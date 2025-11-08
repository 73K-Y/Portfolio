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

/* ===== HERO fit (desktop/tablet). Su mobile (<600px) lascio al CSS per stabilità. ===== */
(function fitHero() {
  const top    = document.getElementById('heroTop');
  const bottom = document.getElementById('heroBottom');
  const column = document.querySelector('.hero-left');
  if (!top || !bottom || !column) return;

  function isMobile(){ return window.matchMedia('(max-width: 600px)').matches; }

  const MIN_TOP = 30;
  const MIN_BOTTOM = 54;
  const EPS = 0.5, SAFETY = 12, MAX_WS = 18, MAX_LS = 0.6;

  const w = el => el.getBoundingClientRect().width;
  const gaps = txt => (txt.match(/\s+/g)||[]).reduce((a,s)=>a+s.length,0);
  const colW = () => Math.max(0, column.getBoundingClientRect().width - SAFETY);

  function binaryFit(el, target, minPx, grow=2.2){
    el.style.wordSpacing = '';
    el.style.letterSpacing = '';
    let base = Math.max(minPx, parseFloat(getComputedStyle(el).fontSize) || minPx);
    let lo = minPx, hi = Math.max(base*grow, base + 48);
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
    if (isMobile()){
      [top, bottom].forEach(el=>{
        el.style.fontSize=''; el.style.wordSpacing=''; el.style.letterSpacing='';
      });
      return;
    }
    const maxBox = colW();
    binaryFit(top, maxBox, MIN_TOP, 2.2);
    const target = Math.min(w(top), maxBox);
    binaryFit(bottom, target, MIN_BOTTOM, 2.4);

    let width = w(bottom);
    const need = target - width;
    if (need > EPS){
      const sp = gaps(bottom.textContent);
      if (sp > 0){
        const perGap = Math.min(MAX_WS, need / sp);
        bottom.style.wordSpacing = perGap.toFixed(3) + 'px';
      } else {
        let ls = need / Math.max(bottom.textContent.length,1);
        ls = Math.max(-MAX_LS, Math.min(MAX_LS, ls));
        bottom.style.letterSpacing = ls.toFixed(3) + 'px';
      }
    }
  }

  const ro = new ResizeObserver(tune);
  ro.observe(document.body);
  window.addEventListener('resize', tune);
  window.addEventListener('load', tune, { once:true });
  setTimeout(()=>document.fonts?.ready.then(tune), 0);
  tune();
})();

