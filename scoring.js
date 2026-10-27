// Scores a translation by how many words it shares with a reference.
// Accents, capitalization, and punctuation are ignored so small typing slips
// don't sink the score.

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accent marks
    .toLowerCase()
    .replace(/[^a-z0-9ñ'\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

// Word-overlap F1: balances "did you include the right words" (recall)
// against "did you add extra wrong words" (precision). Returns 0–1.
function overlapScore(attempt, reference) {
  const attemptWords = normalizeText(attempt);
  const referenceWords = normalizeText(reference);
  if (attemptWords.length === 0 || referenceWords.length === 0) {
    return 0;
  }
  const remaining = new Map();
  for (const word of referenceWords) {
    remaining.set(word, (remaining.get(word) || 0) + 1);
  }
  let shared = 0;
  for (const word of attemptWords) {
    const count = remaining.get(word) || 0;
    if (count > 0) {
      shared += 1;
      remaining.set(word, count - 1);
    }
  }
  const precision = shared / attemptWords.length;
  const recall = shared / referenceWords.length;
  return shared === 0 ? 0 : (2 * precision * recall) / (precision + recall);
}

// Scores against every acceptable reference and keeps the best match.
function scoreTranslation(attempt, references) {
  return Math.max(...references.map((reference) => overlapScore(attempt, reference)));
}

function scoreLabel(score) {
  if (score >= 0.75) return "good";
  if (score >= 0.4) return "partial";
  return "off";
}

if (typeof module !== "undefined") {
  module.exports = { normalizeText, overlapScore, scoreTranslation, scoreLabel };
}
