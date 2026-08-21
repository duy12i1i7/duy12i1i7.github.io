let allPublications = [];
let showingSelected = true;

document.addEventListener('DOMContentLoaded', function () {
  loadPublications();
  const toggleButton = document.getElementById('toggle-publications');
  if (toggleButton) toggleButton.addEventListener('click', togglePublications);
});

function loadPublications() {
  fetch('publications.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      allPublications = data.publications || [];
      renderPublications(true);
    })
    .catch(() => {
      const container = document.getElementById('publications-container');
      if (container) container.textContent = 'Publications are being updated.';
    });
}

function togglePublications() {
  showingSelected = !showingSelected;
  renderPublications(showingSelected);
  document.getElementById('toggle-publications').textContent = showingSelected ? 'Show All' : 'Show Selected';
  document.getElementById('toggle-header').textContent = showingSelected ? 'Selected Publications' : 'All Publications';
}

function renderPublications(selectedOnly) {
  const container = document.getElementById('publications-container');
  container.innerHTML = '';
  const items = selectedOnly ? allPublications.filter(pub => pub.selected === 1) : allPublications;
  items.forEach(pub => container.appendChild(createPublicationElement(pub)));
}

function isCurrentAuthor(author) {
  const normalized = author.toLowerCase().replace(/\s+/g, ' ').trim();
  const variants = [
    'dinh duy nguyen',
    'dinh-duy nguyen',
    'd. d. nguyen',
    'd.d. nguyen',
    'd. duy nguyen',
    'd.duy nguyen'
  ];
  return variants.some(name => normalized === name || normalized.includes(name));
}

function createPublicationElement(publication) {
  const item = document.createElement('div');
  item.className = 'publication-item';

  if (publication.thumbnail) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'pub-thumbnail';
    const img = document.createElement('img');
    img.src = publication.thumbnail;
    img.alt = `${publication.title} thumbnail`;
    img.onerror = () => thumbnail.remove();
    thumbnail.onclick = () => openModal(publication.thumbnail);
    thumbnail.appendChild(img);
    item.appendChild(thumbnail);
  }

  const content = document.createElement('div');
  content.className = 'pub-content';

  const title = document.createElement('div');
  title.className = 'pub-title';
  title.textContent = publication.title;
  content.appendChild(title);

  if (publication.authors && publication.authors.length) {
    const authors = document.createElement('div');
    authors.className = 'pub-authors';
    publication.authors.forEach((author, index) => {
      const span = document.createElement('span');
      span.textContent = author;
      if (isCurrentAuthor(author)) span.className = 'highlight-name';
      authors.appendChild(span);
      if (index < publication.authors.length - 1) authors.appendChild(document.createTextNode(', '));
    });
    content.appendChild(authors);
  }

  const venue = document.createElement('div');
  venue.className = 'pub-venue';
  venue.textContent = publication.venue || '';
  content.appendChild(venue);

  if (publication.links) {
    const links = document.createElement('div');
    links.className = 'pub-links';
    const labels = { pdf: 'PDF', doi: 'DOI', publisher: 'Publisher', code: 'Code', project: 'Project' };
    Object.entries(labels).forEach(([key, label]) => {
      const href = publication.links[key];
      if (href && href !== '#') {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        links.appendChild(a);
      }
    });
    content.appendChild(links);
  }

  item.appendChild(content);
  return item;
}

function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = 'block';
  setTimeout(() => modal.classList.add('show'), 10);
  modalImg.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

window.onclick = function (event) {
  const modal = document.getElementById('imageModal');
  if (event.target === modal) closeModal();
};