/* ===== Badge categoria + tools + descrizione ===== */
document.querySelectorAll('.case').forEach(card=>{
  const badges = card.querySelector('.badges');
  const descEl = card.querySelector('.desc');
  const cat = (card.dataset.cat || '').trim();
  const tools = (card.dataset.tools || '').split(',').map(s=>s.trim()).filter(Boolean);

  if (badges) {
    if (cat){
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

/* ===== Filtro categorie ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = Array.from(document.querySelectorAll('.case'));

function applyFilter(key){
  const cat = (key || 'all').trim();
  cards.forEach(c=>{
    const cc = (c.dataset.cat || '').trim();
    if (cat === 'all' || cc === cat) c.classList.remove('is-hidden');
    else c.classList.add('is-hidden');
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
applyFilter('all');

/* ===== Modal ===== */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const modalTools = document.getElementById('modalTools');
const modalNote = document.getElementById('modalNote');
const closeModal = document.getElementById('closeModal');

function closeModalFn(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  modalInner.innerHTML = '';
}
if (closeModal) closeModal.addEventListener('click', closeModalFn);
document.getElementById('modalBackdrop')?.addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

/* ===== Modal Gallery (slider fluido) ===== */
function openModal(items, title, desc, tools, note){
  modalInner.innerHTML = '';
  modalTools.innerHTML = '';
  modalNote.textContent = '';

  // Build gallery structure
  const gallery = document.createElement('div');
  gallery.className = 'gallery';

  const track = document.createElement('div');
  track.className = 'gallery-track';
  track.setAttribute('role','region');
  track.setAttribute('aria-label','Galleria immagini');

  // Slides
  items.forEach(src=>{
    const slide = document.createElement('div');
    slide.className = 'slide';
    if (src.endsWith('.mp4')) {
      const v = document.createElement('video');
      v.src = src; v.controls = true; v.playsInline = true; v.style.maxHeight='80vh';
      slide.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src; img.loading = 'lazy'; img.alt = title || 'media';
      img.style.maxHeight = '80vh';
      slide.appendChild(img);
    }
    track.appendChild(slide);
  });

  // Nav + counter
  const nav = document.createElement('div'); nav.className = 'gallery-nav';
  const prev = document.createElement('button'); prev.className = 'gallery-btn prev'; prev.innerHTML = '‹';
  const next = document.createElement('button'); next.className = 'gallery-btn next'; next.innerHTML = '›';
  const counter = document.createElement('div'); counter.className = 'gallery-counter';

  nav.appendChild(prev); nav.appendChild(next);
  gallery.appendChild(track); gallery.appendChild(nav); gallery.appendChild(counter);
  modalInner.appendChild(gallery);

  // Tools chips
  if (tools) {
    tools.split(',').map(s=>s.trim()).filter(Boolean).forEach(t=>{
      const span = document.createElement('span');
      span.className = 'chip'; span.textContent = t; modalTools.appendChild(span);
    });
  }

  if (note) modalNote.textContent = note;
  modalInfo.textContent = title + (desc ? ' — ' + desc : '');

  // Helpers
  const slides = Array.from(track.children);
  const slideW = () => track.getBoundingClientRect().width;
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const indexFromScroll = () => Math.round(track.scrollLeft / slideW());
  const goTo = i => track.scrollTo({ left: clamp(i,0,slides.length-1)*slideW(), behavior:'smooth' });
  const updateCounter = () => { counter.textContent = `${indexFromScroll()+1} / ${slides.length}`; };

  // Wheel -> scorrimento orizzontale (trackpad)
  track.addEventListener('wheel', (e)=>{
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  }, { passive:false });

  // Drag/Swipe
  let isDown=false, startX=0, startLeft=0;
  const onDown = (e) => {
    isDown = true; track.classList.add('grabbing');
    startX = (e.touches? e.touches[0].clientX : e.clientX);
    startLeft = track.scrollLeft;
  };
  const onMove = (e) => {
    if (!isDown) return;
    const x = (e.touches? e.touches[0].clientX : e.clientX);
    track.scrollLeft = startLeft - (x - startX);
  };
  const onUp = () => {
    if (!isDown) return;
    isDown=false; track.classList.remove('grabbing');
    goTo(indexFromScroll());
  };
  track.addEventListener('mousedown', onDown);
  track.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, {passive:true});
  track.addEventListener('touchmove', onMove, {passive:true});
  track.addEventListener('touchend', onUp);

  // Bottoni
  prev.addEventListener('click', ()=> goTo(indexFromScroll()-1));
  next.addEventListener('click', ()=> goTo(indexFromScroll()+1));

  // Tastiera
  const onKey = (e)=>{
    if (!modal.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(indexFromScroll()-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(indexFromScroll()+1); }
  };
  document.addEventListener('keydown', onKey);

  // Aggiorna contatore in scroll
  let rafId=null;
  const onScroll = ()=>{
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateCounter);
  };
  track.addEventListener('scroll', onScroll);

  // Apri modale
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  updateCounter();

  // Cleanup quando chiudi
  const cleanup = ()=>{
    document.removeEventListener('keydown', onKey);
    track.removeEventListener('scroll', onScroll);
  };
  modal.addEventListener('transitionend', ()=>{ if(!modal.classList.contains('open')) cleanup(); }, { once:true });
}

/* Open modal on button */
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

/* Coming soon: “peek” su touch (opzionale, usa le classi già in CSS) */
document.querySelectorAll('.case-coming').forEach(card=>{
  card.addEventListener('touchstart', ()=> card.classList.add('peek'), {passive:true});
  card.addEventListener('touchend',   ()=> card.classList.remove('peek'));
  card.addEventListener('touchcancel',()=> card.classList.remove('peek'));
});