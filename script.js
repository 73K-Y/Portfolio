// Anno footer
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Reveal on scroll (leggero)
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

// Filtro categorie
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

// Modal semplice (immagini + video)
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

// Click sulle card .case
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

/* === BADGES auto dai data-tools === */
document.querySelectorAll('.case').forEach(card=>{
  const tools = (card.dataset.tools || '').split(',').map(s=>s.trim()).filter(Boolean);
  const box = card.querySelector('.badges');
  if (box && tools.length){
    box.innerHTML = '';
    tools.forEach(t=>{
      const b = document.createElement('span');
      b.className = 'badge ' + (card.dataset.cat === 'game' ? 'game' : 'viz');
      b.textContent = t;
      box.appendChild(b);
    });
  }
});

/* === Ripple leggerissimo sui .btn === */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.btn');
  if(!btn) return;
  const r = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.position='absolute';
  r.style.inset='0';
  r.style.borderRadius='inherit';
  r.style.pointerEvents='none';
  r.style.maskImage = 'radial-gradient(circle at '+(e.clientX-rect.left)+'px '+(e.clientY-rect.top)+'px, rgba(0,0,0,1) 0, rgba(0,0,0,0) '+(size/2)+'px)';
  r.style.background='rgba(255,255,255,.18)';
  r.style.opacity='0';
  r.style.transition='opacity .45s ease';
  btn.style.position='relative';
  btn.appendChild(r);
  requestAnimationFrame(()=>{ r.style.opacity='1'; });
  setTimeout(()=>{ r.style.opacity='0'; setTimeout(()=>r.remove(),300); },120);
});

/* === Apri le .case anche da tastiera === */
document.addEventListener('keydown', (e)=>{
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const focus = document.activeElement;
  const card = focus?.closest?.('.case');
  if(!card) return;
  e.preventDefault();
  const title = card.dataset.title || 'Progetto';
  const desc  = card.dataset.desc || '';
  const tools = card.dataset.tools || '';
  const note  = card.dataset.note  || '';
  const images = (card.dataset.images || '').split('|').map(s=>s.trim()).filter(Boolean);
  const videos = (card.dataset.videos || '').split('|').map(s=>s.trim()).filter(Boolean);
  const items = [...images, ...videos];
  if(items.length) openModal(items, title, desc, tools, note);
});