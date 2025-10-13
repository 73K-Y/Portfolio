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

function openModal(type, src, title, desc){
    modalInner.innerHTML = '';
    modalInfo.textContent = title + ' — ' + desc;
    if(type === 'image'){
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        modalInner.appendChild(img);
    } else if(type === 'video'){
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.style.width = '100%';
        modalInner.appendChild(video);
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
}

function closeModalFn(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
}

projectsGrid.addEventListener('click', e => {
    const card = e.target.closest('.project');
    if(!card) return;
    const title = card.dataset.title || 'Progetto';
    const desc = card.dataset.desc || '';
    const type = card.dataset.type || 'image';
    const src = card.dataset.src || '';
    pdTitle.textContent = title;
    pdDesc.textContent = desc;
    pdMedia.innerHTML = '';
    const thumb = document.createElement(type === 'video' ? 'video' : 'img');
    thumb.src = src;
    if(type==='video'){thumb.controls=true; thumb.autoplay=true; thumb.loop=true;}
    thumb.style.width='100%';
    pdMedia.appendChild(thumb);
    openModal(type, src, title, desc);
});

projectsGrid.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const card = e.target.closest('.project');
        if(!card) return;
        const title = card.dataset.title || 'Progetto';
        const desc = card.dataset.desc || '';
        const type = card.dataset.type || 'image';
        const src = card.dataset.src || '';
        openModal(type, src, title, desc);
    }
});

closeModal.addEventListener('click', closeModalFn);
document.getElementById('modalBackdrop').addEventListener('click', closeModalFn);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModalFn(); });