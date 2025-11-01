/* Riferimenti */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const backdrop = document.getElementById('modalBackdrop');
const progress = document.getElementById('progress');
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* Scroll progress (leggero) */
function updateProgress(){
  const st = document.documentElement.scrollTop || document.body.scrollTop;
  const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
  if (progress) progress.style.width = (st/h*100) + '%';
}
document.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

/* Reveal on scroll (economico) */
const revealIO = new IntersectionObserver((entries,obs)=>{
  entries.forEach(en=>{
    if(!en.isIntersecting) return;
    en.target.classList.add('is-visible');
    obs.unobserve(en.target);
  });
},{threshold:0.18});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

/* Modal gallery con sottominiature (immagini + video) */
function openModal(src, title, desc, extras = []) {
  modalInner.innerHTML = '';
  modalInfo.textContent = `${title} — ${desc}`;

  const mainWrap = document.createElement('div');
  modalInner.appendChild(mainWrap);

  const loadMain = (url) => {
    mainWrap.innerHTML = '';
    const isVideo = url.toLowerCase().endsWith('.mp4');
    const el = document.createElement(isVideo ? 'video' : 'img');
    el.src = url;
    el.style.width = '100%';
    if (isVideo) { el.controls = true; el.autoplay = true; el.loop = true; el.playsInline = true; }
    mainWrap.appendChild(el);
  };
  loadMain(src);

  if (extras.length) {
    const bar = document.createElement('div');
    bar.className = 'thumb-bar';
    Object.assign(bar.style, {display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'10px'});
    extras.forEach(u=>{
      const isVid = u.toLowerCase().endsWith('.mp4');
      const t = document.createElement(isVid ? 'video' : 'img');
      t.src = u;
      if (isVid){ t.muted = true; t.loop = true; t.autoplay = true; t.playsInline = true; }
      Object.assign(t.style, {width:'90px',height:'60px',objectFit:'cover',cursor:'pointer',borderRadius:'6px',opacity: u===src?'1':'.72'});
      t.addEventListener('click', ()=>{
        loadMain(u);
        bar.querySelectorAll('img,video').forEach(n=>{ n.style.opacity='.72'; n.classList.remove('is-active'); });
        t.style.opacity = '1'; t.classList.add('is-active');
      });
      bar.appendChild(t);
    });
    setTimeout(()=>{ const first = bar.querySelector('img,video'); first && first.classList.add('is-active'); },0);
    modalInner.appendChild(bar);
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function closeModalFn(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
closeModal && closeModal.addEventListener('click', closeModalFn);
backdrop && backdrop.addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

/* Helpers per gallery */
function gatherExtras(node){
  const imgs = node.dataset.images ? node.dataset.images.split('|').map(s=>s.trim()) : [];
  const vids = node.dataset.videos ? node.dataset.videos.split('|').map(s=>s.trim()) : [];
  return [...imgs, ...vids];
}
function openCaseSection(sec){
  const title = sec.dataset.title || 'Progetto';
  const desc  = sec.dataset.desc  || '';
  const extras = gatherExtras(sec);
  const src = extras[0] || sec.dataset.src || '';
  if(!src) return;
  openModal(src, title, desc, extras);
}

/* Bind alle case */
document.querySelectorAll('.case').forEach(sec=>{
  const btn = sec.querySelector('.open-modal');
  btn && btn.addEventListener('click', (e)=>{ e.stopPropagation(); openCaseSection(sec); });
  sec.addEventListener('click', (e)=>{
    if (e.target.closest('button, a')) return;
    openCaseSection(sec);
  });
});

/* ===== Glitch orchestrator (burst breve, leggero) ===== */
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  const body = document.body;
  function burst(){
    // random piccolo offset per le cover (CSS legge --tx/--ty)
    const tx = (Math.random() * 2 - 1).toFixed(2) + 'px';
    const ty = (Math.random() * 2 - 1).toFixed(2) + 'px';
    body.style.setProperty('--tx', tx);
    body.style.setProperty('--ty', ty);
    body.classList.add('glitch-active');
    setTimeout(()=>{
      body.classList.remove('glitch-active');
      body.style.removeProperty('--tx');
      body.style.removeProperty('--ty');
    }, 260); // durata burst
  }
  // burst casuali ogni 6–10 secondi
  (function schedule(){
    const next = 6000 + Math.random()*4000;
    setTimeout(()=>{ burst(); schedule(); }, next);
  })();
}