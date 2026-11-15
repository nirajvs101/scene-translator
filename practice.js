// Plays a scene one line at a time: the current line is a big card, and
// finished lines stack above it like a chat thread. After the last line
// comes a results screen with stars, the weakest lines, and a full review.

// A line is finished once it reaches this score, or after this many checks.
const GREAT_SCORE = 0.9;
// A correct but word-for-word answer (one a scene marks as literal) is
// capped here, whatever the grader says, and shown a more natural way.
const LITERAL_SCORE = 0.9;
// "My answer means the same" counts a line as great, but not perfect.
const SELF_MARKED_SCORE = 0.9;
const SELF_MARK_LABEL = "✓ My answer means the same";
const MAX_CHECKS = 2;
const WEAK_LINES_SHOWN = 3;

// Progress per scene and language pair, like the answers, so switching
// scenes or languages and coming back picks up where you left off.
// results[i] is { status: "trying" | "checked" | "skipped", score, checks },
// and hints[i] is how many hints line i has shown.
const runsByPair = {};

function currentRun() {
  const key = answersKey();
  runsByPair[key] = runsByPair[key] || { index: 0, results: [], hints: [] };
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

// Each cheer matches what that score means under the grading rules: a slip
// or two costs about 8 points each, a wrong tense or a bigger part left out
// 15–30, and a wrong meaning puts a line below 50.
const CHEERS = [
  [0.995, "Perfect!"],
  [GREAT_SCORE, "Great!"],
  [0.75, "Almost there!"],
  [0.5, "Getting there."],
  [0.2, "Not quite."],
  [0, "That's way off."],
];

function cheerFor(score) {
  return CHEERS.find(([minimum]) => score >= minimum)[1];
}

// Compares an answer with the line's references, in the script the learner
// wrote in (for example Manglish instead of Malayalam script).
function compareLine(attempt, line, language) {
  const { altScript, byCharacter } = LANGUAGES[language];
  const native = compareWithReference(attempt, line.text[language], byCharacter, language);
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
// Shows the accepted answer closest to the attempt. `underline` is off after
// an AI grade, since word-matching underlines could contradict it.
function renderReference(line, attempt, { underline = true } = {}) {
  const reference = document.createElement("span");
  reference.className = "reference";
  reference.dir = "auto";
  if (attempt.trim() === "") {
    reference.textContent = referenceText(line, toLanguage);
    return reference;
  }
  const compared = compareLine(attempt, line, toLanguage);
  const plain = (comparison) =>
    comparison && { ...comparison, pieces: comparison.pieces.map((piece) => ({ ...piece, missed: false })) };
  const native = underline ? compared.native : plain(compared.native);
  const romanized = underline ? compared.romanized : plain(compared.romanized);
  const closest = compared.closest === compared.native ? native : romanized;
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

// A hint toward the answer, built from the accepted translation closest to
// what's typed so far (or the first one if nothing is), in both scripts for
// languages with a romanized form.
function hintText(line, attempt, level) {
  const { altScript, byCharacter } = LANGUAGES[toLanguage];
  const nativeForms = line.text[toLanguage];
  const romanizedForms = altScript && line.text[altScript] ? line.text[altScript] : null;
  let position = 0;
  if (attempt.trim() !== "") {
    const { native, romanized, closest } = compareLine(attempt, line, toLanguage);
    position = closest === native ? nativeForms.indexOf(native.reference) : romanizedForms.indexOf(romanized.reference);
  }
  const nativeHint = hintFor(nativeForms[position] || nativeForms[0], level, byCharacter);
  if (!romanizedForms) {
    return nativeHint;
  }
  return `${nativeHint} (${hintFor(romanizedForms[position] || romanizedForms[0], level)})`;
}

function showHint() {
  const run = currentRun();
  run.hints[run.index] = Math.min((run.hints[run.index] || 0) + 1, HINT_LEVELS);
  refreshCurrentCard({ focus: "answer" });
}

// If the answer matches one of the line's literal answers better than any
// natural one, returns the natural answer closest to it; otherwise null.
function naturalWayFor(line, answer, language) {
  const literal = line.literal && line.literal[language];
  if (!literal) {
    return null;
  }
  const { byCharacter } = LANGUAGES[language];
  const score = (reference) => matchScore(answer, reference, byCharacter, language);
  const natural = line.text[language].filter((reference) => !literal.includes(reference));
  if (natural.length === 0) {
    return null;
  }
  const literalBest = Math.max(...literal.map(score));
  const closestNatural = natural.reduce((best, reference) => (score(reference) > score(best) ? reference : best));
  return literalBest >= GREAT_SCORE && literalBest > score(closestNatural) ? closestNatural : null;
}

// True when the answer already says exactly what "One way to say it" would
// show. Languages with a romanized form always show it: someone who typed
// the romanized form still gets to see the native script.
function matchesShownAnswer(line, answer) {
  if (answer.trim() === "" || LANGUAGES[toLanguage].altScript) {
    return false;
  }
  return compareLine(answer, line, toLanguage).closest.score === 1;
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

// The AI's one-sentence reason, or a note that word matching was used
// because the AI couldn't answer in time.
function appendGradeNote(container, result) {
  if (result.literal) {
    container.append("Correct, but word-for-word. ");
  } else if (result.aiFeedback) {
    const note = document.createElement("span");
    note.className = "ai-feedback";
    note.textContent = `🤖 ${result.aiFeedback} `;
    container.append(note);
  } else if (result.aiUnavailable) {
    const note = document.createElement("span");
    note.className = "ai-feedback";
    note.textContent = "(AI check unavailable, scored by matching words.) ";
    container.append(note);
  }
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

  const hintsShown = run.hints[index] || 0;
  const hint = document.createElement("p");
  hint.className = "hint";
  hint.dir = "auto";
  hint.setAttribute("aria-live", "polite");
  hint.hidden = finished || hintsShown === 0;
  if (!hint.hidden) {
    const label = document.createElement("strong");
    label.textContent = `💡 Hint ${hintsShown} of ${HINT_LEVELS}: `;
    hint.append(label, hintText(line, input.value, hintsShown));
  }
  const hintButton = () => {
    const button = actionButton("💡 Hint", showHint, { id: "hint-button" });
    button.title = hintsShown === 0 ? "Show the shape of the answer" : "Fill in more of the answer";
    return button;
  };

  if (!result) {
    actions.append(
      actionButton("Check", () => checkCurrentLine(input, status), { primary: true, id: "check-button" }),
      actionButton("Skip", skipCurrentLine, { id: "skip-button" }),
    );
    if (hintsShown < HINT_LEVELS) {
      actions.append(hintButton());
    }
  } else if (result.status === "trying") {
    feedback.classList.add(scoreLabel(result.score));
    const score = document.createElement("strong");
    score.textContent = `${Math.round(result.score * 100)}% match`;
    feedback.append(score, ` · ${cheerFor(result.score)} `);
    appendGradeNote(feedback, result);
    feedback.append("Change your answer and check once more, or see the answer.");
    actions.append(
      actionButton("Check again", () => checkCurrentLine(input, status), { primary: true, id: "check-button" }),
      actionButton("Show answer", () => finishCurrentLine("checked")),
    );
    if (hintsShown < HINT_LEVELS) {
      actions.append(hintButton());
    }
    actions.append(actionButton(SELF_MARK_LABEL, markAsMeaningTheSame, { id: "self-mark-button" }));
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
    } else if (result.selfMarked) {
      feedback.classList.add("good");
      const score = document.createElement("strong");
      score.textContent = `${Math.round(result.score * 100)}% match`;
      feedback.append(score, " · You marked your answer as meaning the same. One way to say it: ", renderReference(line, ""), " ", speakReference);
    } else {
      feedback.classList.add(scoreLabel(result.score));
      const score = document.createElement("strong");
      score.textContent = `${Math.round(result.score * 100)}% match`;
      feedback.append(score, ` · ${cheerFor(result.score)} `);
      appendGradeNote(feedback, result);
      if (result.naturalWay) {
        const speakNatural = createSpeakButton(`Hear a more natural way in ${targetName}`, () => result.naturalWay, toLanguage, status);
        const natural = document.createElement("span");
        natural.className = "reference";
        natural.dir = "auto";
        natural.textContent = result.naturalWay;
        feedback.append("A more natural way to say it: ", natural, " ", speakNatural);
      } else if (!matchesShownAnswer(line, input.value)) {
        // Underlines come from word matching, so they'd contradict an AI
        // grade (underlining "coffee with milk" after "a latte" got 100).
        const underline = result.gradedBy !== "ai";
        feedback.append("One way to say it: ", renderReference(line, input.value, { underline }), " ", speakReference);
      }
      if (result.score >= GREAT_SCORE) {
        item.classList.add("celebrate");
      }
    }
    actions.append(actionButton(isLastLine ? "See results →" : "Next line →", goToNextLine, { primary: true, id: "next-button" }));
    if (result.status === "checked" && !result.selfMarked && result.score < GREAT_SCORE) {
      actions.append(actionButton(SELF_MARK_LABEL, markAsMeaningTheSame, { id: "self-mark-button" }));
    }
  }

  // Enter checks or moves on; Shift+Enter still starts a new line in the box.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      actions.querySelector(".primary").click();
    }
  });

  item.append(name, renderOriginal(line, status), answerRow, hint, status, feedback, actions);
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

let gradingInProgress = false;

// While the AI grades, the card says so and its buttons wait.
function showCheckingState() {
  const card = currentCard();
  for (const button of card.querySelectorAll(".card-actions button, .mic")) {
    button.disabled = true;
  }
  card.querySelector("textarea").readOnly = true;
  const feedback = card.querySelector(".result");
  feedback.className = "result checking";
  feedback.textContent = "🤖 Checking with AI…";
}

// Grades the answer with the AI grader when it's set up, falling back to
// word matching if it can't answer in time; otherwise by word matching.
async function checkCurrentLine(input, status) {
  const run = currentRun();
  const index = run.index;
  if (input.value.trim() === "") {
    status.textContent = "Type or speak your translation first, or press Skip.";
    input.focus();
    return;
  }
  if (gradingInProgress) {
    return;
  }
  stopListening();
  const line = scene.lines[index];
  const answer = input.value.trim();
  let score = scoreLine(answer, line, toLanguage);
  let grading = { gradedBy: "words" };
  const request = aiGradingAvailable() ? gradeRequestFor(line, answer, fromLanguage, toLanguage) : null;
  if (request) {
    gradingInProgress = true;
    showCheckingState();
    const grade = await gradeWithAi(request);
    gradingInProgress = false;
    // Ignore a grade that arrives after the learner moved on (Start over,
    // Skip to results, or another scene).
    const card = currentCard();
    if (currentRun() !== run || run.index !== index || !card || card.dataset.lineIndex !== String(index)) {
      return;
    }
    if (grade) {
      score = grade.score;
      grading = { gradedBy: "ai", aiFeedback: grade.feedback };
    } else {
      grading = { gradedBy: "words", aiUnavailable: true };
    }
  }
  const naturalWay = naturalWayFor(line, answer, toLanguage);
  if (naturalWay) {
    grading.naturalWay = naturalWay;
    if (score > LITERAL_SCORE) {
      // The AI may have called it "completely natural"; the scene knows better.
      score = LITERAL_SCORE;
      grading = { gradedBy: grading.gradedBy, naturalWay, literal: true };
    }
  }
  const checks = (run.results[index] ? run.results[index].checks : 0) + 1;
  const done = score >= GREAT_SCORE || checks >= MAX_CHECKS;
  run.results[index] = { status: done ? "checked" : "trying", score, checks, ...grading };
  refreshCurrentCard({ focus: done ? "next" : "answer" });
  if (score >= GREAT_SCORE) {
    celebrateLine(currentCard());
  }
}

function finishCurrentLine(status) {
  const run = currentRun();
  const previous = run.results[run.index];
  // Keeps what the last check found (such as the AI's feedback); a skip
  // starts fresh.
  run.results[run.index] =
    status === "skipped"
      ? { status, score: 0, checks: previous ? previous.checks : 0 }
      : { ...previous, status };
  refreshCurrentCard({ focus: "next" });
}

// The scoring only compares words, so it can't know that "a latte" means
// "a coffee with milk". This lets the learner say so, on the honor system.
function markAsMeaningTheSame() {
  const run = currentRun();
  const previous = run.results[run.index];
  run.results[run.index] = { status: "checked", score: SELF_MARKED_SCORE, checks: previous.checks, selfMarked: true };
  refreshCurrentCard({ focus: "next" });
  celebrateLine(currentCard());
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
    autoPlayCurrentLine();
  } else {
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
    celebrateResultsIfEarned();
  }
}

