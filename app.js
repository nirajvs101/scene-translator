// Sets up the page: scenes, languages, speaking, listening, and reading aloud.
// The line-by-line practice itself is in practice.js.

// Chrome and Safari still expose speech recognition under a "webkit" prefix.
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

let activeListening = null;

const SCENES = [CAFE_SCENE, DOCTOR_SCENE, DIRECTIONS_SCENE, TRAIN_SCENE, ...loadCustomScenes()];

let scene = SCENES[0];
let fromLanguage = "es";
let toLanguage = "en";
// Separate answers per scene and language pair so switching doesn't erase what was typed.
const answersByPair = {};

function answersKey() {
  return `${scene.id}:${fromLanguage}-${toLanguage}`;
}

function currentAnswers() {
  const key = answersKey();
  answersByPair[key] = answersByPair[key] || [];
  return answersByPair[key];
}

function languageName(language) {
  return LANGUAGES[language].name;
}

// The line's main text, plus its romanized form for languages that have one.
function lineText(line, language) {
  const altScript = LANGUAGES[language].altScript;
  return { main: line.text[language][0], alt: altScript && line.text[altScript] ? line.text[altScript][0] : null };
}

function referenceText(line, language) {
  const { main, alt } = lineText(line, language);
  return alt ? `${main} (${alt})` : main;
}

function renderLegend() {
  const legend = document.getElementById("speaker-legend");
  legend.innerHTML = "";
  for (const speaker of Object.values(scene.speakers)) {
    const item = document.createElement("li");
    item.textContent = speaker.name;
    item.style.setProperty("--speaker-color", speaker.color);
    legend.appendChild(item);
  }
}

function speakOutcomeMessage(outcome, language) {
  if (outcome === "no-voice") {
    const name = languageName(language);
    return `This browser has no ${name} voice, so it can't read ${name} aloud. Try Chrome, or add a ${name} voice in your device's settings.`;
  }
  if (outcome === "error") {
    return canSpeak() ? "Couldn't read that aloud. Try again." : "Reading aloud isn't supported in this browser.";
  }
  if (outcome === "fell-back") {
    return `The natural ${languageName(language)} voice couldn't load, so your device's voice read it instead.`;
  }
  return "";
}

// A 🔊 button that reads text aloud. Clicking it again while it reads stops it.
function createSpeakButton(label, getText, language, status) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "speak";
  button.textContent = "🔊";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", async () => {
    if (button.classList.contains("speaking")) {
      stopSpeaking();
      return;
    }
    const text = getText().trim();
    if (text === "") {
      status.textContent = "Nothing to read yet. Type or speak a translation first.";
      return;
    }
    stopScenePlayback();
    stopListening();
    status.textContent = "";
    button.classList.add("speaking");
    const outcome = await speakText(text, language, status);
    button.classList.remove("speaking");
    if (outcome !== "stopped") {
      status.textContent = speakOutcomeMessage(outcome, language);
    }
  });
  return button;
}

const SPEECH_ERROR_MESSAGES = {
  "no-speech": "Didn't hear anything. Click 🎤 and try again.",
  "audio-capture": "No microphone found. Check that one is connected.",
  network: "Speech recognition needs an internet connection.",
};

// Safari reports a permission error for languages it can't recognize, even
// when the microphone is allowed, so these errors can mean either thing.
const SPEECH_REFUSED_ERRORS = new Set(["not-allowed", "service-not-allowed", "language-not-supported"]);

function speechErrorMessage(error, language) {
  if (SPEECH_REFUSED_ERRORS.has(error)) {
    return `This browser couldn't listen in ${languageName(language)}. It may not support speaking this language, so try Chrome or type your answer. If no language works, allow the microphone in your browser's site settings.`;
  }
  return SPEECH_ERROR_MESSAGES[error] || "Something went wrong while listening. Try again.";
}

function stopListening() {
  if (activeListening) {
    activeListening.cancel();
  }
}

const LISTENING_MESSAGE = "Listening… click 🎤 when you're done";
// Learners pause to think mid-sentence, so only stop after a long silence.
const SILENCE_BEFORE_STOP_MS = 4000;
// Safari never stops by itself in continuous mode, even if nobody speaks.
const NO_SPEECH_BEFORE_STOP_MS = 10000;
// Time for a final result to arrive after asking the browser to stop.
const FINAL_RESULT_WAIT_MS = 1000;

