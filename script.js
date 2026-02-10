/* Footer year */
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

/* Reveal */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
},{threshold:.1});
revealEls.forEach(el=>io.observe(el));

/* ===== Glitch burst SOLO su interazioni ===== */
let lock=false;
function glitchBurst(ms=120){
  if(lock) return;
  lock=true;
  document.body.classList.add('glitch-burst');
  setTimeout(()=>{
    document.body.classList.remove('glitch-burst');
    lock=false;
  },ms);
}
document.querySelectorAll('.glitch, .btn, nav a').forEach(el=>{
  el.addEventListener('mouseenter',()=>glitchBurst(90));
  el.addEventListener('click',()=>glitchBurst(120));
});
