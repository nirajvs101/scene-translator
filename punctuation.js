// Speech recognition usually returns bare words, so this adds a capital
// letter and an ending mark. Questions are guessed from question words;
// a wrong guess is easy to fix by hand.

const QUESTION_WORDS = {
  en: [
    "what", "where", "when", "why", "who", "whose", "which", "how",
    "can", "could", "would", "will", "should", "shall", "may",
    "do", "does", "did", "is", "are", "was", "were", "am", "have", "has",
  ],
  es: [
    "qué", "cómo", "dónde", "adónde", "cuándo", "cuál", "cuáles", "quién", "quiénes",
    "cuánto", "cuánta", "cuántos", "cuántas", "por qué",
    "puedo", "puedes", "puede", "podemos", "pueden", "podría", "quieres", "tienes",
  ],
  fr: [
    "qu'est-ce", "que", "quoi", "où", "quand", "pourquoi", "qui", "comment",
    "quel", "quelle", "quels", "quelles", "combien", "est-ce",
    "puis-je", "peux-tu", "pouvez-vous", "veux-tu", "voulez-vous", "as-tu", "avez-vous",
  ],
  de: [
    "was", "wo", "wohin", "woher", "wann", "warum", "wer", "wie", "welche", "welcher", "welches",
    "kann", "kannst", "können", "darf", "darfst", "willst", "möchtest", "möchten",
    "hast", "haben", "bist", "ist", "sind", "gehst", "kommst",
  ],
  it: [
    "cosa", "dove", "quando", "perché", "chi", "come", "quale", "quali",
    "quanto", "quanta", "quanti", "quante", "posso", "puoi", "può", "possiamo", "vuoi",
  ],
  hi: ["क्या", "कहाँ", "कहां", "कब", "क्यों", "कौन", "कैसे", "कैसा", "कैसी", "कितना", "कितने", "कितनी"],
};

// Hindi often puts the question word mid-sentence ("आप क्या लेंगे"), so any
// position counts there; other languages usually lead with it.
const QUESTION_WORD_ANYWHERE = new Set(["hi"]);

// Languages without question words above always get a statement ending.
const SENTENCE_END = { hi: "।", bn: "।", ur: "۔", zh: "。", ja: "。" };

function looksLikeQuestion(text, language) {
  const lower = text.toLowerCase();
  const words = QUESTION_WORDS[language] || [];
  if (QUESTION_WORD_ANYWHERE.has(language)) {
    const spokenWords = lower.split(/\s+/);
    return words.some((word) => spokenWords.includes(word));
  }
  return words.some((word) => lower === word || lower.startsWith(`${word} `));
}

function punctuateSpeech(text, language) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return "";
  }
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if (/[.!?।۔。？！؟;]$/.test(trimmed)) {
    return capitalized;
  }
  if (!looksLikeQuestion(trimmed, language)) {
    return `${capitalized}${SENTENCE_END[language] || "."}`;
  }
  return language === "es" ? `¿${capitalized}?` : `${capitalized}?`;
}

if (typeof module !== "undefined") {
  module.exports = { punctuateSpeech };
}
