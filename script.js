/* Refs */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const backdrop = document.getElementById('modalBackdrop');
const progress = document.getElementById('progress');
const cursorGlow = document.getElementById('cursorGlow');
const yearSpan = document.getElementById('year');
const perfToggle = document.getElementById('perfToggle');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ---- Modalità ridotta: init/auto ---- */
const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const weakDevice =
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

const savedPref = localStorage.getItem('reducedMode');
const startReduced = savedPref === '1' || (savedPref === null && (mqReduced || weakDevice));
if (startReduced) document.body.classList.add('reduced');

function setReduced(on){
  document.body.classList.toggle('reduced', !!on);
  localStorage.setItem('reducedMode', on ? '1' : '0');
}

/* Toggle manuale */
if (perfToggle){
  perfToggle.addEventListener('click', ()=>{
    const on = !document.body.classList.contains('reduced');
    setReduced(on);
  });
}

/* Cursor glow (solo se non ridotto) */
window.addEventListener('pointermove', e=>{
  if (!cursorGlow || document.body.classList.contains('reduced')) return;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* Scroll progress */
function updateProgress(){
  const st = document.documentElement.scrollTop || document.body.scrollTop;
  const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
  progress && (progress.style.width = (st/h*100) + '%');
}
document.addEventListener('scroll', updateProgress);
updateProgress();

/* Reveal on scroll */
const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(!en.isIntersecting) return;
    en.target.classList.add('is-visible');
    revealIO.unobserve(en.target);
  });
},{threshold:0.18});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

/* Modal gallery */
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

/* Tilt/parallax con throttle (disattivato se ridotto) */
(function tilt(){
  if (document.body.classList.contains('reduced')) return;
  let ticking = false;
  document.querySelectorAll('.case').forEach(sec=>{
    sec.addEventListener('mousemove', (e)=>{
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        const r = sec.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        const dx = (e.clientX - cx) / (r.width/2);
        const dy = (e.clientY - cy) / (r.height/2);
        sec.style.setProperty('--rx', (-dy*3.5).toFixed(2) + 'deg');
        sec.style.setProperty('--ry', ( dx*3.5).toFixed(2) + 'deg');
        ticking = false;
      });
    });
    sec.addEventListener('mouseleave', ()=>{
      sec.style.setProperty('--rx','0deg'); sec.style.setProperty('--ry','0deg');
    });
  });
})();

/* Particelle: solo se non ridotto (meno numerose) */
(function spawnParticles(){
  if (document.body.classList.contains('reduced')) return;
  const layer = document.getElementById('fxLayer');
  if(!layer) return;
  const COUNT = 16;
  const vw = () => window.innerWidth, vh = () => window.innerHeight;

  for(let i=0;i<COUNT;i++){
    const p = document.createElement('div');
    p.className = 'fx-particle';
    reset(p, true);
    layer.appendChild(p);
    p.addEventListener('animationiteration', ()=> reset(p, false));
  }
  function reset(el, initial){
    const x = Math.random() * vw();
    const y = initial ? (Math.random() * vh()) : vh() + 40;
    const size = 4 + Math.random()*4;
    const dx = (Math.random()*40 - 20) + 'px';
    const dur = (18 + Math.random()*12) + 's';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--dur', dur);
  }
})();