// Listens until the speaker clicks 🎤 again or goes quiet, and writes the
// answer into the box, after any text already typed there.
function startListening(input, micButton, status, onTextChange) {
  if (!SpeechRecognitionClass) {
    status.textContent = "Speaking isn't supported in this browser. Try Chrome or Safari.";
    return;
  }
  const language = toLanguage;
  const recognition = new SpeechRecognitionClass();
  recognition.lang = LANGUAGES[language].speechLocale;
  recognition.continuous = true;
  recognition.interimResults = true;

  const existingText = input.value.trim();
  let transcript = "";
  let stopTimer = null;
  let finished = false;
  const showAnswer = (spoken) => {
    input.value = existingText && spoken ? `${existingText} ${spoken}` : existingText || spoken;
    onTextChange();
  };

  // Safari can report an error and never send "end", so this runs on whichever
  // signal comes first instead of waiting for the browser.
  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(stopTimer);
    // Punctuate once, after the whole answer, rather than at every pause.
    if (transcript !== "") {
      showAnswer(punctuateSpeech(transcript, language));
    }
    micButton.classList.remove("listening");
    micButton.setAttribute("aria-pressed", "false");
    if (status.textContent === LISTENING_MESSAGE) {
      status.textContent = "";
    }
    if (activeListening && activeListening.recognition === recognition) {
      activeListening = null;
    }
  };
  const stopThenFinish = () => {
    recognition.stop();
    clearTimeout(stopTimer);
    stopTimer = setTimeout(finish, FINAL_RESULT_WAIT_MS);
  };

  recognition.onresult = (event) => {
    if (finished) {
      return;
    }
    transcript = Array.from(event.results, (result) => result[0].transcript.trim())
      .filter((part) => part !== "")
      .join(" ");
    showAnswer(transcript);
    clearTimeout(stopTimer);
    stopTimer = setTimeout(stopThenFinish, SILENCE_BEFORE_STOP_MS);
  };
  recognition.onerror = (event) => {
    if (event.error !== "aborted") {
      status.textContent = speechErrorMessage(event.error, language);
    }
    finish();
  };
  recognition.onend = finish;

  stopListening();
  // Otherwise the microphone would hear the app reading aloud.
  stopScenePlayback();
  stopSpeaking();
  activeListening = {
    recognition,
    stop: stopThenFinish,
    cancel: () => {
      recognition.abort();
      finish();
    },
  };
  micButton.classList.add("listening");
  micButton.setAttribute("aria-pressed", "true");
  status.textContent = LISTENING_MESSAGE;
  stopTimer = setTimeout(() => {
    status.textContent = SPEECH_ERROR_MESSAGES["no-speech"];
    stopThenFinish();
  }, NO_SPEECH_BEFORE_STOP_MS);
  recognition.start();
}

function renderOriginal(line, status) {
  const { main, alt } = lineText(line, fromLanguage);
  const original = document.createElement("div");
  original.className = "original";
  const texts = document.createElement("div");
  texts.className = "original-text";
  const mainText = document.createElement("p");
  mainText.lang = fromLanguage;
  mainText.dir = "auto";
  mainText.textContent = main;
  texts.appendChild(mainText);
  if (alt) {
    const romanized = document.createElement("p");
    romanized.className = "romanized";
    romanized.textContent = alt;
    texts.appendChild(romanized);
  }
  const speakOriginal = createSpeakButton(
    `Hear ${scene.speakers[line.speaker].name}'s line in ${languageName(fromLanguage)}`,
    () => main,
    fromLanguage,
    status,
  );
  original.append(texts, speakOriginal);
  return original;
}

let scenePlayback = null;

function setPlayButton(isPlaying) {
  const button = document.getElementById("play-scene");
  button.textContent = isPlaying ? "⏹ Stop" : "▶ Play scene";
  button.setAttribute("aria-pressed", String(isPlaying));
}

function stopScenePlayback() {
  if (scenePlayback) {
    scenePlayback.stopped = true;
    scenePlayback = null;
    stopSpeaking();
    setPlayButton(false);
  }
}

// Each line in order, followed by its reference translation when that box is ticked.
function scenePartsToRead(withTranslations) {
  return scene.lines.flatMap((line, lineIndex) => {
    const parts = [{ lineIndex, text: lineText(line, fromLanguage).main, language: fromLanguage }];
    if (withTranslations) {
      parts.push({ lineIndex, text: lineText(line, toLanguage).main, language: toLanguage });
    }
    return parts;
  });
}