const AUTO_PLAY_KEY = "scene-translator-auto-play";

// "on", "off", or null if the learner hasn't been asked yet.
function loadAutoPlayChoice() {
  try {
    return localStorage.getItem(AUTO_PLAY_KEY);
  } catch {
    return null;
  }
}

function saveAutoPlayChoice(isOn) {
  try {
    localStorage.setItem(AUTO_PLAY_KEY, isOn ? "on" : "off");
  } catch {
    // The choice still applies until the page closes.
  }
}

// Reads the current card's line, just as if its 🔊 were pressed. Browsers
// only allow sound once the person has clicked something on the page, so
// before that this does nothing.
function autoPlayCurrentLine() {
  if (!document.getElementById("auto-play").checked) {
    return;
  }
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    return;
  }
  const card = currentCard();
  const speakButton = card && card.querySelector(".original .speak");
  if (speakButton && !speakButton.classList.contains("speaking")) {
    speakButton.click();
  }
}

// Auto-play starts off. The first time, a banner asks; the answer is
// remembered, and the switch by Reading speed changes it later.
function setUpAutoPlay() {
  const toggle = document.getElementById("auto-play");
  const offer = document.getElementById("auto-play-offer");
  const choice = loadAutoPlayChoice();
  toggle.checked = choice === "on";
  offer.hidden = choice !== null;
  const choose = (isOn) => {
    saveAutoPlayChoice(isOn);
    toggle.checked = isOn;
    offer.hidden = true;
    if (isOn) {
      autoPlayCurrentLine();
    }
  };
  document.getElementById("auto-play-yes").addEventListener("click", () => choose(true));
  document.getElementById("auto-play-no").addEventListener("click", () => choose(false));
  toggle.addEventListener("change", () => choose(toggle.checked));
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
  celebrateResultsIfEarned();
}

