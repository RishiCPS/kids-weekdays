// =======================================================
// Kids Weekdays Adventure 🚀
// 100% Pre-Literate Friendly:
// - Spoken Audio for Every Option & Action
// - "Listen Before You Choose" Preview Buttons
// - Full Verbal Right/Wrong Explanation on Click
// - "Listen & Pick" Audio Detective Subgame
// =======================================================

const BASE_DAYS = [
  {
    id: "mon",
    name: "Monday",
    emoji: "🎒",
    type: "School Day",
    color: "#4f46e5",
    bgLight: "#e0e7ff",
    freq: 523.25, // C5
    noteName: "Note 1"
  },
  {
    id: "tue",
    name: "Tuesday",
    emoji: "🎨",
    type: "School Day",
    color: "#0284c7",
    bgLight: "#e0f2fe",
    freq: 587.33, // D5
    noteName: "Note 2"
  },
  {
    id: "wed",
    name: "Wednesday",
    emoji: "🍎",
    type: "School Day",
    color: "#d97706",
    bgLight: "#fef3c7",
    freq: 659.25, // E5
    noteName: "Note 3"
  },
  {
    id: "thu",
    name: "Thursday",
    emoji: "🚀",
    type: "School Day",
    color: "#7c3aed",
    bgLight: "#ede9fe",
    freq: 698.46, // F5
    noteName: "Note 4"
  },
  {
    id: "fri",
    name: "Friday",
    emoji: "🎈",
    type: "School Day",
    color: "#059669",
    bgLight: "#d1fae5",
    freq: 783.99, // G5
    noteName: "Note 5"
  },
  {
    id: "sat",
    name: "Saturday",
    emoji: "🏖️",
    type: "Weekend Fun!",
    color: "#ea580c",
    bgLight: "#ffedd5",
    freq: 880.00, // A5
    noteName: "Note 6"
  },
  {
    id: "sun",
    name: "Sunday",
    emoji: "🍦",
    type: "Weekend Fun!",
    color: "#db2777",
    bgLight: "#fce7f3",
    freq: 987.77, // B5
    noteName: "Note 7"
  }
];

// App State
let weekOrder = "monday";
let activeDays = [];
let soundEnabled = true;
let stars = 0;
let showNumberClues = false; // Toggle to show numbers on choice cards if needed

// Level 1 State
let learnActiveNumber = 1;

// Level 2 (What's Next) State
let currentRound = 1;
const TOTAL_ROUNDS = 5;
let currentQuestionDay = null;
let currentCorrectNextDay = null;

// Level 3 (Audio Detective) State
let detectiveRound = 1;
let detectiveQuestionDay = null;
let detectiveTargetDay = null;

// Level 4 (Train) State
let trainExpectedIndex = 0;

// Web Audio API Synthesizer
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

const soundFx = {
  pop() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch (e) { console.warn(e); }
  },

  playTone(freq, duration = 0.35) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { console.warn(e); }
  },

  success() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) { console.warn(e); }
  },

  boing() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) { console.warn(e); }
  },

  fanfare() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const melody = [
        { f: 523.25, d: 0.15, t: 0 },
        { f: 659.25, d: 0.15, t: 0.15 },
        { f: 783.99, d: 0.15, t: 0.30 },
        { f: 1046.50, d: 0.45, t: 0.45 }
      ];
      melody.forEach(n => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, audioCtx.currentTime + n.t);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + n.t + n.d);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + n.t);
        osc.stop(audioCtx.currentTime + n.t + n.d);
      });
    } catch (e) { console.warn(e); }
  }
};

// Pure Vanilla JS Confetti (Self-Contained)
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#fde047"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.5,
      r: Math.random() * 6 + 4,
      d: Math.random() * 70,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16
    });
  }

  let animationFrame;
  let ticks = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();

      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx;
      p.vy += 0.4;
      p.vx *= 0.98;
      p.tilt = Math.sin(p.tiltAngle) * 12;
    });

    ticks++;
    if (ticks < 120) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  draw();
}