// Reads the whole scene, highlighting and scrolling to the line being read.
// Any voice downloads are asked about first, and each next line's audio is
// made while the current one plays, so there are no long pauses.
async function playScene() {
  stopListening();
  stopScenePlayback();
  const token = beginSpeech();
  const playback = { stopped: false };
  scenePlayback = playback;
  const status = document.getElementById("play-status");
  status.textContent = "";
  setPlayButton(true);

  const withTranslations = document.getElementById("play-translations").checked;
  const choices = {};
  for (const language of withTranslations ? [fromLanguage, toLanguage] : [fromLanguage]) {
    choices[language] = await chooseVoice(language, status, token);
    if (!choices[language]) {
      playback.stopped = true;
    }
  }

  const parts = playback.stopped ? [] : scenePartsToRead(withTranslations);
  const prepare = (part) => part && prepareSpeech(choices[part.language], part.text, status);
  let nextAudio = prepare(parts[0]);
  for (const [index, part] of parts.entries()) {
    const audio = nextAudio;
    nextAudio = prepare(parts[index + 1]);
    // Lines you haven't reached yet aren't on screen, so only shown ones light up.
    const item = document.querySelector(`#dialogue [data-line-index="${part.lineIndex}"]`);
    if (item) {
      item.classList.add("playing");
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const outcome = await speakPrepared(choices[part.language], audio, part.text, status, token);
    if (outcome === "fell-back") {
      status.textContent = speakOutcomeMessage(outcome, part.language);
      choices[part.language] = { kind: "device", language: part.language };
    } else if (outcome !== "done") {
      status.textContent = speakOutcomeMessage(outcome, part.language);
      playback.stopped = true;
    }
    const lineFinished = !parts[index + 1] || parts[index + 1].lineIndex !== part.lineIndex;
    if (item && (lineFinished || playback.stopped)) {
      item.classList.remove("playing");
    }
    if (playback.stopped) {
      break;
    }
  }
  if (scenePlayback === playback) {
    scenePlayback = null;
    setPlayButton(false);
  }
}

// Reads the word of the day the way the card shows it, with the same voices
// and reading speed as the scene. Voices are chosen (and any download asked
// about) before anything plays, as in Play scene.
async function readWordOfTheDay(status) {
  const token = beginSpeech();
  const parts = wordOfTheDayReading(fromLanguage, toLanguage, shownWordDate);
  const choices = {};
  for (const { language } of parts) {
    choices[language] ??= await chooseVoice(language, status, token);
    if (!choices[language]) {
      return;
    }
  }
  for (const part of parts) {
    const choice = choices[part.language];
    const outcome = await speakPrepared(choice, prepareSpeech(choice, part.text, status), part.text, status, token);
    if (outcome === "fell-back") {
      status.textContent = speakOutcomeMessage(outcome, part.language);
      choices[part.language] = { kind: "device", language: part.language };
    } else if (outcome !== "done") {
      status.textContent = speakOutcomeMessage(outcome, part.language);
      return;
    }
  }
}

function setUpWordOfTheDaySpeech() {
  const button = document.getElementById("daily-word-speak");
  const status = document.getElementById("daily-word-status");
  button.addEventListener("click", async () => {
    if (button.classList.contains("speaking")) {
      stopSpeaking();
      return;
    }
    stopScenePlayback();
    stopListening();
    status.textContent = "";
    button.classList.add("speaking");
    await readWordOfTheDay(status);
    button.classList.remove("speaking");
  });
}

const SPEECH_RATE_KEY = "scene-translator-speech-rate";

// Remembers the chosen speed in this browser; private windows may refuse.
function loadSpeechRate() {
  try {
    const saved = Number(localStorage.getItem(SPEECH_RATE_KEY));
    return SPEECH_RATES.includes(saved) ? saved : 1;
  } catch {
    return 1;
  }
}

// Listening settings (speed and the switches) open and close under a ⚙️
// button, so the card shows only Play scene until someone wants them.
function setUpListenSettings() {
  const button = document.getElementById("listen-settings-button");
  const panel = document.getElementById("listen-settings");
  button.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  });
}

