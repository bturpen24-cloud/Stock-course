/* ===========================
   GLOBAL STATE + STORAGE
=========================== */
const STORAGE_KEY = "courseState_v1";

let state = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  sourcesAwarded: {},
  lessons: {
    lesson1: { completed: false },
    lesson2: { completed: false }
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load state", e);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ===========================
   LEVEL / STREAK / XP LOGIC
=========================== */
function recalcLevel() {
  state.level = Math.floor(state.xp / 100) + 1;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreakOnActivity() {
  const today = todayString();
  if (!state.lastActiveDate) {
    state.streak = 1;
  } else if (state.lastActiveDate !== today) {
    state.streak += 1;
  }
  state.lastActiveDate = today;
}

/* One-time XP grant per source key */
function grantXP(sourceKey, amount) {
  if (state.sourcesAwarded[sourceKey]) return;

  state.sourcesAwarded[sourceKey] = true;
  state.xp += amount;
  recalcLevel();
  updateStreakOnActivity();
  saveState();
  updateGlobalUI();
}

/* Mark lesson complete */
function completeLessonGlobal(lessonKey, xpReward) {
  if (state.lessons[lessonKey]?.completed) return;

  state.lessons[lessonKey].completed = true;
  state.xp += xpReward;
  recalcLevel();
  updateStreakOnActivity();
  saveState();
  updateGlobalUI();
}

/* ===========================
   UI BINDING
=========================== */
function updateGlobalUI() {
  const xpFill = document.getElementById("xpFill");
  const xpValue = document.getElementById("xpValue");
  const streakValue = document.getElementById("streakValue");
  const levelValue = document.getElementById("levelValue");
  const lesson1Status = document.getElementById("lesson1Status");
  const lesson2Status = document.getElementById("lesson2Status");
  const totalXPValue = document.getElementById("totalXPValue");
  const progressXPBar = document.getElementById("progressXPBarFill");
  const progressTotalXP = document.getElementById("progressTotalXP");
  const progressLevel = document.getElementById("progressLevel");
  const progressLesson1Status = document.getElementById("progressLesson1Status");
  const progressLesson2Status = document.getElementById("progressLesson2Status");
  const streakDashboard = document.getElementById("streakValueDashboard");

  const levelXPWithin = state.xp % 100;
  const levelPercent = Math.min(levelXPWithin, 100);

  if (xpFill) xpFill.style.width = levelPercent + "%";
  if (xpValue) xpValue.textContent = state.xp + " XP";
  if (streakValue) streakValue.textContent = state.streak;
  if (levelValue) levelValue.textContent = "Level " + state.level;
  if (lesson1Status) lesson1Status.textContent = state.lessons.lesson1.completed ? "Completed" : "Locked";
  if (lesson2Status) lesson2Status.textContent = state.lessons.lesson2.completed ? "Completed" : "Locked";
  if (totalXPValue) totalXPValue.textContent = state.xp + " XP total";
  if (progressXPBar) progressXPBar.style.width = Math.min(levelPercent, 100) + "%";
  if (progressTotalXP) progressTotalXP.textContent = state.xp + " XP total";
  if (progressLevel) progressLevel.textContent = "Level " + state.level;
  if (progressLesson1Status) progressLesson1Status.textContent = state.lessons.lesson1.completed ? "Completed" : "Locked";
  if (progressLesson2Status) progressLesson2Status.textContent = state.lessons.lesson2.completed ? "Completed" : "Locked";
  if (streakDashboard) streakDashboard.textContent = state.streak;
}

/* ===========================
   PAGE HELPERS
=========================== */
function globalSpin(sourceKey, resultElementId, messages, xpAmount) {
  const el = document.getElementById(resultElementId);
  if (!el) return;

  if (state.sourcesAwarded[sourceKey]) {
    el.textContent = "You've already spun this.";
    return;
  }

  const result = messages[Math.floor(Math.random() * messages.length)];
  el.textContent = "🎰 " + result;
  grantXP(sourceKey, xpAmount);
}

function globalRevealCard(sourceKey, cardElement, text) {
  if (cardElement.classList.contains("revealed")) return;

  cardElement.classList.add("revealed");
  cardElement.textContent = text;
  grantXP(sourceKey, 6);
}

function globalQuizAnswer(sourceKey, button, correct, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  if (!feedback) return;

  if (correct) {
    button.classList.add("correct");
    feedback.textContent = "Nice work!";
    grantXP(sourceKey, 12);
  } else {
    button.classList.add("wrong");
    feedback.textContent = "Try again.";
    setTimeout(() => button.classList.remove("wrong"), 800);
  }
}

function globalActionStep(sourceKey, item) {
  if (item.classList.contains("completed")) return;
  item.classList.add("completed");
  grantXP(sourceKey, 10);
}

/* ===========================
   INIT
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateGlobalUI();
});
