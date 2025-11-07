/* ====== Footer year ====== */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ====== Reveal on scroll ====== */
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

/* ====== HERO: fai “È la mia firma” lungo quanto la riga sopra ====== */
(function fitHero() {
  const top    = document.getElementById('heroTop');
  const bottom = document.getElementById('heroBottom');
  const column = document.querySelector('.hero-left');
  if (!top || !bottom || !column) return;

  function measure(el){ return el.getBoundingClientRect().width; }

  function tune() {
    // reset
    bottom.style.fontSize = '';
    bottom.style.letterSpacing = '';

    const maxBox = column.clientWidth; // mai oltre il box sinistro
    const target = Math.min(measure(top), maxBox);

    // Binary search sulla font-size
    let base = parseFloat(getComputedStyle(bottom).fontSize) || 48;
    let lo = 12, hi = Math.max(96, base * 2);
    for (let i=0; i<18; i++){
      bottom.style.fontSize = base + 'px';
      const w = measure(bottom);
      if (Math.abs(w - target) < 0.8) break;
      if (w > target) { hi = base; } else { lo = base; }
      base = (lo + hi) / 2;
    }

    // micro-finitura con letter-spacing
    const w = measure(bottom);
    let diff = target - w;                 // positivo = corto
    const n = Math.max(bottom.textContent.length, 1);
    let spacing = diff / n;                // px/char
    spacing = Math.max(-0.6, Math.min(0.6, spacing));
    if (Math.abs(diff) > 0.2) bottom.style.letterSpacing = spacing.toFixed(3) + 'px';
  }

  const ro = new ResizeObserver(() => tune());
  ro.observe(document.body);
  window.addEventListener('load', tune, { once:true });
  tune();
})();

/* ====== Filtro categorie ====== */
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

/* ====== Modal immagini/video ====== */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const modalTools = document.getElementById('modalTools');
const modalNote = document.getElementById('modalNote');
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

document.getElementById('showreel')?.addEventListener('click', e=>{
  const card = e.target.closest('.case');
  if (!card) return;
  const title = card.dataset.title || 'Progetto';
  const desc  = card.dataset.desc || '';
  const tools = card.dataset.tools || '';
  const note  = card.dataset.note  || '';
  const images = (card.dataset.images || '')
    .split('|').map(s=>s.trim()).filter(Boolean);
  const videos = (card.dataset.videos || '')
    .split('|').map(s=>s.trim()).filter(Boolean);
  const items = [...images, ...videos];
  if (!items.length) return;
  openModal(items, title, desc, tools, note);
});