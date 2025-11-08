/* Footer year */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* Reveal on scroll */
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

/* ===== HERO: allinea e mantieni grande ===== */
(function fitHero() {
  const top    = document.getElementById('heroTop');
  const bottom = document.getElementById('heroBottom');
  const column = document.querySelector('.hero-left');
  if (!top || !bottom || !column) return;

  // limiti minimi più generosi per evitare rimpicciolimenti
  const MIN_TOP = 34;      // px
  const MIN_BOTTOM = 64;   // px

  const EPS = 0.5, SAFETY = 12;
  const w = el => el.getBoundingClientRect().width;
  const gaps = txt => (txt.match(/\s+/g)||[]).reduce((a,s)=>a+s.length,0);
  const colW = () => Math.max(0, column.getBoundingClientRect().width - SAFETY);

  function polyfit(el, target, minPx, maxGrow){
    el.style.fontSize = '';
    el.style.letterSpacing = '';
    el.style.wordSpacing = '';

    let base = Math.max(minPx, parseFloat(getComputedStyle(el).fontSize) || minPx);
    let lo = minPx, hi = Math.max(base*maxGrow, base + 48);

    for (let i=0;i<18;i++){
      el.style.fontSize = base + 'px';
      const width = w(el);
      if (Math.abs(width - target) <= EPS) break;
      if (width > target) hi = base; else lo = base;
      const next = (lo + hi) / 2;
      if (Math.abs(next - base) < 0.1) break;
      base = next;
    }
  }

  function tune(){
    const maxBox = colW();
    // 1) riga sopra: riempi colonna ma non scendere sotto MIN_TOP
    polyfit(top, maxBox, MIN_TOP, 2.2);

    // 2) riga sotto: match larghezza esatta della riga sopra
    const target = Math.min(w(top), maxBox);
    polyfit(bottom, target, MIN_BOTTOM, 2.4);

    // 3) rifinitura a spazi/lettere se resta leggermente corta
    let width = w(bottom);
    const need = target - width;
    if (need > EPS){
      const sp = gaps(bottom.textContent);
      if (sp > 0){
        const perGap = Math.min(18, need / sp);
        bottom.style.wordSpacing = perGap.toFixed(3) + 'px';
      } else {
        let ls = need / Math.max(bottom.textContent.length,1);
        ls = Math.max(-0.6, Math.min(0.6, ls));
        bottom.style.letterSpacing = ls.toFixed(3) + 'px';
      }
    }
  }

  const ro = new ResizeObserver(tune);
  ro.observe(document.body);
  window.addEventListener('resize', tune);
  window.addEventListener('load', tune, { once:true });
  // dopo che i font sono pronti
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tune);
  tune();
})();

/* ===== Badge categoria + tools + desc ===== */
document.querySelectorAll('#showreel .case').forEach(card=>{
  const badges = card.querySelector('.badges');
  const descEl = card.querySelector('.desc');
  const cat = (card.dataset.cat || '').trim();          // game | viz
  const tools = (card.dataset.tools || '').split(',').map(s=>s.trim()).filter(Boolean);

  if (badges) {
    badges.innerHTML = ''; // evita duplicazioni in hot-reload
    if (cat){
      const b = document.createElement('span');
      b.className = 'badge cat ' + (cat==='game'?'game':'viz');
      b.textContent = (cat === 'game' ? 'Game Art & Dev' : '3D Visualization');
      badges.appendChild(b);
    }
    tools.forEach(t=>{
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = t;
      badges.appendChild(b);
    });
  }
  if (descEl && !descEl.textContent.trim() && card.dataset.desc) {
    descEl.textContent = card.dataset.desc;
  }
});

/* ===== Filtro categorie ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
// filtra SOLO le card del #showreel
const cards = Array.from(document.querySelectorAll('#showreel .case'));

function applyFilter(key){
  const cat = (key || 'all').trim(); // all | game | viz
  cards.forEach(c=>{
    const cc = (c.dataset.cat || '').trim();
    // usa style.display per evitare dipendenza da CSS .is-hidden
    c.style.display = (cat==='all' || cc===cat) ? '' : 'none';
  });
}

filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
    document.getElementById('filters')?.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// all'avvio mostra davvero TUTTO
applyFilter('all');

/* ===== Modal ===== */
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
    tools.split(',').map(s=>s.trim()).filter(Boolean).forEach(t=>{
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
  if (!card || !e.target.classList.contains('open-modal')) return; // apri solo dal bottone
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