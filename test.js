const DATA = window.KIRMIZI_CIZGI_DATA;
const QUESTIONS = DATA.quizQuestions;

const levels = [
  { min: 0, name: "Seyirci" },
  { min: 3, name: "Fark Eden" },
  { min: 6, name: "Şaka Maskesini Gören" },
  { min: 9, name: "Ses Çıkaran" },
  { min: 12, name: "Yanında Duran" },
  { min: 16, name: "Kırmızı Çizgisini Çeken" }
];

let currentIndex = 0;
let score = 0;
let streak = 0;
let completed = 0;
let badges = [];
let answers = [];
let answered = false;

const $ = (selector) => document.querySelector(selector);

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getLevel() {
  return [...levels].reverse().find((level) => completed >= level.min).name;
}

function addBadge(name) {
  if (!badges.includes(name)) {
    badges.push(name);
  }
}

function updateHud() {
  $("#score").textContent = score;
  $("#streak").textContent = streak;
  $("#level").textContent = getLevel();

  const progress = Math.min(completed / QUESTIONS.length, 1) * 100;

  $("#redlineFill").style.width = `${progress}%`;
  $("#redlineText").textContent = `${Math.round(progress)}%`;
  $("#counter").textContent = `${completed} / ${QUESTIONS.length}`;

  const badgesTarget = $("#badges");
  badgesTarget.innerHTML = badges.length
    ? badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")
    : `<span class="badge">Henüz rozet yok</span>`;
}

function renderQuestion() {
  const question = QUESTIONS[currentIndex];

  answered = false;

  $("#questionNumber").textContent = `Soru ${currentIndex + 1}`;
  $("#category").textContent = question.category;
  $("#questionTitle").textContent = question.title;
  $("#scenario").textContent = question.scenario;

  $("#feedback").hidden = true;

  document.querySelectorAll(".options button").forEach((button) => {
    button.disabled = false;
    button.style.borderColor = "rgba(17, 17, 17, 0.12)";
    button.style.background = "white";
  });

  $("#nextBtn").textContent =
    currentIndex === QUESTIONS.length - 1 ? "Sonucu Gör" : "Sonraki Soru";

  updateHud();
}

function answerQuestion(selected, button) {
  if (answered) return;

  answered = true;

  const question = QUESTIONS[currentIndex];
  const correct = selected === "bullying";

  document.querySelectorAll(".options button").forEach((btn) => {
    btn.disabled = true;
  });

  if (correct) {
    score += 100;
    streak += 1;

    $("#feedbackIcon").textContent = "✓";
    $("#feedbackTitle").textContent = "Doğru: Bu ZORBALIK.";
    button.style.borderColor = "#c90a0a";
    button.style.background = "rgba(201, 10, 10, 0.08)";

    addBadge("Maskeyi düşürdün");
  } else if (selected === "unsure") {
    score += 55;
    streak = 0;

    $("#feedbackIcon").textContent = "!";
    $("#feedbackTitle").textContent = "Emin olmak önemli: Bu ZORBALIK.";
    button.style.borderColor = "#0d2c46";
    button.style.background = "rgba(13, 44, 70, 0.08)";

    addBadge("Sınırı sorguladın");
  } else {
    score += 25;
    streak = 0;

    $("#feedbackIcon").textContent = "!";
    $("#feedbackTitle").textContent = "Şaka değil: Bu ZORBALIK.";
    button.style.borderColor = "#0d2c46";
    button.style.background = "rgba(13, 44, 70, 0.08)";

    addBadge("Şaka bahanesini yakaladın");
  }

  completed = Math.max(completed, currentIndex + 1);

  if (completed >= 4) addBadge("Gülme Geçme");
if (completed >= 8) addBadge("Sessiz Kalmayan");
if (completed >= 12) addBadge("Yanında Duran");
if (completed >= 16) addBadge("Kırmızı Çizgisini Çeken");


  answers[currentIndex] = { selected, correct };

  $("#feedbackExplanation").textContent = question.explanation;
  $("#feedbackWhy").textContent = question.why;
  $("#feedbackAction").textContent = question.action;

  $("#feedback").hidden = false;

  updateHud();
}

function nextQuestion() {
  if (currentIndex < QUESTIONS.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const correctCount = answers.filter((item) => item && item.correct).length;
  const unsureCount = answers.filter((item) => item && item.selected === "unsure").length;
  const jokeCount = answers.filter((item) => item && item.selected === "joke").length;

  $("#resultTitle").textContent = `${getLevel()} Rozeti Kazandın`;
  $("#resultText").textContent =
    `${score} farkındalık puanı topladın. ${correctCount} senaryoda zorbalığı doğrudan fark ettin. ${unsureCount} senaryoda sınırı sorguladın. ${jokeCount} senaryoda ise şaka maskesinin nasıl çalıştığını gördün.`;

  $("#resultList").innerHTML = `
    <li><strong>En önemli cümle:</strong> Bence burada duralım.</li>
    <li><strong>Hatırlanacak nokta:</strong> Şaka karşılıklıysa şakadır; biri susuyorsa veya utanıyorsa sınır aşılmış olabilir.</li>
    <li><strong>Sonraki adım:</strong> Kılavuzu oku, müdahale cümlelerini sakla, gerektiğinde güvenli bir yetişkine başvur.</li>
  `;

  $("#resultSection").hidden = false;
  $("#resultSection").scrollIntoView({ behavior: "smooth", block: "center" });
}

function restartTest() {
  currentIndex = 0;
  score = 0;
  streak = 0;
  completed = 0;
  badges = [];
  answers = [];
  answered = false;

  $("#resultSection").hidden = true;
  renderQuestion();
  $("#quizArea").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resultToText() {
  return [
    "Kırmızı Çizgini Çek Test Sonucu",
    "",
    `Puan: ${score}`,
    `Rozet: ${getLevel()}`,
    "",
    "Hatırlanacak cümle: Bence burada duralım.",
    "Gülme, geçme. Kırmızı çizgini çek."
  ].join("\n");
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.querySelectorAll(".options button").forEach((button) => {
    button.addEventListener("click", () => {
      answerQuestion(button.dataset.answer, button);
    });
  });

  $("#nextBtn").addEventListener("click", nextQuestion);

  $("#restartBtn").addEventListener("click", restartTest);

  $("#downloadResultBtn").addEventListener("click", () => {
    downloadFile("kirmizi-cizgini-cek-test-sonucu.txt", resultToText());
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  bindEvents();
  renderQuestion();
});
