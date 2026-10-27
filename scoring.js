// Scores a translation by how many words it shares with a reference.
// Accents, capitalization, and punctuation are ignored so small typing slips
// don't sink the score. Works for any script, including Devanagari.

// `byCharacter` is for languages written without spaces (Chinese, Japanese):
// each character counts as one "word".
function normalizeText(text, byCharacter = false) {
  const words = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin and Greek accent marks (é → e, ñ → n, ά → α)
    .replace(/[\u064b-\u0655]/g, "") // strip optional Arabic vowel and hamza marks (أ → ا)
    .replace(/\u200c/g, "") // join Persian half-spaced words (می‌خوام → میخوام)
    .toLowerCase()
    // Keep letters, their vowel signs (needed for Devanagari), and digits;
    // everything else, including apostrophes and ।, separates words.
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return byCharacter ? words.flatMap((word) => Array.from(word)) : words;
}

// Word-overlap F1: balances "did you include the right words" (recall)
// against "did you add extra wrong words" (precision). Returns 0–1.
function overlapScore(attempt, reference, byCharacter = false) {
  const attemptWords = normalizeText(attempt, byCharacter);
  const referenceWords = normalizeText(reference, byCharacter);
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
function scoreTranslation(attempt, references, byCharacter = false) {
  return Math.max(...references.map((reference) => overlapScore(attempt, reference, byCharacter)));
}

function scoreLabel(score) {
  if (score >= 0.75) return "good";
  if (score >= 0.4) return "partial";
  return "off";
}

if (typeof module !== "undefined") {
  module.exports = { normalizeText, overlapScore, scoreTranslation, scoreLabel };
}
