const projectsGrid = document.getElementById('projectsGrid');
const pdTitle = document.getElementById('pdTitle');
const pdDesc = document.getElementById('pdDesc');
const pdMedia = document.getElementById('pdMedia');
const modal = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');
const yearSpan = document.getElementById('year');

yearSpan.textContent = new Date().getFullYear();

function openModal(src, title, desc, extras = []) {
  modalInner.innerHTML = '';
  modalInfo.textContent = title + ' — ' + desc;

  const type = src.endsWith('.mp4') ? 'video' : 'image';
  const main = document.createElement(type === 'video' ? 'video' : 'img');
  main.src = src;
  main.style.width = '100%';
  if (type === 'video') {
    main.controls = true;
    main.autoplay = true;
    main.loop = true;
  }
  modalInner.appendChild(main);

  if (extras.length > 0) {
    const thumbBar = document.createElement('div');
    thumbBar.className = 'thumb-bar';
    thumbBar.style.display = 'flex';
    thumbBar.style.flexWrap = 'wrap';
    thumbBar.style.gap = '8px';
    thumbBar.style.marginTop = '10px';

    extras.forEach(mediaSrc => {
      const thumbType = mediaSrc.endsWith('.mp4') ? 'video' : 'image';
      let thumb = thumbType === 'video' ? document.createElement('video') : document.createElement('img');
      thumb.src = mediaSrc;
      if (thumbType === 'video') {
        thumb.muted = true;
        thumb.loop = true;
        thumb.autoplay = true;
      }
      thumb.style.width = '90px';
      thumb.style.height = '60px';
      thumb.style.objectFit = 'cover';
      thumb.style.cursor = 'pointer';
      thumb.style.borderRadius = '6px';
      thumb.style.opacity = mediaSrc === src ? '1' : '0.7';
      thumb.addEventListener('click', () => {
        const newType = mediaSrc.endsWith('.mp4') ? 'video' : 'image';
        const newMain = document.createElement(newType === 'video' ? 'video' : 'img');
        newMain.src = mediaSrc;
        newMain.style.width = '100%';
        if (newType === 'video') {
          newMain.controls = true;
          newMain.autoplay = true;
          newMain.loop = true;
        }
        modalInner.replaceChild(newMain, main);
        main.src = mediaSrc; // aggiorna riferimento principale
        thumbBar.querySelectorAll('img,video').forEach(t => t.style.opacity = '0.7');
        thumb.style.opacity = '1';
      });
      thumbBar.appendChild(thumb);
    });

    modalInner.appendChild(thumbBar);
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModalFn() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function showProject(card) {
  const title = card.dataset.title || 'Progetto';
  const desc = card.dataset.desc || '';
  let extras = [];

  if (card.dataset.images) extras = card.dataset.images.split('|').map(x => x.trim());
  if (card.dataset.videos) extras = [...extras, ...card.dataset.videos.split('|').map(x => x.trim())];

  let src = card.dataset.images ? card.dataset.images.split('|')[0] :
            card.dataset.videos ? card.dataset.videos.split('|')[0] : '';

  openModal(src, title, desc, extras);
}

projectsGrid.addEventListener('click', e => {
  const card = e.target.closest('.project');
  if (!card) return;
  showProject(card);
});

projectsGrid.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const card = e.target.closest('.project');
    if (!card) return;
    showProject(card);
  }
});

closeModal.addEventListener('click', closeModalFn);
document.getElementById('modalBackdrop').addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalFn();
});