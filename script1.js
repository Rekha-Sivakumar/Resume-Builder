document.addEventListener("DOMContentLoaded", () => {

  /* ---------- element refs ---------- */
  const addEducationBtn = document.getElementById("add-education-btn");
  const educationContainer = document.getElementById("education-container");

  const addExperienceBtn = document.getElementById("add-experience-btn");
  const experienceContainer = document.getElementById("experience-container");

  const addInternshipBtn = document.getElementById("add-internship-btn");
  const internshipContainer = document.getElementById("internship-container");

  const addProjectBtn = document.getElementById("add-project-btn");
  const projectContainer = document.getElementById("project-container");

  const addCertificationBtn = document.getElementById("add-certification-btn");
  const certificationContainer = document.getElementById("certification-container");

  const languageContainer = document.getElementById("language-container");
  const hobbyContainer = document.getElementById("hobbies-container");

  const addDetailBtn = document.getElementById("add-detail-btn");
  const detailsContainer = document.getElementById("details-container");

  const addMediaBtn = document.getElementById("add-media-btn");
  const mediaContainer = document.getElementById("media-container");

  const photoInput = document.getElementById("photo");
  const photoPreviewWrap = document.getElementById("photo-preview-wrap");
  const photoPreviewImg = document.getElementById("photo-preview");
  const photoRemoveBtn = document.getElementById("photo-remove-btn");
  const qrLinkInput = document.getElementById("qrlink");

  const resumeForm = document.getElementById("resume-form");

  const stepChooseTemplate = document.getElementById("step-choose-template");
  const stepForm = document.getElementById("step-form");
  const stepPreview = document.getElementById("step-preview");
  const progressSteps = document.querySelectorAll("#progress-steps .step");

  const galleryLg = document.getElementById("template-gallery-select");
  const galleryMini = document.getElementById("template-gallery-mini");
  const selectedTemplateNameEl = document.getElementById("selected-template-name");
  const backToTemplatesBtn = document.getElementById("back-to-templates");

  const resumePreview = document.getElementById("resume-preview");
  const backToFormBtn = document.getElementById("back-to-form");

  const downloadDropdown = document.getElementById("download-dropdown");
  const downloadToggleBtn = document.getElementById("download-toggle-btn");
  const downloadMenu = document.getElementById("download-menu");
  const downloadOptions = document.querySelectorAll(".download-option");

  /* ---------- template catalog ---------- */

  const TEMPLATES = [
    { id: "ledger", name: "Ledger", desc: "Centered monochrome header, quiet rules, block by block" },
    { id: "clarity", name: "Clarity", desc: "Bold left header, links under your name, no clutter" },
    { id: "heritage", name: "Heritage", desc: "Formal serif, centered, classic and understated" },
    { id: "scholar", name: "Scholar", desc: "Serif with a deep maroon accent, straightforward flow" },
    { id: "vector", name: "Vector", desc: "Strong blue rule header, skills right up front" },
    { id: "precision", name: "Precision", desc: "Centered, compact, built to be scanned fast" },
    { id: "ascent", name: "Ascent", desc: "Bold blue headers, link row under your name, ATS-first" },
    { id: "modern", name: "Modern", desc: "Teal sidebar, clean and confident" },
    { id: "classic", name: "Classic", desc: "Centered serif, traditional" },
    { id: "minimal", name: "Minimal", desc: "Quiet type, maximum whitespace" },
    { id: "bold", name: "Bold", desc: "Dark banner, strong statement" },
    { id: "elegant", name: "Elegant", desc: "Gold hairlines, sidebar on the right" },
    { id: "compact", name: "Compact", desc: "Dense two-column, fits more in less space" },
    { id: "executive", name: "Executive", desc: "Navy banner, formal double rules" },
    { id: "contrast", name: "Contrast", desc: "Plum sidebar on the right" },
    { id: "portrait", name: "Portrait", desc: "Centered round photo, warm serif" },
    { id: "studio", name: "Studio", desc: "Square photo, ink sidebar, editorial" },
    { id: "corporate", name: "Corporate", desc: "Navy banner, photo badge, QR footer" }
  ];

  // The 7 newest templates share one rule set: everything stacks block by
  // block (no side-by-side columns), the profile photo and QR code (if any)
  // sit together up in the header next to the name, and every link — email,
  // phone, socials — prints as one row directly under the name, the way a
  // plain single-column ATS resume reads. Older templates keep their
  // original sidebar layout untouched.
  const SIMPLE_LAYOUT_TEMPLATES = new Set(["ledger", "clarity", "heritage", "scholar", "vector", "precision", "ascent"]);

  // Most templates read better with education as plain text blocks (degree
  // bold, dates flush right, institution and score underneath) rather than
  // a table. A small handful of the denser/more formal templates keep the
  // table because it actually suits their look.
  const TABLE_EDU_TEMPLATES = new Set(["executive", "corporate", "compact", "contrast"]);

  let selectedTemplate = "modern";
  let currentData = null;
  let photoDataUrl = "";

  function thumbMarkup() {
    return `<span></span><span></span><span></span>`;
  }

  function renderGallery(container, { large }) {
    container.innerHTML = TEMPLATES.map(t => `
      <button type="button" class="template-card ${large ? "template-card--lg" : ""} ${t.id === selectedTemplate ? "is-selected" : ""}" data-template="${t.id}">
        <span class="tpl-thumb tpl-thumb-${t.id}">${thumbMarkup()}</span>
        <span class="tpl-name">${t.name}</span>
        <span class="tpl-desc">${t.desc}</span>
        ${large ? `<span class="tpl-use">Use this template →</span>` : ""}
      </button>
    `).join("");

    container.querySelectorAll(".template-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedTemplate = card.dataset.template;

        [galleryLg, galleryMini].forEach(g => {
          if (!g) return;
          g.querySelectorAll(".template-card").forEach(c => {
            c.classList.toggle("is-selected", c.dataset.template === selectedTemplate);
          });
        });

        if (selectedTemplateNameEl) {
          const t = TEMPLATES.find(x => x.id === selectedTemplate);
          selectedTemplateNameEl.textContent = t ? t.name : selectedTemplate;
        }

        if (large) {
          goToStep(2);
        } else if (currentData) {
          renderResume(currentData, selectedTemplate);
        }
      });
    });
  }

  renderGallery(galleryLg, { large: true });
  renderGallery(galleryMini, { large: false });

  /* ---------- photo upload ---------- */

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please choose an image file (JPG or PNG).");
        photoInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        photoDataUrl = reader.result;
        photoPreviewImg.src = photoDataUrl;
        photoPreviewWrap.hidden = false;
      };
      reader.readAsDataURL(file);
    });
  }

  if (photoRemoveBtn) {
    photoRemoveBtn.addEventListener("click", () => {
      photoDataUrl = "";
      photoInput.value = "";
      photoPreviewImg.src = "";
      photoPreviewWrap.hidden = true;
    });
  }

  resumeForm.addEventListener("reset", () => {
    photoDataUrl = "";
    if (photoPreviewImg) photoPreviewImg.src = "";
    if (photoPreviewWrap) photoPreviewWrap.hidden = true;
  });

  /* ---------- QR code generation (client-side, from a link the user provides) ---------- */

  // Renders the link into an off-screen QRCode.js instance, then reads the
  // result back out as a PNG data URL so it can be dropped straight into the
  // resume markup (and survives html2pdf's canvas-based export).
  function generateQRDataUrl(link) {
    return new Promise(resolve => {
      if (!link || typeof QRCode === "undefined") {
        resolve("");
        return;
      }

      const holder = document.createElement("div");
      holder.style.position = "fixed";
      holder.style.left = "-9999px";
      holder.style.top = "0";
      document.body.appendChild(holder);

      try {
        new QRCode(holder, {
          text: link,
          width: 200,
          height: 200,
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.error("QR code generation failed:", err);
        document.body.removeChild(holder);
        resolve("");
        return;
      }

      // QRCode.js draws into the holder synchronously in modern browsers,
      // but a short delay makes this robust either way.
      setTimeout(() => {
        const canvas = holder.querySelector("canvas");
        const img = holder.querySelector("img");
        let dataUrl = "";
        if (canvas) dataUrl = canvas.toDataURL("image/png");
        else if (img && img.src) dataUrl = img.src;
        document.body.removeChild(holder);
        resolve(dataUrl);
      }, 30);
    });
  }

  /* ---------- add-entry buttons ---------- */

  addEducationBtn.addEventListener("click", () => {
    educationContainer.appendChild(createEducationEntry());
  });

  addExperienceBtn.addEventListener("click", () => {
    experienceContainer.appendChild(createExperienceEntry());
  });

  addInternshipBtn.addEventListener("click", () => {
    internshipContainer.appendChild(createInternshipEntry());
  });

  addCertificationBtn.addEventListener("click", () => {
    certificationContainer.appendChild(createCertificationEntry());
  });

  addProjectBtn.addEventListener("click", () => {
    projectContainer.appendChild(createProjectEntry());
  });

  if (addDetailBtn) {
    addDetailBtn.addEventListener("click", () => {
      detailsContainer.appendChild(createDetailEntry());
    });
  }

  if (addMediaBtn) {
    addMediaBtn.addEventListener("click", () => {
      mediaContainer.appendChild(createMediaEntry());
    });
  }

  function entryLabel(container, selector) {
    return container.querySelectorAll(selector).length + 1;
  }

  function attachRemove(div) {
    const btn = div.querySelector(".remove-btn");
    if (btn) btn.addEventListener("click", () => div.remove());
  }

  function createEducationEntry() {
    const div = document.createElement("div");
    div.className = "education-entry entry-card";
    const n = entryLabel(educationContainer, ".education-entry");
    div.innerHTML = `
      <p class="entry-label">Entry ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Qualification</label><input type="text" placeholder="e.g. B.Tech – CSE / SSC / Diploma" required></div>
        <div class="field"><label>School / College name</label><input type="text" placeholder="Institution name" required></div>
        <div class="field"><label>Year</label><input type="text" placeholder="Year of passing" required></div>
        <div class="field"><label>Percentage / GPA</label><input type="text" placeholder="e.g. 8.7 CGPA" required></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createExperienceEntry() {
    const div = document.createElement("div");
    div.className = "experience-entry entry-card";
    const n = entryLabel(experienceContainer, ".experience-entry");
    div.innerHTML = `
      <p class="entry-label">Entry ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Job role</label><input type="text" placeholder="Software Developer"></div>
        <div class="field"><label>Company name</label><input type="text" placeholder="e.g. Google"></div>
        <div class="field"><label>Duration</label><input type="text" placeholder="2021 – 2023"></div>
        <div class="field field-wide"><label>About</label><input type="text" placeholder="Work, challenges, experience"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createInternshipEntry() {
    const div = document.createElement("div");
    div.className = "internship-entry entry-card";
    const n = entryLabel(internshipContainer, ".internship-entry");
    div.innerHTML = `
      <p class="entry-label">Entry ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Domain</label><input type="text" placeholder="AI/ML, Full Stack, Web Development"></div>
        <div class="field"><label>Company name</label><input type="text" placeholder="e.g. Google"></div>
        <div class="field"><label>Duration</label><input type="text" placeholder="Jan 2023 – Jul 2023"></div>
        <div class="field field-wide"><label>About</label><input type="text" placeholder="More details about the internship"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createProjectEntry() {
    const div = document.createElement("div");
    div.className = "project-entry entry-card";
    const n = entryLabel(projectContainer, ".project-entry");
    div.innerHTML = `
      <p class="entry-label">Entry ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Project title</label><input type="text" placeholder="e.g. Tic Tac Toe"></div>
        <div class="field"><label>Demo link (optional)</label><input type="url" placeholder="https://your-project-demo.com"></div>
        <div class="field field-wide"><label>About</label><input type="text" placeholder="More details about the project"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createDetailEntry() {
    const div = document.createElement("div");
    div.className = "detail-entry entry-card";
    const n = entryLabel(detailsContainer, ".detail-entry");
    div.innerHTML = `
      <p class="entry-label">Detail ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Label</label><input type="text" placeholder="e.g. Nationality"></div>
        <div class="field field-wide"><label>Value</label><input type="text" placeholder="Value"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createMediaEntry() {
    const div = document.createElement("div");
    div.className = "media-entry entry-card";
    const n = entryLabel(mediaContainer, ".media-entry");
    div.innerHTML = `
      <p class="entry-label">Link ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Platform / label</label><input type="text" placeholder="e.g. GitHub"></div>
        <div class="field field-wide"><label>URL</label><input type="text" placeholder="github.com/you"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  function createCertificationEntry() {
    const div = document.createElement("div");
    div.className = "certification-entry entry-card";
    const n = entryLabel(certificationContainer, ".certification-entry");
    div.innerHTML = `
      <p class="entry-label">Entry ${String(n).padStart(2, "0")}</p>
      <div class="field-grid">
        <div class="field"><label>Title</label><input type="text" placeholder="Certified in ___"></div>
        <div class="field"><label>Company name</label><input type="text" placeholder="Certified by"></div>
        <div class="field"><label>Date</label><input type="text" placeholder="dd-mm-yyyy"></div>
        <div class="field field-wide"><label>About</label><input type="text" placeholder="Your experience with it"></div>
      </div>
      <button type="button" class="remove-btn">Remove</button>
    `;
    attachRemove(div);
    return div;
  }

  /* ---------- collect form data into a plain object ---------- */

  function collectResumeData() {
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      objective: document.getElementById("objective").value.trim(),
      tech: document.getElementById("tech").value.trim(),
      nontech: document.getElementById("nontech").value.trim(),
      education: [],
      internships: [],
      projects: [],
      experience: [],
      certifications: [],
      languages: "",
      hobbies: "",
      additionalDetails: [],
      socialLinks: [],
      photo: photoDataUrl,
      qrLink: qrLinkInput ? qrLinkInput.value.trim() : "",
      qrDataUrl: ""
    };

    educationContainer.querySelectorAll(".education-entry").forEach(entry => {
      const [qual, inst, year, pct] = entry.querySelectorAll("input");
      if (qual.value && inst.value && year.value && pct.value) {
        data.education.push({ qualification: qual.value, institution: inst.value, year: year.value, percentage: pct.value });
      }
    });

    internshipContainer.querySelectorAll(".internship-entry").forEach(entry => {
      const [domain, company, duration, about] = entry.querySelectorAll("input");
      if (domain.value && company.value && duration.value && about.value) {
        data.internships.push({ domain: domain.value, company: company.value, duration: duration.value, about: about.value });
      }
    });

    projectContainer.querySelectorAll(".project-entry").forEach(entry => {
      const [title, demoLink, about] = entry.querySelectorAll("input");
      if (title.value && about.value) {
        data.projects.push({ title: title.value, about: about.value, demoLink: (demoLink ? demoLink.value.trim() : "") });
      }
    });

    experienceContainer.querySelectorAll(".experience-entry").forEach(entry => {
      const [role, company, duration, about] = entry.querySelectorAll("input");
      if (role.value && company.value && duration.value && about.value) {
        data.experience.push({ role: role.value, company: company.value, duration: duration.value, about: about.value });
      }
    });

    certificationContainer.querySelectorAll(".certification-entry").forEach(entry => {
      const [title, company, date, about] = entry.querySelectorAll("input");
      if (title.value && company.value && date.value && about.value) {
        data.certifications.push({ title: title.value, company: company.value, date: date.value, about: about.value });
      }
    });

    const langInput = languageContainer.querySelector("input");
    if (langInput) data.languages = langInput.value.trim();

    const hobbyInput = hobbyContainer.querySelector("input");
    if (hobbyInput) data.hobbies = hobbyInput.value.trim();

    if (detailsContainer) {
      detailsContainer.querySelectorAll(".detail-entry").forEach(entry => {
        const [label, value] = entry.querySelectorAll("input");
        if (label.value.trim() && value.value.trim()) {
          data.additionalDetails.push({ label: label.value.trim(), value: value.value.trim() });
        }
      });
    }

    if (mediaContainer) {
      mediaContainer.querySelectorAll(".media-entry").forEach(entry => {
        const [label, url] = entry.querySelectorAll("input");
        if (label.value.trim() && url.value.trim()) {
          data.socialLinks.push({ label: label.value.trim(), url: url.value.trim() });
        }
      });
    }

    return data;
  }

  function escapeHTML(str) {
    return (str || "").replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  // For use inside an href="..." attribute — escapeHTML already covers the
  // characters that matter there (quotes, angle brackets, ampersands).
  const escapeAttr = escapeHTML;

  // Adds a protocol if the user typed a bare domain (e.g. "linkedin.com/in/x"),
  // so the link actually opens instead of being treated as a relative path.
  function normalizeUrl(url) {
    if (!url) return "";
    const trimmed = url.trim();
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  }

  // Strips the protocol and leading "www." so links display short and on
  // one line — the full, working URL still lives in the href.
  function shortenUrlDisplay(url) {
    return (url || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  }

  // html2canvas (used for PDF export) does its own text line-breaking pass
  // and only breaks at whitespace — it doesn't honor CSS overflow-wrap for
  // mid-word breaks the way real browser layout does. So for any very long
  // run of non-space characters (pasted junk, a long URL, no spaces typed)
  // we insert real zero-width-space break points every ~12 characters. This
  // keeps text wrapping correctly both on screen and in the exported PDF.
  function softBreakLongRuns(str) {
    return (str || "").replace(/\S{16,}/g, run => run.replace(/(.{12})(?=.)/g, "$1\u200B"));
  }

  function fmt(str) {
    return escapeHTML(softBreakLongRuns(str));
  }

  /* ---------- render the resume document (shared across templates) ---------- */

  function renderResume(data, template) {
    const e = fmt;
    const isSimpleLayout = SIMPLE_LAYOUT_TEMPLATES.has(template);
    const usesEduTable = TABLE_EDU_TEMPLATES.has(template);

    let sidebarHTML = "";

    if (data.additionalDetails.length) {
      sidebarHTML += `<div class="r-block"><h3>Details</h3>
        ${data.additionalDetails.map(d => `<p><strong>${e(d.label)}:</strong> ${e(d.value)}</p>`).join("")}
      </div>`;
    }

    if (data.tech || data.nontech) {
      sidebarHTML += `<div class="r-block">
        <h3>Skills</h3>
        ${data.tech ? `<p><strong>Technical:</strong> ${e(data.tech)}</p>` : ""}
        ${data.nontech ? `<p><strong>Non-technical:</strong> ${e(data.nontech)}</p>` : ""}
      </div>`;
    }

    if (data.languages) {
      sidebarHTML += `<div class="r-block"><h3>Languages</h3><p>${e(data.languages)}</p></div>`;
    }

    if (data.hobbies) {
      sidebarHTML += `<div class="r-block"><h3>Hobbies</h3><p>${e(data.hobbies)}</p></div>`;
    }

    // On simple-layout templates, links move up into the header (below the
    // name) instead of getting their own block down here.
    if (data.socialLinks.length && !isSimpleLayout) {
      sidebarHTML += `<div class="r-block"><h3>Links</h3>
        ${data.socialLinks.map(link => {
          const href = normalizeUrl(link.url);
          const shortText = shortenUrlDisplay(link.url);
          return `<div class="r-link-item">
            <p class="r-link-label">${e(link.label)}</p>
            <a class="r-link-url" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${e(shortText)}</a>
          </div>`;
        }).join("")}
      </div>`;
    }

    // Likewise, the QR code moves up next to the photo in the header on
    // simple-layout templates instead of sitting in its own sidebar block.
    if (data.qrDataUrl && !isSimpleLayout) {
      const qrHref = normalizeUrl(data.qrLink);
      sidebarHTML += `<div class="r-block r-qr-block">
        <h3>Scan Me</h3>
        <a class="r-qr" href="${escapeAttr(qrHref)}" target="_blank" rel="noopener noreferrer">
          <img class="r-qr-img" src="${data.qrDataUrl}" alt="QR code — tap to open link">
        </a>
      </div>`;
    }

    let mainHTML = "";

    if (data.objective) {
      mainHTML += `<div class="r-block"><h3>Summary</h3><p>${e(data.objective)}</p></div>`;
    }

    if (data.experience.length) {
      mainHTML += `<div class="r-block"><h3>Experience</h3>`;
      data.experience.forEach(x => {
        mainHTML += `<div class="r-item">
          <p class="r-item-title">${e(x.role)} — ${e(x.company)}</p>
          <p class="r-item-sub">${e(x.duration)}</p>
          <p class="r-item-desc">${e(x.about)}</p>
        </div>`;
      });
      mainHTML += `</div>`;
    }

    if (data.internships.length) {
      mainHTML += `<div class="r-block"><h3>Internships</h3>`;
      data.internships.forEach(x => {
        mainHTML += `<div class="r-item">
          <p class="r-item-title">${e(x.domain)} — ${e(x.company)}</p>
          <p class="r-item-sub">${e(x.duration)}</p>
          <p class="r-item-desc">${e(x.about)}</p>
        </div>`;
      });
      mainHTML += `</div>`;
    }

    if (data.projects.length) {
      mainHTML += `<div class="r-block"><h3>Projects</h3>`;
      data.projects.forEach(x => {
        const demoHTML = x.demoLink
          ? ` — <a class="r-demo-link" href="${escapeAttr(normalizeUrl(x.demoLink))}" target="_blank" rel="noopener noreferrer">View demo ↗</a>`
          : "";
        mainHTML += `<div class="r-item">
          <p class="r-item-title">${e(x.title)}${demoHTML}</p>
          <p class="r-item-desc">${e(x.about)}</p>
        </div>`;
      });
      mainHTML += `</div>`;
    }

    if (data.education.length) {
      if (usesEduTable) {
        mainHTML += `<div class="r-block"><h3>Education</h3>
          <table class="r-edu-table">
            <thead><tr><th>Year</th><th>Qualification</th><th>Institution</th><th>Score</th></tr></thead>
            <tbody>
              ${data.education.map(x => `<tr><td>${e(x.year)}</td><td>${e(x.qualification)}</td><td>${e(x.institution)}</td><td>${e(x.percentage)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>`;
      } else {
        mainHTML += `<div class="r-block"><h3>Education</h3>
          <div class="r-edu-list">
            ${data.education.map(x => `
              <div class="r-edu-entry">
                <div class="r-edu-row">
                  <span class="r-edu-degree">${e(x.qualification)}</span>
                  <span class="r-edu-year">${e(x.year)}</span>
                </div>
                <p class="r-edu-inst">${e(x.institution)}</p>
                ${x.percentage ? `<p class="r-edu-score">${e(x.percentage)}</p>` : ""}
              </div>
            `).join("")}
          </div>
        </div>`;
      }
    }

    if (data.certifications.length) {
      mainHTML += `<div class="r-block"><h3>Certifications</h3>`;
      data.certifications.forEach(x => {
        mainHTML += `<div class="r-item">
          <p class="r-item-title">${e(x.title)} — ${e(x.company)}</p>
          <p class="r-item-sub">${e(x.date)}</p>
          <p class="r-item-desc">${e(x.about)}</p>
        </div>`;
      });
      mainHTML += `</div>`;
    }

    const photoHTML = data.photo
      ? `<img class="r-photo" src="${data.photo}" alt="Profile photo">`
      : "";

    let headerMediaHTML = "";
    let contactRowHTML;

    if (isSimpleLayout) {
      // Photo and QR share one cluster in the header, next to the name.
      const qrHTML = data.qrDataUrl
        ? `<a class="r-qr-header" href="${escapeAttr(normalizeUrl(data.qrLink))}" target="_blank" rel="noopener noreferrer">
            <img class="r-qr-header-img" src="${data.qrDataUrl}" alt="QR code — tap to open link">
          </a>`
        : "";
      if (photoHTML || qrHTML) {
        headerMediaHTML = `<div class="r-header-media">${photoHTML}${qrHTML}</div>`;
      }

      // Phone, email, and every social link — all on one row under the name.
      const linkBits = [];
      if (data.phone) linkBits.push(`<span>${e(data.phone)}</span>`);
      if (data.email) linkBits.push(`<span>${e(data.email)}</span>`);
      data.socialLinks.forEach(link => {
        const href = normalizeUrl(link.url);
        linkBits.push(`<span><a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${e(shortenUrlDisplay(link.url))}</a></span>`);
      });
      contactRowHTML = `<div class="r-contact r-contact-links">${linkBits.join("")}</div>`;
    } else {
      headerMediaHTML = photoHTML ? `<div class="r-photo-wrap">${photoHTML}</div>` : "";
      const contactBits = [data.email, data.phone].filter(Boolean).map(x => `<span>${e(x)}</span>`).join("");
      contactRowHTML = `<div class="r-contact">${contactBits}</div>`;
    }

    resumePreview.innerHTML = `
      <div class="resume-doc template-${template}">
        <div class="r-header">
          <div class="r-header-row">
            <div class="r-header-text">
              <h1>${e(data.name) || "Your Name"}</h1>
              ${contactRowHTML}
            </div>
            ${headerMediaHTML}
          </div>
        </div>
        <div class="r-body">
          <div class="r-sidebar">${sidebarHTML}</div>
          <div class="r-main">${mainHTML}</div>
        </div>
      </div>
    `;
  }

  /* ---------- step switching (1: choose template, 2: details, 3: preview) ---------- */

  const STEP_ELS = { 1: stepChooseTemplate, 2: stepForm, 3: stepPreview };

  function goToStep(stepNum) {
    Object.entries(STEP_ELS).forEach(([n, el]) => {
      el.classList.toggle("is-active", Number(n) === stepNum);
    });
    progressSteps.forEach(s => {
      s.classList.toggle("is-active", Number(s.dataset.step) === stepNum);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  backToTemplatesBtn.addEventListener("click", () => goToStep(1));

  resumeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!resumeForm.checkValidity()) {
      resumeForm.reportValidity();
      return;
    }

    const submitBtn = resumeForm.querySelector(".generate-resume");
    const originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Preparing preview…";
    }

    const data = collectResumeData();
    data.qrDataUrl = await generateQRDataUrl(data.qrLink);

    currentData = data;
    renderResume(currentData, selectedTemplate);
    goToStep(3);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  backToFormBtn.addEventListener("click", () => goToStep(2));

  /* ---------- multi-format download (PDF / Word / JPG) ---------- */

  function buildFileName(ext) {
    const base = currentData && currentData.name ? currentData.name.trim().replace(/\s+/g, "_") : "resume";
    return `${base}_resume.${ext}`;
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Widens the resume element to its own fixed pixel width before capture so
  // html2canvas can't resolve container sizing differently than what's on
  // screen, then restores it afterwards. Shared by the PDF and JPG exports.
  function withFixedWidth(docEl, fn) {
    const docWidth = docEl.offsetWidth;
    const prevWidth = docEl.style.width;
    const prevBoxSizing = docEl.style.boxSizing;
    docEl.style.width = docWidth + "px";
    docEl.style.boxSizing = "border-box";

    const restore = () => {
      docEl.style.width = prevWidth;
      docEl.style.boxSizing = prevBoxSizing;
    };

    return fn(docWidth).then(
      (result) => { restore(); return result; },
      (err) => { restore(); throw err; }
    );
  }

  function downloadAsPDF(docEl) {
    return withFixedWidth(docEl, (docWidth) =>
      html2pdf()
        .set({
          margin: 0,
          filename: buildFileName("pdf"),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, windowWidth: docWidth, width: docWidth },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
        })
        .from(docEl)
        .save()
    );
  }

  function downloadAsImage(docEl) {
    if (typeof html2canvas === "undefined") {
      alert("Image export isn't available right now — please try the PDF option instead.");
      return Promise.resolve();
    }
    return withFixedWidth(docEl, (docWidth) =>
      html2canvas(docEl, { scale: 2, useCORS: true, windowWidth: docWidth, width: docWidth })
        .then(canvas => new Promise(resolve => {
          canvas.toBlob(blob => {
            if (blob) triggerBlobDownload(blob, buildFileName("jpg"));
            resolve();
          }, "image/jpeg", 0.95);
        }))
    );
  }

  // Word doesn't read our external stylesheet, so we fetch its contents and
  // inline them into the exported document's <style> — Word's HTML renderer
  // understands plain CSS well enough to keep the layout recognizable.
  function getStylesheetText() {
    return fetch("styles.css").then(res => res.text()).catch(() => "");
  }

  function downloadAsWord(docEl) {
    return getStylesheetText().then(cssText => {
      const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8"><title>Resume</title><style>${cssText}</style></head><body>`;
      const postHtml = "</body></html>";
      const fullHtml = preHtml + docEl.outerHTML + postHtml;
      const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword" });
      triggerBlobDownload(blob, buildFileName("doc"));
    });
  }

  // Produces a genuine Office Open XML .docx (a real zip, not the mhtml-in-a
  // .doc-wrapper trick) so it opens cleanly in Word with no "different
  // format" warning and can be edited like any normal Word document.
  function downloadAsDocx(docEl) {
    return getStylesheetText().then(cssText => {
      const fullHtml = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8"><title>Resume</title><style>${cssText}</style></head>
        <body>${docEl.outerHTML}</body></html>`;

      if (typeof htmlDocx === "undefined" || !htmlDocx.asBlob) {
        // Fallback: same technique as the .doc export, just saved with a
        // .docx name/mime so it still opens directly from Word's UI.
        const blob = new Blob(["\ufeff", fullHtml], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        triggerBlobDownload(blob, buildFileName("docx"));
        return;
      }

      const blob = htmlDocx.asBlob(fullHtml);
      triggerBlobDownload(blob, buildFileName("docx"));
    });
  }

  function closeDownloadMenu() {
    if (downloadMenu) downloadMenu.hidden = true;
  }

  if (downloadToggleBtn && downloadMenu) {
    downloadToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      downloadMenu.hidden = !downloadMenu.hidden;
    });

    document.addEventListener("click", (e) => {
      if (downloadDropdown && !downloadDropdown.contains(e.target)) closeDownloadMenu();
    });
  }

  downloadOptions.forEach(btn => {
    btn.addEventListener("click", () => {
      const docEl = resumePreview.querySelector(".resume-doc");
      if (!docEl) return;

      closeDownloadMenu();

      const format = btn.dataset.format;
      const originalLabel = downloadToggleBtn.textContent;
      downloadToggleBtn.disabled = true;
      downloadToggleBtn.textContent = "Preparing…";

      const done = () => {
        downloadToggleBtn.disabled = false;
        downloadToggleBtn.textContent = originalLabel;
      };

      let task;
      if (format === "pdf") task = downloadAsPDF(docEl);
      else if (format === "jpg") task = downloadAsImage(docEl);
      else if (format === "docx") task = downloadAsDocx(docEl);
      else if (format === "doc") task = downloadAsWord(docEl);
      else task = Promise.resolve();

      task.then(done).catch(err => {
        console.error("Download failed:", err);
        done();
      });
    });
  });

});