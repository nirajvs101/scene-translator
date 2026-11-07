// Reads lines aloud, with one voice per language for every speaker. Voices
// are tried in this order:
//   1. a natural-sounding voice the device already has (Chrome's Google
//      voices, Edge's Natural voices, Apple's Enhanced/Premium voices, Android);
//   2. a Piper AI voice that runs in the browser (ai-voices.js), after the
//      learner agrees to its one-time download;
//   3. the device's basic voice;
//   4. a message when there's no voice for the language at all.

const SPEECH_RATES = [0.5, 0.75, 1, 1.25, 1.5];

let speechRate = 1;
// Chrome can drop the "end" event of an utterance nothing refers to anymore,
// so the one being spoken is kept here.
let currentUtterance = null;
// Bumped whenever speech stops, so anything still loading for an older
// request knows not to play.
let speechToken = 0;
let pendingPrompt = null;
// Languages whose AI voice the learner turned down during this visit.
const declinedAiLanguages = new Set();

function canSpeak() {
  return "speechSynthesis" in window || typeof WebAssembly === "object";
}

function setSpeechRate(rate) {
  speechRate = rate;
}

// macOS lists sound-effect voices alongside real ones; a speaker shouldn't get these.
const NOVELTY_VOICES = new Set([
  "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Good News",
  "Jester", "Organ", "Superstar", "Trinoids", "Whisper", "Wobble", "Zarvox",
]);
const NATURAL_VOICE_PATTERN = /Google|Natural|Premium|Enhanced|Neural/;
// Android's voices all come from Google's speech engine, whatever their names.
const DEVICE_IS_ANDROID = /Android/i.test(navigator.userAgent);

function isNaturalVoice(voice) {
  return DEVICE_IS_ANDROID || NATURAL_VOICE_PATTERN.test(voice.name);
}

// How good a device voice is for this locale, lower first: natural-sounding
// voices, then the exact region (es-ES before es-MX), then the device's default.
function voiceRank(voice, locale) {
  return (
    (isNaturalVoice(voice) ? 0 : 4) +
    (voice.lang.replace("_", "-") === locale ? 0 : 2) +
    (voice.default ? 0 : 1)
  );
}

// The device's real voices for a language, best first.
function voicesFor(locale) {
  if (!("speechSynthesis" in window)) {
    return [];
  }
  const language = locale.split("-")[0].toLowerCase();
  return speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.replace("_", "-").split("-")[0].toLowerCase() === language)
    .filter((voice) => !NOVELTY_VOICES.has(voice.name))
    .sort((first, second) => voiceRank(first, locale) - voiceRank(second, locale));
}

function bestDeviceVoice(locale) {
  return voicesFor(locale)[0] || null;
}

function hasNaturalDeviceVoice(locale) {
  const voice = bestDeviceVoice(locale);
  return Boolean(voice && isNaturalVoice(voice));
}

// Chrome lists its voices a moment after the page loads; asking early starts that.
if ("speechSynthesis" in window) {
  speechSynthesis.getVoices();
}

// True when the device has listed its voices and none speaks this language.
// Some browsers list voices late, so an empty list is not treated as missing.
function deviceVoiceMissing(locale) {
  return !("speechSynthesis" in window) || (speechSynthesis.getVoices().length > 0 && voicesFor(locale).length === 0);
}

// AI voices play through one <audio> element. Phones only let a page play
// sound right after a tap, so each tap first plays a moment of silence on
// it, which keeps it allowed to play the real audio once it's ready.
const audioPlayer = new Audio();
const silentClip = URL.createObjectURL(encodeWav(new Float32Array(160), 16000));
let finishPlayback = null;
// iPhones would otherwise stay quiet when the ring switch is off.
if (navigator.audioSession) {
  navigator.audioSession.type = "playback";
}

function unlockAudio() {
  audioPlayer.src = silentClip;
  audioPlayer.play().catch(() => {});
}

function stopSpeaking() {
  speechToken += 1;
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
  if (finishPlayback) {
    audioPlayer.pause();
    finishPlayback("stopped");
  }
  if (pendingPrompt) {
    pendingPrompt.cancel();
  }
}

// Call right after a tap: stops anything playing and returns a token that
// stays current until the next stop.
function beginSpeech() {
  stopSpeaking();
  unlockAudio();
  return speechToken;
}

function playWav(wav) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(wav);
    const finish = (outcome) => {
      finishPlayback = null;
      audioPlayer.onended = null;
      audioPlayer.onerror = null;
      URL.revokeObjectURL(url);
      resolve(outcome);
    };
    finishPlayback = finish;
    audioPlayer.onended = () => finish("done");
    audioPlayer.onerror = () => finish("error");
    audioPlayer.src = url;
    audioPlayer.play().catch(() => {
      if (finishPlayback === finish) {
        finish("error");
      }
    });
  });
}

