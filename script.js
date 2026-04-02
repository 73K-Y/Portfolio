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

/* ========= Marquee seamless loop ========= */
(() => {
  const track = document.getElementById("marqueeTrack");
  if (!track || track.dataset.duped === "1") return;
  track.innerHTML = track.innerHTML + track.innerHTML;
  track.dataset.duped = "1";
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

/* ========= Modal & Gallery ========= */
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

    // Gestione Frecce (solo se più di un elemento)
    if (items.length > 1) {
      const nav = document.createElement("div");
      nav.className = "gallery-nav";

      const prev = document.createElement("button");
      prev.className = "gallery-btn prev"; prev.innerHTML = "‹";
      
      const next = document.createElement("button");
      next.className = "gallery-btn next"; next.innerHTML = "›";

      nav.appendChild(prev);
      nav.appendChild(next);
      gallery.appendChild(nav);

      const updateArrows = () => {
        const idx = indexFromScroll();
        prev.style.opacity = idx === 0 ? "0" : "1";
        prev.style.pointerEvents = idx === 0 ? "none" : "auto";
        
        next.style.opacity = idx === slides.length - 1 ? "0" : "1";
        next.style.pointerEvents = idx === slides.length - 1 ? "none" : "auto";
      };

      prev.addEventListener("click", () => { goTo(indexFromScroll() - 1); }, { passive: true });
      next.addEventListener("click", () => { goTo(indexFromScroll() + 1); }, { passive: true });

      // Aggiorna le frecce quando la galleria scorre
      track.addEventListener('scroll', updateArrows, { passive: true });
      
      // Ritardo per assicurarsi che i width siano caricati e controllare subito
      setTimeout(updateArrows, 50);
    }

    const onKey = (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(indexFromScroll() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexFromScroll() + 1); }
    };
    document.addEventListener("keydown", onKey);

    // Solo tocco (rimosso drag da mouse per PC)
    let isDown = false; let startX = 0; let startLeft = 0;
    const getX = (e) => e.touches[0].clientX;
    const onDown = (e) => { isDown = true; startX = getX(e); startLeft = track.scrollLeft; };
    const onMove = (e) => { if (!isDown) return; const x = getX(e); track.scrollLeft = startLeft - (x - startX); };
    const onUp = () => { if (!isDown) return; isDown = false; goTo(indexFromScroll()); };

    track.addEventListener("touchstart", onDown, { passive: true });
    track.addEventListener("touchmove", onMove, { passive: true });
    track.addEventListener("touchend", onUp, { passive: true });

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