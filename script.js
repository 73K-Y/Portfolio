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
        const catNames = {
          "characters": "Characters",
          "environments": "Environments",
          "hardsurface": "Hard Surface",
          "props": "Props & Scans",
          "motion": "Motion & UI"
        };
        const b = document.createElement("span");
        b.className = "badge cat";
        b.textContent = catNames[cat] || cat;
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

/* ========= Filtro categorie (CON FIX BENTO BOX) ========= */
(() => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = Array.from(document.querySelectorAll(".case"));

  function applyFilter(key) {
    const cat = (key || "all").trim();
    let visibleIndex = 1;
    cards.forEach((c) => {
      const cc = (c.dataset.cat || "").trim();
      if (cat === "all" || cc === cat) {
        c.classList.remove("is-hidden");
        c.setAttribute("data-bento", visibleIndex);
        visibleIndex++;
      } else {
        c.classList.add("is-hidden");
        c.removeAttribute("data-bento");
      }
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

  /* ── Contatore progetti per categoria ── */
  const catCount = {};
  cards.forEach((c) => {
    const cc = (c.dataset.cat || "").trim();
    if (cc) catCount[cc] = (catCount[cc] || 0) + 1;
  });
  filterBtns.forEach((btn) => {
    const f = btn.dataset.filter;
    if (f === "all") {
      btn.textContent = `Tutti (${cards.length})`;
    } else {
      const cnt = catCount[f] || 0;
      if (cnt > 0) btn.textContent = `${btn.textContent} (${cnt})`;
    }
  });
})();

/* ========= Modal & Gallery NATIVA ========= */
(() => {
  const modal = document.getElementById("modal");
  const modalInner = document.getElementById("modalInner");
  const modalInfo = document.getElementById("modalInfo");
  const modalTools = document.getElementById("modalTools");
  const modalNote = document.getElementById("modalNote");
  const closeModal = document.getElementById("closeModal");
  const backdrop = document.getElementById("modalBackdrop");

  if (!modal || !modalInner || !modalInfo || !modalTools || !modalNote) return;

  /* ✅ FIX: rimuove il listener tastiera ad ogni chiusura */
  function closeModalFn() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalInner.innerHTML = "";
    document.body.style.overflow = "";
    if (modal._onKey) {
      document.removeEventListener("keydown", modal._onKey);
      modal._onKey = null;
    }
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

    const isPC = window.matchMedia("(min-width: 769px)").matches;

    /* ── Indicatore posizione: counter su PC, dots su mobile ── */
    if (items.length > 1) {
      const indicator = document.createElement("div");

      if (isPC) {
        indicator.className = "gallery-counter";
        const updateCounter = () => {
          indicator.textContent = `${indexFromScroll() + 1} / ${slides.length}`;
        };
        updateCounter();
        track.addEventListener("scroll", updateCounter, { passive: true });
      } else {
        indicator.className = "gallery-dots";
        slides.forEach((_, i) => {
          const dot = document.createElement("button");
          dot.className = "gallery-dot" + (i === 0 ? " active" : "");
          dot.setAttribute("aria-label", `Vai alla slide ${i + 1}`);
          dot.type = "button";
          dot.addEventListener("click", () => goTo(i), { passive: true });
          indicator.appendChild(dot);
        });
        const updateDots = () => {
          const idx = indexFromScroll();
          indicator.querySelectorAll(".gallery-dot").forEach((d, i) => {
            d.classList.toggle("active", i === idx);
          });
        };
        track.addEventListener("scroll", updateDots, { passive: true });
      }

      gallery.appendChild(indicator);
    }

    if (items.length > 1 && isPC) {
      const prev = document.createElement("button");
      prev.className = "gallery-btn prev"; prev.innerHTML = "‹";

      const next = document.createElement("button");
      next.className = "gallery-btn next"; next.innerHTML = "›";

      gallery.appendChild(prev);
      gallery.appendChild(next);

      const updateArrows = () => {
        const idx = indexFromScroll();
        prev.style.display = idx === 0 ? "none" : "block";
        next.style.display = idx === slides.length - 1 ? "none" : "block";
      };

      prev.addEventListener("click", () => { goTo(indexFromScroll() - 1); }, { passive: true });
      next.addEventListener("click", () => { goTo(indexFromScroll() + 1); }, { passive: true });
      track.addEventListener("scroll", updateArrows, { passive: true });
      setTimeout(updateArrows, 50);
    }

    /* ✅ FIX: salva riferimento per rimozione in closeModalFn */
    const onKey = (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(indexFromScroll() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexFromScroll() + 1); }

      /* ── Focus trap WCAG ── */
      if (e.key === "Tab") {
        const focusable = Array.from(modal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    modal._onKey = onKey;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    /* Sposta il focus al pulsante di chiusura all'apertura del modal */
    requestAnimationFrame(() => closeModal?.focus());
  }

  document.getElementById("showreel")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".open-modal");
      if (!btn) return;
      const card = e.target.closest(".case");
      if (!card) return;
      const title  = card.dataset.title  || "Progetto";
      const desc   = card.dataset.desc   || "";
      const tools  = card.dataset.tools  || "";
      const note   = card.dataset.note   || "";
      const images = (card.dataset.images || "").split("|").map((s) => s.trim()).filter(Boolean);
      const videos = (card.dataset.videos || "").split("|").map((s) => s.trim()).filter(Boolean);
      const items  = [...images, ...videos];
      if (!items.length) return;
      openModal(items, title, desc, tools, note);
    }, { passive: true }
  );
})();