// Generic friendly speech synthesis (Zero child name)
function speak(text, callback) {
  if (!soundEnabled || !("speechSynthesis" in window)) {
    if (callback) callback();
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.15;

  const voices = window.speechSynthesis.getVoices();
  const auVoice = voices.find(v => v.lang === "en-AU" || v.lang.includes("AU")) ||
                  voices.find(v => v.lang.startsWith("en-GB")) ||
                  voices.find(v => v.lang.startsWith("en"));
  if (auVoice) {
    utterance.voice = auVoice;
  }

  if (callback) {
    utterance.onend = callback;
    utterance.onerror = callback;
  }
  window.speechSynthesis.speak(utterance);
}

// Play combined musical jingle: Tone + Spoken Rhyme ("1 is Monday!")
function playDayJingle(day, callback) {
  initAudio();
  soundFx.playTone(day.freq, 0.4);
  setTimeout(() => {
    speak(`${day.dayNum} is ${day.name}!`, callback);
  }, 250);
}

// Update Active Day Order
function updateWeekOrder(mode) {
  weekOrder = mode;
  let rawList = [];
  if (mode === "monday") {
    rawList = [...BASE_DAYS];
  } else {
    const sun = BASE_DAYS.find(d => d.id === "sun");
    const rest = BASE_DAYS.filter(d => d.id !== "sun");
    rawList = [sun, ...rest];
  }

  activeDays = rawList.map((d, index) => ({
    ...d,
    dayNum: index + 1
  }));
}

// =======================================================
// LEVEL 1: LEARN THE SOUND & NUMBER JINGLE
// =======================================================
function setupLearnNumbers() {
  const strip = document.getElementById("number-buttons-strip");
  strip.innerHTML = "";

  activeDays.forEach(day => {
    const btn = document.createElement("button");
    btn.className = `num-strip-btn ${day.dayNum === learnActiveNumber ? "active" : ""}`;
    btn.id = `num-strip-btn-${day.dayNum}`;
    btn.innerHTML = `
      <span>${day.dayNum}</span>
      <span class="btn-sub-emoji">${day.emoji}</span>
    `;

    btn.addEventListener("click", () => {
      initAudio();
      soundFx.pop();
      selectLearnNumber(day.dayNum, true);
    });

    strip.appendChild(btn);
  });

  selectLearnNumber(learnActiveNumber, false);
}

function selectLearnNumber(num, shouldPlayJingle = true) {
  learnActiveNumber = num;
  const day = activeDays.find(d => d.dayNum === num);
  if (!day) return;

  document.querySelectorAll(".num-strip-btn").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById(`num-strip-btn-${num}`);
  if (activeBtn) activeBtn.classList.add("active");

  document.getElementById("learn-progress-pill").textContent = `Step ${num} of 7`;
  document.getElementById("disc-num-tag").textContent = `Number ${num}`;
  document.getElementById("disc-note-tag").textContent = `🎵 ${day.noteName}`;
  document.getElementById("disc-emoji").textContent = day.emoji;
  document.getElementById("disc-name-display").textContent = day.name;
  document.getElementById("disc-jingle-pill").textContent = `🎶 "${num} is ${day.name}!"`;

  const nextNum = (num % activeDays.length) + 1;
  document.getElementById("disc-next-btn").textContent = `Next Day (${nextNum}) ➔`;

  const card = document.getElementById("learn-discovery-card");
  card.style.background = `linear-gradient(135deg, ${day.color} 0%, #1e1b4b 100%)`;

  if (shouldPlayJingle) {
    playDayJingle(day);
  }
}

function handleNextNumberStep() {
  initAudio();
  soundFx.pop();
  stars += 1;
  document.getElementById("star-count").textContent = stars;

  const nextNum = (learnActiveNumber % activeDays.length) + 1;
  selectLearnNumber(nextNum, true);

  if (nextNum === 1) {
    soundFx.fanfare();
    launchConfetti();
    speak("Hooray! You learned all seven days of the week!");
  }
}

function playAllDaysMelody() {
  initAudio();
  soundFx.pop();
  let idx = 0;

  function next() {
    if (idx >= activeDays.length) {
      soundFx.fanfare();
      launchConfetti();
      speak("Wonderful! All seven days in rhythm!");
      return;
    }
    const day = activeDays[idx];
    playDayJingle(day, () => {
      idx++;
      setTimeout(next, 450);
    });
  }

  speak("Let's sing all the numbers and days together!", () => {
    setTimeout(next, 500);
  });
}

// =======================================================
// LEVEL 2: WHAT'S NEXT? (HYPOTHETICAL + VERBAL FEEDBACK)
// =======================================================
function setupNextDayRound() {
  const currentIdx = Math.floor(Math.random() * activeDays.length);
  currentQuestionDay = activeDays[currentIdx];

  const nextIdx = (currentIdx + 1) % activeDays.length;
  currentCorrectNextDay = activeDays[nextIdx];

  document.getElementById("round-indicator").textContent = `Round ${currentRound}/${TOTAL_ROUNDS}`;
  
  const questionPhrases = [
    `Let's say today is ${currentQuestionDay.name}!`,
    `Imagine today is ${currentQuestionDay.name}!`,
    `Let's pretend today is ${currentQuestionDay.name}!`
  ];
  const chosenPhrase = questionPhrases[Math.floor(Math.random() * questionPhrases.length)];
  
  document.getElementById("next-question-text").innerHTML = `${chosenPhrase}`;
  document.getElementById("next-question-sub").innerHTML = `What day comes <strong>NEXT</strong>?`;

  document.getElementById("hero-day-number").textContent = `Number ${currentQuestionDay.dayNum}`;
  document.getElementById("hero-sound-hint").textContent = `🎵 ${currentQuestionDay.noteName}`;
  document.getElementById("hero-day-emoji").textContent = currentQuestionDay.emoji;
  document.getElementById("hero-day-name-clean").textContent = currentQuestionDay.name;

  document.getElementById("hear-current-jingle-btn").textContent = `🔔 Hear: "${currentQuestionDay.dayNum} is ${currentQuestionDay.name}"`;

  const heroCard = document.getElementById("day-hero-card");
  heroCard.style.background = `linear-gradient(135deg, ${currentQuestionDay.color} 0%, #1e1b4b 100%)`;

  const feedbackEl = document.getElementById("feedback-message");
  feedbackEl.classList.add("hidden");

  // Create choices
  const otherDays = activeDays.filter(d => d.id !== currentCorrectNextDay.id);
  const shuffledOthers = [...otherDays].sort(() => 0.5 - Math.random());
  const selectedDistractors = shuffledOthers.slice(0, 3);
  const allChoices = [currentCorrectNextDay, ...selectedDistractors].sort(() => 0.5 - Math.random());

  const choicesContainer = document.getElementById("choices-grid");
  choicesContainer.innerHTML = "";

  allChoices.forEach(day => {
    const wrapper = document.createElement("div");
    wrapper.className = "choice-card-wrapper";

    // Main tap button
    const cardBtn = document.createElement("button");
    cardBtn.className = "choice-card";
    cardBtn.style.borderColor = day.color;
    
    let topBadgeHtml = "";
    if (showNumberClues) {
      topBadgeHtml = `
        <div class="choice-top-badge-row">
          <span class="choice-num-tag">Number ${day.dayNum}</span>
        </div>
      `;
    }

    cardBtn.innerHTML = `
      ${topBadgeHtml}
      <span class="choice-emoji">${day.emoji}</span>
      <span class="choice-name">${day.name}</span>
    `;

    cardBtn.addEventListener("click", () => handleChoiceTap(day, cardBtn));

    // Audio preview button (child can hear what this button is BEFORE guessing!)
    const listenBtn = document.createElement("button");
    listenBtn.className = "choice-listen-btn";
    listenBtn.innerHTML = `<span>🔊 Listen: "${day.name}"</span>`;
    listenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      initAudio();
      soundFx.playTone(day.freq, 0.3);
      speak(`This option is ${day.name}!`);
    });

    wrapper.appendChild(cardBtn);
    wrapper.appendChild(listenBtn);
    choicesContainer.appendChild(wrapper);
  });

  const voicePrompt = `Let's say today is ${currentQuestionDay.name}! What day comes next? You can tap the speaker to hear each card!`;
  speak(voicePrompt);
}