function renderSpeedPills() {
  const chosen = loadSpeechRate();
  setSpeechRate(chosen);
  const pills = document.getElementById("speed-pills");
  for (const rate of SPEECH_RATES) {
    const label = document.createElement("label");
    label.className = "option-pill";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "speech-rate";
    radio.value = String(rate);
    radio.checked = rate === chosen;
    radio.addEventListener("change", () => {
      setSpeechRate(rate);
      try {
        localStorage.setItem(SPEECH_RATE_KEY, String(rate));
      } catch {
        // The speed still applies until the page closes.
      }
    });
    const text = document.createElement("span");
    text.textContent = `${rate}×`;
    label.append(radio, text);
    pills.appendChild(label);
  }
}

const fromPicker = createLanguagePicker(document.getElementById("from-picker"), "From", (code) =>
  setLanguages(code, toLanguage),
);
const toPicker = createLanguagePicker(document.getElementById("to-picker"), "To", (code) =>
  setLanguages(fromLanguage, code),
);

// Built-in scenes have every language; custom scenes only list their two. A
// clip's audio is in its first language, so it only works in that direction.
function sceneHasLanguages(candidate, ...languages) {
  if (candidate.video) {
    return languages[0] === candidate.languages[0] && languages[1] === candidate.languages[1];
  }
  return !candidate.languages || languages.every((language) => candidate.languages.includes(language));
}

// Picking the same language on both sides swaps them instead.
function setLanguages(newFrom, newTo) {
  if (newFrom === newTo) {
    [newFrom, newTo] = [toLanguage, fromLanguage];
  }
  fromLanguage = newFrom;
  toLanguage = newTo;
  fromPicker.setValue(fromLanguage);
  toPicker.setValue(toLanguage);
  showWordOfTheDay(fromLanguage, toLanguage);
  let notice = "";
  if (!sceneHasLanguages(scene, fromLanguage, toLanguage)) {
    const [first, second] = scene.languages.map(languageName);
    notice = scene.video
      ? `"${scene.title.en}" is a ${first} video to translate into ${second}, so here's a built-in scene. Yours is still in the list.`
      : `"${scene.title.en}" is only in ${first} and ${second}, so here's a built-in scene. Yours is still in the list.`;
    scene = SCENES[0];
  }
  showScene(notice);
}

// Draws the current scene, picking up where you left off in it.
function showScene(notice = "") {
  document.getElementById("scene-notice").textContent = notice;
  document.getElementById("scene-title").textContent = scene.title[fromLanguage] || scene.title.en;
  document.getElementById("scene-description").textContent = scene.description;
  document.getElementById("play-status").textContent = "";
  document.getElementById("play-translations-label").textContent =
    `Read the ${languageName(toLanguage)} after each line`;
  document.getElementById("custom-languages").textContent =
    `It will be in ${languageName(fromLanguage)} and ${languageName(toLanguage)}. To use others, change From and To below first.`;
  document.getElementById("clip-languages").textContent =
    `The video should be in ${languageName(fromLanguage)}, and you'll translate it into ${languageName(toLanguage)}. To use others, change From and To below first.`;
  showClipVideo(scene.video);
  // A clip is heard in the video, so the offer to read lines aloud doesn't apply.
  document.getElementById("auto-play-offer").hidden = Boolean(scene.video) || loadAutoPlayChoice() !== null;
  markChosenScene();
  updateSceneStars();
  renderLegend();
  renderDialogue();
  autoPlayCurrentLine();
}

function markChosenScene() {
  for (const button of document.querySelectorAll("#scene-picker [data-scene-id]")) {
    button.setAttribute("aria-pressed", String(button.dataset.sceneId === scene.id));
  }
}

// How long a scene is, counted from its lines so built-in and custom scenes
// are labeled the same way without storing anything extra.
function sceneLengthLabel(option) {
  const count = option.lines.length;
  return count === 1 ? "1 line" : `${count} lines`;
}

