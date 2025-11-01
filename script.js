const projectsTrack = document.getElementById('projectsTrack');
const projectsGrid = document.getElementById('projectsGrid') || projectsTrack; // fallback
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const backdrop = document.getElementById('modalBackdrop');
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ---------- MODAL con galleria (immagini + video) ---------- */
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
    if (isVideo) { el.controls = true; el.autoplay = true; el.loop = true; }
    mainWrap.appendChild(el);
  };

  loadMain(src);

  // Thumbs
  if (extras.length) {
    const bar = document.createElement('div');
    bar.className = 'thumb-bar';
    bar.style.display = 'flex';
    bar.style.flexWrap = 'wrap';
    bar.style.gap = '8px';
    bar.style.marginTop = '10px';

    extras.forEach(u => {
      const isVid = u.toLowerCase().endsWith('.mp4');
      const t = document.createElement(isVid ? 'video' : 'img');
      t.src = u;
      if (isVid) { t.muted = true; t.loop = true; t.autoplay = true; }
      Object.assign(t.style, {
        width:'90px',height:'60px',objectFit:'cover',cursor:'pointer',borderRadius:'6px',opacity: u===src?'1':'0.7'
      });
      t.addEventListener('click', () => {
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
  // extras: immagini e poi video (se presenti)
  let extras = [];
  if (card.dataset.images) extras = card.dataset.images.split('|').map(s=>s.trim());
  if (card.dataset.videos) extras = [...extras, ...card.dataset.videos.split('|').map(s=>s.trim())];
  const src = (extras[0]) || card.dataset.src || '';
  openModal(src, title, desc, extras);
}

/* ---------- Interazioni: click + tastiera ---------- */
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

/* ---------- Reel orizzontale: drag + wheel + frecce ---------- */
if (projectsTrack) {
  let isDown = false, startX = 0, scrollLeft = 0;
  projectsTrack.addEventListener('mousedown', (e)=>{ isDown=true; startX=e.pageX - projectsTrack.offsetLeft; scrollLeft=projectsTrack.scrollLeft; projectsTrack.classList.add('grabbing'); });
  window.addEventListener('mouseup', ()=>{ isDown=false; projectsTrack.classList.remove('grabbing'); });
  projectsTrack.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX - projectsTrack.offsetLeft; const walk = (x - startX)*1.2; projectsTrack.scrollLeft = scrollLeft - walk; });
  // wheel -> scroll X
  projectsTrack.addEventListener('wheel', (e)=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)) { projectsTrack.scrollLeft += e.deltaY; e.preventDefault(); } }, {passive:false});
  // keyboard arrows
  projectsTrack.addEventListener('keydown',(e)=>{ if(e.key==='ArrowRight') projectsTrack.scrollBy({left:300,behavior:'smooth'}); if(e.key==='ArrowLeft') projectsTrack.scrollBy({left:-300,behavior:'smooth'}); });
}

/* ---------- Tilt 3D + preview video on hover ---------- */
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
      preview.style.position='absolute'; preview.style.inset='0'; preview.style.width='100%'; preview.style.height='100%';
      preview.style.objectFit='cover'; preview.style.opacity='0'; preview.style.transition='opacity .2s ease';
      card.appendChild(preview);
      requestAnimationFrame(()=> preview.style.opacity='1');
    });
    card.addEventListener('mouseleave', ()=>{
      if(!preview) return;
      preview.remove(); preview=null;
    });
  }
});

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('is-visible'); io.unobserve(en.target); }
  });
},{threshold:.2});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));