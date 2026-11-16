// Scores a translation by counting its mistakes against a reference: missing,
// extra, wrong, or out-of-order words. Accents, capitalization, and
// punctuation are ignored so small typing slips don't sink the score. Works
// for any script, including Devanagari.

// English words that mean the same here count as one word ("one latte" is
// "a latte"), and contractions count as their long forms ("I'll" is "I
// will"). Contractions arrive split at the apostrophe: "I'll" is "i" + "ll".
// Other languages get none on purpose: in Spanish, French, German and others
// "un" versus "una" is a gender choice the learner should get right.
const EQUIVALENT_WORDS = {
  en: {
    an: "a", one: "a",
    ll: "will", re: "are", ve: "have", m: "am", t: "not",
    don: "do", doesn: "does", didn: "did", isn: "is", aren: "are", wasn: "was", weren: "were",
    won: "will", haven: "have", hasn: "has", couldn: "could", shouldn: "should", wouldn: "would",
  },
};

// `byCharacter` is for languages written without spaces (Chinese, Japanese):
// each character counts as one "word". `language` turns on that language's
// equivalent words.
function normalizeText(text, byCharacter = false, language = null) {
  const words = text
    // NFKD also turns look-alike forms into plain letters, such as the
    // full-width letters a Japanese or Chinese keyboard types (Ｇｏｏｄ → Good).
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin and Greek accent marks (é → e, ñ → n, ά → α)
    .replace(/[\u064b-\u0655]/g, "") // strip optional Arabic vowel and hamza marks (أ → ا)
    .replace(/\u200c/g, "") // join Persian half-spaced words (می‌خوام → میخوام)
    .toLowerCase()
    // Keep letters, their vowel signs (needed for Devanagari), and digits;
    // everything else, including apostrophes and ।, separates words.
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (byCharacter) {
    return words.flatMap((word) => Array.from(word));
  }
  const equivalents = EQUIVALENT_WORDS[language] || {};
  return words.map((word) => equivalents[word] || word);
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

// What fixing one word costs: nothing if it matches, part of a mistake for
// a near-miss spelling, and a whole mistake otherwise.
function wordFixCost(word, referenceWord) {
  return word === referenceWord ? 0 : 1 - nearMissCredit(word, referenceWord);
}

// Mistakes between an answer and a reference, counted like a teacher would:
// a missing, extra, or wrong word is one mistake, and so are two words in
// the wrong order ("tea green" for "green tea").
function countMistakes(words, referenceWords) {
  const costs = Array.from({ length: words.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= referenceWords.length; column += 1) {
    costs[0][column] = column;
  }
  for (let row = 1; row <= words.length; row += 1) {
    for (let column = 1; column <= referenceWords.length; column += 1) {
      costs[row][column] = Math.min(
        costs[row - 1][column] + 1,
        costs[row][column - 1] + 1,
        costs[row - 1][column - 1] + wordFixCost(words[row - 1], referenceWords[column - 1]),
      );
      const isSwap =
        row > 1 &&
        column > 1 &&
        words[row - 1] === referenceWords[column - 2] &&
        words[row - 2] === referenceWords[column - 1];
      if (isSwap) {
        costs[row][column] = Math.min(costs[row][column], costs[row - 2][column - 2] + 1);
      }
    }
  }
  return costs[words.length][referenceWords.length];
}

// Every real mistake costs at least this much, so one missing article or
// one pair of swapped words keeps a line below "great".
const MISTAKE_PENALTY = 0.12;

// How well an answer matches one reference, from 0 to 1. Each mistake costs
// its share of the sentence, or the minimum penalty if that's more (so short
// and long lines are judged alike).
function matchScore(attempt, reference, byCharacter = false, language = null) {
  const words = normalizeText(attempt, byCharacter, language);
  const referenceWords = normalizeText(reference, byCharacter, language);
  if (words.length === 0 || referenceWords.length === 0) {
    return 0;
  }
  const mistakes = countMistakes(words, referenceWords);
  return Math.max(0, Math.min(1 - mistakes / referenceWords.length, 1 - MISTAKE_PENALTY * mistakes));
}

// Scores against every acceptable reference and keeps the best match.
function scoreTranslation(attempt, references, byCharacter = false, language = null) {
  return Math.max(...references.map((reference) => matchScore(attempt, reference, byCharacter, language)));
}

function scoreLabel(score) {
  if (score >= 0.75) return "good";
  if (score >= 0.4) return "partial";
  return "off";
}

// Takes a matching word (exact, or a near miss) out of the pool. Returns
// whether one was found.
function takeMatchingWord(pool, word) {
  let index = pool.indexOf(word);
  if (index === -1) {
    const credits = pool.map((candidate) => nearMissCredit(candidate, word));
    const bestCredit = Math.max(0, ...credits);
    if (bestCredit === 0) {
      return false;
    }
    index = credits.indexOf(bestCredit);
  }
  pool.splice(index, 1);
  return true;
}

// Splits the reference closest to the attempt into pieces, marking the
// words the attempt left out so they can be underlined. Spaces are kept as
// their own pieces, so joining every piece gives back the reference.
function compareWithReference(attempt, references, byCharacter = false, language = null) {
  const scored = references.map((reference) => ({ reference, score: matchScore(attempt, reference, byCharacter, language) }));
  const best = scored.reduce((closest, candidate) => (candidate.score > closest.score ? candidate : closest));
  const unusedWords = normalizeText(attempt, byCharacter, language);
  const pieces = (byCharacter ? Array.from(best.reference) : best.reference.split(/(\s+)/))
    .filter((text) => text !== "")
    .map((text) => {
      const words = normalizeText(text, byCharacter, language);
      const missed = words.length > 0 && !words.every((word) => takeMatchingWord(unusedWords, word));
      return { text, missed };
    });
  return { reference: best.reference, score: best.score, pieces };
}

// Stars for a finished scene, from the average match across every line
// (skipped lines count as 0). Five stars also means at most one hint.
const STAR_THRESHOLDS = [0.9, 0.75, 0.6, 0.4];
const MAX_HINTS_FOR_FIVE_STARS = 1;

function starsFor(average, hintsUsed = 0) {
  const reached = STAR_THRESHOLDS.findIndex((threshold) => average >= threshold);
  const stars = reached === -1 ? 1 : 5 - reached;
  return hintsUsed > MAX_HINTS_FOR_FIVE_STARS ? Math.min(stars, 4) : stars;
}

// Splits text into what a reader sees as single letters, so letters with
// accents or vowel signs (as in Hindi) stay whole.
const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

function letters(text) {
  return graphemeSegmenter ? Array.from(graphemeSegmenter.segment(text), (part) => part.segment) : Array.from(text);
}

const HINT_LEVELS = 2;
// From hint 2 on, words this long are shown in full; shorter ones keep only
// their first letter, so the learner still has something to work out.
const HINT_FULL_WORD_LENGTH = 4;
const LETTER_PATTERN = /[\p{L}\p{M}\p{N}]/u;

function maskWord(word, showWhole) {
  const parts = letters(word);
  const wordLetters = parts.filter((part) => LETTER_PATTERN.test(part)).length;
  if (showWhole || wordLetters <= 1) {
    return word;
  }
  let shown = 0;
  return parts
    .map((part) => {
      if (!LETTER_PATTERN.test(part)) {
        return part;
      }
      shown += 1;
      return shown === 1 ? part : "_";
    })
    .join("");
}

// A hint built from a reference translation. Level 1 keeps each word's
// first letter (G___ m______.), level 2 also shows the longer words in full
// (Good morning. What c__ I g__ y__?). For languages written without spaces,
// level 1 shows every third character and level 2 every other one.
function hintFor(reference, level, byCharacter = false) {
  if (byCharacter) {
    const every = level >= 2 ? 2 : 3;
    let position = 0;
    return letters(reference)
      .map((part) => {
        if (!LETTER_PATTERN.test(part)) {
          return part;
        }
        position += 1;
        return (position - 1) % every === 0 ? part : "＿";
      })
      .join("");
  }
  return reference
    .split(/(\s+)/)
    .map((word) => {
      const length = letters(word).filter((part) => LETTER_PATTERN.test(part)).length;
      return /^\s*$/.test(word) ? word : maskWord(word, level >= 2 && length >= HINT_FULL_WORD_LENGTH);
    })
    .join("");
}

if (typeof module !== "undefined") {
  module.exports = { normalizeText, matchScore, scoreTranslation, scoreLabel, compareWithReference, starsFor, hintFor };
}
