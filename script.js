/* Footer year */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* Marquee seamless loop (duplica contenuto per -50%) */
(function initMarquee(){
  const track = document.getElementById('marqueeTrack');
  if (!track || track.dataset.duped === '1') return;
  const original = track.innerHTML;
  track.innerHTML = original + original;
  track.dataset.duped = '1';
})();

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

/* Badge categoria + tools + descrizione */
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

/* Filtro categorie */
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
    glitchBurst(120);
  });
});
applyFilter('all');

/* ===== Glitch burst SOLO su interazioni (leggero) ===== */
let glitchLock = false;
function glitchBurst(ms=110){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (glitchLock) return;
  glitchLock = true;
  document.body.classList.add('glitch-burst');
  window.setTimeout(()=>{
    document.body.classList.remove('glitch-burst');
    glitchLock = false;
  }, ms);
}
document.querySelectorAll('.glitch, .btn, nav a, .pill').forEach(el=>{
  el.addEventListener('mouseenter', ()=> glitchBurst(90));
  el.addEventListener('click', ()=> glitchBurst(110));
});

/* ===== Modal (il tuo: invariato, performance ok) ===== */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const modalTools = document.getElementById('modalTools');
const modalNote = document.getElementById('modalNote');
const closeModal = document.getElementById('closeModal');

function closeModalFn(){
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  if (modalInner) modalInner.innerHTML = '';
}
closeModal?.addEventListener('click', () => { closeModalFn(); glitchBurst(100); });
document.getElementById('modalBackdrop')?.addEventListener('click', () => { closeModalFn(); glitchBurst(100); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

function openModal(items, title, desc, tools, note){
  if (!modal || !modalInner || !modalInfo || !modalTools || !modalNote) return;

  modalInner.innerHTML = '';
  modalTools.innerHTML = '';
  modalNote.textContent = '';

  const gallery = document.createElement('div');
  gallery.className = 'gallery';

  const track = document.createElement('div');
  track.className = 'gallery-track';
  track.setAttribute('role','region');
  track.setAttribute('aria-label','Galleria immagini');

  items.forEach(src=>{
    const slide = document.createElement('div');
    slide.className = 'slide';

    if (src.toLowerCase().endsWith('.mp4')) {
      const v = document.createElement('video');
      v.src = src; v.controls = true; v.playsInline = true; v.style.maxHeight='80vh';
      slide.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src; img.loading = 'lazy'; img.alt = title || 'media'; img.style.maxHeight='80vh';
      slide.appendChild(img);
    }
    track.appendChild(slide);
  });

  const nav = document.createElement('div'); nav.className = 'gallery-nav';
  const prev = document.createElement('button'); prev.className = 'gallery-btn prev'; prev.innerHTML = '‹';
  const next = document.createElement('button'); next.className = 'gallery-btn next'; next.innerHTML = '›';
  const counter = document.createElement('div'); counter.className = 'gallery-counter';

  nav.appendChild(prev); nav.appendChild(next);
  gallery.appendChild(track); gallery.appendChild(nav); gallery.appendChild(counter);
  modalInner.appendChild(gallery);

  if (tools) {
    tools.split(',').map(s=>s.trim()).filter(Boolean).forEach(t=>{
      const span = document.createElement('span');
      span.className = 'chip'; span.textContent = t; modalTools.appendChild(span);
    });
  }
  if (note) modalNote.textContent = note;
  modalInfo.textContent = title + (desc ? ' — ' + desc : '');

  const slides = Array.from(track.children);
  const slideW = () => track.getBoundingClientRect().width;
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const indexFromScroll = () => Math.round(track.scrollLeft / slideW());
  const goTo = i => track.scrollTo({ left: clamp(i,0,slides.length-1)*slideW(), behavior:'smooth' });
  const updateCounter = () => { counter.textContent = `${indexFromScroll()+1} / ${slides.length}`; };

  prev.addEventListener('click', ()=> { goTo(indexFromScroll()-1); glitchBurst(80); });
  next.addEventListener('click', ()=> { goTo(indexFromScroll()+1); glitchBurst(80); });

  track.addEventListener('scroll', () => requestAnimationFrame(updateCounter), { passive:true });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  updateCounter();
  glitchBurst(120);
}

document.getElementById('showreel')?.addEventListener('click', e=>{
  const btn = e.target.closest('.open-modal');
  if (!btn) return;
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