// Lists the scenes matching the search box. The open scene stays on screen
// even if it doesn't match, so searching never loses what was typed.
function renderScenePicker() {
  const picker = document.getElementById("scene-picker");
  const query = document.getElementById("scene-search").value;
  const matches = searchScenes(SCENES, query);
  picker.replaceChildren();
  document.getElementById("scene-search-message").textContent =
    matches.length === 0 ? `No scenes match "${query.trim()}". Try another word.` : "";
  for (const option of matches) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.sceneId = option.id;
    button.title = option.description;
    const name = document.createElement("span");
    name.className = "scene-name";
    name.textContent = option.title.en;
    const length = document.createElement("span");
    length.className = "scene-length";
    length.textContent = sceneLengthLabel(option);
    button.append(name, length);
    button.addEventListener("click", () => {
      scene = option;
      if (sceneHasLanguages(scene, fromLanguage, toLanguage)) {
        showScene();
      } else {
        setLanguages(...scene.languages);
      }
    });
    const chip = document.createElement("div");
    chip.className = "scene-chip";
    chip.dataset.chipFor = option.id;
    const stars = document.createElement("span");
    stars.className = "scene-stars";
    chip.append(button, stars);
    if (option.languages) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "scene-delete";
      deleteButton.textContent = "×";
      deleteButton.title = `Delete ${option.title.en}`;
      deleteButton.setAttribute("aria-label", `Delete ${option.title.en}`);
      deleteButton.addEventListener("click", () => askToDeleteScene(option));
      chip.appendChild(deleteButton);
    }
    picker.appendChild(chip);
  }
  markChosenScene();
  updateSceneStars();
}

// Shows the best stars for the chosen languages under each scene button;
// scenes not yet finished in these languages show none.
function updateSceneStars() {
  for (const chip of document.querySelectorAll("#scene-picker [data-chip-for]")) {
    const best = bestStarsFor(chip.dataset.chipFor, fromLanguage, toLanguage);
    const stars = chip.querySelector(".scene-stars");
    stars.hidden = best === 0;
    stars.replaceChildren();
    if (best > 0) {
      const symbols = document.createElement("span");
      symbols.setAttribute("aria-hidden", "true");
      symbols.textContent = "★".repeat(best) + "☆".repeat(5 - best);
      const words = document.createElement("span");
      words.className = "visually-hidden";
      words.textContent = `Your best: ${best} out of 5 stars`;
      stars.append(symbols, words);
    }
  }
}

let pendingScene = null;
let sceneToDelete = null;

function setCustomPanelOpen(isOpen) {
  document.getElementById("custom-panel").hidden = !isOpen;
  document.getElementById("custom-open").setAttribute("aria-expanded", String(isOpen));
}