function handleChoiceTap(selectedDay, buttonEl) {
  initAudio();

  const feedbackEl = document.getElementById("feedback-message");
  feedbackEl.classList.remove("hidden");

  if (selectedDay.id === currentCorrectNextDay.id) {
    // CORRECT!
    buttonEl.classList.add("correct");
    soundFx.success();
    launchConfetti();

    stars += 1;
    document.getElementById("star-count").textContent = stars;

    feedbackEl.className = "feedback-msg success";
    feedbackEl.innerHTML = `✅ <strong>You clicked ${selectedDay.name}! That is CORRECT!</strong><br>${selectedDay.name} comes after ${currentQuestionDay.name}! (${selectedDay.dayNum} is ${selectedDay.name})`;

    // Voice explicitly announces what was clicked and that it is correct!
    speak(`You clicked ${selectedDay.name}! That is CORRECT! ${selectedDay.name} comes after ${currentQuestionDay.name}! Wonderful job!`);

    const allBtns = document.querySelectorAll(".choice-card, .choice-listen-btn");
    allBtns.forEach(b => b.style.pointerEvents = "none");

    setTimeout(() => {
      if (currentRound >= TOTAL_ROUNDS) {
        showCelebration();
      } else {
        currentRound++;
        setupNextDayRound();
      }
    }, 2800);

  } else {
    // WRONG
    buttonEl.classList.add("wrong");
    soundFx.boing();

    feedbackEl.className = "feedback-msg try-again";
    feedbackEl.innerHTML = `❌ <strong>You clicked ${selectedDay.name}! That is not correct.</strong><br>We need the day after ${currentQuestionDay.name} (Looking for <strong>${currentCorrectNextDay.name}</strong>).`;

    // Voice explicitly tells him what he clicked and why it's not correct!
    speak(`You clicked ${selectedDay.name}! That is not correct. We are looking for the day after ${currentQuestionDay.name}. Can you find ${currentCorrectNextDay.name}?`);

    setTimeout(() => {
      buttonEl.classList.remove("wrong");
    }, 1000);
  }
}

