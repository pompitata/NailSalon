let currentPage = 1;
const totalPages = 50;
const uniqueImages = Array.from({length: 20}, (_, i) => `images/work-${i + 1}.jpg`);

function getShuffledIndexes(page) {
    const seed = page * 12345;
    const arr = Array.from({length: 20}, (_, i) => i);

    for (let i = arr.length - 1; i > 0; i--) {
        const pseudoRandom = Math.sin(seed + i) * 10000;
        const j = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateGallery(page) {
    currentPage = page;
    const indexes = getShuffledIndexes(page);
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = '';

    indexes.forEach(i => {
        const img = document.createElement('img');
        img.src = uniqueImages[i % 20];
        img.alt = `Работа ${i + 1}`;
        img.addEventListener('click', () => openFullscreen(img.src));
        galleryGrid.appendChild(img);
    });

    window.history.replaceState(null, null, `?page=${page}`);
    document.getElementById('pageInput').value = page;
}

function handlePagination(newPage) {
    newPage = Math.max(1, Math.min(totalPages, newPage));
    if (newPage !== currentPage) {
        generateGallery(newPage);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') handlePagination(currentPage - 1);
    if (e.key === 'ArrowRight') handlePagination(currentPage + 1);
});

document.getElementById('prevBtn').addEventListener('click', () => handlePagination(currentPage - 1));
document.getElementById('nextBtn').addEventListener('click', () => handlePagination(currentPage + 1));

document.getElementById('pageInput').addEventListener('change', (e) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page)) handlePagination(page);
});

function openFullscreen(src) {
    const modal = document.getElementById('fullscreenModal');
    const img = document.getElementById('fullscreenImage');
    img.src = src;
    modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('fullscreenModal').style.display = 'none';
});

// Initial load
const urlParams = new URLSearchParams(window.location.search);
generateGallery(parseInt(urlParams.get('page')) || 1);