// Piper AI voices: the backup for devices without a natural-sounding voice
// of their own (Safari, iPhones, Firefox). They run inside the browser, in a
// background worker (voice-worker.js), and each downloads once per browser.

const PIPER_VOICE_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/";
const VOICE_CACHE_NAME = "scene-translator-voices";

function piperVoice(path, sizeMb) {
  return { path, sizeMb };
}

// Japanese and Hebrew Piper voices need text converters that don't run in
// the browser, and Tamil has no voice, so those three use the device's voices.
const AI_VOICES = {
  en: piperVoice("en/en_US/lessac/medium/en_US-lessac-medium.onnx", 63),
  es: piperVoice("es/es_ES/davefx/medium/es_ES-davefx-medium.onnx", 63),
  fr: piperVoice("fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx", 63),
  de: piperVoice("de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx", 63),
  it: piperVoice("it/it_IT/paola/medium/it_IT-paola-medium.onnx", 64),
  hi: piperVoice("hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx", 64),
  zh: piperVoice("zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx", 63),
  ar: piperVoice("ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx", 63),
  pt: piperVoice("pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx", 63),
  ru: piperVoice("ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx", 63),
  ko: piperVoice("ko/ko_KR/kss/medium/ko_KR-kss-medium.onnx", 63),
  bn: piperVoice("bn/bn_BD/google/medium/bn_BD-google-medium.onnx", 77),
  ur: piperVoice("ur/ur_PK/aegis_female/medium/ur_PK-aegis_female-medium.onnx", 64),
  id: piperVoice("id/id_ID/news_tts/medium/id_ID-news_tts-medium.onnx", 63),
  tr: piperVoice("tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx", 63),
  vi: piperVoice("vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx", 63),
  nl: piperVoice("nl/nl_NL/pim/medium/nl_NL-pim-medium.onnx", 64),
  pl: piperVoice("pl/pl_PL/gosia/medium/pl_PL-gosia-medium.onnx", 63),
  sw: piperVoice("sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx", 63),
  ml: piperVoice("ml/ml_IN/meera/medium/ml_IN-meera-medium.onnx", 63),
  fa: piperVoice("fa/fa_IR/gyro/medium/fa_IR-gyro-medium.onnx", 63),
  el: piperVoice("el/el_GR/joy/medium/el_GR-joy-medium.onnx", 64),
  sv: piperVoice("sv/sv_SE/lisa/medium/sv_SE-lisa-medium.onnx", 64),
};

// Voices that failed to load during this visit are skipped until a reload.
const failedAiVoices = new Set();

// What decides whether this device should run AI voices.
function describeDevice() {
  return {
    canRunWorkers: typeof WebAssembly === "object" && typeof Worker === "function",
    savesData: Boolean(navigator.connection && navigator.connection.saveData),
    lowMemory: Boolean(navigator.deviceMemory && navigator.deviceMemory < 2),
  };
}

// The AI voice for a language on this device, or null to use the device's own voices.
function aiVoiceFor(language, device = describeDevice(), failed = failedAiVoices) {
  const voice = AI_VOICES[language];
  if (!voice || failed.has(voice.path) || !device.canRunWorkers || device.savesData || device.lowMemory) {
    return null;
  }
  return voice;
}

// Whether the voice is already saved, so playing it needs no download.
async function isAiVoiceDownloaded(voice) {
  try {
    const cache = await caches.open(VOICE_CACHE_NAME);
    return Boolean(await cache.match(PIPER_VOICE_BASE + voice.path));
  } catch {
    return false;
  }
}

let voiceWorker = null;
let nextRequestId = 1;
const pendingRequests = new Map();

function startVoiceWorker() {
  voiceWorker = new Worker("voice-worker.js", { type: "module" });
  voiceWorker.addEventListener("message", (event) => {
    const { id, type } = event.data;
    const request = pendingRequests.get(id);
    if (!request) {
      return;
    }
    if (type === "progress") {
      request.onProgress(event.data.loaded, event.data.total);
      return;
    }
    pendingRequests.delete(id);
    if (type === "done") {
      request.resolve(encodeWav(event.data.samples, event.data.sampleRate));
    } else {
      request.reject(new Error(event.data.message));
    }
  });
  voiceWorker.addEventListener("error", () => {
    for (const request of pendingRequests.values()) {
      request.reject(new Error("The voice worker stopped."));
    }
    pendingRequests.clear();
    voiceWorker = null;
  });
}

// One line at a time, so the line needed next is never stuck behind others.
let synthesisQueue = Promise.resolve();

// Speaks text with an AI voice in the background and returns it as a WAV file.
function synthesizeAiSpeech(voice, text, rate, onProgress = () => {}) {
  const run = () =>
    new Promise((resolve, reject) => {
      if (!voiceWorker) {
        startVoiceWorker();
      }
      const id = nextRequestId++;
      pendingRequests.set(id, { resolve, reject, onProgress });
      voiceWorker.postMessage({ id, path: voice.path, text, rate });
    });
  const result = synthesisQueue.then(run, run);
  synthesisQueue = result.catch(() => {});
  return result;
}

// Wraps raw samples (-1 to 1) in a 16-bit WAV file that an <audio> element can play.
function encodeWav(samples, sampleRate) {
  const headerSize = 44;
  const view = new DataView(new ArrayBuffer(headerSize + samples.length * 2));
  const writeText = (offset, text) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(headerSize + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}
