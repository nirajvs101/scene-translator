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

// Google turns free-tier requests away when it's busy, and its smallest model
// gets through only some of the time, so a busy answer is retried after these
// waits: about 3 minutes of trying in all. The Gemini chat route is offered
// from the first busy answer, so nobody has to wait it out.
const CLIP_BUSY_RETRY_SECONDS = [10, 20, 30, 40];

function isBusyError(error) {
  return error.message.startsWith("Google's AI is too busy");
}

// Imports the clip, retrying while Google is busy. `onWait(seconds)` is
// called before each wait so the learner knows it's still trying, and once
// `isCancelled()` says so it stops asking.
async function importClipWithRetries(request, onWait = () => {}, isCancelled = () => false) {
  for (const seconds of [...CLIP_BUSY_RETRY_SECONDS, null]) {
    if (isCancelled()) {
      throw new Error("The import was stopped.");
    }
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

// --- The Gemini chat route ----------------------------------------------
// When the server's free tier is busy, the learner can ask Google's regular
// Gemini chat (gemini.google.com, which runs on Google's consumer capacity)
// and paste its reply back. The chat's times are a little rougher, so these
// scenes get a bigger cushion around each line.

const GEMINI_CHAT_URL = "https://gemini.google.com/app";
const CHAT_CLIP_PADDING_SECONDS = 1;

function clipChatPrompt({ videoId, start, end, sourceLanguage, targetLanguage, romanizedName }) {
  const from = formatClipTime(start);
  const to = formatClipTime(end);
  const romanizedNote = romanizedName
    ? `- "romanized": the same words in ${romanizedName} (${sourceLanguage} in Latin letters), as people commonly type it`
    : `- "romanized": an empty string`;
  return `Watch this YouTube video from ${from} to ${to} (${start} to ${end} seconds): https://www.youtube.com/watch?v=${videoId}

It is a scene in ${sourceLanguage}, for a language-practice app: learners watch one short chunk of dialogue at a time and translate it into ${targetLanguage}.

Listen to the audio and split ALL the dialogue between ${from} and ${to} into chunks, right up to ${to}:
- Each chunk is ONE speaker only. When a different person starts talking, start a new chunk.
- If one person talks for long, split their turn into chunks of at most 3 sentences.
- Skip music, background noise, and anything nobody says.

For each chunk give:
- "speaker": a short label for who is talking, the same label every time for the same person: their name if it is said in the scene, otherwise a short description such as "Waiter" or "Man in grey shirt"
- "start" and "end": when the chunk's speech starts and ends, in seconds from the beginning of the FULL video (so between ${start} and ${end}), to one decimal place. Be as precise as you can: these times play exactly that chunk.
- "original": exactly what is said, in ${sourceLanguage}'s own script (words said in another language, such as English, as they are said)
${romanizedNote}
- "translation": a natural ${targetLanguage} translation a learner could be graded against
- "alternatives": up to 3 other natural ${targetLanguage} translations with the same meaning, worded differently, including casual everyday wordings
- "practice": false when there is nothing worth translating: a filler or reply of one or two words such as "okay", "yes", "no", "hmm", a name called out, or a line already spoken in ${targetLanguage}; otherwise true

Reply with only this JSON in a code block:
{"title":"Short English title","chunks":[{"speaker":"...","start":0.0,"end":0.0,"original":"...","romanized":"...","translation":"...","alternatives":["..."],"practice":true}]}`;
}

const NOT_A_CLIP_REPLY = "That doesn't look like Gemini's reply. Copy its whole answer (the part with \"chunks\") and paste it here again.";

// Keeps the chunks that make sense for the chosen part, in order, the same
// way the server cleans its own answer.
function cleanClipChunks(chunks, start, end) {
  const text = (value) => (typeof value === "string" ? value.trim().slice(0, AI_MAX_TEXT_LENGTH) : "");
  return chunks
    .map((chunk) => ({
      speaker: text(chunk?.speaker).slice(0, 40) || "Speaker",
      start: Number(chunk?.start),
      end: Number(chunk?.end),
      original: text(chunk?.original),
      romanized: text(chunk?.romanized),
      translation: text(chunk?.translation),
      alternatives: (Array.isArray(chunk?.alternatives) ? chunk.alternatives : []).map(text).filter(Boolean).slice(0, 3),
      practice: chunk?.practice !== false,
    }))
    .filter(
      (chunk) =>
        Number.isFinite(chunk.start) &&
        Number.isFinite(chunk.end) &&
        chunk.end > chunk.start &&
        chunk.start >= start - 2 &&
        chunk.end <= end + 2 &&
        chunk.original !== "" &&
        chunk.translation !== "",
    )
    .sort((first, second) => first.start - second.start);
}

// Turns a pasted Gemini reply into { title, chunks }, or throws an error to
// show the learner. Chat replies often wrap the JSON in a sentence or a code block.
function parseClipReply(reply, { start, end }) {
  let parsed;
  try {
    parsed = JSON.parse(reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1));
  } catch {
    throw new Error(NOT_A_CLIP_REPLY);
  }
  if (!parsed || !Array.isArray(parsed.chunks)) {
    throw new Error(NOT_A_CLIP_REPLY);
  }
  const chunks = cleanClipChunks(parsed.chunks, start, end);
  if (chunks.length === 0) {
    throw new Error("Gemini's reply has no lines between the times you chose. Check the times, then ask Gemini again.");
  }
  return { title: typeof parsed.title === "string" ? parsed.title.trim().slice(0, 80) : "", chunks };
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
function clipSceneFromImport(
  { title, chunks },
  { videoId, start, end },
  sourceLanguage,
  targetLanguage,
  { padding = CLIP_PADDING_SECONDS } = {},
) {
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
    video: { id: videoId, start, end, padding },
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
// "done" or "stopped" at the end. `padding` is the extra video around it,
// so no word is cut off. Uses the reading speed from Listening settings.
// Resolves once playback has ended either way.
async function playClipSegment({ from, to, turnAt = from, padding = CLIP_PADDING_SECONDS, onTurn = () => {}, onDone = () => {} }) {
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
    const start = Math.max(0, from - padding);
    const stopAt = to + padding;
    player.setPlaybackRate(speechRate);
    player.seekTo(start, true);
    player.playVideo();
    if (turnAt <= from) {
      reachedTurn = true;
      onTurn();
    }
    clipVideo.pollTimer = setInterval(() => {
      const now = player.getCurrentTime();
      if (!reachedTurn && now >= turnAt - padding) {
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