// Asks before a big download, in the line's own status area. Resolves
// "yes", "no", or "stopped" if something else started meanwhile.
function askToDownload(voice, language, status) {
  return new Promise((resolve) => {
    const name = LANGUAGES[language].name;
    const message = document.createElement("span");
    message.textContent = `Hear ${name} in a natural voice? It's a one-time ${voice.sizeMb} MB download. `;
    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "prompt-button primary";
    yes.textContent = "Download voice";
    const no = document.createElement("button");
    no.type = "button";
    no.className = "prompt-button";
    no.textContent = "Not now";
    const answer = (value) => {
      pendingPrompt = null;
      status.replaceChildren();
      resolve(value);
    };
    yes.addEventListener("click", () => {
      unlockAudio();
      answer("yes");
    });
    no.addEventListener("click", () => {
      unlockAudio();
      answer("no");
    });
    pendingPrompt = { cancel: () => answer("stopped") };
    status.replaceChildren(message, yes, no);
  });
}

// Decides how a language will be read: { kind: "ai", voice } or
// { kind: "device" }. Returns null if speech was stopped while asking.
async function chooseVoice(language, status, token) {
  if (hasNaturalDeviceVoice(LANGUAGES[language].speechLocale)) {
    return { kind: "device", language };
  }
  const voice = aiVoiceFor(language);
  if (voice && !declinedAiLanguages.has(language)) {
    if (await isAiVoiceDownloaded(voice)) {
      return { kind: "ai", voice, language };
    }
    if (token !== speechToken) {
      return null;
    }
    const answer = await askToDownload(voice, language, status);
    if (answer === "stopped" || token !== speechToken) {
      return null;
    }
    if (answer === "yes") {
      return { kind: "ai", voice, language };
    }
    declinedAiLanguages.add(language);
  }
  return { kind: "device", language };
}

// Recently made AI audio, so replays and the next line in Play scene are instant.
const preparedAudio = new Map();
const PREPARED_AUDIO_LIMIT = 40;

function showDownloadProgress(status, language) {
  return (loaded, total) => {
    const name = LANGUAGES[language].name;
    status.textContent =
      total > 0
        ? `Downloading the natural ${name} voice… ${Math.round((loaded / total) * 100)}%`
        : `Downloading the natural ${name} voice…`;
  };
}

// Starts making the audio for a line ahead of time. Device voices need no
// preparation, so this returns null for them.
function prepareSpeech(choice, text, status) {
  if (choice.kind !== "ai") {
    return null;
  }
  const key = `${choice.voice.path}|${speechRate}|${text}`;
  if (!preparedAudio.has(key)) {
    const audio = synthesizeAiSpeech(choice.voice, text, speechRate, showDownloadProgress(status, choice.language));
    audio.catch(() => preparedAudio.delete(key));
    preparedAudio.set(key, audio);
    if (preparedAudio.size > PREPARED_AUDIO_LIMIT) {
      preparedAudio.delete(preparedAudio.keys().next().value);
    }
  }
  return preparedAudio.get(key);
}

// Plays prepared speech and resolves "done", "fell-back" (the AI voice
// failed, so the device's voice read it), "stopped", "no-voice", or "error".
async function speakPrepared(choice, prepared, text, status, token) {
  if (choice.kind === "ai") {
    const slowNotice = setTimeout(() => {
      if (status.textContent === "") {
        status.textContent = "Getting the voice ready…";
      }
    }, 600);
    try {
      const wav = await prepared;
      clearTimeout(slowNotice);
      if (token !== speechToken) {
        return "stopped";
      }
      status.textContent = "";
      return await playWav(wav);
    } catch {
      clearTimeout(slowNotice);
      failedAiVoices.add(choice.voice.path);
      if (token !== speechToken) {
        return "stopped";
      }
      const outcome = await speakWithDevice(text, choice.language);
      return outcome === "done" ? "fell-back" : outcome;
    }
  }
  return speakWithDevice(text, choice.language);
}

function speakWithDevice(text, language) {
  const locale = LANGUAGES[language].speechLocale;
  if (deviceVoiceMissing(locale)) {
    return Promise.resolve("no-voice");
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = speechRate;
  const voice = bestDeviceVoice(locale);
  if (voice) {
    utterance.voice = voice;
  }
  currentUtterance = utterance;
  return new Promise((resolve) => {
    utterance.onend = () => resolve("done");
    utterance.onerror = (event) => {
      resolve(event.error === "interrupted" || event.error === "canceled" ? "stopped" : "error");
    };
    speechSynthesis.speak(utterance);
  });
}

// Reads one piece of text in a language, using the best voice available.
// Call it straight from a tap, so phones allow the sound.
async function speakText(text, language, status) {
  const token = beginSpeech();
  const choice = await chooseVoice(language, status, token);
  if (!choice) {
    return "stopped";
  }
  return speakPrepared(choice, prepareSpeech(choice, text, status), text, status, token);
}
