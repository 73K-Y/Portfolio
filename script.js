/* ========= Modal & Gallery Fix ========= */
(() => {
  const modal = document.getElementById("modal");
  const modalInner = document.getElementById("modalInner");
  const closeModal = document.getElementById("closeModal");
  const backdrop = document.getElementById("modalBackdrop");
  
  // Elementi opzionali (se mancano nel DOM, il codice non crasha)
  const modalInfo = document.getElementById("modalInfo");
  const modalTools = document.getElementById("modalTools");
  const modalNote = document.getElementById("modalNote");

  if (!modal || !modalInner) return;

  function closeModalFn() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalInner.innerHTML = "";
    document.body.style.overflow = "";
  }

  closeModal?.addEventListener("click", closeModalFn);
  backdrop?.addEventListener("click", closeModalFn);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModalFn(); });

  function openModal(items, title, desc, tools, note) {
    modalInner.innerHTML = "";
    if (modalTools) modalTools.innerHTML = "";
    if (modalNote) modalNote.textContent = "";
    if (modalInfo) modalInfo.textContent = title + (desc ? " — " + desc : "");

    if (tools && modalTools) {
      tools.split(",").map(s => s.trim()).filter(Boolean).forEach(t => {
        const span = document.createElement("span");
        span.className = "chip"; span.textContent = t;
        modalTools.appendChild(span);
      });
    }
    if (note && modalNote) modalNote.textContent = note;

    const gallery = document.createElement("div");
    gallery.className = "gallery";
    const track = document.createElement("div");
    track.className = "gallery-track";

    items.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      if (src.toLowerCase().endsWith(".mp4")) {
        const v = document.createElement("video");
        v.src = src; v.controls = true; v.playsInline = true;
        slide.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = src; img.alt = title;
        slide.appendChild(img);
      }
      track.appendChild(slide);
    });

    gallery.appendChild(track);
    modalInner.appendChild(gallery);

    const slides = Array.from(track.children);
    const slideW = () => track.offsetWidth || 1;
    const indexFromScroll = () => Math.round(track.scrollLeft / slideW());
    const goTo = (i) => track.scrollTo({ left: i * slideW(), behavior: "smooth" });

    // Frecce per PC
    if (items.length > 1 && window.innerWidth > 768) {
      const prev = document.createElement("button");
      prev.className = "gallery-btn prev"; prev.innerHTML = "‹";
      const next = document.createElement("button");
      next.className = "gallery-btn next"; next.innerHTML = "›";
      gallery.appendChild(prev); gallery.appendChild(next);

      const updateArrows = () => {
        const idx = indexFromScroll();
        prev.style.display = idx === 0 ? "none" : "block";
        next.style.display = idx === slides.length - 1 ? "none" : "block";
      };
      prev.onclick = () => goTo(indexFromScroll() - 1);
      next.onclick = () => goTo(indexFromScroll() + 1);
      track.addEventListener('scroll', updateArrows);
      setTimeout(updateArrows, 50);
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  document.getElementById("showreel")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".open-modal");
    if (!btn) return;
    const card = e.target.closest(".case");
    if (!card) return;
    
    const items = [
      ...(card.dataset.images || "").split("|"),
      ...(card.dataset.videos || "").split("|")
    ].map(s => s.trim()).filter(Boolean);

    openModal(items, card.dataset.title, card.dataset.desc, card.dataset.tools, card.dataset.note);
  });
})();

/* ========= Badge Auto-Generation ========= */
document.querySelectorAll(".case").forEach((card) => {
  const badges = card.querySelector(".badges");
  const cat = card.dataset.cat;
  const tools = (card.dataset.tools || "").split(",").map(s => s.trim()).filter(Boolean);
  if (badges) {
    if (cat) badges.innerHTML += `<span class="badge cat">${cat === 'game' ? 'Game Art' : '3D Viz'}</span>`;
    tools.forEach(t => badges.innerHTML += `<span class="badge">${t}</span>`);
  }
});