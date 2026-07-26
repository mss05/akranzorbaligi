const DATA = window.KIRMIZI_CIZGI_DATA;
const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function renderStats() {
  const target = $("#statsGrid");
  if (!target || !DATA?.stats) return;

  target.innerHTML = DATA.stats.map((item) => `
    <article class="stat-card">
      <strong>${escapeHtml(item.value)}</strong>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function renderSupports() {
  const target = $("#supportGrid");
  if (!target || !DATA?.supports) return;

  target.innerHTML = DATA.supports.map((group) => `
    <article class="support-card">
      <h3>${escapeHtml(group.title)}</h3>
      <p>${escapeHtml(group.intro)}</p>
      <ul>
        ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function renderGuide() {
  const target = $("#guideGrid");
  if (!target || !DATA?.guideSections) return;

  target.innerHTML = DATA.guideSections.map((item) => `
    <article class="info-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function renderBulletinCards() {
  const target = $("#bulletinCards");
  if (!target || !DATA?.bulletins) return;

  target.innerHTML = DATA.bulletins.map((item) => `
    <article class="bulletin-card">
      <small>${escapeHtml(item.date)}</small>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.excerpt)}</p>
      <a class="btn secondary" href="#${escapeHtml(item.id)}">Oku</a>
    </article>
  `).join("");
}

function renderBulletinDetails() {
  const target = $("#bulletinDetails");
  if (!target || !DATA?.bulletins) return;

  target.innerHTML = DATA.bulletins.map((item) => `
    <article class="bulletin-detail" id="${escapeHtml(item.id)}">
      <small>${escapeHtml(item.date)}</small>
      <h3>${escapeHtml(item.title)}</h3>
      <p><strong>${escapeHtml(item.excerpt)}</strong></p>
      ${item.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <button class="btn primary" type="button" data-copy-bulletin="${escapeHtml(item.id)}">Metni Kopyala</button>
      <button class="btn secondary" type="button" data-download-bulletin="${escapeHtml(item.id)}">Bülteni İndir</button>
    </article>
  `).join("");
}

function getBulletinText(id) {
  const bulletin = DATA.bulletins.find((item) => item.id === id);
  if (!bulletin) return "";

  return [
    bulletin.date,
    bulletin.title,
    "",
    bulletin.excerpt,
    "",
    ...bulletin.body
  ].join("\n\n");
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

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    return success;
  }
}

/* GUIDE PDF */

function renderGuidePdfTemplate() {
  const target = $("#guidePdfContent");
  if (!target || !DATA?.guideSections) return;

  target.innerHTML = DATA.guideSections.map((item, index) => `
    <article class="guide-pdf-item">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </article>
  `).join("");
}

async function downloadGuidePdf() {
  renderGuidePdfTemplate();

  const template = $("#guidePdfTemplate");

  if (!template) {
    alert("PDF şablonu bulunamadı.");
    return;
  }

  if (typeof html2canvas === "undefined") {
    alert("PDF oluşturma kütüphanesi yüklenemedi.");
    return;
  }

  const jsPDFClass = window.jspdf && window.jspdf.jsPDF;

  if (!jsPDFClass) {
    alert("PDF kütüphanesi yüklenemedi.");
    return;
  }

  const canvas = await html2canvas(template, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffaf4"
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDFClass("p", "pt", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 18;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);
  const finalWidth = (canvas.width * finalHeight) / canvas.height;

  const x = (pageWidth - finalWidth) / 2;
  const y = margin;

  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save("kirmizi-cizgini-cek-akran-zorbaligi-kilavuzu.pdf");
}

/* CIMER */

function updateCimerText() {
  const textarea = $("#cimerText");
  if (!textarea || !DATA?.cimerText) return;

  const name = $("#pledgeName")?.value.trim();
  const signatureLine = name ? `\n\nBaşvuru sahibi: ${name}` : "";

  textarea.value = `${DATA.cimerText}${signatureLine}`;
}

function updateCounter(increment = false) {
  const key = "kirmiziCizgiCounter";
  let value = parseInt(localStorage.getItem(key), 10);

  if (Number.isNaN(value)) {
    value = 4521;
  }

  if (increment) {
    value += 1;
    localStorage.setItem(key, String(value));
  }

  const target = $("#signatureCount");
  if (target) {
    target.textContent = value.toLocaleString("tr-TR");
  }
}

function checklistReady() {
  const read = $("#checkRead")?.checked;
  const own = $("#checkOwn")?.checked;
  const edit = $("#checkEdit")?.checked;

  return Boolean(read && own && edit);
}

async function handleCopyCimer(goAfter = false) {
  const status = $("#cimerStatus");

  if (!checklistReady()) {
    if (status) {
      status.textContent = "Önce üç onay kutusunu işaretlemen gerekiyor.";
    }
    return;
  }

  updateCimerText();

  const ok = await copyText($("#cimerText").value);

  if (ok) {
    updateCounter(true);

    if (status) {
      status.textContent = "Metin kopyalandı. Sayaç arttı.";
    }

    if (goAfter) {
      setTimeout(() => {
        window.open(DATA.cimerUrl, "_blank", "noopener,noreferrer");
      }, 400);
    }
  } else if (status) {
    status.textContent = "Metin kopyalanamadı. Elle seçip kopyalayabilirsin.";
  }
}

/* EVENTS */

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const copyBulletinBtn = event.target.closest("[data-copy-bulletin]");
    const downloadBulletinBtn = event.target.closest("[data-download-bulletin]");

    if (copyBulletinBtn) {
      const ok = await copyText(getBulletinText(copyBulletinBtn.dataset.copyBulletin));
      copyBulletinBtn.textContent = ok ? "Kopyalandı" : "Hata";

      setTimeout(() => {
        copyBulletinBtn.textContent = "Metni Kopyala";
      }, 1400);
    }

    if (downloadBulletinBtn) {
      const id = downloadBulletinBtn.dataset.downloadBulletin;
      downloadFile(`${id}.txt`, getBulletinText(id));
    }
  });

  $("#downloadGuideBtn")?.addEventListener("click", downloadGuidePdf);

  $("#pledgeName")?.addEventListener("input", updateCimerText);

  $("#copyCimerBtn")?.addEventListener("click", () => {
    handleCopyCimer(false);
  });

  $("#copyAndGoCimerBtn")?.addEventListener("click", () => {
    handleCopyCimer(true);
  });

  $("#openCimerBtn")?.addEventListener("click", () => {
    window.open(DATA.cimerUrl, "_blank", "noopener,noreferrer");
  });
}

function init() {
  setYear();
  renderStats();
  renderSupports();
  renderGuide();
  renderGuidePdfTemplate();
  renderBulletinCards();
  renderBulletinDetails();
  updateCimerText();
  updateCounter(false);
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
