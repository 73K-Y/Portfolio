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

// === HERO: adatta la seconda riga (È la mia firma) alla larghezza della prima ===
(function fitHero() {
  const top     = document.getElementById('heroTop');
  const bottom  = document.getElementById('heroBottom');
  const column  = document.querySelector('.hero-left');
  if (!top || !bottom || !column) return;

  function measure(el){
    // Forza misure precise senza layout strani
    const prev = el.style.letterSpacing;
    el.style.letterSpacing = ''; // reset
    const w = el.getBoundingClientRect().width;
    el.style.letterSpacing = prev;
    return w;
  }

  function tune() {
    // reset per partire dal CSS
    bottom.style.fontSize      = '';
    bottom.style.letterSpacing = '';

    const maxBox = column.clientWidth;       // non oltre il box sinistro
    const target = Math.min(measure(top), maxBox);

    // 1) Binary-approach sulla font-size per avvicinarci rapidamente
    let size = parseFloat(getComputedStyle(bottom).fontSize);
    let minS = 12, maxS = Math.max(96, size * 2);
    for (let i=0;i<18;i++){
      bottom.style.fontSize = size + 'px';
      let w = measure(bottom);

      if (w > maxBox) {           // se usciamo dal box: abbassa
        maxS = size;
        size = (minS + maxS) / 2;
        continue;
      }

      const diff = target - w;
      if (Math.abs(diff) < 1.0) break; // ci basta 1px

      if (diff > 0) {              // troppo corto -> alza
        minS = size;
      } else {                     // troppo lungo -> abbassa
        maxS = size;
      }
      size = (minS + maxS) / 2;
    }
    bottom.style.fontSize = size + 'px';

    // 2) Micro-finitura con letter-spacing per colmare < 1px–3px
    let w = measure(bottom);
    let diff = target - w;               // positivo = corto
    const n = Math.max(bottom.textContent.length, 1);
    // calcolo spacing per distribuire l'errore sui caratteri
    let spacing = diff / n;              // px/char
    // limiti di sicurezza
    spacing = Math.max(-0.6, Math.min(0.6, spacing));
    // applica solo se serve
    if (Math.abs(diff) > 0.2) {
      bottom.style.letterSpacing = spacing.toFixed(3) + 'px';
    }
  }

  // init + resize
  const ro = new ResizeObserver(() => tune());
  ro.observe(document.body);
  window.addEventListener('load', tune, { once:true });
  tune();
})();