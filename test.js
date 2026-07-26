const DATA = window.KIRMIZI_CIZGI_DATA;
const QUESTIONS = DATA && Array.isArray(DATA.quizQuestions) ? DATA.quizQuestions : [];

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

  const progress = QUESTIONS.length ? Math.min(completed / QUESTIONS.length, 1) * 100 : 0;

  $("#redlineFill").style.width = `${progress}%`;
  $("#redlineText").textContent = `${Math.round(progress)}%`;
  $("#counter").textContent = `${completed} / ${QUESTIONS.length}`;

  const badgesTarget = $("#badges");
  badgesTarget.innerHTML = badges.length
    ? badges.map((badge) => `<span class="badge">${badge}</span>`).join("")
    : `<span class="badge empty">Henüz rozet yok</span>`;
}

function renderQuestion() {
  if (!QUESTIONS.length) {
    $("#questionTitle").textContent = "Sorular yüklenemedi.";
    $("#scenario").textContent = "data.js dosyasında quizQuestions alanı bulunamadı veya hatalı.";
    return;
  }

  const question = QUESTIONS[currentIndex];

  answered = false;

  $("#questionNumber").textContent = `Soru ${currentIndex + 1}`;
  $("#category").textContent = question.category;
  $("#questionTitle").textContent = question.title;
  $("#scenario").textContent = question.scenario;

  $("#feedback").hidden = true;

  document.querySelectorAll(".options button").forEach((button) => {
    button.disabled = false;
    button.classList.remove("selected", "wrong", "correct");
  });

  $("#nextBtn").textContent =
    currentIndex === QUESTIONS.length - 1 ? "Sonucu Gör" : "Sonraki soru";

  updateHud();
}

function answerQuestion(selected, button) {
  if (answered || !QUESTIONS.length) return;

  answered = true;

  const question = QUESTIONS[currentIndex];
  const correct = selected === "bullying";

  document.querySelectorAll(".options button").forEach((btn) => {
    btn.disabled = true;
  });

  button.classList.add("selected");

  if (correct) {
    score += 100;
    streak += 1;

    $("#feedbackIcon").textContent = "✓";
    $("#feedbackTitle").textContent = "Doğru: Bu ZORBALIK.";
    button.classList.add("correct");

    addBadge("Maskeyi düşürdün");
  } else if (selected === "unsure") {
    score += 55;
    streak = 0;

    $("#feedbackIcon").textContent = "!";
    $("#feedbackTitle").textContent = "Emin olmak önemli: Bu ZORBALIK.";
    button.classList.add("wrong");

    addBadge("Sınırı sorguladın");
  } else {
    score += 25;
    streak = 0;

    $("#feedbackIcon").textContent = "!";
    $("#feedbackTitle").textContent = "Şaka değil: Bu ZORBALIK.";
    button.classList.add("wrong");

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

function updateShareCard() {
  const badge = getLevel();

  let text = "Şaka gibi görünen davranışların zorbalık olduğunu fark ettim.";

  if (score >= 1200) {
    text = "Sessiz kalmak yerine sınır çizebileceğimi ve zorbalığın karşısında durabileceğimi gördüm.";
  } else if (score >= 800) {
    text = "Birçok durumda şaka ile zorbalık arasındaki çizgiyi daha net fark ettim.";
  } else if (score >= 400) {
    text = "Bazı durumlarda şakanın zorbalığa dönüşebileceğini fark ettim.";
  }

  $("#shareBadge").textContent = badge;
  $("#shareScore").textContent = score;
  $("#shareText").textContent = text;
}

async function renderCardCanvas() {
  updateShareCard();

  const card = $("#shareCard");

  const canvas = await html2canvas(card, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffaf4"
  });

  return canvas;
}

async function downloadCardImage() {
  const canvas = await renderCardCanvas();

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "kirmizi-cizgini-cek-sonuc-karti.png";
  link.click();
}

async function shareCardImage() {
  const canvas = await renderCardCanvas();

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], "kirmizi-cizgini-cek-sonuc-karti.png", {
      type: "image/png"
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Kırmızı Çizgini Çek Test Sonucum",
          text: "Ben testimi çözdüm. Gülme, Geçme.",
          files: [file]
        });
      } catch (error) {
        console.log("Paylaşım iptal edildi.", error);
      }
    } else {
      await downloadCardImage();
    }
  }, "image/png");
}

async function downloadResultPdf() {
  updateShareCard();

  const canvas = await renderCardCanvas();
  const imgData = canvas.toDataURL("image/png");

  const jsPDFClass = window.jspdf && window.jspdf.jsPDF;

  if (!jsPDFClass) {
    alert("PDF kütüphanesi yüklenemedi. Kart PNG olarak indirilecek.");
    await downloadCardImage();
    return;
  }

  const pdf = new jsPDFClass("p", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 24;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);
  const finalWidth = (canvas.width * finalHeight) / canvas.height;

  const x = (pageWidth - finalWidth) / 2;
  const y = margin;

  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save("kirmizi-cizgini-cek-test-sonucu.pdf");
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

  updateShareCard();

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

function bindEvents() {
  document.querySelectorAll(".options button").forEach((button) => {
    button.addEventListener("click", () => {
      answerQuestion(button.dataset.answer, button);
    });
  });

  $("#nextBtn").addEventListener("click", nextQuestion);
  $("#restartBtn").addEventListener("click", restartTest);

  $("#downloadCardBtn").addEventListener("click", downloadCardImage);
  $("#shareCardBtn").addEventListener("click", shareCardImage);
  $("#downloadResultPdfBtn").addEventListener("click", downloadResultPdf);
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  bindEvents();
  renderQuestion();
});
