// The page background: "hello" in every language the app supports, tilted
// and packed edge to edge in a color just lighter than the page. It is only
// decoration, so it sits behind everything, ignores clicks, and is hidden from
// screen readers.

const GREETINGS = [
  "Hello", "Hola", "Bonjour", "Hallo", "Ciao", "नमस्ते", "你好", "مرحبا", "Olá", "Привет",
  "こんにちは", "안녕하세요", "নমস্কার", "السلام علیکم", "Halo", "Merhaba", "Xin chào", "Hoi",
  "Cześć", "Jambo", "வணக்கம்", "سلام", "Γεια σου", "Hej", "שלום", "നമസ്കാരം", "నమస్కారం", "ನಮಸ್ಕಾರ", "નમસ્તે",
];
const GREETING_SIZES = [14, 18, 24, 30, 40];
// Roughly how much room one word takes, used to fill the screen without
// adding far more words than can be seen.
const AREA_PER_GREETING = 3200;
const MAX_GREETINGS = 3000;

// The same "random" sizes on every visit, so the background never jumps.
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// The tilted square is 1.5 times the screen's longer side, enough to cover
// every corner after tilting. It's sized from the whole screen, not the
// window, so making the window bigger or turning a phone never shows an edge.
function greetingsNeeded(width, height) {
  const side = 1.5 * Math.max(width, height);
  return Math.min(MAX_GREETINGS, Math.ceil((side * side) / AREA_PER_GREETING));
}

function buildGreetingWall(count) {
  const layer = document.createElement("div");
  layer.className = "greeting-wall";
  layer.setAttribute("aria-hidden", "true");
  const words = document.createElement("div");
  words.className = "greeting-wall-words";
  const random = seededRandom(7);
  for (let index = 0; index < count; index++) {
    const word = document.createElement("span");
    word.textContent = GREETINGS[index % GREETINGS.length];
    word.style.fontSize = `${GREETING_SIZES[Math.floor(random() * GREETING_SIZES.length)]}px`;
    words.append(word);
  }
  layer.append(words);
  return layer;
}

function showGreetingWall() {
  const count = greetingsNeeded(window.screen.width || window.innerWidth, window.screen.height || window.innerHeight);
  document.body.prepend(buildGreetingWall(count));
}

showGreetingWall();
