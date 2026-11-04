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

// Words shorter than this must match exactly: short words that differ by a
// letter are usually real, different words (casa/cosa, la/le).
const NEAR_MISS_MIN_LENGTH = 5;
const NEAR_MISS_MIN_SIMILARITY = 0.75;

// Letters to add, remove, or replace (or neighbors to swap) to turn one word
// into the other.
function editDistance(first, second) {
  const distances = Array.from({ length: first.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= second.length; column += 1) {
    distances[0][column] = column;
  }
  for (let row = 1; row <= first.length; row += 1) {
    for (let column = 1; column <= second.length; column += 1) {
      const replaceCost = first[row - 1] === second[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + replaceCost,
      );
      const isSwap = row > 1 && column > 1 && first[row - 1] === second[column - 2] && first[row - 2] === second[column - 1];
      if (isSwap) {
        distances[row][column] = Math.min(distances[row][column], distances[row - 2][column - 2] + 1);
      }
    }
  }
  return distances[first.length][second.length];
}

// Credit from 0 to 1 for a misspelled word: the share of its letters that are right.
function nearMissCredit(word, referenceWord) {
  const longerLength = Math.max(word.length, referenceWord.length);
  if (longerLength < NEAR_MISS_MIN_LENGTH) {
    return 0;
  }
  const similarity = 1 - editDistance(word, referenceWord) / longerLength;
  return similarity >= NEAR_MISS_MIN_SIMILARITY ? similarity : 0;
}

// Word-overlap F1: balances "did you include the right words" (recall)
// against "did you add extra wrong words" (precision). Exact matches are
// counted first, then leftover words can earn near-miss credit. Returns 0–1.
function overlapScore(attempt, reference, byCharacter = false) {
  const attemptWords = normalizeText(attempt, byCharacter);
  const referenceWords = normalizeText(reference, byCharacter);
  if (attemptWords.length === 0 || referenceWords.length === 0) {
    return 0;
  }
  const unmatchedReference = [...referenceWords];
  let shared = 0;
  const unmatchedAttempt = attemptWords.filter((word) => {
    const index = unmatchedReference.indexOf(word);
    if (index === -1) {
      return true;
    }
    unmatchedReference.splice(index, 1);
    shared += 1;
    return false;
  });
  for (const word of unmatchedAttempt) {
    const credits = unmatchedReference.map((referenceWord) => nearMissCredit(word, referenceWord));
    const bestCredit = Math.max(0, ...credits);
    if (bestCredit > 0) {
      unmatchedReference.splice(credits.indexOf(bestCredit), 1);
      shared += bestCredit;
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
