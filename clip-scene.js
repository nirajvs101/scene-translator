// Scenes from YouTube clips: reads the link and times a learner types, asks
// the grader server (which asks Gemini) for the clip's dialogue in chunks,
// turns those into a scene, and plays one chunk at a time in the video.

const MAX_CLIP_SECONDS = 300;
// Gemini watches the clip before answering, which can take a minute or two.
const CLIP_IMPORT_WAIT_MS = 240000;
// A moment of extra video around each chunk, so no word is cut off.
const CLIP_PADDING_SECONDS = 0.4;

// The 11-character video ID from any common kind of YouTube link, or null.
function parseYouTubeLink(text) {
  let url;
  try {
    url = new URL(text.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] || null;
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

// Seconds from "1:30", "1:02:03", "90", or "1m30s"; NaN if it isn't a time.
function parseClipTime(text) {
  const value = text.trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if (/^\d+(:[0-5]?\d){1,2}$/.test(value)) {
    return value.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  }
  const units = value.match(/^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/);
  if (units && value !== "") {
    const [, hours = 0, minutes = 0, seconds = 0] = units;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
  return NaN;
}

function formatClipTime(seconds) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// The request for the grader, or throws an error to show the learner.
function clipImportRequest(linkText, startText, endText, sourceLanguage, targetLanguage) {
  const videoId = parseYouTubeLink(linkText);
  if (!videoId) {
    throw new Error("That doesn't look like a YouTube link. Copy it from the address bar or the Share button.");
  }
  const start = parseClipTime(startText);
  const end = parseClipTime(endText);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error("Enter where the scene starts and ends, like 1:00 and 3:00, with the end after the start.");
  }
  if (end - start > MAX_CLIP_SECONDS) {
    throw new Error(`That's ${formatClipTime(end - start)} long. Pick a part of at most 5 minutes.`);
  }
  const source = LANGUAGES[sourceLanguage];
  return {
    task: "import",
    videoId,
    start,
    end,
    sourceLanguage: source.name,
    targetLanguage: LANGUAGES[targetLanguage].name,
    romanizedName: source.altScript ? source.romanizedName || `${source.name} in Latin letters` : "",
  };
}

// Google turns free-tier requests away when it's busy, often just for a
// moment, so a busy answer is retried after these waits.
const CLIP_BUSY_RETRY_SECONDS = [10, 20];

function isBusyError(error) {
  return error.message.startsWith("Google's AI is too busy");
}

// Imports the clip, retrying while Google is busy. `onWait(seconds)` is
// called before each wait so the learner knows it's still trying.
async function importClipWithRetries(request, onWait = () => {}) {
  for (const seconds of [...CLIP_BUSY_RETRY_SECONDS, null]) {
    try {
      return await importClipFromServer(request);
    } catch (error) {
      if (!isBusyError(error) || seconds === null) {
        throw error;
      }
      onWait(seconds);
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
  }
  throw new Error("unreachable");
}

// Asks the grader server to watch the clip once; resolves to its { title,
// chunks } or throws an error to show the learner.
async function importClipFromServer(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIP_IMPORT_WAIT_MS);
  let response;
  try {
    response = await fetch(aiGraderSettings.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch {
    throw new Error("Couldn't reach the server that watches clips. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(body.chunks)) {
    // The server passes on Google's status: 429 and 5xx mean its AI is busy.
    const busy = /answered (429|5\d\d)/.test(String(body.error));
    throw new Error(
      busy
        ? "Google's AI is too busy to watch the clip right now. Try again in a few minutes."
        : "The clip couldn't be read. It may be private, age-restricted, or not allowed on other sites; try another video.",
    );
  }
  return body;
}

// A line said in the language it's being translated into ("Two orange juices
// also") needs no translating. Gemini is asked to mark those, and this catches
// the ones it misses: the words said already match the translation. In a
// Malayalam test clip, mostly-English lines matched 0.75 or more and real
// Malayalam lines at most 0.04.
const ALREADY_TRANSLATED_SCORE = 0.7;

function isAlreadyInTargetLanguage(chunk, targetLanguage) {
  const said = chunk.romanized || chunk.original;
  const { byCharacter } = LANGUAGES[targetLanguage];
  return scoreTranslation(said, [chunk.translation], byCharacter, targetLanguage) >= ALREADY_TRANSLATED_SCORE;
}

function isWorthTranslating(chunk, targetLanguage) {
  return chunk.practice !== false && !isAlreadyInTargetLanguage(chunk, targetLanguage);
}

// Turns the server's chunks into a scene. Chunks not worth translating
// ("okay", "yes", or already in the target language) aren't lines of their
// own: they play just before the next line, so the scene still flows. Each
// line keeps when its own speech starts and ends, and `playFrom`, where to
// start so those short chunks play first.
function clipSceneFromImport({ title, chunks }, { videoId, start, end }, sourceLanguage, targetLanguage) {
  const { altScript } = LANGUAGES[sourceLanguage];
  const speakers = {};
  const speakerKeys = new Map();
  const speakerKeyFor = (name) => {
    if (!speakerKeys.has(name)) {
      const position = speakerKeys.size;
      speakerKeys.set(name, `speaker${position}`);
      speakers[`speaker${position}`] = { name, color: CUSTOM_SPEAKER_COLORS[position % CUSTOM_SPEAKER_COLORS.length] };
    }
    return speakerKeys.get(name);
  };

  const lines = [];
  let leadInStart = null;
  let watchOnlyCount = 0;
  for (const chunk of chunks) {
    if (!isWorthTranslating(chunk, targetLanguage)) {
      leadInStart = leadInStart ?? chunk.start;
      watchOnlyCount += 1;
      continue;
    }
    const translations = [chunk.translation, ...(chunk.alternatives || [])].filter(
      (translation, index, all) => translation && all.indexOf(translation) === index,
    );
    const text = { [sourceLanguage]: [chunk.original], [targetLanguage]: translations };
    if (altScript && chunk.romanized) {
      text[altScript] = [chunk.romanized];
    }
    lines.push({
      speaker: speakerKeyFor(chunk.speaker),
      text,
      start: chunk.start,
      end: chunk.end,
      playFrom: leadInStart ?? chunk.start,
    });
    leadInStart = null;
  }
  if (lines.length === 0) {
    throw new Error("No dialogue to translate was found in that part of the video. Try a part where people talk more.");
  }
  return {
    id: `clip-${Date.now()}`,
    languages: [sourceLanguage, targetLanguage],
    title: { en: title || "YouTube clip" },
    description: `A YouTube clip, ${formatClipTime(start)}–${formatClipTime(end)}.`,
    keywords: ["video", "youtube", "clip", "custom", "own"],
    speakers,
    video: { id: videoId, start, end },
    lines,
    watchOnlyCount,
  };
}

// --- The video player -------------------------------------------------

const clipVideo = {
  player: null,
  videoId: null,
  readyPromise: null,
  pollTimer: null,
  playback: null,
};

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (!loadYouTubeApi.promise) {
    loadYouTubeApi.promise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === "function") {
          previousReady();
        }
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => reject(new Error("YouTube's player couldn't load."));
      document.head.append(script);
    });
  }
  return loadYouTubeApi.promise;
}

function setClipVideoMessage(text) {
  document.getElementById("clip-video-message").textContent = text;
}

// YouTube's error codes, in words a learner can act on.
function clipVideoErrorMessage(code) {
  if (code === 101 || code === 150) {
    return "This video's owner doesn't allow playing it on other sites, so it can't be practiced here.";
  }
  if (code === 100) {
    return "This video was removed or made private.";
  }
  return "The video couldn't play. Check your connection and try again.";
}

// Shows the video area for a clip scene (or hides it for other scenes) and
// gets the player ready with that video, paused at the clip's start.
function showClipVideo(video) {
  const area = document.getElementById("clip-video");
  area.hidden = !video;
  if (!video) {
    stopClipPlayback();
    return;
  }
  if (clipVideo.videoId === video.id && clipVideo.readyPromise) {
    return;
  }
  clipVideo.videoId = video.id;
  setClipVideoMessage("Loading the video…");
  clipVideo.readyPromise = loadYouTubeApi()
    .then(
      () =>
        new Promise((resolve) => {
          if (clipVideo.player) {
            clipVideo.player.cueVideoById({ videoId: video.id, startSeconds: video.start });
            setClipVideoMessage("");
            resolve(clipVideo.player);
            return;
          }
          new YT.Player("clip-player", {
            videoId: video.id,
            playerVars: { start: Math.floor(video.start), playsinline: 1, rel: 0 },
            events: {
              onReady: (event) => {
                clipVideo.player = event.target;
                setClipVideoMessage("");
                resolve(clipVideo.player);
              },
              onError: (event) => {
                stopClipPlayback();
                setClipVideoMessage(clipVideoErrorMessage(event.data));
              },
            },
          });
        }),
    )
    .catch((error) => {
      setClipVideoMessage(`${error.message} Check your connection and reload the page.`);
      clipVideo.readyPromise = null;
      return null;
    });
}

function stopClipPlayback() {
  if (clipVideo.playback) {
    clipVideo.playback.stop();
  }
  if (clipVideo.player && clipVideo.player.pauseVideo) {
    clipVideo.player.pauseVideo();
  }
}

function isClipPlaying() {
  return clipVideo.playback !== null;
}

// Plays the video from `from` to `to` (seconds), calling onTurn once it
// reaches `turnAt` (where the line to translate starts) and onDone with
// "done" or "stopped" at the end. Uses the reading speed from Listening
// settings. Resolves once playback has ended either way.
async function playClipSegment({ from, to, turnAt = from, onTurn = () => {}, onDone = () => {} }) {
  stopClipPlayback();
  const player = clipVideo.readyPromise && (await clipVideo.readyPromise);
  if (!player) {
    onDone("stopped");
    return "stopped";
  }
  return new Promise((resolve) => {
    let reachedTurn = false;
    const finish = (outcome) => {
      clearInterval(clipVideo.pollTimer);
      clipVideo.playback = null;
      onDone(outcome);
      resolve(outcome);
    };
    clipVideo.playback = { stop: () => finish("stopped") };
    const start = Math.max(0, from - CLIP_PADDING_SECONDS);
    const stopAt = to + CLIP_PADDING_SECONDS;
    player.setPlaybackRate(speechRate);
    player.seekTo(start, true);
    player.playVideo();
    if (turnAt <= from) {
      reachedTurn = true;
      onTurn();
    }
    clipVideo.pollTimer = setInterval(() => {
      const now = player.getCurrentTime();
      if (!reachedTurn && now >= turnAt - CLIP_PADDING_SECONDS) {
        reachedTurn = true;
        onTurn();
      }
      if (now >= stopAt) {
        player.pauseVideo();
        finish("done");
      }
    }, 50);
  });
}
