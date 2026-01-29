// ===========================
// STATE & STORAGE
// ===========================
const STORAGE_KEY = "courseState_v1";

let state = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  lessons: {
    1: { completed: false },
    2: { completed: false }
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
  recalcLevel();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recalcLevel() {
  state.level = Math.floor(state.xp / 100) + 1;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak() {
  const today = todayString();
  if (!state.lastActiveDate) {
    state.streak = 1;
  } else if (state.lastActiveDate !== today) {
    state.streak += 1;
  }
  state.lastActiveDate = today;
}

// ===========================
// XP & PROGRESS
// ===========================
function addXP(amount) {
  if (amount <= 0) return;
  state.xp += amount;
  recalcLevel();
  touchStreak();
  saveState();
  updateUI();
}

function completeLessonInternal(lessonId) {
  if (!state.lessons[lessonId]) return;
  if (!state.lessons[lessonId].completed) {
    state.lessons[lessonId].completed = true;
    addXP(40); // completion bonus
  } else {
    saveState();
    updateUI();
  }
}

// ===========================
// UI UPDATE
// ===========================
function updateUI() {
  // XP bar in sidebar
  const xpFill = document.getElementById("xpFill");
  const xpValue = document.getElementById("xpValue");
  const levelValue = document.getElementById("levelValue");
  const totalXPValue = document.getElementById("totalXPValue");
  const progressTotalXP = document.getElementById("progressTotalXP");
  const progressLevel = document.getElementById("progressLevel");
  const progressXPBarFill = document.getElementById("progressXPBarFill");
  const progressFill = document.getElementById("progressFill");

  const streakValue = document.getElementById("streakValue");
  const streakValueDashboard = document.getElementById("streakValueDashboard");
  const streakValueProgress = document.getElementById("streakValueProgress");

  const lesson1Status = document.getElementById("lesson1Status");
  const lesson2Status = document.getElementById("lesson2Status");
  const progressLesson1Status = document.getElementById("progressLesson1Status");
  const progressLesson2Status = document.getElementById("progressLesson2Status");

  const badgeStarter = document.getElementById("badgeStarter");
  const badgeCommitted = document.getElementById("badgeCommitted");
  const badgeSystemBuilder = document.getElementById("badgeSystemBuilder");

  const levelRing = document.getElementById("levelRing");
  const lessonRadial = document.getElementById("lessonRadial");
  const lessonCompletionPercent = document.getElementById("lessonCompletionPercent");

  // XP & level
  const levelXPWithin = state.xp % 100;
  const levelPercent = Math.min(levelXPWithin, 100);
  const levelFraction = levelPercent / 100;

  if (xpFill) xpFill.style.width = levelPercent + "%";
  if (xpValue) xpValue.textContent = state.xp + " XP";
  if (totalXPValue) totalXPValue.textContent = state.xp;
  if (progressTotalXP) progressTotalXP.textContent = state.xp;
  if (levelValue) levelValue.textContent = state.level;
  if (progressLevel) progressLevel.textContent = state.level;
  if (progressXPBarFill) progressXPBarFill.style.width = levelPercent + "%";
  if (progressFill) progressFill.style.width = levelPercent + "%";

  // Level ring (dashboard hero)
  if (levelRing) {
    const circumference = 314;
    const offset = circumference * (1 - levelFraction);
    levelRing.style.strokeDashoffset = offset;
  }

  // Streak
  if (streakValue) streakValue.textContent = state.streak;
  if (streakValueDashboard) streakValueDashboard.textContent = state.streak;
  if (streakValueProgress) streakValueProgress.textContent = state.streak;

  // Lessons
  const l1Done = state.lessons[1].completed;
  const l2Done = state.lessons[2].completed;

  if (lesson1Status) lesson1Status.textContent = l1Done ? "Completed" : "Locked";
  if (lesson2Status) lesson2Status.textContent = l2Done ? "Completed" : "Locked";
  if (progressLesson1Status) progressLesson1Status.textContent = l1Done ? "Completed" : "Locked";
  if (progressLesson2Status) progressLesson2Status.textContent = l2Done ? "Completed" : "Locked";

  // Lesson completion radial
  if (lessonRadial && lessonCompletionPercent) {
    const completedCount = (l1Done ? 1 : 0) + (l2Done ? 1 : 0);
    const completion = completedCount / 2; // 2 lessons
    const circumference = 314;
    const offset = circumference * (1 - completion);
    lessonRadial.style.strokeDashoffset = offset;
    lessonCompletionPercent.textContent = Math.round(completion * 100) + "%";
  }

  // Badges
  if (badgeStarter) {
    if (state.xp >= 50) {
      badgeStarter.textContent = "Starter — Unlocked";
      badgeStarter.classList.add("completed");
    } else {
      badgeStarter.textContent = "Starter — Reach 50 XP";
      badgeStarter.classList.remove("completed");
    }
  }

  if (badgeCommitted) {
    if (state.xp >= 200) {
      badgeCommitted.textContent = "Committed — Unlocked";
      badgeCommitted.classList.add("completed");
    } else {
      badgeCommitted.textContent = "Committed — Reach 200 XP";
      badgeCommitted.classList.remove("completed");
    }
  }

  if (badgeSystemBuilder) {
    if (l2Done) {
      badgeSystemBuilder.textContent = "System Builder — Unlocked";
      badgeSystemBuilder.classList.add("completed");
    } else {
      badgeSystemBuilder.textContent = "System Builder — Complete Lesson 2";
      badgeSystemBuilder.classList.remove("completed");
    }
  }

  // XP momentum bars (fake distribution based on XP)
  const bars = [
    document.getElementById("xpBar1"),
    document.getElementById("xpBar2"),
    document.getElementById("xpBar3"),
    document.getElementById("xpBar4"),
    document.getElementById("xpBar5")
  ].filter(Boolean);

  if (bars.length) {
    const base = Math.min(state.xp, 500); // cap for visual
    const slice = base / bars.length;
    bars.forEach((bar, idx) => {
      const factor = 0.6 + idx * 0.1;
      const height = Math.min(100, slice * factor / 5); // scale
      bar.style.height = height + "%";
    });
  }
}

// ===========================
// LESSON INTERACTIONS
// ===========================
function getCurrentLessonId() {
  const body = document.body;
  const attr = body.getAttribute("data-lesson");
  if (!attr) return null;
  const id = parseInt(attr, 10);
  return isNaN(id) ? null : id;
}

function openVideo(videoId) {
  if (!videoId) return;
  window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  addXP(5);
}


function spinWheel() {
  const resultEl = document.getElementById("spinResult");
  if (!resultEl) return;

  const messages = [
    "Stay consistent, not perfect.",
    "Systems beat motivation.",
    "Your emotions are your biggest opponent.",
    "Small wins compound over time.",
    "Protect your rules from your feelings.",
    "Design around your real life, not your ideal one."
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];
  resultEl.textContent = "🎰 " + msg;
  addXP(10);
}

function revealCard(el, index) {
  if (!el || el.classList.contains("revealed")) return;

  const lessonId = getCurrentLessonId();
  const textsLesson1 = {
    1: "Investing = owning assets that grow.",
    2: "Trading = short-term timing.",
    3: "Compounding rewards patience.",
    4: "Risk is manageable with knowledge.",
    5: "Mindset drives long-term success."
  };
  const textsLesson2 = {
    1: "Good systems survive bad days.",
    2: "Reduce decisions, increase defaults.",
    3: "Track actions, not feelings.",
    4: "Protect your rules from emotion.",
    5: "Small, repeatable steps compound."
  };

  let text = "?";
  if (lessonId === 1) text = textsLesson1[index] || "?";
  if (lessonId === 2) text = textsLesson2[index] || "?";

  el.classList.add("revealed");
  el.textContent = text;
  addXP(6);
}

function answerQuiz(button, isCorrect) {
  if (!button) return;
  const container = button.closest(".quiz-question");
  if (!container) return;
  if (container.getAttribute("data-answered") === "true") return;

  const feedback = document.getElementById("quizFeedback");
  if (isCorrect) {
    button.classList.add("correct");
    container.setAttribute("data-answered", "true");
    if (feedback) feedback.textContent = "Nice work. That’s the right idea.";
    addXP(12);
  } else {
    button.classList.add("wrong");
    if (feedback) feedback.textContent = "Not quite. Try another option.";
    setTimeout(() => button.classList.remove("wrong"), 700);
  }
}

function completeAction(li) {
  if (!li || li.classList.contains("completed")) return;
  li.classList.add("completed");
  addXP(8);
}

function completeLesson() {
  const lessonId = getCurrentLessonId();
  if (!lessonId) return;

  completeLessonInternal(lessonId);

  const msg = document.getElementById("completionMessage");
  if (msg) {
    msg.textContent = "🎉 Lesson " + lessonId + " marked complete!";
  }
}

// ===========================
// INIT
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateUI();
});
