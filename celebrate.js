// Little rewards for doing well: a soft glow for a great line, and for a
// great scene, confetti and a chime (a calm glow instead of confetti for
// people whose device asks for less motion).

const CONFETTI_COLORS = ["#185fa5", "#f2b100", "#2f9e44", "#d9480f", "#1971c2", "#e64980", "#7048e8"];
const GRAVITY = 0.35;
const AIR_DRAG = 0.985;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let confettiCanvas = null;
let confettiPieces = [];
let confettiFrame = null;

function confettiContext() {
  if (!confettiCanvas) {
    confettiCanvas = document.createElement("canvas");
    confettiCanvas.className = "confetti";
    confettiCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(confettiCanvas);
  }
  const scale = window.devicePixelRatio || 1;
  confettiCanvas.width = window.innerWidth * scale;
  confettiCanvas.height = window.innerHeight * scale;
  const context = confettiCanvas.getContext("2d");
  context.setTransform(scale, 0, 0, scale, 0, 0);
  return context;
}

function drawConfetti() {
  const context = confettiCanvas.getContext("2d");
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces = confettiPieces.filter((piece) => piece.y < window.innerHeight + 40 && piece.life > 0);
  for (const piece of confettiPieces) {
    piece.velocityX *= AIR_DRAG;
    piece.velocityY = piece.velocityY * AIR_DRAG + GRAVITY;
    piece.x += piece.velocityX;
    piece.y += piece.velocityY;
    piece.rotation += piece.spin;
    piece.life -= 1;
    context.save();
    context.globalAlpha = Math.min(1, piece.life / 30);
    context.translate(piece.x, piece.y);
    context.rotate(piece.rotation);
    context.fillStyle = piece.color;
    context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
    context.restore();
  }
  confettiFrame = confettiPieces.length > 0 ? requestAnimationFrame(drawConfetti) : null;
  if (!confettiFrame) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// Throws confetti up and out from a point on screen.
function burstConfetti(x, y, { count, power, spread }) {
  confettiContext();
  for (let index = 0; index < count; index++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = power * (0.55 + Math.random() * 0.45);
    confettiPieces.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      size: 7 + Math.random() * 6,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      life: 110 + Math.random() * 50,
    });
  }
  if (!confettiFrame) {
    confettiFrame = requestAnimationFrame(drawConfetti);
  }
}

function glow(element) {
  element.classList.remove("glow");
  // Reading the size restarts the animation if it was already glowing.
  void element.offsetWidth;
  element.classList.add("glow");
}

const SOUND_EFFECTS_KEY = "scene-translator-sound-effects";
let chimeContext = null;

function soundEffectsOn() {
  const toggle = document.getElementById("sound-effects");
  return !toggle || toggle.checked;
}

// A soft chime: a few gentle bell-like notes, made by the browser rather
// than loaded from a file.
function playChime(notes) {
  if (!soundEffectsOn() || !window.AudioContext) {
    return;
  }
  chimeContext = chimeContext || new AudioContext();
  chimeContext.resume();
  const start = chimeContext.currentTime + 0.02;
  notes.forEach((frequency, index) => {
    const noteStart = start + index * 0.11;
    const oscillator = chimeContext.createOscillator();
    const volume = chimeContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(0, noteStart);
    volume.gain.linearRampToValueAtTime(0.08, noteStart + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.9);
    oscillator.connect(volume).connect(chimeContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 1);
  });
}

// A short rising arpeggio, in hertz.
const SCENE_CHIME = [523.25, 659.25, 783.99, 1046.5];

// A great line just glows softly; confetti and the chime are saved for the
// end of a great scene.
function celebrateLine(card) {
  glow(card);
}

// 5 stars or a new best: a big burst from both sides and a longer chime.
function celebrateScene(element) {
  playChime(SCENE_CHIME);
  if (reducedMotionQuery.matches) {
    glow(element);
    return;
  }
  const box = element.getBoundingClientRect();
  const y = Math.min(box.top + box.height / 2, window.innerHeight * 0.6);
  burstConfetti(window.innerWidth * 0.15, y, { count: 90, power: 17, spread: 1.2 });
  burstConfetti(window.innerWidth * 0.85, y, { count: 90, power: 17, spread: 1.2 });
  burstConfetti(window.innerWidth / 2, y, { count: 60, power: 15, spread: 2 });
}

// Sound effects are on unless the learner turned them off in this browser.
function setUpSoundEffects() {
  const toggle = document.getElementById("sound-effects");
  try {
    toggle.checked = localStorage.getItem(SOUND_EFFECTS_KEY) !== "off";
  } catch {
    toggle.checked = true;
  }
  toggle.addEventListener("change", () => {
    try {
      localStorage.setItem(SOUND_EFFECTS_KEY, toggle.checked ? "on" : "off");
    } catch {
      // The choice still applies until the page closes.
    }
  });
}
