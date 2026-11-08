// Plays a scene one line at a time: the current line is a big card, and
// finished lines stack above it like a chat thread. After the last line
// comes a results screen with stars, the weakest lines, and a full review.

// A line is finished once it reaches this score, or after this many checks.
const GREAT_SCORE = 0.9;
const MAX_CHECKS = 2;
const WEAK_LINES_SHOWN = 3;

// Progress per scene and language pair, like the answers, so switching
// scenes or languages and coming back picks up where you left off.
// results[i] is { status: "trying" | "checked" | "skipped", score, checks }.
const runsByPair = {};

function currentRun() {
  const key = answersKey();
  runsByPair[key] = runsByPair[key] || { index: 0, results: [] };
  return runsByPair[key];
}

function isFinished(result) {
  return Boolean(result) && result.status !== "trying";
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Changes the page with a smooth animation where the browser supports it:
// the finished card shrinks into its place in the thread and the next one
// slides in. Resolves true if the browser animated it; otherwise the caller
// slides the new card in with plain CSS.
async function animateChange(update) {
  if (!document.startViewTransition || prefersReducedMotion.matches) {
    update();
    return false;
  }
  await document.startViewTransition(update).finished;
  return true;
}

const CHEERS = [
  [GREAT_SCORE, "Great!"],
  [0.75, "Nice work!"],
  [0.4, "So close!"],
  [0, "Not quite."],
];

function cheerFor(score) {
  return CHEERS.find(([minimum]) => score >= minimum)[1];
}

// Compares an answer with the line's references, in the script the learner
// wrote in (for example Manglish instead of Malayalam script).
function compareLine(attempt, line, language) {
  const { altScript, byCharacter } = LANGUAGES[language];
  const native = compareWithReference(attempt, line.text[language], byCharacter);
  const romanized = altScript && line.text[altScript] ? compareWithReference(attempt, line.text[altScript]) : null;
  return { native, romanized, closest: romanized && romanized.score > native.score ? romanized : native };
}

function appendPieces(container, pieces) {
  for (const { text, missed } of pieces) {
    if (missed) {
      const mark = document.createElement("mark");
      mark.className = "missed";
      mark.textContent = text;
      container.appendChild(mark);
    } else {
      container.append(text);
    }
  }
}

// "One way to say it", with the words the answer missed underlined. With no
// answer (a skip), nothing is underlined.
function renderReference(line, attempt) {
  const reference = document.createElement("span");
  reference.className = "reference";
  reference.dir = "auto";
  if (attempt.trim() === "") {
    reference.textContent = referenceText(line, toLanguage);
    return reference;
  }
  const { native, romanized, closest } = compareLine(attempt, line, toLanguage);
  // The two scripts list the same sentences in the same order, so the
  // matching form of the closest sentence is at the same position.
  const nativeForms = line.text[toLanguage];
  const romanizedForms = romanized ? line.text[LANGUAGES[toLanguage].altScript] : [];
  if (closest === native) {
    appendPieces(reference, native.pieces);
    if (romanized) {
      const position = nativeForms.indexOf(native.reference);
      reference.append(` (${romanizedForms[position] || romanizedForms[0]})`);
    }
  } else {
    const position = romanizedForms.indexOf(romanized.reference);
    reference.append(`${nativeForms[position] || nativeForms[0]} (`);
    appendPieces(reference, romanized.pieces);
    reference.append(")");
  }
  return reference;
}

function missedWords(line, attempt) {
  return compareLine(attempt, line, toLanguage)
    .closest.pieces.filter((piece) => piece.missed)
    .map((piece) => piece.text.replace(/[^\p{L}\p{M}\p{N}'’-]/gu, ""))
    .filter((word) => word !== "");
}

function scoreChip(result) {
  const chip = document.createElement("span");
  if (result.status === "skipped") {
    chip.className = "chip skipped";
    chip.textContent = "skipped";
  } else {
    chip.className = `chip ${scoreLabel(result.score)}`;
    chip.textContent = `${Math.round(result.score * 100)}%`;
  }
  return chip;
}

// A finished line, shrunk into the thread: who said what, and how you did.
function renderPastLine(line, index, result, answer) {
  const speaker = scene.speakers[line.speaker];
  const item = document.createElement("li");
  item.className = "past-line";
  item.dataset.lineIndex = String(index);
  item.style.setProperty("--speaker-color", speaker.color);
  item.style.viewTransitionName = `line-${index}`;

  const name = document.createElement("span");
  name.className = "past-speaker";
  name.textContent = speaker.name;
  const original = document.createElement("span");
  original.className = "past-original";
  original.lang = fromLanguage;
  original.dir = "auto";
  original.textContent = lineText(line, fromLanguage).main;
  const mine = document.createElement("span");
  mine.className = "past-answer";
  mine.dir = "auto";
  mine.textContent = result.status === "skipped" || answer.trim() === "" ? "Skipped" : answer;
  mine.append(" ", scoreChip(result));
  item.append(name, " ", original, mine);
  return item;
}

function actionButton(text, onClick, { primary = false, id = "" } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  if (primary) {
    button.className = "primary";
  }
  if (id) {
    button.id = id;
  }
  button.addEventListener("click", onClick);
  return button;
}

// The line being translated: the original, an answer box, and feedback
// that changes as you check, retry, skip, and move on.
function renderCurrentCard(line, index, run) {
  const speaker = scene.speakers[line.speaker];
  const targetName = languageName(toLanguage);
  const answers = currentAnswers();
  const result = run.results[index];
  const finished = isFinished(result);
  const isLastLine = index === scene.lines.length - 1;

  const item = document.createElement("li");
  item.className = "line current-card";
  item.dataset.lineIndex = String(index);
  item.style.setProperty("--speaker-color", speaker.color);
  item.style.viewTransitionName = `line-${index}`;

  const name = document.createElement("div");
  name.className = "speaker-name";
  name.textContent = speaker.name;

  const status = document.createElement("div");
  status.className = "mic-status";
  status.setAttribute("aria-live", "polite");

  const input = document.createElement("textarea");
  input.rows = 2;
  input.lang = toLanguage;
  input.dir = "auto";
  input.placeholder = `${speaker.name}'s line in ${targetName}…`;
  input.setAttribute("aria-label", `Your ${targetName} translation of ${speaker.name}, line ${index + 1}`);
  input.value = answers[index] || "";
  input.readOnly = finished;
  input.addEventListener("input", () => {
    answers[index] = input.value;
  });

  const micButton = document.createElement("button");
  micButton.type = "button";
  micButton.className = "mic";
  micButton.textContent = "🎤";
  micButton.disabled = finished;
  micButton.setAttribute("aria-pressed", "false");
  micButton.setAttribute("aria-label", `Speak ${speaker.name}'s line in ${targetName}`);
  micButton.title = `Speak your translation in ${targetName}`;
  micButton.addEventListener("click", () => {
    if (micButton.classList.contains("listening")) {
      activeListening.stop();
    } else {
      status.textContent = "";
      startListening(input, micButton, status, () => {
        answers[index] = input.value;
      });
    }
  });

  const speakAnswer = createSpeakButton(`Hear your ${targetName} translation`, () => input.value, toLanguage, status);
  const answerRow = document.createElement("div");
  answerRow.className = "answer-row";
  answerRow.append(input, speakAnswer, micButton);

  const feedback = document.createElement("div");
  feedback.className = "result";
  feedback.setAttribute("aria-live", "polite");

  const actions = document.createElement("div");
  actions.className = "card-actions";

  if (!result) {
    actions.append(
      actionButton("Check", () => checkCurrentLine(input, status), { primary: true, id: "check-button" }),
      actionButton("Skip", skipCurrentLine, { id: "skip-button" }),
    );
  } else if (result.status === "trying") {
    feedback.classList.add(scoreLabel(result.score));
    const score = document.createElement("strong");
    score.textContent = `${Math.round(result.score * 100)}% match`;
    feedback.append(score, ` · ${cheerFor(result.score)} Change your answer and check once more, or see the answer.`);
    actions.append(
      actionButton("Check again", () => checkCurrentLine(input, status), { primary: true, id: "check-button" }),
      actionButton("Show answer", () => finishCurrentLine("checked")),
    );
  } else {
    const speakReference = createSpeakButton(
      `Hear one way to say it in ${targetName}`,
      () => lineText(line, toLanguage).main,
      toLanguage,
      status,
    );
    if (result.status === "skipped") {
      feedback.classList.add("skipped");
      feedback.append("Skipped. One way to say it: ", renderReference(line, ""), " ", speakReference);
    } else {
      feedback.classList.add(scoreLabel(result.score));
      const score = document.createElement("strong");
      score.textContent = `${Math.round(result.score * 100)}% match`;
      feedback.append(score, ` · ${cheerFor(result.score)} One way to say it: `, renderReference(line, input.value), " ", speakReference);
      if (result.score >= GREAT_SCORE) {
        item.classList.add("celebrate");
      }
    }
    actions.append(actionButton(isLastLine ? "See results →" : "Next line →", goToNextLine, { primary: true, id: "next-button" }));
  }

  // Enter checks or moves on; Shift+Enter still starts a new line in the box.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      actions.querySelector(".primary").click();
    }
  });

  item.append(name, renderOriginal(line, status), answerRow, status, feedback, actions);
  return item;
}

function renderProgress(run) {
  const total = scene.lines.length;
  const done = run.results.filter(isFinished).length;
  const label = document.getElementById("progress-label");
  label.textContent = run.index >= total ? `All ${total} lines done` : `Line ${run.index + 1} of ${total}`;
  document.getElementById("progress-fill").style.width = `${(done / total) * 100}%`;
  document.getElementById("progress-bar").setAttribute("aria-valuenow", String(done));
  document.getElementById("progress-bar").setAttribute("aria-valuemax", String(total));
}

// Draws the thread, or the results once every line is done.
function renderDialogue() {
  stopListening();
  stopScenePlayback();
  stopSpeaking();
  const run = currentRun();
  const answers = currentAnswers();
  const list = document.getElementById("dialogue");
  list.replaceChildren();
  renderProgress(run);

  const lastShown = Math.min(run.index, scene.lines.length);
  for (let index = 0; index < lastShown; index++) {
    list.appendChild(renderPastLine(scene.lines[index], index, run.results[index], answers[index] || ""));
  }
  const allDone = run.index >= scene.lines.length;
  if (!allDone) {
    list.appendChild(renderCurrentCard(scene.lines[run.index], run.index, run));
  }
  document.getElementById("results").hidden = !allDone;
  document.getElementById("skip-all-button").hidden = allDone;
  closeSkipAllConfirm();
  if (allDone) {
    renderResults(run);
  }
}

function currentCard() {
  return document.querySelector("#dialogue .current-card");
}

// Redraws just the current card after a check, keeping your place on the page.
function refreshCurrentCard({ focus }) {
  const run = currentRun();
  const fresh = renderCurrentCard(scene.lines[run.index], run.index, run);
  currentCard().replaceWith(fresh);
  if (focus === "answer") {
    const input = fresh.querySelector("textarea");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  } else {
    fresh.querySelector(".card-actions .primary").focus({ preventScroll: true });
  }
}

function checkCurrentLine(input, status) {
  const run = currentRun();
  const index = run.index;
  if (input.value.trim() === "") {
    status.textContent = "Type or speak your translation first, or press Skip.";
    input.focus();
    return;
  }
  stopListening();
  const line = scene.lines[index];
  const score = scoreLine(input.value, line, toLanguage);
  const checks = (run.results[index] ? run.results[index].checks : 0) + 1;
  const done = score >= GREAT_SCORE || checks >= MAX_CHECKS;
  run.results[index] = { status: done ? "checked" : "trying", score, checks };
  refreshCurrentCard({ focus: done ? "next" : "answer" });
}

function finishCurrentLine(status) {
  const run = currentRun();
  const previous = run.results[run.index];
  run.results[run.index] = {
    status,
    score: status === "skipped" ? 0 : previous.score,
    checks: previous ? previous.checks : 0,
  };
  refreshCurrentCard({ focus: "next" });
}

function skipCurrentLine() {
  stopListening();
  finishCurrentLine("skipped");
}

async function goToNextLine() {
  stopListening();
  stopSpeaking();
  const run = currentRun();
  const animated = await animateChange(() => {
    run.index += 1;
    renderDialogue();
  });
  const next = currentCard();
  if (next) {
    if (!animated && !prefersReducedMotion.matches) {
      next.classList.add("entering");
    }
    next.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "nearest" });
    next.querySelector("textarea").focus({ preventScroll: true });
  } else {
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function askToSkipAll() {
  const run = currentRun();
  const remaining = scene.lines.length - run.results.filter(isFinished).length;
  document.getElementById("skip-all-message").textContent =
    `Skip the remaining ${remaining} ${remaining === 1 ? "line" : "lines"} and see your results? Skipped lines count as 0%.`;
  document.getElementById("skip-all-confirm").hidden = false;
  document.getElementById("skip-all-no").focus();
}

function closeSkipAllConfirm() {
  document.getElementById("skip-all-confirm").hidden = true;
}

// Finishes the scene now: unfinished lines count as skipped, except a line
// you've already checked once, which keeps that score.
async function skipToResults() {
  closeSkipAllConfirm();
  stopListening();
  stopSpeaking();
  const run = currentRun();
  for (let index = run.index; index < scene.lines.length; index++) {
    const result = run.results[index];
    if (!isFinished(result)) {
      run.results[index] = result ? { ...result, status: "checked" } : { status: "skipped", score: 0, checks: 0 };
    }
  }
  await animateChange(() => {
    run.index = scene.lines.length;
    renderDialogue();
  });
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetRun() {
  answersByPair[answersKey()] = [];
  runsByPair[answersKey()] = { index: 0, results: [] };
  animateChange(renderDialogue);
}

function renderStars(count) {
  const stars = document.getElementById("result-stars");
  stars.replaceChildren();
  stars.setAttribute("aria-label", `${count} out of 5 stars`);
  for (let star = 1; star <= 5; star++) {
    const symbol = document.createElement("span");
    symbol.className = star <= count ? "star earned" : "star";
    symbol.style.setProperty("--star-delay", `${star * 90}ms`);
    symbol.textContent = "★";
    symbol.setAttribute("aria-hidden", "true");
    stars.appendChild(symbol);
  }
}

function renderWeakLines(run) {
  const answers = currentAnswers();
  const list = document.getElementById("weak-lines");
  list.replaceChildren();
  const weakest = scene.lines
    .map((line, index) => ({ line, index, result: run.results[index] }))
    .filter(({ result }) => result.score < GREAT_SCORE)
    .sort((first, second) => first.result.score - second.result.score)
    .slice(0, WEAK_LINES_SHOWN);
  document.getElementById("weak-section").hidden = weakest.length === 0;
  for (const { line, index, result } of weakest) {
    const item = document.createElement("li");
    const original = document.createElement("p");
    const name = document.createElement("strong");
    name.textContent = `${scene.speakers[line.speaker].name}: `;
    original.append(name, lineText(line, fromLanguage).main);
    original.dir = "auto";
    const detail = document.createElement("p");
    detail.className = "weak-detail";
    const answer = answers[index] || "";
    if (result.status === "skipped") {
      detail.append("Skipped · One way to say it: ", referenceText(line, toLanguage));
    } else {
      const words = missedWords(line, answer);
      detail.append(words.length > 0 ? "Missed: " : `${Math.round(result.score * 100)}% · One way to say it: `);
      if (words.length > 0) {
        for (const word of words) {
          const chip = document.createElement("span");
          chip.className = "missed-word";
          chip.textContent = word;
          detail.append(chip, " ");
        }
      } else {
        detail.append(referenceText(line, toLanguage));
      }
    }
    item.append(original, detail);
    list.appendChild(item);
  }
}

function renderReview(run) {
  const answers = currentAnswers();
  const list = document.getElementById("review-lines");
  list.replaceChildren();
  const status = document.getElementById("review-status");
  scene.lines.forEach((line, index) => {
    const result = run.results[index];
    const answer = answers[index] || "";
    const item = document.createElement("li");
    item.style.setProperty("--speaker-color", scene.speakers[line.speaker].color);
    const original = document.createElement("p");
    const name = document.createElement("strong");
    name.textContent = `${scene.speakers[line.speaker].name}: `;
    original.dir = "auto";
    original.append(name, lineText(line, fromLanguage).main);
    const mine = document.createElement("p");
    mine.dir = "auto";
    mine.append(`You: ${result.status === "skipped" ? "Skipped" : answer} `, scoreChip(result));
    const reference = document.createElement("p");
    reference.append("One way to say it: ", renderReference(line, result.status === "skipped" ? "" : answer), " ");
    reference.appendChild(
      createSpeakButton(`Hear one way to say it in ${languageName(toLanguage)}`, () => lineText(line, toLanguage).main, toLanguage, status),
    );
    item.append(original, mine, reference);
    list.appendChild(item);
  });
  document.getElementById("review-summary").textContent = `Review all ${scene.lines.length} lines`;
}

function renderResults(run) {
  const total = scene.lines.length;
  const average = run.results.reduce((sum, result) => sum + result.score, 0) / total;
  renderStars(starsFor(average));
  document.getElementById("result-average").textContent = `Average match ${Math.round(average * 100)}%`;
  document.getElementById("stat-checked").textContent = String(run.results.filter((result) => result.status === "checked").length);
  document.getElementById("stat-retried").textContent = String(run.results.filter((result) => result.checks > 1).length);
  document.getElementById("stat-skipped").textContent = String(run.results.filter((result) => result.status === "skipped").length);
  renderWeakLines(run);
  renderReview(run);
}

function pickAnotherScene() {
  const search = document.getElementById("scene-search");
  search.scrollIntoView({ behavior: "smooth", block: "center" });
  search.focus({ preventScroll: true });
}
