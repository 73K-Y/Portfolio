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

  const EPS = 0.5;                     // tolleranza sub-pixel
  const MAX_WS = 18;                   // word-spacing max (px) per gap
  const MAX_LS = 0.6;                  // letter-spacing +/- (px) limite

  function measure(el){ return el.getBoundingClientRect().width; }
  function countSpaces(text){ return (text.match(/\s+/g)||[]).reduce((a,s)=>a+s.length,0); }

  function tune() {
    // reset
    bottom.style.fontSize      = '';
    bottom.style.letterSpacing = '';
    bottom.style.wordSpacing   = '';

    // misure target
    const maxBox = column.clientWidth;           // non superare la colonna
    const target = Math.min(measure(top), maxBox);

    // dimensione di base della riga sotto (parto dalla CSS)
    let base = parseFloat(getComputedStyle(bottom).fontSize) || 48;

    // se siamo più lunghi del target, riduciamo con binary search sul font-size
    let lo = 12, hi = Math.max(96, base*2);
    for (let i=0; i<18; i++){
      bottom.style.fontSize = base + 'px';
      const w = measure(bottom);
      if (Math.abs(w - target) <= EPS) break;
      if (w > target) { hi = base; } else { lo = base; }
      base = (lo + hi) / 2;
    }

    // raffinatura con spaziature
    const gaps = countSpaces(bottom.textContent); // numero spazi totali
    let w = measure(bottom);

    if (w < target - EPS && gaps > 0){
      // allungare con word-spacing distribuito
      let extra = target - w;                      // px da recuperare
      let wsPerGap = Math.min(MAX_WS, extra / gaps);
      bottom.style.wordSpacing = wsPerGap.toFixed(3) + 'px';
      w = measure(bottom);
    }

    // micro-finitura con letter-spacing
    if (Math.abs(w - target) > EPS){
      let diff = target - w;                       // positivo = corto
      let ls = diff / Math.max(bottom.textContent.length,1);
      ls = Math.max(-MAX_LS, Math.min(MAX_LS, ls));
      bottom.style.letterSpacing = ls.toFixed(3) + 'px';
      w = measure(bottom);
    }

    // ultimo ritocco, se ancora oltre di poco, ritocchiamo 1% font-size
    if (w > target + EPS){
      const cur = parseFloat(getComputedStyle(bottom).fontSize);
      bottom.style.fontSize = (cur * 0.99) + 'px';
    }
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