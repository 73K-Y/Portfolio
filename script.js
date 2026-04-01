/* === Performance & Setup === */
(() => {
  if (navigator.hardwareConcurrency <= 4) document.body.classList.add("no-blur");
  
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  document.querySelectorAll(".glitchable").forEach(el => {
    el.dataset.text = el.textContent.trim();
  });
})();

/* === Glitch Effect === */
function glitchBurst() {
  document.body.classList.add("glitch-burst");
  setTimeout(() => document.body.classList.remove("glitch-burst"), 150);
}

document.querySelectorAll(".btn, .filter-btn, .logo").forEach(el => {
  el.addEventListener("click", glitchBurst);
});

/* === Intersection Observer for Reveal === */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

/* === Portfolio Engine (Filtri & Badge) === */
(() => {
  const cards = document.querySelectorAll(".case");
  
  cards.forEach(card => {
    const badges = card.querySelector(".badges");
    const tools = (card.dataset.tools || "").split(",").map(t => t.trim());
    if (badges) {
      tools.forEach(t => {
        const span = document.createElement("span");
        span.className = "badge";
        span.textContent = t;
        badges.appendChild(span);
      });
    }
  });

  window.applyFilter = (filter) => {
    cards.forEach(card => {
      if (filter === "all" || card.dataset.cat === filter) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  };

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelector(".filter-btn.active").classList.remove("active");
      this.classList.add("active");
      applyFilter(this.dataset.filter);
    });
  });
})();

/* === Modal System === */
const modal = document.getElementById("modal");
const openModalButtons = document.querySelectorAll(".open-modal");

openModalButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".case");
    const title = card.dataset.title;
    const images = card.dataset.images.split("|");
    
    document.getElementById("modalInner").innerHTML = images.map(img => `<img src="${img}" style="width:100%; margin-bottom:10px; border-radius:8px;">`).join("");
    document.getElementById("modalInfo").textContent = title;
    
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

document.getElementById("modalBackdrop").addEventListener("click", () => {
  modal.classList.remove("open");
  document.body.style.overflow = "";
});