function resetRun() {
  answersByPair[answersKey()] = [];
  runsByPair[answersKey()] = { index: 0, results: [], hints: [] };
  animateChange(renderDialogue).then(autoPlayCurrentLine);
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
    } else if (result.aiFeedback) {
      detail.append(`🤖 ${result.aiFeedback} One way to say it: `, referenceText(line, toLanguage));
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
    if (result.selfMarked) {
      mine.append(" (you marked it as meaning the same)");
    } else if (result.aiFeedback) {
      mine.append(` 🤖 ${result.aiFeedback}`);
    }
    const reference = document.createElement("p");
    const attempt = result.status === "skipped" ? "" : answer;
    if (result.naturalWay) {
      reference.append(`A more natural way to say it: ${result.naturalWay} `);
    } else {
      reference.append("One way to say it: ", renderReference(line, attempt, { underline: result.gradedBy !== "ai" }), " ");
    }
    reference.appendChild(
      createSpeakButton(`Hear one way to say it in ${languageName(toLanguage)}`, () => lineText(line, toLanguage).main, toLanguage, status),
    );
    item.append(original, mine, reference);
    list.appendChild(item);
  });
  document.getElementById("review-summary").textContent = `Review all ${scene.lines.length} lines`;
}

const BEST_STARS_KEY = "scene-translator-best-stars";

