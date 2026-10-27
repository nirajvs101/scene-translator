// Draws the scene and handles checking translations.

// Chrome and Safari still expose speech recognition under a "webkit" prefix.
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

let activeRecognition = null;

let fromLanguage = "es";
let toLanguage = "en";
// Separate answers per language pair so switching doesn't erase what was typed.
const answersByPair = {};
let showResults = false;

function currentAnswers() {
  const pair = `${fromLanguage}-${toLanguage}`;
  answersByPair[pair] = answersByPair[pair] || [];
  return answersByPair[pair];
}

function languageName(language) {
  return LANGUAGES[language].name;
}

// The line's main text, plus its romanized form for languages that have one.
function lineText(line, language) {
  const altScript = LANGUAGES[language].altScript;
  return { main: line.text[language][0], alt: altScript ? line.text[altScript][0] : null };
}

function referenceText(line, language) {
  const { main, alt } = lineText(line, language);
  return alt ? `${main} (${alt})` : main;
}

function renderLegend() {
  const legend = document.getElementById("speaker-legend");
  legend.innerHTML = "";
  for (const speaker of Object.values(SCENE.speakers)) {
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
    container.textContent = `Not answered. Reference: ${reference}`;
    return;
  }
  const score = scoreLine(attempt, line, toLanguage);
  const percent = Math.round(score * 100);
  container.className = `result ${scoreLabel(score)}`;

  const scoreText = document.createElement("strong");
  scoreText.textContent = `${percent}% match`;
  const referenceSpan = document.createElement("span");
  referenceSpan.textContent = ` · Reference: ${reference}`;
  container.append(scoreText, referenceSpan);
}

const SPEECH_ERROR_MESSAGES = {
  "not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "service-not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "no-speech": "Didn't hear anything. Click 🎤 and try again.",
  "audio-capture": "No microphone found. Check that one is connected.",
  "language-not-supported": "Your browser can't recognize speech in this language. Try typing instead.",
  network: "Speech recognition needs an internet connection.",
};

function stopListening() {
  if (activeRecognition) {
    activeRecognition.abort();
    activeRecognition = null;
  }
}

const LISTENING_MESSAGE = "Listening… click 🎤 when you're done";
// Learners pause to think mid-sentence, so only stop after a long silence.
const SILENCE_BEFORE_STOP_MS = 4000;

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
  let silenceTimer = null;
  const showAnswer = (spoken) => {
    input.value = existingText && spoken ? `${existingText} ${spoken}` : existingText || spoken;
    onTextChange();
  };

  recognition.onresult = (event) => {
    transcript = Array.from(event.results, (result) => result[0].transcript.trim())
      .filter((part) => part !== "")
      .join(" ");
    showAnswer(transcript);
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => recognition.stop(), SILENCE_BEFORE_STOP_MS);
  };
  recognition.onerror = (event) => {
    if (event.error !== "aborted") {
      status.textContent = SPEECH_ERROR_MESSAGES[event.error] || "Something went wrong while listening. Try again.";
    }
  };
  recognition.onend = () => {
    clearTimeout(silenceTimer);
    // Punctuate once, after the whole answer, rather than at every pause.
    if (transcript !== "") {
      showAnswer(punctuateSpeech(transcript, language));
    }
    micButton.classList.remove("listening");
    micButton.setAttribute("aria-pressed", "false");
    if (status.textContent === LISTENING_MESSAGE) {
      status.textContent = "";
    }
    if (activeRecognition === recognition) {
      activeRecognition = null;
    }
  };

  stopListening();
  activeRecognition = recognition;
  micButton.classList.add("listening");
  micButton.setAttribute("aria-pressed", "true");
  status.textContent = LISTENING_MESSAGE;
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

  SCENE.lines.forEach((line, index) => {
    const speaker = SCENE.speakers[line.speaker];
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
        activeRecognition.stop();
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
  const attempted = SCENE.lines
    .map((line, index) => ({ line, attempt: answers[index] || "" }))
    .filter(({ attempt }) => attempt.trim() !== "");
  const summary = document.getElementById("summary");
  if (attempted.length === 0) {
    summary.textContent = "Type a translation in at least one box, then check again.";
    return;
  }
  const total = attempted.reduce(
    (sum, { line, attempt }) => sum + scoreLine(attempt, line, toLanguage),
    0,
  );
  const average = Math.round((total / attempted.length) * 100);
  summary.textContent = `Average match: ${average}% across ${attempted.length} of ${SCENE.lines.length} lines.`;
}

const fromPicker = createLanguagePicker(document.getElementById("from-picker"), "From", (code) =>
  setLanguages(code, toLanguage),
);
const toPicker = createLanguagePicker(document.getElementById("to-picker"), "To", (code) =>
  setLanguages(fromLanguage, code),
);

// Picking the same language on both sides swaps them instead.
function setLanguages(newFrom, newTo) {
  if (newFrom === newTo) {
    [newFrom, newTo] = [toLanguage, fromLanguage];
  }
  fromLanguage = newFrom;
  toLanguage = newTo;
  fromPicker.setValue(fromLanguage);
  toPicker.setValue(toLanguage);
  showResults = false;
  document.getElementById("summary").textContent = "";
  document.getElementById("scene-title").textContent = SCENE.title[fromLanguage];
  renderDialogue();
}

function clearAnswers() {
  answersByPair[`${fromLanguage}-${toLanguage}`] = [];
  showResults = false;
  document.getElementById("summary").textContent = "";
  renderDialogue();
}

document.getElementById("swap-button").addEventListener("click", () => setLanguages(toLanguage, fromLanguage));
document.getElementById("check-button").addEventListener("click", checkAll);
document.getElementById("reset-button").addEventListener("click", clearAnswers);
document.getElementById("scene-description").textContent = SCENE.description;
renderLegend();
setLanguages(fromLanguage, toLanguage);
