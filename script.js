const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const backdrop = document.getElementById('modalBackdrop');
const progress = document.getElementById('progress');
const cursorGlow = document.getElementById('cursorGlow');
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

window.addEventListener('pointermove', e=>{
  if (!cursorGlow) return;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

function updateProgress(){
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight);
  const pct = Math.max(0, Math.min(1, scrollTop / h));
  if (progress) progress.style.width = (pct*100) + '%';
}
document.addEventListener('scroll', updateProgress);
updateProgress();

const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(!en.isIntersecting) return;
    en.target.classList.add('is-visible');
    revealIO.unobserve(en.target);
  });
},{threshold:0.18});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

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
        bar.querySelectorAll('img,video').forEach(n=>n.style.opacity='.72');
        t.style.opacity = '1';
      });
      bar.appendChild(t);
    });
    modalInner.appendChild(bar);
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function closeModalFn(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}
if (closeModal) closeModal.addEventListener('click', closeModalFn);
if (backdrop) backdrop.addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });

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

document.querySelectorAll('.case').forEach(sec=>{
  const btn = sec.querySelector('.open-modal');
  if (btn) btn.addEventListener('click', (e)=>{ e.stopPropagation(); openCaseSection(sec); });
  sec.addEventListener('click', (e)=>{
    const isButton = e.target.closest('button, a');
    if (isButton) return;
    openCaseSection(sec);
  });
});

document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('mousemove', e=>{
    if (!b.classList.contains('magnet')) return;
    const r = b.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    b.style.transform = `translate(${x*0.08}px, ${y*0.08}px)`;
  });
  b.addEventListener('mouseleave', ()=> b.style.transform='translate(0,0)');
  b.addEventListener('mousedown', ()=> b.style.transform='scale(0.985)');
  ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev =>
    b.addEventListener(ev, ()=> b.style.transform=''));
});