// =======================================================
// LEVEL 3: LISTEN & PICK (AUDIO DETECTIVE SUBGAME)
// =======================================================
function setupAudioDetective() {
  const currentIdx = Math.floor(Math.random() * activeDays.length);
  detectiveQuestionDay = activeDays[currentIdx];

  const nextIdx = (currentIdx + 1) % activeDays.length;
  detectiveTargetDay = activeDays[nextIdx];

  document.getElementById("detective-round-indicator").textContent = `Mission ${detectiveRound}/5`;
  document.getElementById("mission-prompt-text").textContent = `Let's say today is ${detectiveQuestionDay.name}...`;
  document.getElementById("mission-target-day-name").textContent = detectiveTargetDay.name;

  const targetHearBtn = document.getElementById("mission-hear-target-btn");
  targetHearBtn.textContent = `🔊 Hear Mission: "Find ${detectiveTargetDay.name}"`;

  const feedbackEl = document.getElementById("detective-feedback");
  feedbackEl.classList.add("hidden");

  // Create mystery cards with audio buttons
  const otherDays = activeDays.filter(d => d.id !== detectiveTargetDay.id);
  const shuffledOthers = [...otherDays].sort(() => 0.5 - Math.random());
  const selectedDistractors = shuffledOthers.slice(0, 3);
  const allChoices = [detectiveTargetDay, ...selectedDistractors].sort(() => 0.5 - Math.random());

  const grid = document.getElementById("detective-choices-grid");
  grid.innerHTML = "";

  allChoices.forEach((day, index) => {
    const card = document.createElement("div");
    card.className = "mystery-card";
    card.id = `detective-card-${index}`;

    card.innerHTML = `
      <div class="mystery-speaker-icon">🔊</div>
      <div class="mystery-tap-label">Tap to Hear</div>
    `;

    card.addEventListener("click", () => {
      handleDetectiveCardClick(day, card);
    });

    grid.appendChild(card);
  });

  const promptText = `Mission time! If today was ${detectiveQuestionDay.name}, what comes next? We are looking for ${detectiveTargetDay.name}! Tap each card to hear its sound, then pick ${detectiveTargetDay.name}!`;
  speak(promptText);
}

