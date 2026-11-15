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
