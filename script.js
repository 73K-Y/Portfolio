/* ====== Anno footer ====== */
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

/* ====== HERO: allinea le due righe senza sconfinare ====== */
(function fitHero() {
  const top    = document.getElementById('heroTop');
  const bottom = document.getElementById('heroBottom');
  const column = document.querySelector('.hero-left');
  if (!top || !bottom || !column) return;

  const EPS = 0.5, SAFETY = 12, MAX_WS = 18, MAX_LS = 0.6;
  const w = el => el.getBoundingClientRect().width;
  const gaps = txt => (txt.match(/\s+/g)||[]).reduce((a,s)=>a+s.length,0);

  function columnWidth() { return Math.max(0, column.getBoundingClientRect().width - SAFETY); }

  function tuneTop(maxBox){
    top.style.fontSize = ''; top.style.letterSpacing = '';
    let base = parseFloat(getComputedStyle(top).fontSize) || 32;
    let lo = 12, hi = Math.max(72, base*1.8);
    for (let i=0;i<18;i++){
      top.style.fontSize = base + 'px';
      const width = w(top);
      if (width <= maxBox - EPS) lo = base; else hi = base;
      const nxt = (lo + hi) / 2;
      if (Math.abs(nxt - base) < 0.1) break;
      base = nxt;
    }
    const diff = maxBox - w(top);
    if (Math.abs(diff) > EPS){
      let ls = diff / Math.max(top.textContent.length,1);
      ls = Math.max(-MAX_LS, Math.min(MAX_LS, ls));
      top.style.letterSpacing = ls.toFixed(3) + 'px';
    }
  }

  function tuneBottom(target){
    bottom.style.fontSize = ''; bottom.style.letterSpacing = ''; bottom.style.wordSpacing = '';
    let base = parseFloat(getComputedStyle(bottom).fontSize) || 56;
    let lo = 12, hi = Math.max(110, base*2);
    for (let i=0;i<18;i++){
      bottom.style.fontSize = base + 'px';
      const width = w(bottom);
      if (Math.abs(width - target) <= EPS) break;
      if (width > target) hi = base; else lo = base;
      base = (lo + hi) / 2;
    }
    let width = w(bottom);
    const sp = gaps(bottom.textContent);
    if (width < target - EPS && sp > 0){
      const extra = target - width;
      const perGap = Math.min(MAX_WS, extra / sp);
      bottom.style.wordSpacing = perGap.toFixed(3) + 'px';
      width = w(bottom);
    }
    const diff = target - width;
    if (Math.abs(diff) > EPS){
      let ls = diff / Math.max(bottom.textContent.length,1);
      ls = Math.max(-MAX_LS, Math.min(MAX_LS, ls));
      bottom.style.letterSpacing = ls.toFixed(3) + 'px';
    }
  }

  function tune(){
    const maxBox = columnWidth();
    tuneTop(maxBox);
    const target = Math.min(w(top), maxBox);
    tuneBottom(target);
  }

  const ro = new ResizeObserver(tune);
  ro.observe(document.body);
  window.addEventListener('load', tune, { once:true });
  tune();
})();

/* ====== Popola badge categoria & tools + descrizione ====== */
document.querySelectorAll('.case').forEach(card=>{
  const badges = card.querySelector('.badges');
  const descEl = card.querySelector('.desc');
  const cat = card.dataset.cat || '';
  const tools = (card.dataset.tools || '')
                .split(',').map(s=>s.trim()).filter(Boolean);

  if (badges) {
    if (cat) {
      const b = document.createElement('span');
      b.className = 'badge cat';
      b.textContent = (cat === 'game' ? 'Game Art & Dev' : '3D Viz');
      badges.appendChild(b);
    }
    tools.forEach(t=>{
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = t;
      badges.appendChild(b);
    });
  }
  if (descEl && card.dataset.desc) descEl.textContent = card.dataset.desc;
});

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
    // scroll lieve verso le cards
    document.getElementById('filters')?.scrollIntoView({behavior:'smooth', block:'start'});
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
  if (!card || !e.target.classList.contains('open-modal')) return;
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