// ----------------- util -----------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
$('#year').textContent = new Date().getFullYear();

// ----------------- reveal on scroll -----------------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
$$('.reveal').forEach(el => io.observe(el));

// ----------------- filter buttons -----------------
const filterBtns = $$('.filter-btn');
const cards = $$('.case');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(card => {
      const match = f === 'all' || card.dataset.cat === f;
      card.style.display = match ? '' : 'none';
    });
  });
});

// ----------------- badges auto -----------------
cards.forEach(card => {
  const box = card.querySelector('.badges');
  if (!box) return;
  const cat = card.dataset.cat;
  const tools = (card.dataset.tools || '').split(',').map(s => s.trim()).filter(Boolean);
  if (cat) {
    const b = document.createElement('span');
    b.className = 'badge ' + (cat === 'game' ? 'game' : 'viz');
    b.textContent = cat === 'game' ? 'Game Art' : '3D Viz';
    box.appendChild(b);
  }
  tools.forEach(t => {
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = t;
    box.appendChild(b);
  });
});

// ----------------- modal gallery -----------------
const modal = $('#modal');
const modalInner = $('#modalInner');
const modalInfo = $('#modalInfo');
const modalTools = $('#modalTools');
const modalNote = $('#modalNote');

function openModalForCard(card){
  // Evita modale per i "coming soon"
  if (card.classList.contains('case-coming')) return;

  modalInner.innerHTML = '';
  modalTools.innerHTML = '';
  modalNote.textContent = '';

  const title = card.dataset.title || '';
  const desc  = card.dataset.desc || '';
  const tools = (card.dataset.tools || '').split(',').map(s => s.trim()).filter(Boolean);
  const note  = card.dataset.note || '';

  const images = (card.dataset.images || '').split('|').map(s => s.trim()).filter(Boolean);
  const videos = (card.dataset.videos || '').split('|').map(s => s.trim()).filter(Boolean);

  // media
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src; img.loading = 'lazy';
    modalInner.appendChild(img);
  });
  videos.forEach(src => {
    const video = document.createElement('video');
    video.src = src; video.controls = true; video.autoplay = true; video.loop = true;
    video.style.width = '100%';
    modalInner.appendChild(video);
  });

  // tools chips
  tools.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = t;
    modalTools.appendChild(chip);
  });

  if (note) modalNote.textContent = note;
  modalInfo.textContent = `${title} — ${desc}`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

$('#closeModal').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

// open via button or click on card
cards.forEach(card => {
  const btn = card.querySelector('.open-modal');
  card.addEventListener('click', e => {
    // se clic su bottone, ok; se clic su overlay coming, ignora
    if (card.classList.contains('case-coming')) return;
    // evita che click su bottoni/links diversi dal tasto apra doppiamente
    const targetBtn = e.target.closest('.open-modal');
    if (!targetBtn && btn) return; // apri solo col bottone se presente
    openModalForCard(card);
  });
  if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); openModalForCard(card); });
});