/* ========= Sistema Navigazione SPA (Hash Routing) ========= */
/* ✅ FIX: IntersectionObserver creato una sola volta fuori da switchView */
(() => {
  const btnProfile  = document.getElementById("btn-profile");
  const btnShowreel = document.getElementById("btn-showreel");
  const logoHome    = document.getElementById("logo-home");
  const viewHome    = document.getElementById("view-home");
  const viewProfile = document.getElementById("view-profile");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  function switchView(hash) {
    window.scrollTo({ top: 0, behavior: "instant" });

    if (hash === "#profile") {
      viewHome.style.display    = "none";
      viewProfile.style.display = "block";
      btnProfile.classList.add("active");
      btnShowreel.classList.remove("active");
    } else {
      viewHome.style.display    = "block";
      viewProfile.style.display = "none";
      btnShowreel.classList.add("active");
      btnProfile.classList.remove("active");
      hash = "#home";
    }

    history.pushState(null, null, hash);

    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.remove("is-visible");
      setTimeout(() => revealObserver.observe(el), 50);
    });
  }

  window.addEventListener("load",     () => switchView(window.location.hash || "#home"));
  window.addEventListener("popstate", () => switchView(window.location.hash || "#home"));

  btnProfile?.addEventListener( "click", (e) => { e.preventDefault(); switchView("#profile"); });
  btnShowreel?.addEventListener("click", (e) => { e.preventDefault(); switchView("#home"); });
  logoHome?.addEventListener(   "click", (e) => { e.preventDefault(); switchView("#home"); });
})();

/* ========= Interazioni Extra (CTA, Video Fallback, Copia Email) ========= */
(() => {
  // === CTA profile switch ===
  document.getElementById("cta-profile-link")?.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("btn-profile")?.click();
  });

  // === Slideshow fallback hero ===
  const video = document.getElementById("heroVideo");
  const slideshow = document.getElementById("heroSlideshow");
  if (video) {
    const showSlideshow = () => {
      video.style.display = "none";
      if (slideshow) slideshow.style.display = "block";
    };
    video.addEventListener("error", showSlideshow);
    setTimeout(() => { if (video.readyState === 0) showSlideshow(); }, 2500);
  } else if (slideshow) {
    slideshow.style.display = "block";
  }

  // === Bottone "Scrivimi" — copia email negli appunti ===
  document.querySelectorAll(".btn-copy-email").forEach(btn => {
    btn.addEventListener("click", function() {
      const email = this.dataset.email;
      if (!email) return;
      navigator.clipboard.writeText(email).then(() => {
        const orig = this.textContent;
        this.textContent = "✓ Email copiata!";
        this.style.background = "#00c864";
        setTimeout(() => {
          this.textContent = orig;
          this.style.background = "";
        }, 2200);
      }).catch(() => {
        // Fallback visivo invece di aprire il client email
        const orig = this.textContent;
        this.textContent = email;
        this.style.background = "#333";
        setTimeout(() => {
          this.textContent = orig;
          this.style.background = "";
        }, 4000);
      });
    });
  });
  /* ========= Coming Soon: griglia auto-adattiva ========= */
  (() => {
    const grid = document.querySelector('.coming-grid');
    if (!grid) return;

    function updateComingCols() {
      if (window.innerWidth < 900) {
        grid.style.gridTemplateColumns = '1fr';
        return;
      }
      const count = grid.querySelectorAll('.case-coming').length;
      let cols;
      if (count % 3 === 0)      cols = 3;   // 3, 6, 9…
      else if (count % 2 === 0) cols = 2;   // 2, 4, 8…
      else                      cols = 3;   // 1, 5, 7… → default 3
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    updateComingCols();
    window.addEventListener('resize', updateComingCols, { passive: true });
  })();
})();