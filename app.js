// Draws the scene and handles checking translations.

const LANGUAGE_NAMES = { es: "Spanish", en: "English" };
const SPEECH_LOCALES = { es: "es-ES", en: "en-US" };
// Chrome and Safari still expose speech recognition under a "webkit" prefix.
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

let activeRecognition = null;

let direction = "es-en";
// Separate answers per direction so switching doesn't erase what was typed.
const answers = { "es-en": [], "en-es": [] };
let showResults = false;

function directionLanguages() {
  const [source, target] = direction.split("-");
  return { source, target };
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

function renderResult(container, line, attempt, target) {
  container.innerHTML = "";
  if (attempt.trim() === "") {
    container.className = "result skipped";
    container.textContent = `Not answered. Reference: ${line[target][0]}`;
    return;
  }
  const score = scoreTranslation(attempt, line[target]);
  const percent = Math.round(score * 100);
  container.className = `result ${scoreLabel(score)}`;

  const scoreText = document.createElement("strong");
  scoreText.textContent = `${percent}% match`;
  const reference = document.createElement("span");
  reference.textContent = ` · Reference: ${line[target][0]}`;
  container.append(scoreText, reference);
}

const SPEECH_ERROR_MESSAGES = {
  "not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "service-not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "no-speech": "Didn't hear anything. Click 🎤 and try again.",
  "audio-capture": "No microphone found. Check that one is connected.",
  network: "Speech recognition needs an internet connection.",
};

function stopListening() {
  if (activeRecognition) {
    activeRecognition.abort();
    activeRecognition = null;
  }
}

// Listens for one spoken answer and writes it into the box, after any text
// already typed there.
function startListening(input, micButton, status, onTextChange) {
  if (!SpeechRecognitionClass) {
    status.textContent = "Speaking isn't supported in this browser. Try Chrome or Safari.";
    return;
  }
  const { target } = directionLanguages();
  const recognition = new SpeechRecognitionClass();
  recognition.lang = SPEECH_LOCALES[target];
  recognition.interimResults = true;

  const existingText = input.value.trim();
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results, (result) => result[0].transcript).join("");
    const isFinished = event.results[event.results.length - 1].isFinal;
    // Punctuate only the finished sentence, so the text doesn't flicker while speaking.
    const spoken = isFinished ? punctuateSpeech(transcript, target) : transcript;
    input.value = existingText ? `${existingText} ${spoken}` : spoken;
    onTextChange();
  };
  recognition.onerror = (event) => {
    if (event.error !== "aborted") {
      status.textContent = SPEECH_ERROR_MESSAGES[event.error] || "Something went wrong while listening. Try again.";
    }
  };
  recognition.onend = () => {
    micButton.classList.remove("listening");
    micButton.setAttribute("aria-pressed", "false");
    if (status.textContent === "Listening…") {
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
  status.textContent = "Listening…";
  recognition.start();
}

function renderDialogue() {
  stopListening();
  const { source, target } = directionLanguages();
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

    const original = document.createElement("p");
    original.className = "original";
    original.lang = source;
    original.textContent = line[source][0];

    const input = document.createElement("textarea");
    input.rows = 2;
    input.lang = target;
    input.placeholder = `${speaker.name}'s line in ${LANGUAGE_NAMES[target]}…`;
    input.setAttribute("aria-label", `Your ${LANGUAGE_NAMES[target]} translation of ${speaker.name}, line ${index + 1}`);
    input.value = answers[direction][index] || "";

    const result = document.createElement("div");
    result.className = "result";
    result.setAttribute("aria-live", "polite");

    const saveAnswer = () => {
      answers[direction][index] = input.value;
      result.className = "result";
      result.innerHTML = "";
    };
    input.addEventListener("input", saveAnswer);

    const micButton = document.createElement("button");
    micButton.type = "button";
    micButton.className = "mic";
    micButton.textContent = "🎤";
    micButton.setAttribute("aria-pressed", "false");
    micButton.setAttribute("aria-label", `Speak ${speaker.name}'s line in ${LANGUAGE_NAMES[target]}`);
    micButton.title = `Speak your translation in ${LANGUAGE_NAMES[target]}`;

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
      renderResult(result, line, input.value, target);
    }

    item.append(name, original, answerRow, micStatus, result);
    list.appendChild(item);
  });
}

function checkAll() {
  const { target } = directionLanguages();
  showResults = true;
  renderDialogue();

  const attempted = SCENE.lines
    .map((line, index) => ({ line, attempt: answers[direction][index] || "" }))
    .filter(({ attempt }) => attempt.trim() !== "");
  const summary = document.getElementById("summary");
  if (attempted.length === 0) {
    summary.textContent = "Type a translation in at least one box, then check again.";
    return;
  }
  const total = attempted.reduce((sum, { line, attempt }) => sum + scoreTranslation(attempt, line[target]), 0);
  const average = Math.round((total / attempted.length) * 100);
  summary.textContent = `Average match: ${average}% across ${attempted.length} of ${SCENE.lines.length} lines.`;
}

function setDirection(newDirection) {
  direction = newDirection;
  showResults = false;
  document.getElementById("summary").textContent = "";
  for (const button of document.querySelectorAll(".direction button")) {
    button.classList.toggle("active", button.dataset.direction === direction);
  }
  renderDialogue();
}

function clearAnswers() {
  answers[direction] = [];
  showResults = false;
  document.getElementById("summary").textContent = "";
  renderDialogue();
}

document.getElementById("scene-title").textContent = SCENE.title;
document.getElementById("scene-description").textContent = SCENE.description;
for (const button of document.querySelectorAll(".direction button")) {
  button.addEventListener("click", () => setDirection(button.dataset.direction));
}
document.getElementById("check-button").addEventListener("click", checkAll);
document.getElementById("reset-button").addEventListener("click", clearAnswers);
renderLegend();
renderDialogue();
