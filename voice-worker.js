// Runs Piper AI voices in the background, so making speech never freezes
// the page. The page sends { id, path, text, rate }; this replies with
// progress messages while a voice downloads, then the finished samples.

const PIPER_VOICE_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/";
const PHONEMIZER_MODULE = "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/dist/piper-DeOu3H9E.js";
const PHONEMIZER_FILES = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize";
const ONNX_RUNTIME_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
const VOICE_CACHE_NAME = "scene-translator-voices";

let onnxRuntime = null;
let phonemizerModule = null;
const loadedVoices = new Map();

async function openVoiceCache() {
  try {
    return await caches.open(VOICE_CACHE_NAME);
  } catch {
    // Some private windows block storage; voices then download each visit.
    return null;
  }
}

// Downloads a file once, reporting progress, and keeps it for next time.
async function fetchAndKeep(url, onProgress) {
  const cache = await openVoiceCache();
  const saved = cache && (await cache.match(url));
  if (saved) {
    return saved.arrayBuffer();
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }
  const total = Number(response.headers.get("Content-Length")) || 0;
  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }
  const blob = new Blob(chunks);
  if (cache) {
    try {
      await cache.put(url, new Response(blob));
    } catch {
      // Out of storage: the voice still works for this visit.
    }
  }
  return blob.arrayBuffer();
}

async function loadVoice(path, onProgress) {
  if (!loadedVoices.has(path)) {
    onnxRuntime = onnxRuntime || (await import(`${ONNX_RUNTIME_BASE}esm/ort.wasm.min.js`));
    onnxRuntime.env.wasm.wasmPaths = ONNX_RUNTIME_BASE;
    // Threads need special server headers that GitHub Pages can't send.
    onnxRuntime.env.wasm.numThreads = 1;
    phonemizerModule = phonemizerModule || (await import(PHONEMIZER_MODULE));
    const configBuffer = await fetchAndKeep(`${PIPER_VOICE_BASE}${path}.json`, () => {});
    const config = JSON.parse(new TextDecoder().decode(configBuffer));
    const model = await fetchAndKeep(PIPER_VOICE_BASE + path, onProgress);
    const session = await onnxRuntime.InferenceSession.create(model);
    loadedVoices.set(path, { session, config });
  }
  return loadedVoices.get(path);
}

// Turns text into the sound IDs the model reads. The phonemizer prints its
// result instead of returning it, and runs once per instance.
async function phonemize(text, espeakVoice) {
  let phonemeIds = null;
  const phonemizer = await phonemizerModule.createPiperPhonemize({
    print: (line) => {
      phonemeIds = JSON.parse(line).phoneme_ids;
    },
    printErr: () => {},
    locateFile: (file) => {
      if (file.endsWith(".wasm")) {
        return `${PHONEMIZER_FILES}.wasm`;
      }
      return file.endsWith(".data") ? `${PHONEMIZER_FILES}.data` : file;
    },
  });
  phonemizer.callMain(["-l", espeakVoice, "--input", JSON.stringify([{ text }]), "--espeak_data", "/espeak-ng-data"]);
  if (!phonemeIds) {
    throw new Error("Couldn't turn this text into sounds.");
  }
  return phonemeIds;
}

async function synthesize({ path, text, rate }, onProgress) {
  const { session, config } = await loadVoice(path, onProgress);
  const ids = await phonemize(text, config.espeak.voice);
  const ort = onnxRuntime;
  const inputs = {
    input: new ort.Tensor("int64", ids, [1, ids.length]),
    input_lengths: new ort.Tensor("int64", [ids.length]),
    // A longer "length scale" means slower speech.
    scales: new ort.Tensor("float32", [
      config.inference.noise_scale,
      config.inference.length_scale / rate,
      config.inference.noise_w,
    ]),
  };
  if (Object.keys(config.speaker_id_map || {}).length > 0) {
    inputs.sid = new ort.Tensor("int64", [0]);
  }
  const { output } = await session.run(inputs);
  return { samples: Float32Array.from(output.data), sampleRate: config.audio.sample_rate };
}

self.addEventListener("message", async (event) => {
  const { id } = event.data;
  try {
    const { samples, sampleRate } = await synthesize(event.data, (loaded, total) =>
      self.postMessage({ id, type: "progress", loaded, total }),
    );
    self.postMessage({ id, type: "done", samples, sampleRate }, [samples.buffer]);
  } catch (error) {
    self.postMessage({ id, type: "error", message: error.message });
  }
});
