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
          "characters": "Personaggi",
          "environments": "Ambienti",
          "hardsurface": "Hard surface",
          "props": "Props e scan",
          "motion": "Motion e UI"
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

  /* Conto i progetti per categoria e scrivo il numero nei bottoni filtro */
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

  /* Alla chiusura rimuovo il listener della tastiera, altrimenti ne resta uno attaccato a ogni apertura */
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
    modalInfo.textContent = title + (desc ? " - " + desc : "");

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

    /* Su PC uso il contatore numerico, su mobile i puntini */
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

    /* Salvo il riferimento su modal._onKey cosi posso rimuoverlo alla chiusura */
    const onKey = (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(indexFromScroll() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexFromScroll() + 1); }

      /* Tengo il focus dentro il modal con Tab, per accessibilita */
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

/* Tastiera: le card sono role="button", quindi Invio e Spazio aprono la galleria */
document.getElementById("showreel")?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".case");
  if (!card || e.target !== card) return;
  e.preventDefault();
  card.click();
});

/* ========= Sistema Navigazione SPA (Hash Routing) ========= */
(() => {
  const nav = {
    work:    document.getElementById("btn-showreel"),
    code:    document.getElementById("btn-code"),
    profile: document.getElementById("btn-profile"),
  };
  /* hash -> [id vista, voce di menu attiva, titolo pagina] */
  const routes = {
    "#assets":      ["view-home",    "work",    "Assets"],
    "#in-sviluppo": ["view-dev",     "work",    "Ferrovie Tricolore"],
    "#annunci":     ["view-news",    "work",    "Annunci"],
    "#studio":      ["view-studio",  "work",    "TOMHODA Studios"],
    "#code":        ["view-code",    "code",    "Codice"],
    "#profile":     ["view-profile", "profile", "Profilo"],
  };
  /* vecchi indirizzi ancora validi */
  const aliases = { "": "#assets", "#home": "#assets", "#ferrovie-tricolore": "#in-sviluppo", "#terminati": "#annunci" };
  const views = [...new Set(Object.values(routes).map((r) => r[0]))]
    .map((id) => document.getElementById(id)).filter(Boolean);

  function switchView(hash, mode = "push") {
    hash = aliases[hash] ?? hash;
    if (!routes[hash]) hash = "#assets";
    const [viewId, navKey, title] = routes[hash];

    window.scrollTo({ top: 0, behavior: "instant" });
    views.forEach((v) => { v.style.display = v.id === viewId ? "block" : "none"; });
    Object.entries(nav).forEach(([k, el]) => el && el.classList.toggle("active", k === navKey));
    document.querySelectorAll(".subnav a").forEach((a) => {
      if (a.getAttribute("href") === hash) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.title = `${title} - Tommy Raffaello Hodoroaba`;

    // push solo su click; su load/popstate si sostituisce, altrimenti "Indietro" non funziona
    if (mode === "push" && location.hash !== hash) history.pushState(null, "", hash);
    else if (mode !== "push" && location.hash !== hash) history.replaceState(null, "", hash);

    document.dispatchEvent(new CustomEvent("viewchange", { detail: { hash } }));
  }

  window.addEventListener("load",     () => switchView(location.hash, "replace"));
  window.addEventListener("popstate", () => switchView(location.hash, "none"));

  /* Ogni link interno a una vista passa dal router */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute("href");
    if (!(h in routes) && !(h in aliases)) return;
    e.preventDefault();
    switchView(h);
  });
  document.getElementById("logo-home")?.addEventListener("click", (e) => { e.preventDefault(); switchView("#assets"); });
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

  // === Bottone "Scrivimi" - copia email negli appunti ===
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
      if (count % 3 === 0)      cols = 3;
      else if (count % 2 === 0) cols = 2;
      else                      cols = 3;
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    updateComingCols();
    window.addEventListener('resize', updateComingCols, { passive: true });
  })();

  /* ========= Tool & Codice: colonne bilanciate (mai una card orfana) ========= */
  (() => {
    const grid = document.querySelector('.dev-grid');
    if (!grid) return;

    function updateDevCols() {
      if (window.innerWidth < 900) {
        grid.style.gridTemplateColumns = '';
        return;
      }
      const count = grid.querySelectorAll('.code-card').length;
      const cols = (count % 3 === 0) ? 3 : 2;
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    updateDevCols();
    window.addEventListener('resize', updateDevCols, { passive: true });
  })();
})();
/* ========= Lazy load delle copertine delle card ========= */
(() => {
  const cards = document.querySelectorAll(".case-bg[data-bg]");
  const load = (el) => {
    el.style.setProperty("--bg", `url("${encodeURI(el.dataset.bg)}")`);
    el.removeAttribute("data-bg");
  };
  if (!("IntersectionObserver" in window)) { cards.forEach(load); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
  }, { rootMargin: "300px 0px" });
  cards.forEach((el) => io.observe(el));
})();

