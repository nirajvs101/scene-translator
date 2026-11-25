// Daily streak: how many days in a row the learner has finished a scene,
// shown as a small pill above the word of the day. Days follow the learner's
// own clock (localDayNumber, from word-of-the-day.js). It's saved in this
// browser as { lastDay, count }: the last day practiced and the streak then.

const STREAK_KEY = "scene-translator-streak";

function loadStreak() {
  try {
    const saved = JSON.parse(localStorage.getItem(STREAK_KEY));
    return saved && Number.isInteger(saved.lastDay) && Number.isInteger(saved.count) && saved.count > 0 ? saved : null;
  } catch {
    return null;
  }
}

function saveStreak(streak) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {
    // Private windows can refuse; the streak still shows until the page closes.
  }
}

// The streak after practicing on `day`: practicing twice in a day counts
// once, the day after the last one adds a day, and a gap starts over.
function streakAfterPractice(streak, day) {
  if (streak && streak.lastDay >= day) {
    return streak;
  }
  if (streak && streak.lastDay === day - 1) {
    return { lastDay: day, count: streak.count + 1 };
  }
  return { lastDay: day, count: 1 };
}

// How the streak stands on `today`. It stays alive through the day after the
// last practice, so yesterday's streak can still be kept going today.
function streakStatus(streak, today) {
  if (!streak || streak.lastDay < today - 1) {
    return { count: 0, practicedToday: false };
  }
  return { count: streak.count, practicedToday: streak.lastDay >= today };
}

// Longer streaks get bigger cheers; the first level a streak reaches applies.
const STREAK_LEVELS = [
  { from: 100, message: (count) => `👑 ${count}-day streak, legendary!` },
  { from: 30, message: (count) => `🏆 ${count}-day streak, a month of practice!` },
  { from: 14, message: (count) => `🚀 ${count}-day streak, unstoppable!` },
  { from: 7, message: (count) => `⚡ ${count} days in a row, a whole week!` },
  { from: 2, message: (count) => `🔥 ${count}-day streak!` },
  { from: 1, message: () => "🌱 Day 1! Come back tomorrow to grow it" },
];

function streakMessage({ count, practicedToday }) {
  if (count === 0) {
    return "✨ Finish a scene to start a streak";
  }
  if (!practicedToday) {
    return `🔥 ${count}-day streak, keep it going today`;
  }
  return STREAK_LEVELS.find((level) => count >= level.from).message(count);
}

function renderStreak() {
  const pill = document.getElementById("streak");
  const status = streakStatus(loadStreak(), localDayNumber(new Date()));
  pill.textContent = streakMessage(status);
  pill.classList.toggle("streak-waiting", status.count > 0 && !status.practicedToday);
}

// Counts today as practiced (a finished scene) and shows the new streak,
// with a little pop when it grew.
function recordPractice() {
  const before = loadStreak();
  const after = streakAfterPractice(before, localDayNumber(new Date()));
  saveStreak(after);
  renderStreak();
  if (after !== before) {
    const pill = document.getElementById("streak");
    pill.classList.remove("streak-grew");
    void pill.offsetWidth;
    pill.classList.add("streak-grew");
  }
}

// The message changes at midnight ("keep it going today"), so
// redraw then, and when coming back to a tab that slept through it.
function setUpStreak() {
  renderStreak();
  const redrawAtMidnight = () => {
    setTimeout(() => {
      renderStreak();
      redrawAtMidnight();
    }, msUntilNextMidnight(new Date()) + 1000);
  };
  redrawAtMidnight();
  document.addEventListener("visibilitychange", renderStreak);
}
