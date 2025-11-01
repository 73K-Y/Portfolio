/* Base refs */
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const modalTools = document.getElementById('modalTools');
const modalNote  = document.getElementById('modalNote');
const closeModal = document.getElementById('closeModal');
const backdrop   = document.getElementById('modalBackdrop');
const progress   = document.getElementById('progress');
const yearSpan   = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* Scroll progress */
function updateProgress(){
  const st = document.documentElement.scrollTop || document.body.scrollTop;
  const h  = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
  if (progress) progress.style.width = (st/h*100) + '%';
}
document.addEventListener('scroll', updateProgress, {passive:true}); updateProgress();

/* Reveal */
const io = new IntersectionObserver((entries,obs)=>{
  for (const en of entries){ if (en.isIntersecting){ en.target.classList.add('is-visible'); obs.unobserve(en.target); } }
},{threshold:0.18});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Category badges */
const catLabel = { game:'Game Art', viz:'3D Viz', motion:'Motion' };
document.querySelectorAll('.case').forEach(c=>{
  const holder = c.querySelector('.badges'); const cat = c.dataset.cat;
  if(holder && cat){ const b=document.createElement('span'); b.className=`badge ${cat}`; b.textContent=catLabel[cat]||cat; holder.appendChild(b); }
});

/* Modal gallery */
function openModal(src, title, desc, extras=[], tools=[], note=''){
  modalInner.innerHTML=''; modalTools.innerHTML=''; modalNote.textContent=''; modalInfo.textContent = `${title} — ${desc}`;
  const main=document.createElement('div'); modalInner.appendChild(main);
  const load=(url)=>{
    main.innerHTML=''; const isVideo = url.toLowerCase().endsWith('.mp4');
    const el=document.createElement(isVideo?'video':'img'); el.src=url; el.style.width='100%';
    if(isVideo){ el.controls=true; el.autoplay=true; el.loop=true; el.playsInline=true; }
    main.appendChild(el);
  };
  load(src);

  if(extras.length){
    const bar=document.createElement('div'); bar.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px';
    extras.forEach(u=>{
      const isVid=u.toLowerCase().endsWith('.mp4'); const t=document.createElement(isVid?'video':'img');
      t.src=u; if(isVid){t.muted=true;t.loop=true;t.autoplay=true;t.playsInline=true;}
      Object.assign(t.style,{width:'90px',height:'60px',objectFit:'cover',cursor:'pointer',borderRadius:'6px',opacity:u===src?'1':'.72'});
      t.addEventListener('click',()=>{load(u); bar.querySelectorAll('img,video').forEach(n=>n.style.opacity='.72'); t.style.opacity='1';});
      bar.appendChild(t);
    });
    modalInner.appendChild(bar);
  }
  if(tools.length){ tools.forEach(t=>{ const chip=document.createElement('span'); chip.className='chip'; chip.textContent=t.trim(); modalTools.appendChild(chip); }); }
  if(note) modalNote.textContent = note;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}
function closeModalFn(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
closeModal && closeModal.addEventListener('click', closeModalFn);
backdrop   && backdrop.addEventListener('click', closeModalFn);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModalFn(); });

function extrasOf(node){
  const imgs = node.dataset.images ? node.dataset.images.split('|').map(s=>s.trim()) : [];
  const vids = node.dataset.videos ? node.dataset.videos.split('|').map(s=>s.trim()) : [];
  return [...imgs, ...vids];
}
function openCase(sec){
  const title = sec.dataset.title || 'Progetto';
  const desc  = sec.dataset.desc  || '';
  const extras= extrasOf(sec);
  const src   = extras[0] || sec.dataset.src || '';
  const tools = (sec.dataset.tools || '').split(',').map(s=>s.trim()).filter(Boolean);
  const note  = sec.dataset.note || '';
  if(!src) return;
  openModal(src, title, desc, extras, tools, note);
}
document.querySelectorAll('.case').forEach(sec=>{
  const btn=sec.querySelector('.open-modal');
  btn && btn.addEventListener('click', e=>{ e.stopPropagation(); openCase(sec); });
  sec.addEventListener('click', e=>{ if(e.target.closest('button,a')) return; openCase(sec); });
});

/* Filters */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.case').forEach(c=>{ const cat=c.dataset.cat; c.style.display=(f==='all'||f===cat)?'':'none'; });
  });
});

/* ===== Animazioni leggere ===== */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Parallax (immagini senza hover; solo lieve parallax) */
const pxNodes = reduce ? [] : Array.from(document.querySelectorAll('[data-parallax]')).map(el=>{
  return { el, speed: Math.min(0.15, Math.max(-0.15, parseFloat(el.dataset.parallax)||0.08)) };
});
let ticking = false;
function parallaxRAF(){
  const vh = window.innerHeight;
  for(const n of pxNodes){
    const r = n.el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0){
      const amt = (r.top - vh/2) * n.speed;
      n.el.style.transform = `translate3d(0, ${amt.toFixed(2)}px, 0)`;
    }
  }
  ticking = false;
}
function onScroll(){ if(!ticking){ requestAnimationFrame(parallaxRAF); ticking = true; } }
if (pxNodes.length){ document.addEventListener('scroll', onScroll, {passive:true}); onScroll(); }

/* DISABILITATO Tilt 3D per evitare animazioni sulle immagini */
// (Voluto: niente rotazioni o hover sulla card)

/* Bottone magnetico (resta leggero e non tocca le immagini) */
if (!reduce){
  document.querySelectorAll('.btn.magnetic').forEach(btn=>{
    const str = 18;
    let rafId = null;
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const y = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
      if(!rafId){
        rafId = requestAnimationFrame(()=>{
          btn.style.transform = `translate(${x*str}px, ${y*str}px)`;
          rafId = null;
        });
      }
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform='translate(0,0)'; });
  });
}

/* ===== Marquee loop perfetto ===== */
(function(){
  const rail = document.querySelector('.marquee__rail');
  const track = document.querySelector('.marquee__track');
  if(!rail || !track) return;

  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden','true');
  rail.appendChild(clone);

  const checkWidth = () => {
    const totalW = track.scrollWidth + clone.scrollWidth;
    if(totalW < rail.offsetWidth * 2){
      const clone2 = track.cloneNode(true);
      clone2.setAttribute('aria-hidden','true');
      rail.appendChild(clone2);
    }
  };
  requestAnimationFrame(checkWidth);
})();