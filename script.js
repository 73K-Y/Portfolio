/* ===== Auto performance switch (rispetta override manuale) ===== */
(() => {
  if (document.body.classList.contains('no-blur')) return;

  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const lowCPU = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const saveData = (navigator.connection && navigator.connection.saveData);

  if (isMobile || lowCPU || saveData) {
    document.body.classList.add('no-blur');
  }
})();

/* ========= Footer year ========= */
(() => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
})();

/* ========= Auto setup glitchable (data-text) ========= */
(() => {
  document.querySelectorAll('.glitchable').forEach(el => {
    const txt = (el.textContent || '').trim();
    if (!el.dataset.text && txt) el.dataset.text = txt;
  });
})();

/* ========= Glitch burst (leggero) ========= */
let glitchLock = false;
function glitchBurst(ms = 110){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || glitchLock) return;
  glitchLock = true;
  document.body.classList.add('glitch-burst');
  window.setTimeout(() => {
    document.body.classList.remove('glitch-burst');
    glitchLock = false;
  }, ms);
}

(() => {
  const targets = document.querySelectorAll('.glitchable, nav a, .btn');
  targets.forEach(el => {
    el.addEventListener('click', () => glitchBurst(110), { passive: true });
  });
})();

/* ========= Marquee seamless loop (duplica una volta) ========= */
(() => {
  const track = document.getElementById('marqueeTrack');
  if (!track || track.dataset.duped === '1') return;
  track.innerHTML = track.innerHTML + track.innerHTML;
  track.dataset.duped = '1';
})();

/* ========= Reveal on scroll (IntersectionObserver) ========= */
(() => {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  revealEls.forEach(el => io.observe(el));
})();

/* ========= Badge categoria + tools + descrizione ========= */
(() => {
  document.querySelectorAll('.case').forEach(card=>{
    const badges = card.querySelector('.badges');
    const descEl = card.querySelector('.desc');
    const cat = (card.dataset.cat || '').trim();
    const tools = (card.dataset.tools || '').split(',').map(s=>s.trim()).filter(Boolean);

    if (badges) {
      badges.innerHTML = '';
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
})();

/* ========= Filtro categorie ========= */
(() => {
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
      glitchBurst(100);
    }, { passive: true });
  });

  applyFilter('all');
})();

/* ========= Modal (galleria più leggera, senza numeri/counter) ========= */
(() => {
  const modal = document.getElementById('modal');
  const modalInner = document.getElementById('modalInner');
  const modalInfo = document.getElementById('modalInfo');
  const modalTools = document.getElementById('modalTools');
  const modalNote = document.getElementById('modalNote');
  const closeModal = document.getElementById('closeModal');
  const backdrop = document.getElementById('modalBackdrop');

  if (!modal || !modalInner || !modalInfo || !modalTools || !modalNote) return;

  function closeModalFn(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    modalInner.innerHTML = '';
  }

  closeModal?.addEventListener('click', ()=>{ closeModalFn(); glitchBurst(70); }, { passive: true });
  backdrop?.addEventListener('click', ()=>{ closeModalFn(); glitchBurst(70); }, { passive: true });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

  function openModal(items, title, desc, tools, note){
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
        v.src = src;
        v.controls = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.style.maxHeight = '80vh';
        slide.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = title || 'media';
        img.style.maxHeight = '80vh';
        slide.appendChild(img);
      }
      track.appendChild(slide);
    });

    const nav = document.createElement('div'); nav.className = 'gallery-nav';
    const prev = document.createElement('button'); prev.className = 'gallery-btn prev'; prev.type = 'button'; prev.innerHTML = '‹';
    const next = document.createElement('button'); next.className = 'gallery-btn next'; next.type = 'button'; next.innerHTML = '›';

    nav.appendChild(prev); nav.appendChild(next);
    gallery.appendChild(track); gallery.appendChild(nav);
    modalInner.appendChild(gallery);

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

    const slides = Array.from(track.children);
    const slideW = () => track.getBoundingClientRect().width;
    const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
    const indexFromScroll = () => Math.round(track.scrollLeft / Math.max(slideW(), 1));
    const goTo = i => track.scrollTo({ left: clamp(i,0,slides.length-1)*slideW(), behavior:'smooth' });

    // drag (mouse/touch) leggero
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

    track.addEventListener('mousedown', onDown, { passive:true });
    track.addEventListener('mousemove', onMove, { passive:true });
    window.addEventListener('mouseup', onUp, { passive:true, once:true });

    track.addEventListener('touchstart', onDown, {passive:true});
    track.addEventListener('touchmove', onMove, {passive:true});
    track.addEventListener('touchend', onUp, {passive:true});

    prev.addEventListener('click', ()=> { goTo(indexFromScroll()-1); glitchBurst(60); }, { passive:true });
    next.addEventListener('click', ()=> { goTo(indexFromScroll()+1); glitchBurst(60); }, { passive:true });

    const onKey = (e)=>{
      if (!modal.classList.contains('open')) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(indexFromScroll()-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(indexFromScroll()+1); }
    };
    document.addEventListener('keydown', onKey, { passive:false });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    glitchBurst(90);
  }

  /* Open modal on button (delegation) */
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
  }, { passive:true });

  /* Coming soon: peek su touch */
  document.querySelectorAll('.case-coming').forEach(card=>{
    card.addEventListener('touchstart', ()=> card.classList.add('peek'), {passive:true});
    card.addEventListener('touchend',   ()=> card.classList.remove('peek'), {passive:true});
    card.addEventListener('touchcancel',()=> card.classList.remove('peek'), {passive:true});
  });
})();