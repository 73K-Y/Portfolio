// === Footer year ===
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// === Reveal on scroll (leggero) ===
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
revealEls.forEach(el => io.observe(el));

// === Filtro categorie ===
const filterBtns = document.querySelectorAll('.filter-btn');
const cases = document.querySelectorAll('.case');
filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    cases.forEach(c=>{
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
    });
  });
});

// === Modal (immagini + video) ===
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const modalTools = document.getElementById('modalTools');
const modalNote  = document.getElementById('modalNote');
const closeModal = document.getElementById('closeModal');

function openModal(items, title, desc, tools, note){
  modalInner.innerHTML = '';
  modalTools.innerHTML = '';
  modalNote.textContent = '';

  items.forEach(it=>{
    if (it.endsWith('.mp4')) {
      const v = document.createElement('video');
      v.src = it; v.controls = true; v.loop = true; v.style.width='100%';
      modalInner.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = it; img.loading = 'lazy';
      modalInner.appendChild(img);
    }
  });

  if (tools) {
    tools.split(',').map(s=>s.trim()).forEach(t=>{
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = t;
      modalTools.appendChild(span);
    });
  }
  if (note) modalNote.textContent = note;
  modalInfo.textContent = title + (desc ? ' — ' + desc : '');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function closeModalFn(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  modalInner.innerHTML = '';
}
if (closeModal) closeModal.addEventListener('click', closeModalFn);
document.getElementById('modalBackdrop')?.addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

// Click sulle card .case (apertura galleria)
document.getElementById('showreel')?.addEventListener('click', e=>{
  const card = e.target.closest('.case');
  if (!card) return;
  const title  = card.dataset.title || 'Progetto';
  const desc   = card.dataset.desc || '';
  const tools  = card.dataset.tools || '';
  const note   = card.dataset.note  || '';
  const images = (card.dataset.images || '').split('|').map(s=>s.trim()).filter(Boolean);
  const videos = (card.dataset.videos || '').split('|').map(s=>s.trim()).filter(Boolean);
  const items  = [...images, ...videos];
  if (!items.length) return;
  openModal(items, title, desc, tools, note);
});

// === HERO: adatta la seconda riga alla larghezza della prima ===
(function fitHero() {
  const top = document.getElementById('heroTop');
  const bottom = document.getElementById('heroBottom');
  const container = document.querySelector('.hero-left');
  if (!top || !bottom || !container) return;

  let baseSizeBottom = parseFloat(getComputedStyle(bottom).fontSize); // valore CSS
  let ticking = false;

  function adjust() {
    const maxWidth = container.clientWidth;      // non superare il box di sinistra
    const target   = top.getBoundingClientRect().width;   // larghezza riga 1
    let size       = baseSizeBottom;
    bottom.style.fontSize = size + 'px';

    // se supera il box, riduci
    if (bottom.getBoundingClientRect().width > maxWidth) {
      while (bottom.getBoundingClientRect().width > maxWidth && size > 12) {
        size -= 1;
        bottom.style.fontSize = size + 'px';
      }
    }

    // allinea alla larghezza della riga 1 (entro tolleranza)
    const tolerance = 6; // px
    let w = bottom.getBoundingClientRect().width;
    if (w < target - tolerance) {
      while (w < target - tolerance && size < baseSizeBottom * 1.4 && w < maxWidth) {
        size += 0.8;
        bottom.style.fontSize = size + 'px';
        w = bottom.getBoundingClientRect().width;
      }
    } else if (w > target + tolerance) {
      while (w > target + tolerance && size > 12) {
        size -= 0.8;
        bottom.style.fontSize = size + 'px';
        w = bottom.getBoundingClientRect().width;
      }
    }
  }

  function onResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      // reset alla dimensione CSS di base prima di ricalcolare
      bottom.style.fontSize = '';
      baseSizeBottom = parseFloat(getComputedStyle(bottom).fontSize);
      adjust();
      ticking = false;
    });
  }

  // inizializza
  window.addEventListener('load', onResize, { once: true });
  window.addEventListener('resize', onResize);
  onResize();
})();