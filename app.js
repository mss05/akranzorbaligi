const data = window.KIRMIZI_CIZGI_DATA;
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

function guideToText() {
  return [
    data.guide.title,
    "",
    ...data.guide.sections.flatMap((section) => [
      section.title,
      section.body,
      "",
      ...section.items.map((item) => `- ${item}`),
      ""
    ])
  ].join("\n");
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
    .tagline {
      font-weight: 800;
      color: #b20d16;
    }
  </style>
</head>
<body>
  <p class="tagline">Kırmızı Çizgini Çek · Gülme, geçme. Bence burada duralım.</p>
  <h1>${escapeHtml(data.guide.title)}</h1>
  ${sections}
</body>
</html>`;
}

function bulletinToText(bulletin) {
  return [
    bulletin.kicker,
    bulletin.title,
    bulletin.date,
    "",
    bulletin.excerpt,
    "",
    ...bulletin.body,
    "",
    `Alıntı: ${bulletin.quote}`
  ].join("\n\n");
}

function renderExcuses() {
  const target = $("#excuseGrid");
  if (!target) return;

  target.innerHTML = data.excuses.map((item, index) => `
    <article class="detector-card" data-excuse-card>
      <button type="button" data-toggle-excuse="${index}">“${escapeHtml(item.title)}”</button>
      <p class="detector-answer">${escapeHtml(item.answer)}</p>
    </article>
  `).join("");
}

function renderGuidePreview() {
  const target = $("#guidePreview");
  if (!target) return;

  target.innerHTML = data.guide.sections.slice(0, 6).map((section, index) => `
    <article class="guide-card">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(section.title.replace(/^\d+\.\s*/, ""))}</h3>
      <p>${escapeHtml(section.body)}</p>
    </article>
  `).join("");
}

function renderBulletins() {
  const target = $("#bulletinGrid");
  if (!target) return;

  target.innerHTML = data.bulletins.map((bulletin) => `
    <article class="bulletin-card">
      <span>${escapeHtml(bulletin.date)} · ${escapeHtml(bulletin.kicker)}</span>
      <h3>${escapeHtml(bulletin.title)}</h3>
      <p>${escapeHtml(bulletin.excerpt)}</p>

      <div class="card-actions">
        <button class="btn primary" type="button" data-read-bulletin="${bulletin.id}">Oku</button>
        <button class="btn secondary" type="button" data-copy-bulletin="${bulletin.id}">Kopyala</button>
        <button class="btn ghost" type="button" data-download-bulletin="${bulletin.id}">İndir</button>
      </div>
    </article>
  `).join("");
}

function renderShareTexts() {
  const target = $("#shareGrid");
  if (!target) return;

  target.innerHTML = data.shareTexts.map((item, index) => `
    <article class="share-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      <div class="card-actions">
        <button class="btn secondary" type="button" data-copy-share="${index}">Metni Kopyala</button>
      </div>
    </article>
  `).join("");
}

function openModal({ kicker = "Kırmızı Çizgini Çek", title, bodyHtml, copyTextValue, downloadFileName, downloadContent }) {
  const modal = $("#contentModal");

  $("#modalKicker").textContent = kicker;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHtml;

  const copyBtn = $("#modalCopyBtn");
  const downloadBtn = $("#modalDownloadBtn");

  copyBtn.onclick = async () => {
    const success = await copyText(copyTextValue);
    copyBtn.textContent = success ? "Kopyalandı" : "Kopyalanamadı";

    setTimeout(() => {
      copyBtn.textContent = "Metni Kopyala";
    }, 1600);
  };

  downloadBtn.onclick = () => {
    downloadFile(downloadFileName, downloadContent);
  };

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = $("#contentModal");
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function openGuideModal() {
  const bodyHtml = data.guide.sections.map((section) => `
    <h3>${escapeHtml(section.title)}</h3>
    <p>${escapeHtml(section.body)}</p>
    <ul>
      ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `).join("");

  openModal({
    kicker: "Kılavuz",
    title: data.guide.title,
    bodyHtml,
    copyTextValue: guideToText(),
    downloadFileName: data.guide.filename,
    downloadContent: guideToHtmlDocument()
  });
}

function openBulletinModal(id) {
  const bulletin = data.bulletins.find((item) => item.id === id);
  if (!bulletin) return;

  const bodyHtml = `
    <p><strong>${escapeHtml(bulletin.date)}</strong></p>
    <p>${escapeHtml(bulletin.excerpt)}</p>
    ${bulletin.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    <blockquote>${escapeHtml(bulletin.quote)}</blockquote>
  `;

  openModal({
    kicker: bulletin.kicker,
    title: bulletin.title,
    bodyHtml,
    copyTextValue: bulletinToText(bulletin),
    downloadFileName: `${bulletin.id}.txt`,
    downloadContent: bulletinToText(bulletin)
  });
}

function updateCimerText() {
  const textarea = $("#cimerText");
  if (!textarea) return;

  const name = $("#pledgeName")?.value.trim();
  const signatureLine = name ? `\n\nBaşvuru sahibi: ${name}` : "";

  textarea.value = `${data.cimerText}${signatureLine}`;
}

function updateSignatureCount(increment = false) {
  const key = "kirmiziCizgiSignatureCount";
  let count = parseInt(localStorage.getItem(key), 10);

  if (Number.isNaN(count)) {
    count = 4521;
  }

  if (increment) {
    count += 1;
    localStorage.setItem(key, String(count));
  }

  const target = $("#signatureCount");
  if (target) {
    target.textContent = count.toLocaleString("tr-TR");
  }
}

function checklistReady() {
  const read = $("#checkRead")?.checked;
  const own = $("#checkOwn")?.checked;
  const edit = $("#checkEdit")?.checked;

  return Boolean(read && own && edit);
}

async function copyCimerText({ goAfterCopy = false } = {}) {
  updateCimerText();

  if (!checklistReady()) {
    $("#cimerStatus").textContent =
      "Önce üç kutucuğu işaretle. Sonra metni kopyalayıp CİMER’e geçebilirsin.";
    return;
  }

  const success = await copyText($("#cimerText").value);

  if (success) {
    updateSignatureCount(true);
    $("#cimerStatus").textContent =
      "Metin kopyalandı. Sayaç arttı. Şimdi CİMER’e gidip başvuru alanına yapıştırabilirsin.";

    if (goAfterCopy) {
      setTimeout(() => {
        window.open(data.cimerUrl, "_blank", "noopener,noreferrer");
      }, 550);
    }
  } else {
    $("#cimerStatus").textContent =
      "Metin kopyalanamadı. Manuel olarak seçip kopyalayabilirsin.";
  }
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const excuseBtn = event.target.closest("[data-toggle-excuse]");
    const readBulletinBtn = event.target.closest("[data-read-bulletin]");
    const copyBulletinBtn = event.target.closest("[data-copy-bulletin]");
    const downloadBulletinBtn = event.target.closest("[data-download-bulletin]");
    const copyShareBtn = event.target.closest("[data-copy-share]");
    const closeModalBtn = event.target.closest("[data-close-modal]");

    if (excuseBtn) {
      const card = excuseBtn.closest("[data-excuse-card]");
      card.classList.toggle("open");
    }

    if (readBulletinBtn) {
      openBulletinModal(readBulletinBtn.dataset.readBulletin);
    }

    if (copyBulletinBtn) {
      const bulletin = data.bulletins.find((item) => item.id === copyBulletinBtn.dataset.copyBulletin);
      if (!bulletin) return;

      const success = await copyText(bulletinToText(bulletin));
      copyBulletinBtn.textContent = success ? "Kopyalandı" : "Hata";

      setTimeout(() => {
        copyBulletinBtn.textContent = "Kopyala";
      }, 1500);
    }

    if (downloadBulletinBtn) {
      const bulletin = data.bulletins.find((item) => item.id === downloadBulletinBtn.dataset.downloadBulletin);
      if (!bulletin) return;

      downloadFile(`${bulletin.id}.txt`, bulletinToText(bulletin));
    }

    if (copyShareBtn) {
      const item = data.shareTexts[Number(copyShareBtn.dataset.copyShare)];
      if (!item) return;

      const success = await copyText(item.text);
      copyShareBtn.textContent = success ? "Kopyalandı" : "Hata";

      setTimeout(() => {
        copyShareBtn.textContent = "Metni Kopyala";
      }, 1500);
    }

    if (closeModalBtn) {
      closeModal();
    }
  });

  $("#guideReadTop")?.addEventListener("click", openGuideModal);
  $("#guideReadBottom")?.addEventListener("click", openGuideModal);

  $("#guideDownloadTop")?.addEventListener("click", () => {
    downloadFile(data.guide.filename, guideToHtmlDocument(), "text/html;charset=utf-8");
  });

  $("#guideDownloadBottom")?.addEventListener("click", () => {
    downloadFile(data.guide.filename, guideToHtmlDocument(), "text/html;charset=utf-8");
  });

  $("#pledgeName")?.addEventListener("input", updateCimerText);

  $("#copyCimerBtn")?.addEventListener("click", () => {
    copyCimerText({ goAfterCopy: false });
  });

  $("#copyAndGoCimerBtn")?.addEventListener("click", () => {
    copyCimerText({ goAfterCopy: true });
  });

  $("#openCimerBtn")?.addEventListener("click", () => {
    window.open(data.cimerUrl, "_blank", "noopener,noreferrer");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function initHomePage() {
  $("#currentYear").textContent = new Date().getFullYear();

  renderExcuses();
  renderGuidePreview();
  renderBulletins();
  renderShareTexts();
  updateCimerText();
  updateSignatureCount(false);
  bindEvents();
}

initHomePage();
