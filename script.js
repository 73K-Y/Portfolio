/* ===== Auto performance switch ===== */
(() => {
  if (document.body.classList.contains("no-blur")) return;
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (isMobile || lowCPU || saveData) { document.body.classList.add("no-blur"); }
})();

/* ========= Footer year ========= */
(() => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
})();

/* ========= Reveal on scroll ========= */
(() => {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );
  revealEls.forEach((el) => io.observe(el));
})();

/* ========= Badge categoria + tools + descrizione ========= */
(() => {
  document.querySelectorAll(".case").forEach((card) => {
    const badges = card.querySelector(".badges");
    const descEl = card.querySelector(".desc");
    const cat = (card.dataset.cat || "").trim();
    const tools = (card.dataset.tools || "").split(",").map((s) => s.trim()).filter(Boolean);

    if (badges) {
      badges.innerHTML = "";
      if (cat) {
        const b = document.createElement("span");
        b.className = "badge cat";
        b.textContent = cat === "game" ? "Game Art & Dev" : "3D Viz";
        badges.appendChild(b);
      }
      tools.forEach((t) => {
        const b = document.createElement("span");
        b.className = "badge";
        b.textContent = t;
        badges.appendChild(b);
      });
    }
    if (descEl && card.dataset.desc) descEl.textContent = card.dataset.desc;
  });
})();

/* ========= Filtro categorie ========= */
(() => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = Array.from(document.querySelectorAll(".case"));

  function applyFilter(key) {
    const cat = (key || "all").trim();
    cards.forEach((c) => {
      const cc = (c.dataset.cat || "").trim();
      if (cat === "all" || cc === cat) c.classList.remove("is-hidden");
      else c.classList.add("is-hidden");
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
        document.getElementById("filters")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, { passive: true }
    );
  });
  applyFilter("all");
})();

/* ========= Modal & Gallery NATIVA SENZA NAVBAR SOTTO ========= */
(() => {
  const modal = document.getElementById("modal");
  const modalInner = document.getElementById("modalInner");
  const modalInfo = document.getElementById("modalInfo");
  const modalTools = document.getElementById("modalTools");
  const modalNote = document.getElementById("modalNote");
  const closeModal = document.getElementById("closeModal");
  const backdrop = document.getElementById("modalBackdrop");

  if (!modal || !modalInner || !modalInfo || !modalTools || !modalNote) return;

  function closeModalFn() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalInner.innerHTML = "";
    document.body.style.overflow = "";
  }

  closeModal?.addEventListener("click", closeModalFn, { passive: true });
  backdrop?.addEventListener("click", closeModalFn, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModalFn(); });

  function openModal(items, title, desc, tools, note) {
    modalInner.innerHTML = "";
    modalTools.innerHTML = "";
    modalNote.textContent = "";
    modalInfo.textContent = title + (desc ? " — " + desc : "");

    if (tools) {
      tools.split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => {
          const span = document.createElement("span");
          span.className = "chip"; span.textContent = t;
          modalTools.appendChild(span);
      });
    }
    if (note) modalNote.textContent = note;

    const gallery = document.createElement("div");
    gallery.className = "gallery";

    const track = document.createElement("div");
    track.className = "gallery-track";
    track.setAttribute("role", "region");

    items.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "slide";

      if (src.toLowerCase().endsWith(".mp4")) {
        const v = document.createElement("video");
        v.src = src; v.controls = true; v.playsInline = true; v.preload = "metadata"; v.style.maxHeight = "80vh";
        slide.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = src; img.loading = "lazy"; img.decoding = "async"; img.alt = title || "media"; img.style.maxHeight = "80vh";
        slide.appendChild(img);
      }
      track.appendChild(slide);
    });

    gallery.appendChild(track);
    modalInner.appendChild(gallery);

    const slides = Array.from(track.children);
    const slideW = () => track.getBoundingClientRect().width || 1;
    const indexFromScroll = () => Math.round(track.scrollLeft / slideW());
    const goTo = (i) => track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i)) * slideW(), behavior: "smooth" });

    // Gestione Frecce per PC: compaiono SOLO SE CI SONO PIÙ FOTO e nascondono in modo intelligente
    const isPC = window.matchMedia("(min-width: 769px)").matches;
    
    if (items.length > 1 && isPC) {
      const prev = document.createElement("button");
      prev.className = "gallery-btn prev"; prev.innerHTML = "‹";
      
      const next = document.createElement("button");
      next.className = "gallery-btn next"; next.innerHTML = "›";

      gallery.appendChild(prev);
      gallery.appendChild(next);

      const updateArrows = () => {
        const idx = indexFromScroll();
        prev.style.display = idx === 0 ? "none" : "block"; // Se è la prima, via la sinistra
        next.style.display = idx === slides.length - 1 ? "none" : "block"; // Se è l'ultima, via la destra
      };

      prev.addEventListener("click", () => { goTo(indexFromScroll() - 1); }, { passive: true });
      next.addEventListener("click", () => { goTo(indexFromScroll() + 1); }, { passive: true });

      track.addEventListener('scroll', updateArrows, { passive: true });
      setTimeout(updateArrows, 50); // Inizializza subito
    }

    const onKey = (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(indexFromScroll() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexFromScroll() + 1); }
    };
    document.addEventListener("keydown", onKey);

    // Su mobile lo swipe è nativo (CSS overflow-x: auto + scroll-snap) quindi ho rimosso il custom touch JS.
    // Nessuna navbar sotto o roba che interrompe la visione!

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  document.getElementById("showreel")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".open-modal");
      if (!btn) return;
      const card = e.target.closest(".case");
      if (!card) return;
      const title = card.dataset.title || "Progetto";
      const desc = card.dataset.desc || "";
      const tools = card.dataset.tools || "";
      const note = card.dataset.note || "";
      const images = (card.dataset.images || "").split("|").map((s) => s.trim()).filter(Boolean);
      const videos = (card.dataset.videos || "").split("|").map((s) => s.trim()).filter(Boolean);
      const items = [...images, ...videos];
      if (!items.length) return;
      openModal(items, title, desc, tools, note);
    }, { passive: true }
  );
})();