function handleDetectiveCardClick(day, cardEl) {
  initAudio();

  // Reveal card emoji and name on tap
  cardEl.innerHTML = `
    <span class="choice-emoji">${day.emoji}</span>
    <span class="choice-name">${day.name}</span>
  `;

  const feedbackEl = document.getElementById("detective-feedback");
  feedbackEl.classList.remove("hidden");

  if (day.id === detectiveTargetDay.id) {
    // Correct!
    cardEl.classList.add("correct");
    soundFx.success();
    launchConfetti();

    stars += 1;
    document.getElementById("star-count").textContent = stars;

    feedbackEl.className = "feedback-msg success";
    feedbackEl.innerHTML = `🎉 <strong>You found ${day.name}! Correct!</strong><br>${day.name} comes after ${detectiveQuestionDay.name}!`;

    speak(`You found ${day.name}! That is CORRECT! Fantastic listening!`);

    const allCards = document.querySelectorAll(".mystery-card");
    allCards.forEach(c => c.style.pointerEvents = "none");

    setTimeout(() => {
      if (detectiveRound >= 5) {
        showCelebration();
      } else {
        detectiveRound++;
        setupAudioDetective();
      }
    }, 2800);

  } else {
    // Wrong
    cardEl.classList.add("wrong");
    soundFx.boing();

    feedbackEl.className = "feedback-msg try-again";
    feedbackEl.innerHTML = `❌ <strong>That is ${day.name}.</strong><br>Keep listening! We are looking for <strong>${detectiveTargetDay.name}</strong>!`;

    speak(`That card says ${day.name}. Not ${day.name}. We are looking for ${detectiveTargetDay.name}! Tap another card to listen!`);

    setTimeout(() => {
      cardEl.classList.remove("wrong");
    }, 1000);
  }
}

// =======================================================
// LEVEL 4: DAY TRAIN
// =======================================================
function setupTrainMode() {
  trainExpectedIndex = 0;

  const slotsContainer = document.getElementById("train-slots-container");
  slotsContainer.innerHTML = "";

  activeDays.forEach((day, idx) => {
    const slot = document.createElement("div");
    slot.className = "train-car-slot";
    slot.id = `train-slot-${idx}`;
    slot.innerHTML = `
      <span class="car-index-tag">Car ${idx + 1}</span>
      <div class="car-slot-content">
        <span class="car-slot-emoji">❓</span>
        <span class="car-slot-name">---</span>
      </div>
    `;
    slotsContainer.appendChild(slot);
  });

  const poolContainer = document.getElementById("train-choices-pool");
  poolContainer.innerHTML = "";

  const shuffledPool = [...activeDays].sort(() => 0.5 - Math.random());
  shuffledPool.forEach(day => {
    const pickBtn = document.createElement("button");
    pickBtn.className = "train-pick-btn";
    pickBtn.id = `train-pick-${day.id}`;
    pickBtn.innerHTML = `<span>${day.emoji}</span> <span>${day.name}</span>`;
    pickBtn.addEventListener("click", () => handleTrainPick(day, pickBtn));
    poolContainer.appendChild(pickBtn);
  });
}

function handleTrainPick(day, pickBtn) {
  initAudio();
  const targetDay = activeDays[trainExpectedIndex];

  if (day.id === targetDay.id) {
    soundFx.playTone(day.freq, 0.3);
    const slot = document.getElementById(`train-slot-${trainExpectedIndex}`);
    slot.classList.add("filled");
    slot.style.borderColor = day.color;
    slot.style.backgroundColor = day.bgLight;
    slot.innerHTML = `
      <span class="car-index-tag">Car ${trainExpectedIndex + 1}</span>
      <div class="car-slot-content">
        <span class="car-slot-emoji">${day.emoji}</span>
        <span class="car-slot-name">${day.name}</span>
      </div>
    `;

    pickBtn.classList.add("used");
    speak(`You loaded ${day.name}! ${day.dayNum} is ${day.name}!`);

    trainExpectedIndex++;

    if (trainExpectedIndex === activeDays.length) {
      setTimeout(() => {
        soundFx.fanfare();
        launchConfetti();
        stars += 2;
        document.getElementById("star-count").textContent = stars;
        speak("Choo Choo! You lined up all seven days in order! Wonderful job!");
      }, 500);
    }
  } else {
    soundFx.boing();
    pickBtn.classList.add("wrong");
    speak(`You picked ${day.name}. That is not right for car number ${trainExpectedIndex + 1}. Car number ${trainExpectedIndex + 1} needs ${targetDay.name}!`);
    setTimeout(() => {
      pickBtn.classList.remove("wrong");
    }, 600);
  }
}

// Celebration Modal
function showCelebration() {
  soundFx.fanfare();
  launchConfetti();
  const modal = document.getElementById("celebration-modal");
  modal.classList.remove("hidden");
  speak("Fantastic! You finished all rounds and know the days of the week!");
}

function resetGame() {
  document.getElementById("celebration-modal").classList.add("hidden");
  currentRound = 1;
  detectiveRound = 1;
  setupNextDayRound();
}