function chosenOption(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function chosenSceneOptions() {
  const grammar = [...document.querySelectorAll('input[name="scene-grammar"]:checked')].map((box) => box.value);
  const otherGrammar = document.getElementById("custom-grammar-other").value.trim();
  if (otherGrammar !== "") {
    grammar.push(otherGrammar);
  }
  return {
    grammar,
    length: chosenOption("scene-length"),
    level: chosenOption("scene-level"),
    tone: chosenOption("scene-tone"),
    speakers: chosenOption("scene-speakers"),
  };
}

// Opens the AI first, because browsers only allow a new tab right after a click.
async function askAi(ai) {
  const message = document.getElementById("custom-ai-message");
  const promptBox = document.getElementById("custom-prompt");
  const descriptionBox = document.getElementById("custom-description");
  const situation = descriptionBox.value.trim();
  promptBox.hidden = true;
  if (situation === "") {
    message.textContent = "First, describe the conversation you want.";
    descriptionBox.focus();
    return;
  }
  const prompt = buildScenePrompt(situation, fromLanguage, toLanguage, chosenSceneOptions());
  if (ai.url) {
    window.open(aiLink(ai, prompt), "_blank", "noopener");
  }
  try {
    await navigator.clipboard.writeText(prompt);
    if (ai.promptParameter) {
      message.textContent = `${ai.name} opened with your request filled in. If its box is empty, paste there: your request is copied. Send it, then copy the whole reply.`;
    } else {
      const destination = ai.url ? ai.name : "any AI";
      message.textContent = `Your request is copied. Paste it into ${destination}, send it, then copy the whole reply.`;
    }
  } catch {
    promptBox.value = prompt;
    promptBox.hidden = false;
    message.textContent = "This browser blocked copying, so select and copy the request below, send it to the AI, then copy the whole reply.";
  }
}

const PREVIEW_LINE_COUNT = 3;

function renderScenePreview(preview) {
  const [firstLanguage, secondLanguage] = preview.languages;
  const speakerNames = Object.values(preview.speakers).map((speaker) => speaker.name);
  const lineCount = preview.lines.length;
  document.getElementById("custom-preview-title").textContent = preview.title.en;
  document.getElementById("custom-preview-summary").textContent =
    `${lineCount} ${lineCount === 1 ? "line" : "lines"} in ${languageName(firstLanguage)} and ${languageName(secondLanguage)}, with ${speakerNames.join(", ")}.`;

  const previewLines = document.getElementById("custom-preview-lines");
  previewLines.replaceChildren();
  for (const line of preview.lines.slice(0, PREVIEW_LINE_COUNT)) {
    const item = document.createElement("li");
    item.dir = "auto";
    item.textContent = `${preview.speakers[line.speaker].name}: ${line.text[firstLanguage][0]}`;
    previewLines.appendChild(item);
  }
  if (lineCount > PREVIEW_LINE_COUNT) {
    const more = document.createElement("li");
    more.textContent = `…and ${lineCount - PREVIEW_LINE_COUNT} more`;
    previewLines.appendChild(more);
  }
  document.getElementById("custom-preview").hidden = false;
}

// Nothing is saved until the learner confirms, so a wrong paste leaves no trace.
function previewPastedScene() {
  const replyBox = document.getElementById("custom-reply");
  const replyMessage = document.getElementById("custom-reply-message");
  document.getElementById("custom-cancel-message").textContent = "";
  document.getElementById("custom-preview").hidden = true;
  pendingScene = null;
  try {
    pendingScene = parseSceneReply(replyBox.value);
    replyMessage.textContent = "";
    renderScenePreview(pendingScene);
    document.getElementById("custom-confirm").focus();
  } catch (error) {
    replyMessage.textContent = error.message;
  }
  replyBox.value = "";
}

function cancelPendingScene() {
  pendingScene = null;
  document.getElementById("custom-preview").hidden = true;
  document.getElementById("custom-cancel-message").textContent = "Nothing was added. Paste another reply when you're ready.";
  document.getElementById("custom-reply").focus();
}

function addPendingScene() {
  const descriptionBox = document.getElementById("custom-description");
  const newScene = pendingScene;
  pendingScene = null;
  newScene.description = descriptionBox.value.trim() || newScene.description;
  SCENES.push(newScene);
  const saved = saveCustomScenes(SCENES.filter((option) => option.languages));

  document.getElementById("custom-preview").hidden = true;
  document.getElementById("custom-reply-message").textContent = "";
  descriptionBox.value = "";
  document.getElementById("custom-ai-message").textContent = "";
  document.getElementById("custom-prompt").hidden = true;
  document.getElementById("scene-search").value = "";
  setCustomPanelOpen(false);
  renderScenePicker();
  scene = newScene;
  setLanguages(...newScene.languages);
  document.getElementById("scene-notice").textContent = saved
    ? "Your scene is ready, and saved in this browser."
    : "Your scene is ready, but this browser couldn't save it, so it will be gone when you close the page.";
}

let pendingClip = null;

function setClipPanelOpen(isOpen) {
  document.getElementById("clip-panel").hidden = !isOpen;
  document.getElementById("clip-open").setAttribute("aria-expanded", String(isOpen));
}

function renderClipPreview(preview) {
  const speakerNames = Object.values(preview.speakers).map((speaker) => speaker.name);
  const count = preview.lines.length;
  const watchOnly = preview.watchOnlyCount
    ? ` Another ${preview.watchOnlyCount} short ${preview.watchOnlyCount === 1 ? "line" : "lines"} (like "okay") just play.`
    : "";
  document.getElementById("clip-preview-title").textContent = preview.title.en;
  document.getElementById("clip-preview-summary").textContent =
    `${count} ${count === 1 ? "line" : "lines"} to translate from ${languageName(preview.languages[0])} into ${languageName(preview.languages[1])}, with ${speakerNames.join(", ")}.${watchOnly}`;
  document.getElementById("clip-preview").hidden = false;
  document.getElementById("clip-confirm").focus();
}

// Each import attempt gets a number; switching to the Gemini route or
// starting again makes older attempts stop and ignore their results, so two
// previews never compete.
let clipImportRun = 0;
// The clip a Gemini chat request was made for, so its pasted reply is read
// with the same link, times, and languages.
let chatClip = null;

function readClipForm() {
  return clipImportRequest(
    document.getElementById("clip-link").value,
    document.getElementById("clip-start").value,
    document.getElementById("clip-end").value,
    fromLanguage,
    toLanguage,
  );
}

function setGeminiRouteShown(isShown) {
  document.getElementById("clip-gemini").hidden = !isShown;
  if (!isShown) {
    document.getElementById("clip-gemini-message").textContent = "";
    document.getElementById("clip-gemini-prompt").hidden = true;
  }
}

// Asks the server to watch the clip, retrying for about 3 minutes while
// Google is busy; from the first busy answer the Gemini chat route is offered
// too. Nothing is saved until the learner confirms the preview.
async function startClipImport() {
  const run = ++clipImportRun;
  const isCurrent = () => run === clipImportRun;
  const importButton = document.getElementById("clip-import");
  const message = document.getElementById("clip-message");
  document.getElementById("clip-preview").hidden = true;
  setGeminiRouteShown(false);
  pendingClip = null;
  let request;
  try {
    request = readClipForm();
  } catch (error) {
    message.textContent = error.message;
    return;
  }
  const [importFrom, importTo] = [fromLanguage, toLanguage];
  importButton.disabled = true;
  const watchingMessage = "⏳ Watching the clip and writing down who says what. This takes a minute or two…";
  message.textContent = watchingMessage;
  try {
    const result = await importClipWithRetries(
      request,
      (seconds) => {
        message.textContent = `⏳ Google's AI is busy, so trying again in ${seconds} seconds… Or do it with Gemini below.`;
        setGeminiRouteShown(true);
        setTimeout(() => {
          if (isCurrent()) {
            message.textContent = watchingMessage;
          }
        }, seconds * 1000);
      },
      () => !isCurrent(),
    );
    if (!isCurrent()) {
      return;
    }
    pendingClip = clipSceneFromImport(result, request, importFrom, importTo);
    message.textContent = "";
    setGeminiRouteShown(false);
    renderClipPreview(pendingClip);
  } catch (error) {
    if (!isCurrent()) {
      return;
    }
    if (isBusyError(error)) {
      message.textContent = "Google's AI is still too busy to watch the clip. Do it with Gemini below instead, or try again in a few minutes.";
      setGeminiRouteShown(true);
    } else {
      message.textContent = error.message;
    }
  } finally {
    if (isCurrent()) {
      importButton.disabled = false;
    }
  }
}

// The Gemini chat route: copies the request and opens Gemini (the tab first,
// because browsers only allow a new tab right after a click). Stops the
// automatic import, which can't win once the learner has gone this way.
async function openGeminiForClip() {
  const message = document.getElementById("clip-gemini-message");
  const promptBox = document.getElementById("clip-gemini-prompt");
  promptBox.hidden = true;
  let request;
  try {
    request = readClipForm();
  } catch (error) {
    message.textContent = error.message;
    return;
  }
  clipImportRun += 1;
  document.getElementById("clip-import").disabled = false;
  document.getElementById("clip-message").textContent = "";
  chatClip = { request, from: fromLanguage, to: toLanguage };
  const prompt = clipChatPrompt(request);
  window.open(GEMINI_CHAT_URL, "_blank", "noopener");
  try {
    await navigator.clipboard.writeText(prompt);
    message.textContent = "Your request is copied. Paste it into Gemini, send it, then copy the whole reply back here.";
  } catch {
    promptBox.value = prompt;
    promptBox.hidden = false;
    message.textContent = "This browser blocked copying, so select and copy the request below, send it to Gemini, then copy the whole reply back here.";
  }
}

// Reads a pasted Gemini reply into the same preview the automatic import uses.
function previewGeminiReply() {
  const replyBox = document.getElementById("clip-gemini-reply");
  const message = document.getElementById("clip-gemini-message");
  const reply = replyBox.value;
  replyBox.value = "";
  if (reply.trim() === "") {
    return;
  }
  if (!chatClip) {
    message.textContent = "First press \"Copy the request & open Gemini\", so the reply can be matched to your clip.";
    return;
  }
  clipImportRun += 1;
  document.getElementById("clip-import").disabled = false;
  try {
    const result = parseClipReply(reply, chatClip.request);
    pendingClip = clipSceneFromImport(result, chatClip.request, chatClip.from, chatClip.to, {
      padding: CHAT_CLIP_PADDING_SECONDS,
    });
    message.textContent = "";
    document.getElementById("clip-message").textContent = "";
    setGeminiRouteShown(false);
    renderClipPreview(pendingClip);
  } catch (error) {
    message.textContent = error.message;
  }
}

function cancelPendingClip() {
  pendingClip = null;
  document.getElementById("clip-preview").hidden = true;
  document.getElementById("clip-message").textContent = "Nothing was added. Try another part or another video.";
}

function addPendingClip() {
  const newScene = pendingClip;
  pendingClip = null;
  SCENES.push(newScene);
  const saved = saveCustomScenes(SCENES.filter((option) => option.languages));
  document.getElementById("clip-preview").hidden = true;
  document.getElementById("clip-message").textContent = "";
  setGeminiRouteShown(false);
  chatClip = null;
  for (const id of ["clip-link", "clip-start", "clip-end"]) {
    document.getElementById(id).value = "";
  }
  document.getElementById("scene-search").value = "";
  setClipPanelOpen(false);
  renderScenePicker();
  scene = newScene;
  setLanguages(...newScene.languages);
  document.getElementById("scene-notice").textContent = saved
    ? "Your clip is ready, and saved in this browser. Listen, then translate each line."
    : "Your clip is ready, but this browser couldn't save it, so it will be gone when you close the page.";
}

// Play scene plays the whole clip in the video.
function toggleWholeClip() {
  if (isClipPlaying()) {
    stopClipPlayback();
    return;
  }
  setPlayButton(true);
  playClipSegment({ from: scene.video.start, to: scene.video.end, onDone: () => setPlayButton(false) });
}

function askToDeleteScene(option) {
  sceneToDelete = option;
  document.getElementById("remove-confirm-message").textContent =
    `Delete "${option.title.en}" from this browser? This can't be undone.`;
  document.getElementById("remove-confirm").hidden = false;
  document.getElementById("remove-no").focus();
}

function keepSceneToDelete() {
  sceneToDelete = null;
  document.getElementById("remove-confirm").hidden = true;
}

function deleteChosenScene() {
  const removedTitle = sceneToDelete.title.en;
  const wasOpen = sceneToDelete === scene;
  SCENES.splice(SCENES.indexOf(sceneToDelete), 1);
  saveCustomScenes(SCENES.filter((option) => option.languages));
  keepSceneToDelete();
  renderScenePicker();
  if (wasOpen) {
    scene = SCENES[0];
    showScene(`Deleted "${removedTitle}".`);
  } else {
    document.getElementById("scene-notice").textContent = `Deleted "${removedTitle}".`;
  }
}

for (const ai of AI_CHOICES) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = ai.name;
  button.addEventListener("click", () => askAi(ai));
  document.getElementById("custom-ai-buttons").appendChild(button);
}
document.getElementById("custom-open").addEventListener("click", () => {
  setCustomPanelOpen(document.getElementById("custom-panel").hidden);
});
// The pasted text reaches the box just after this event.
document.getElementById("custom-reply").addEventListener("paste", () => setTimeout(previewPastedScene));
document.getElementById("custom-confirm").addEventListener("click", addPendingScene);
document.getElementById("custom-cancel").addEventListener("click", cancelPendingScene);
document.getElementById("clip-open").addEventListener("click", () => {
  setClipPanelOpen(document.getElementById("clip-panel").hidden);
});
document.getElementById("clip-import").addEventListener("click", startClipImport);
document.getElementById("clip-confirm").addEventListener("click", addPendingClip);
document.getElementById("clip-cancel").addEventListener("click", cancelPendingClip);
document.getElementById("clip-gemini-open").addEventListener("click", openGeminiForClip);
// The pasted text reaches the box just after this event.
document.getElementById("clip-gemini-reply").addEventListener("paste", () => setTimeout(previewGeminiReply));
document.getElementById("remove-no").addEventListener("click", keepSceneToDelete);
document.getElementById("remove-yes").addEventListener("click", deleteChosenScene);
document.getElementById("swap-button").addEventListener("click", () => setLanguages(toLanguage, fromLanguage));
document.getElementById("reset-button").addEventListener("click", resetRun);
document.getElementById("skip-all-button").addEventListener("click", askToSkipAll);
document.getElementById("skip-all-yes").addEventListener("click", skipToResults);
document.getElementById("skip-all-no").addEventListener("click", closeSkipAllConfirm);
document.getElementById("play-again").addEventListener("click", resetRun);
document.getElementById("pick-another").addEventListener("click", pickAnotherScene);
document.getElementById("scene-search").addEventListener("input", renderScenePicker);
document.getElementById("play-scene").addEventListener("click", () => {
  if (scene.video) {
    toggleWholeClip();
  } else if (scenePlayback) {
    stopScenePlayback();
  } else {
    playScene();
  }
});
renderSpeedPills();
setUpListenSettings();
setUpAutoPlay();
setUpSoundEffects();
setUpWordOfTheDaySpeech();
setUpStreak();
renderScenePicker();
setLanguages(fromLanguage, toLanguage);
