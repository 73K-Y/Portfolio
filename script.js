/* ====== elementi ====== */
const projectsTrack = document.getElementById('projectsTrack');
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const backdrop = document.getElementById('modalBackdrop');
const progress = document.getElementById('progress');
const cursorGlow = document.getElementById('cursorGlow');
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ====== cursor glow segui mouse ====== */
window.addEventListener('pointermove', e=>{
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* ====== progress bar scroll ====== */
function updateProgress(){
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight);
  const pct = Math.max(0, Math.min(1, scrollTop / h));
  progress.style.width = (pct*100) + '%';
}
document.addEventListener('scroll', updateProgress);
updateProgress();

/* ====== MODAL con galleria (immagini + video) ====== */
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
      Object.assign(t.style, {width:'90px',height:'60px',objectFit:'cover',cursor:'pointer',borderRadius:'6px',opacity: u===src?'1':'.7'});
      t.addEventListener('click', ()=>{
        loadMain(u);
        bar.querySelectorAll('img,video').forEach(n=>n.style.opacity='.7');
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

function showProject(card){
  const title = card.dataset.title || 'Progetto';
  const desc = card.dataset.desc || '';
  let extras = [];
  if (card.dataset.images) extras = card.dataset.images.split('|').map(s=>s.trim());
  if (card.dataset.videos) extras = [...extras, ...card.dataset.videos.split('|').map(s=>s.trim())];
  const src = (extras[0]) || card.dataset.src || '';
  openModal(src, title, desc, extras);
}

/* ====== Interazioni: click + tastiera ====== */
(projectsTrack || document).addEventListener('click', e => {
  const card = e.target.closest('.project');
  if (!card) return;
  showProject(card);
});
(projectsTrack || document).addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' '){
    const card = e.target.closest('.project');
    if(!card) return;
    e.preventDefault();
    showProject(card);
  }
});

/* ====== Reel orizzontale: drag + wheel + frecce ====== */
if (projectsTrack) {
  let isDown = false, startX = 0, scrollLeft = 0;
  projectsTrack.addEventListener('mousedown', (e)=>{ isDown=true; startX=e.pageX - projectsTrack.offsetLeft; scrollLeft=projectsTrack.scrollLeft; projectsTrack.classList.add('grabbing'); });
  window.addEventListener('mouseup', ()=>{ isDown=false; projectsTrack.classList.remove('grabbing'); });
  projectsTrack.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX - projectsTrack.offsetLeft; const walk=(x-startX)*1.2; projectsTrack.scrollLeft = scrollLeft - walk; });
  projectsTrack.addEventListener('wheel', (e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)) { projectsTrack.scrollLeft += e.deltaY; e.preventDefault(); } }, {passive:false});
  projectsTrack.addEventListener('keydown',(e)=>{ if(e.key==='ArrowRight') projectsTrack.scrollBy({left:320,behavior:'smooth'}); if(e.key==='ArrowLeft') projectsTrack.scrollBy({left:-320,behavior:'smooth'}); });
}

/* ====== Tilt 3D + preview video on hover (come nei reel) ====== */
document.querySelectorAll('.card-3d').forEach(card=>{
  // tilt
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    card.style.transform = `rotateY(${x*6}deg) rotateX(${ -y*6 }deg)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });

  // video preview se presente
  const vids = card.dataset.videos ? card.dataset.videos.split('|').map(s=>s.trim()) : [];
  if (vids.length){
    let preview;
    card.addEventListener('mouseenter', ()=>{
      if (preview) return;
      preview = document.createElement('video');
      preview.src = vids[0];
      preview.muted = true; preview.loop = true; preview.autoplay = true; preview.playsInline = true;
      Object.assign(preview.style,{
        position:'absolute', inset:'0', width:'100%', height:'100%', objectFit:'cover',
        opacity:'0', transition:'opacity .2s ease'
      });
      card.appendChild(preview);
      requestAnimationFrame(()=> preview.style.opacity='1');
    });
    card.addEventListener('mouseleave', ()=>{
      if(!preview) return;
      preview.remove(); preview=null;
    });
  }
});

/* ====== Magnet buttons (micro-interaction) ====== */
document.querySelectorAll('.magnet').forEach(btn=>{
  btn.addEventListener('mousemove', e=>{
    const r = btn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    btn.style.transform = `translate(${x*0.08}px, ${y*0.08}px)`;
  });
  btn.addEventListener('mouseleave', ()=> btn.style.transform='translate(0,0)');
});