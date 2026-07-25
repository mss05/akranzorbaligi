const data = window.KIRMIZI_CIZGI_DATA;
const questions = data.quizQuestions;

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}

function guideToHtmlDocument() {
  const sections = data.guide.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.body)}</p>
      <ul>
        ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.guide.title)}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
      color: #111;
      line-height: 1.6;
      background: #fffaf2;
    }
    h1 {
      font-size: 44px;
      line-height: 1;
      letter-spacing: -2px;
      color: #0a2a43;
    }
    h2 {
      margin-top: 34px;
      color: #b20d16;
    }
    section {
      padding: 20px 0;
      border-bottom: 1px solid rgba(0,0,0,.12);
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <p><strong>Kırmızı Çizgini Çek · Gülme, geçme. Bence burada duralım.</strong></p>
  <h1>${escapeHtml(data.guide.title)}</h1>
  ${sections}
</body>
</html>`;
}

function getCurrentLevel() {
  return [...levels].reverse().find((level) => completed >= level.min).name;
}

function addBadge(name) {
  if (!badges.includes(name)) {
    badges.push(name);
  }
}

function updateHud() {
  $("#testScore").textContent = score;
  $("#testStreak").textContent = streak;
  $("#testLevel").textContent = getCurrentLevel();

  const progress = Math.min(completed / questions.length, 1) * 100;

  $("#testProgress").style.width = `${progress}%`;
  $("#redlineFill").style.width = `${progress}%`;
  $("#redlineText").textContent = `${Math.round(progress)}%`;
  $("#testCounter").textContent = `${completed} / ${questions.length}`;

  const badgesTarget = $("#testBadges");
  badgesTarget.innerHTML = badges.length
    ? badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")
    : `<span class="small">Henüz rozet yok.</span>`;
}

function renderQuestion() {
  const question = questions[currentIndex];

  answered = false;

  $("#questionNumber").textContent = `Soru ${currentIndex + 1}`;
  $("#quizCategory").textContent = question.category;
  $("#quizTitle").textContent = question.title;
  $("#quizScenario").textContent = question.scenario;

  $("#quizFeedback").hidden = true;

  document.querySelectorAll(".option-card").forEach((button) => {
    button.disabled = false;
    button.style.borderColor = "rgba(17, 17, 17, 0.14)";
    button.style.background = "white";
  });

  $("#nextQuestionBtn").textContent =
    currentIndex === questions.length - 1 ? "Sonucu Gör" : "Sonraki Soru";

  updateHud();
}

function answerQuestion(selected, button) {
  if (answered) return;

  answered = true;

  const question = questions[currentIndex];
  const correct = selected === "bullying";

  document.querySelectorAll(".option-card").forEach((btn) => {
    btn.disabled = true;
  });

  if (correct) {
    score += 100;
    streak += 1;

    $("#feedbackMark").textContent = "✓";
    $("#feedbackTitle").textContent = "Doğru: Bu ZORBALIK.";
    button.style.borderColor = "#b20d16";
    button.style.background = "rgba(178, 13, 22, 0.08)";

    addBadge("Maskeyi düşürdün");
    confetti(14);
  } else if (selected === "unsure") {
    score += 55;
    streak = 0;

    $("#feedbackMark").textContent = "!";
    $("#feedbackTitle").textContent = "Emin olmak önemli: Bu ZORBALIK.";
    button.style.borderColor = "#1d5d82";
    button.style.background = "rgba(29, 93, 130, 0.08)";

    addBadge("Sınırı sorguladın");
  } else {
    score += 25;
    streak = 0;

    $("#feedbackMark").textContent = "!";
    $("#feedbackTitle").textContent = "Şaka değil: Bu ZORBALIK.";
    button.style.borderColor = "#0a2a43";
    button.style.background = "rgba(10, 42, 67, 0.08)";

    addBadge("Şaka bahanesini yakaladın");
  }

  completed = Math.max(completed, currentIndex + 1);

  if (completed >= 4) addBadge("Gülme Geçme");
  if (completed >= 8) addBadge("Sessiz Kalmayan");
  if (completed >= 12) addBadge("Yanında Duran");
  if (completed >= 16) addBadge("Kırmızı Çizgisini Çeken");

  answers[currentIndex] = {
    title: question.title,
    selected,
    correct
  };

  $("#feedbackExplanation").textContent = question.explanation;
  $("#feedbackWhy").textContent = question.why;
  $("#feedbackAction").textContent = question.action;
  $("#quizFeedback").hidden = false;

  updateHud();
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const correctCount = answers.filter((answer) => answer && answer.correct).length;
  const unsureCount = answers.filter((answer) => answer && answer.selected === "unsure").length;
  const jokeCount = answers.filter((answer) => answer && answer.selected === "joke").length;
  const level = getCurrentLevel();

  $("#resultTitle").textContent = `${level} Rozeti Kazandın`;
  $("#resultText").textContent =
    `${score} farkındalık puanı topladın. ${correctCount} senaryoda zorbalığı doğrudan fark ettin. ${unsureCount} senaryoda sınırı sorguladın. ${jokeCount} senaryoda ise şaka maskesinin nasıl çalıştığını gördün.`;

  $("#resultList").innerHTML = `
    <li><strong>En önemli cümle:</strong> Bence burada duralım.</li>
    <li><strong>Hatırlanacak nokta:</strong> Şaka karşılıklıysa şakadır; biri susuyorsa veya utanıyorsa sınır aşılmış olabilir.</li>
    <li><strong>Sonraki adım:</strong> Kılavuzu indir, müdahale cümlelerini sakla, gerektiğinde güvenli bir yetişkine başvur.</li>
  `;

  renderTones();

  $("#testResult").hidden = false;
  $("#testResult").scrollIntoView({ behavior: "smooth", block: "center" });

  confetti(42);
}

function renderTones() {
  const target = $("#toneGrid");
  if (!target) return;

  target.innerHTML = data.tones.map((tone) => `
    <article class="tone-card">
      <strong>${escapeHtml(tone.title)}</strong>
      <p>${escapeHtml(tone.text)}</p>
    </article>
  `).join("");
}

function restartTest() {
  currentIndex = 0;
  score = 0;
  streak = 0;
  completed = 0;
  badges = [];
  answers = [];
  answered = false;

  $("#testResult").hidden = true;
  renderQuestion();

  $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resultToText() {
  const level = getCurrentLevel();
  const correctCount = answers.filter((answer) => answer && answer.correct).length;

  return [
    "Kırmızı Çizgini Çek Test Sonucu",
    "",
    `Puan: ${score}`,
    `Rozet: ${level}`,
    `Doğrudan fark edilen zorbalık sayısı: ${correctCount}`,
    "",
    "Hatırlanacak cümle: Bence burada duralım.",
    "",
    "Gülme, geçme. Kırmızı çizgini çek."
  ].join("\n");
}

function confetti(count) {
  const colors = ["#b20d16", "#0a2a43", "#111111", "#fffaf2"];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 1350);
  }
}

function bindTestEvents() {
  document.querySelectorAll(".option-card").forEach((button) => {
    button.addEventListener("click", () => {
      answerQuestion(button.dataset.answer, button);
    });
  });

  $("#nextQuestionBtn").addEventListener("click", nextQuestion);

  $("#restartTestBtn").addEventListener("click", restartTest);

  $("#downloadResultBtn").addEventListener("click", () => {
    downloadFile("kirmizi-cizgini-cek-test-sonucu.txt", resultToText());
  });

  $("#downloadGuideFromTestBtn").addEventListener("click", () => {
    downloadFile(data.guide.filename, guideToHtmlDocument(), "text/html;charset=utf-8");
  });
}

bindTestEvents();
renderQuestion();
