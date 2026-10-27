// Speech recognition usually returns bare words, so this adds a capital
// letter and an ending mark. Questions are guessed from the first word;
// a wrong guess is easy to fix by hand.

const QUESTION_STARTERS = {
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
};

function looksLikeQuestion(text, language) {
  const lower = text.toLowerCase();
  return QUESTION_STARTERS[language].some(
    (starter) => lower === starter || lower.startsWith(`${starter} `),
  );
}

function punctuateSpeech(text, language) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return "";
  }
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if (/[.!?]$/.test(trimmed)) {
    return capitalized;
  }
  if (!looksLikeQuestion(trimmed, language)) {
    return `${capitalized}.`;
  }
  return language === "es" ? `¿${capitalized}?` : `${capitalized}?`;
}

if (typeof module !== "undefined") {
  module.exports = { punctuateSpeech };
}
