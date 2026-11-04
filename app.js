// Draws the scene and handles checking translations.

// Chrome and Safari still expose speech recognition under a "webkit" prefix.
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

let activeListening = null;

const SCENES = [CAFE_SCENE, DOCTOR_SCENE, ...loadCustomScenes()];

let scene = SCENES[0];
let fromLanguage = "es";
let toLanguage = "en";
// Separate answers per scene and language pair so switching doesn't erase what was typed.
const answersByPair = {};
let showResults = false;

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

function renderResult(container, line, attempt) {
  container.innerHTML = "";
  const reference = referenceText(line, toLanguage);
  if (attempt.trim() === "") {
    container.className = "result skipped";
    container.textContent = `Skipped. One way to say it: ${reference}`;
    return;
  }
  const score = scoreLine(attempt, line, toLanguage);
  const percent = Math.round(score * 100);
  container.className = `result ${scoreLabel(score)}`;

  const scoreText = document.createElement("strong");
  scoreText.textContent = `${percent}% match`;
  const referenceSpan = document.createElement("span");
  referenceSpan.textContent = ` · One way to say it: ${reference}`;
  container.append(scoreText, referenceSpan);
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

function renderOriginal(line) {
  const { main, alt } = lineText(line, fromLanguage);
  const original = document.createElement("div");
  original.className = "original";
  const mainText = document.createElement("p");
  mainText.lang = fromLanguage;
  mainText.dir = "auto";
  mainText.textContent = main;
  original.appendChild(mainText);
  if (alt) {
    const romanized = document.createElement("p");
    romanized.className = "romanized";
    romanized.textContent = alt;
    original.appendChild(romanized);
  }
  return original;
}

function renderDialogue() {
  stopListening();
  const targetName = languageName(toLanguage);
  const answers = currentAnswers();
  const list = document.getElementById("dialogue");
  list.innerHTML = "";

  scene.lines.forEach((line, index) => {
    const speaker = scene.speakers[line.speaker];
    const item = document.createElement("li");
    item.className = "line";
    item.style.setProperty("--speaker-color", speaker.color);

    const name = document.createElement("div");
    name.className = "speaker-name";
    name.textContent = speaker.name;

    const input = document.createElement("textarea");
    input.rows = 2;
    input.lang = toLanguage;
    input.dir = "auto";
    input.placeholder = `${speaker.name}'s line in ${targetName}…`;
    input.setAttribute("aria-label", `Your ${targetName} translation of ${speaker.name}, line ${index + 1}`);
    input.value = answers[index] || "";

    const result = document.createElement("div");
    result.className = "result";
    result.setAttribute("aria-live", "polite");

    const saveAnswer = () => {
      answers[index] = input.value;
      result.className = "result";
      result.innerHTML = "";
    };
    input.addEventListener("input", saveAnswer);

    const micButton = document.createElement("button");
    micButton.type = "button";
    micButton.className = "mic";
    micButton.textContent = "🎤";
    micButton.setAttribute("aria-pressed", "false");
    micButton.setAttribute("aria-label", `Speak ${speaker.name}'s line in ${targetName}`);
    micButton.title = `Speak your translation in ${targetName}`;

    const micStatus = document.createElement("div");
    micStatus.className = "mic-status";
    micStatus.setAttribute("aria-live", "polite");

    micButton.addEventListener("click", () => {
      if (micButton.classList.contains("listening")) {
        activeListening.stop();
      } else {
        micStatus.textContent = "";
        startListening(input, micButton, micStatus, saveAnswer);
      }
    });

    const answerRow = document.createElement("div");
    answerRow.className = "answer-row";
    answerRow.append(input, micButton);

    if (showResults) {
      renderResult(result, line, input.value);
    }

    item.append(name, renderOriginal(line), answerRow, micStatus, result);
    list.appendChild(item);
  });
}

function checkAll() {
  showResults = true;
  renderDialogue();

  const answers = currentAnswers();
  const attempted = scene.lines
    .map((line, index) => ({ line, attempt: answers[index] || "" }))
    .filter(({ attempt }) => attempt.trim() !== "");
  const summary = document.getElementById("summary");
  if (attempted.length === 0) {
    summary.textContent = "Try at least one line, then check again.";
    return;
  }
  const total = attempted.reduce(
    (sum, { line, attempt }) => sum + scoreLine(attempt, line, toLanguage),
    0,
  );
  const average = Math.round((total / attempted.length) * 100);
  summary.textContent = `Average match: ${average}% across ${attempted.length} of ${scene.lines.length} lines.`;
}

const fromPicker = createLanguagePicker(document.getElementById("from-picker"), "From", (code) =>
  setLanguages(code, toLanguage),
);
const toPicker = createLanguagePicker(document.getElementById("to-picker"), "To", (code) =>
  setLanguages(fromLanguage, code),
);

// Built-in scenes have every language; custom scenes only list their two.
function sceneHasLanguages(candidate, ...languages) {
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
  let notice = "";
  if (!sceneHasLanguages(scene, fromLanguage, toLanguage)) {
    const [first, second] = scene.languages.map(languageName);
    notice = `"${scene.title.en}" is only in ${first} and ${second}, so here's a built-in scene. Yours is still in the list.`;
    scene = SCENES[0];
  }
  showScene(notice);
}

// Draws the current scene from scratch, with results hidden until the next check.
function showScene(notice = "") {
  showResults = false;
  document.getElementById("summary").textContent = "";
  document.getElementById("scene-notice").textContent = notice;
  document.getElementById("scene-title").textContent = scene.title[fromLanguage] || scene.title.en;
  document.getElementById("scene-description").textContent = scene.description;
  document.getElementById("custom-languages").textContent =
    `It will be in ${languageName(fromLanguage)} and ${languageName(toLanguage)}. To use others, change From and To below first.`;
  markChosenScene();
  renderLegend();
  renderDialogue();
}

function markChosenScene() {
  for (const button of document.querySelectorAll("#scene-picker [data-scene-id]")) {
    button.setAttribute("aria-pressed", String(button.dataset.sceneId === scene.id));
  }
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
    button.textContent = option.title.en;
    button.title = option.description;
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
    chip.appendChild(button);
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
}

function clearAnswers() {
  answersByPair[answersKey()] = [];
  showResults = false;
  document.getElementById("summary").textContent = "";
  renderDialogue();
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
document.getElementById("remove-no").addEventListener("click", keepSceneToDelete);
document.getElementById("remove-yes").addEventListener("click", deleteChosenScene);
document.getElementById("swap-button").addEventListener("click", () => setLanguages(toLanguage, fromLanguage));
document.getElementById("check-button").addEventListener("click", checkAll);
document.getElementById("reset-button").addEventListener("click", clearAnswers);
document.getElementById("scene-search").addEventListener("input", renderScenePicker);
renderScenePicker();
setLanguages(fromLanguage, toLanguage);