// Best stars per scene and language pair, kept in this browser.
function loadBestStars() {
  try {
    const saved = JSON.parse(localStorage.getItem(BEST_STARS_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function bestStarsFor(sceneId, from, to) {
  const stars = loadBestStars()[`${sceneId}:${from}-${to}`];
  return Number.isInteger(stars) && stars >= 1 && stars <= 5 ? stars : 0;
}

function saveBestStars(stars) {
  const best = loadBestStars();
  best[answersKey()] = stars;
  try {
    localStorage.setItem(BEST_STARS_KEY, JSON.stringify(best));
  } catch {
    // The stars still show until the page closes.
  }
}

function starText(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

// Saves a finished run's stars if they beat the best, once per run, and
// says how they compare.
function renderBestStars(run, stars) {
  if (run.bestBefore === undefined) {
    run.bestBefore = bestStarsFor(scene.id, fromLanguage, toLanguage);
    if (stars > run.bestBefore) {
      saveBestStars(stars);
    }
  }
  const note = document.getElementById("result-best");
  if (run.bestBefore === 0) {
    note.textContent = "⭐ Saved: you'll see these stars under the scene's button.";
  } else if (stars > run.bestBefore) {
    note.textContent = `🎉 New best! Up from ${starText(run.bestBefore)}`;
  } else {
    note.textContent = `Your best here: ${starText(run.bestBefore)}`;
  }
  updateSceneStars();
}

// 5 stars or beating your best earns a headline and a big celebration,
// once per run (not again when you come back to these results).
function renderCelebration(run, stars) {
  const fiveStars = stars === 5;
  const newBest = run.bestBefore > 0 && stars > run.bestBefore;
  const headline = document.getElementById("result-celebration");
  headline.hidden = !fiveStars && !newBest;
  if (fiveStars && newBest) {
    headline.textContent = "🎉 5 stars, a new best!";
  } else {
    headline.textContent = fiveStars ? "🎉 5 stars!" : "🎉 New best!";
  }
  if (!headline.hidden && run.celebrated === undefined) {
    run.celebrated = false;
  }
}

// Called once the results are on screen, so the confetti comes from them.
function celebrateResultsIfEarned() {
  const run = currentRun();
  if (run.celebrated === false) {
    run.celebrated = true;
    setTimeout(() => celebrateScene(document.querySelector(".results-hero")), 350);
  }
}

function renderResults(run) {
  const total = scene.lines.length;
  const average = run.results.reduce((sum, result) => sum + result.score, 0) / total;
  const hintsUsed = run.hints.reduce((sum, count) => sum + (count || 0), 0);
  const stars = starsFor(average, hintsUsed);
  renderStars(stars);
  renderBestStars(run, stars);
  renderCelebration(run, stars);
  const hintNote = document.getElementById("result-hint-note");
  const cappedByHints = stars < starsFor(average);
  hintNote.hidden = !cappedByHints;
  hintNote.textContent = cappedByHints
    ? `You'd have 5 stars, but 5 stars allows at most ${MAX_HINTS_FOR_FIVE_STARS} hint and you used ${hintsUsed}.`
    : "";
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
