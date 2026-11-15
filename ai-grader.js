// Asks Scene Translator's grader (grader-worker/worker.js, on Cloudflare) to
// judge an answer the way a fluent speaker would. Two Gemini models are asked
// at once: the stronger one's grade is used if it arrives within a few
// seconds, otherwise the fast one's. If neither answers in time, the caller
// falls back to word matching.

const aiGraderSettings = {
  url: "https://scene-grader.niraj-vs.workers.dev",
  strongModel: "gemini-3.6-flash",
  fastModel: "gemini-3.5-flash-lite",
  // How long to wait for any grade before falling back to word matching.
  waitMs: 5000,
  // A summary reads the whole scene, so it may take longer; the stronger
  // model gets this long, then the fast one gets another try.
  summaryWaitMs: 15000,
};

// The grader rejects longer text, so longer answers are graded by words.
const AI_MAX_TEXT_LENGTH = 400;
const AI_MAX_REFERENCES = 8;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function aiGradingAvailable() {
  return Boolean(aiGraderSettings.url);
}

// Every accepted answer, including romanized ones (so Manglish answers count).
function gradeRequestFor(line, answer, fromLanguage, toLanguage) {
  const { altScript } = LANGUAGES[toLanguage];
  const references = [...line.text[toLanguage], ...(altScript && line.text[altScript] ? line.text[altScript] : [])]
    .filter((reference) => reference.length <= AI_MAX_TEXT_LENGTH)
    .slice(0, AI_MAX_REFERENCES);
  const source = line.text[fromLanguage][0];
  if (answer.length > AI_MAX_TEXT_LENGTH || source.length > AI_MAX_TEXT_LENGTH || references.length === 0) {
    return null;
  }
  return {
    source,
    sourceLanguage: LANGUAGES[fromLanguage].name,
    targetLanguage: LANGUAGES[toLanguage].name,
    references,
    answer,
  };
}

// One model's grade as { score: 0–1, feedback }, or null if it failed.
async function askGrader(request, model, signal) {
  try {
    const response = await fetch(aiGraderSettings.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, model }),
      signal,
    });
    if (!response.ok) {
      return null;
    }
    const { score, feedback } = await response.json();
    if (!Number.isFinite(score) || score < 0 || score > 100 || typeof feedback !== "string") {
      return null;
    }
    return { score: score / 100, feedback: feedback.trim(), model };
  } catch {
    return null;
  }
}

// The best grade available within the wait, or null.
async function gradeWithAi(request) {
  const controller = new AbortController();
  const deadline = Date.now() + aiGraderSettings.waitMs;
  const strong = askGrader(request, aiGraderSettings.strongModel, controller.signal);
  const fast = askGrader(request, aiGraderSettings.fastModel, controller.signal);
  const strongGrade = await Promise.race([strong, wait(aiGraderSettings.waitMs)]);
  let grade = strongGrade || null;
  if (!grade) {
    grade = (await Promise.race([fast, wait(Math.max(0, deadline - Date.now()))])) || null;
  }
  controller.abort();
  return grade;
}

// What to send for an end-of-scene summary: each line's original, an
// accepted answer, and what the learner wrote with its score and the AI's
// reason. Returns null when there's nothing to review (every line skipped).
function summaryRequestFor(lines, answers, results, fromLanguage, toLanguage) {
  const reviewed = lines.map((line, index) => ({
    source: line.text[fromLanguage][0].slice(0, AI_MAX_TEXT_LENGTH),
    reference: line.text[toLanguage][0].slice(0, AI_MAX_TEXT_LENGTH),
    answer: results[index].status === "skipped" ? "" : (answers[index] || "").trim().slice(0, AI_MAX_TEXT_LENGTH),
    score: Math.round(results[index].score * 100),
    feedback: (results[index].aiFeedback || "").slice(0, AI_MAX_TEXT_LENGTH),
  }));
  if (reviewed.every((line) => line.answer === "")) {
    return null;
  }
  return {
    task: "summary",
    sourceLanguage: LANGUAGES[fromLanguage].name,
    targetLanguage: LANGUAGES[toLanguage].name,
    lines: reviewed,
  };
}

// One model's summary as { overall, points: [{ topic, example, fix }] }, or
// null if it failed, took too long, or came back in the wrong shape.
async function askForSummary(request, model) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), aiGraderSettings.summaryWaitMs);
  try {
    const response = await fetch(aiGraderSettings.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, model }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const { overall, points } = await response.json();
    const isText = (value) => typeof value === "string" && value.trim() !== "";
    if (!isText(overall) || !Array.isArray(points)) {
      return null;
    }
    const goodPoints = points.filter((point) => point && isText(point.topic) && isText(point.example) && isText(point.fix));
    return { overall: overall.trim(), points: goodPoints.slice(0, 3) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// The stronger model's summary, or the fast one's if that fails.
async function summarizeWithAi(request) {
  return (
    (await askForSummary(request, aiGraderSettings.strongModel)) ||
    (await askForSummary(request, aiGraderSettings.fastModel))
  );
}