// =======================================================
// INITIALIZATION & LISTENERS
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  updateWeekOrder("monday");

  // Welcome Tap-to-Start Button
  document.getElementById("tap-to-start-btn").addEventListener("click", () => {
    initAudio();
    soundFx.success();
    document.getElementById("start-overlay").classList.add("hidden");
    speak("Welcome! The game will speak every card and tell you what is right and wrong!");
    setupLearnNumbers();
  });

  // Sound Mute Toggle
  const soundBtn = document.getElementById("sound-btn");
  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) {
      initAudio();
      soundFx.pop();
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  });

  // Toggle Number Clues button
  const toggleCluesBtn = document.getElementById("toggle-clues-btn");
  toggleCluesBtn.addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    showNumberClues = !showNumberClues;
    toggleCluesBtn.textContent = showNumberClues ? "Show Numbers: ON 🔢" : "Show Numbers: OFF";
    toggleCluesBtn.classList.toggle("active", showNumberClues);
    setupNextDayRound();
    if (showNumberClues) {
      speak("Number clues are turned on!");
    } else {
      speak("Number clues are turned off!");
    }
  });

  // Level 1 Buttons
  document.getElementById("hear-learn-num-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    const day = activeDays.find(d => d.dayNum === learnActiveNumber);
    if (day) playDayJingle(day);
  });

  document.getElementById("disc-listen-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    const day = activeDays.find(d => d.dayNum === learnActiveNumber);
    if (day) playDayJingle(day);
  });

  document.getElementById("disc-next-btn").addEventListener("click", handleNextNumberStep);
  document.getElementById("play-all-melody-btn").addEventListener("click", playAllDaysMelody);

  // Level 2 Current Jingle button
  document.getElementById("hear-current-jingle-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    if (currentQuestionDay) {
      playDayJingle(currentQuestionDay);
    }
  });

  // Level 3 Detective Buttons
  document.getElementById("repeat-detective-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    if (detectiveQuestionDay && detectiveTargetDay) {
      speak(`Mission! If today was ${detectiveQuestionDay.name}, what day comes next? We are looking for ${detectiveTargetDay.name}!`);
    }
  });

  document.getElementById("mission-hear-target-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    if (detectiveTargetDay) {
      speak(`Target: Find ${detectiveTargetDay.name}!`);
    }
  });

  // Weekday start toggle (Monday vs Sunday)
  const monBtn = document.getElementById("start-monday-btn");
  const sunBtn = document.getElementById("start-sunday-btn");

  monBtn.addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    monBtn.classList.add("active");
    sunBtn.classList.remove("active");
    updateWeekOrder("monday");
    setupLearnNumbers();
    setupNextDayRound();
    setupAudioDetective();
    setupTrainMode();
    speak("Week starts on Monday!");
  });

  sunBtn.addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    sunBtn.classList.add("active");
    monBtn.classList.remove("active");
    updateWeekOrder("sunday");
    setupLearnNumbers();
    setupNextDayRound();
    setupAudioDetective();
    setupTrainMode();
    speak("Week starts on Sunday!");
  });

  // Mode Navigation Tabs
  const modeTabs = document.querySelectorAll(".mode-tab");
  modeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      initAudio();
      soundFx.pop();
      modeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const mode = tab.dataset.mode;
      document.querySelectorAll(".game-screen").forEach(s => s.classList.remove("active-screen"));
      document.getElementById(`mode-${mode}`).classList.add("active-screen");

      if (mode === "learn-numbers") {
        setupLearnNumbers();
      } else if (mode === "next-day") {
        setupNextDayRound();
      } else if (mode === "audio-detective") {
        setupAudioDetective();
      } else if (mode === "train-order") {
        setupTrainMode();
      }
    });
  });

  // Repeat question button
  document.getElementById("repeat-question-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    if (currentQuestionDay) {
      speak(`Let's say today is ${currentQuestionDay.name}! What day comes next?`);
    }
  });

  // Train mode actions
  document.getElementById("reset-train-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    setupTrainMode();
  });

  document.getElementById("hear-train-help-btn").addEventListener("click", () => {
    initAudio();
    soundFx.pop();
    const targetDay = activeDays[trainExpectedIndex];
    speak(`Find ${targetDay.name} for car number ${trainExpectedIndex + 1}!`);
  });

  // Modal replay button
  document.getElementById("play-again-btn").addEventListener("click", () => {
    initAudio();
    resetGame();
  });

  // Initial load
  setupLearnNumbers();
});