/* ========= Form contatti: invio via fetch con stati ========= */
(() => {
  const form = document.querySelector("form.contact-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const btn = form.querySelector(".btn-submit");
  const show = (msg, type) => {
    status.textContent = msg;
    status.className = `form-status is-${type}`;
    status.hidden = false;
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "Invio in corso...";
    status.hidden = true;
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      show("Messaggio inviato, grazie! Ti rispondo appena possibile.", "ok");
    } catch {
      show("Invio non riuscito. Riprova o scrivimi su LinkedIn.", "err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();
/* ========= Ferrovie Tricolore: dati live da Discord ========= */
(() => {
  const root = document.getElementById("view-dev");
  if (!root) return;
  let loaded = false;
  const q = (sel) => root.querySelector(sel);
  const fmtDate = (iso) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const nf = new Intl.NumberFormat("it-IT");

  function show(block) { const b = q(`[data-ft-block="${block}"]`); if (b) b.hidden = false; }

  function render(d) {
    if (typeof d.members === "number") {
      q('[data-ft="members"]').textContent = nf.format(d.members);
      q('[data-ft="members-short"]').textContent = `${nf.format(d.members)} membri`;
      q('[data-ft="members-label"]').textContent =
        typeof d.online === "number" ? `Membri Discord, ${nf.format(d.online)} online ora` : "Membri Discord";
    }

    const scheda = (d.scheda || []).filter((r) => r.key && r.value);
    const stato = scheda.find((r) => r.key.toLowerCase() === "stato");
    if (stato) q('[data-ft="stato"]').textContent = stato.value;
    const rows = scheda.filter((r) => r !== stato);
    if (rows.length) {
      const dl = q('[data-ft="scheda"]');
      dl.replaceChildren(...rows.flatMap((r) => {
        const dt = document.createElement("dt"); dt.textContent = r.key;
        const dd = document.createElement("dd"); dd.textContent = r.value;
        return [dt, dd];
      }));
      show("scheda");
    }

    if ((d.updates || []).length) {
      const box = q('[data-ft="updates"]');
      box.replaceChildren(...d.updates.map((u) => {
        const art = document.createElement("article");
        art.className = "ft-update";
        if (u.image && u.image.url) {
          const img = document.createElement("img");
          img.src = u.image.url; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
          if (u.image.width && u.image.height) { img.width = u.image.width; img.height = u.image.height; }
          art.appendChild(img);
        }
        const body = document.createElement("div");
        body.className = "ft-update-body";
        const time = document.createElement("time");
        time.dateTime = u.date; time.textContent = fmtDate(u.date);
        body.appendChild(time);
        if (u.title) {
          const h = document.createElement("h5");
          h.textContent = u.title;
          body.appendChild(h);
        }
        if (u.text) {
          const p = document.createElement("p");
          p.textContent = u.text;
          body.appendChild(p);
        }
        if (u.link && /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/.test(u.link)) {
          const a = document.createElement("a");
          a.href = u.link; a.target = "_blank"; a.rel = "noopener";
          a.className = "ft-update-link"; a.textContent = "Leggi su Discord";
          body.appendChild(a);
        }
        art.appendChild(body);
        return art;
      }));
      show("updates");
    }

    const posts = (d.tiktok || []).filter((t) => t && /^\d+$/.test(t.id));
    if (posts.length) {
      const box = q('[data-ft="tiktok"]');
      box.replaceChildren(...posts.map((t) => {
        const a = document.createElement("a");
        a.className = "ft-tt";
        a.href = `https://www.tiktok.com/@ferrovietricolore/video/${t.id}`;
        a.target = "_blank"; a.rel = "noopener";
        a.setAttribute("aria-label", `Guarda il video su TikTok${t.caption ? ": " + t.caption : ""}`);
        const media = document.createElement("div");
        media.className = "ft-tt-media";
        if (t.thumb && /^https:\/\/(cdn\.pingsync\.app|images-ext-\d\.discordapp\.net|media\.discordapp\.net|cdn\.discordapp\.com)\//.test(t.thumb)) {
          const img = document.createElement("img");
          img.src = t.thumb; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
          img.onerror = () => img.remove();
          media.appendChild(img);
        }
        const play = document.createElement("span");
        play.className = "ft-tt-play"; play.setAttribute("aria-hidden", "true");
        media.appendChild(play);
        const body = document.createElement("div");
        body.className = "ft-tt-body";
        const time = document.createElement("time");
        time.dateTime = t.date; time.textContent = t.date ? fmtDate(t.date) : "TikTok";
        body.appendChild(time);
        if (t.caption) {
          const p = document.createElement("p"); p.textContent = t.caption; body.appendChild(p);
        }
        const cta = document.createElement("span");
        cta.className = "ft-update-link"; cta.textContent = "Guarda su TikTok";
        body.appendChild(cta);
        a.append(media, body);
        return a;
      }));
      show("tiktok");
    }
  }

  async function load() {
    if (loaded) return;
    loaded = true;
    try {
      const res = await fetch("/.netlify/functions/ft-data");
      if (!res.ok) return; // resta il contenuto statico
      render(await res.json());
    } catch { /* offline o funzione non attiva: resta il contenuto statico */ }
  }

  document.addEventListener("viewchange", (e) => { if (e.detail.hash === "#in-sviluppo") load(); });
})();
