const API_URL = 'https://jsonplaceholder.typicode.com';
const ITEMS_PER_PAGE = 10;

let paginaAtual = 1;
let localPhotos = JSON.parse(localStorage.getItem('imagens')) || [];
let allPhotos = [...localPhotos];

function alteraTab(tabId) {
  document.querySelectorAll('main section').forEach(section => {
    section.classList.add('d-none');
  });

  document.getElementById(tabId).classList.remove('d-none');

  switch (tabId) {
    case 'listar':
      fetchImages();
      break;
    case 'alterar':
      populateDropdown('id-alterado');
      break;
    case 'deletar':
      populateDropdown('id-excluido');
      break;
  }
}

async function fetchImages(page = 1) {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const remainingSlots = calculatePagination(page);

  if (remainingSlots <= 0) {
    montaTable(allPhotos, startIndex);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/photos?_limit=${remainingSlots}&_page=${page}`);
    if (!response.ok) throw new Error('Erro ao buscar imagens');

    const newImages = await response.json();
    allPhotos = [...localPhotos, ...newImages];

    montaTable(allPhotos, startIndex);
  } catch (error) {
    alert(error.message);
  }
}

function montaTable(photos, startIndex) {
  const tableBody = document.getElementById('listagemFotos');
  tableBody.innerHTML = '';
  tableBody.innerHTML = photos
    .slice(startIndex, startIndex + ITEMS_PER_PAGE)
    .map(photo => `
      <tr>
        <td>${photo.id}</td>
        <td>${photo.title}</td>
        <td><img src="${photo.url}" class="img-thumbnail" width="50"></td>
      </tr>
    `)
    .join('');
}

function calculatePagination(page) {
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  return ITEMS_PER_PAGE - localPhotos.slice(startIndex, startIndex + ITEMS_PER_PAGE).length;
}

function populateDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = allPhotos
    .map(photo => `<option value="${photo.id}">ID: ${photo.id} | ${photo.title}</option>`);
}

async function addImage(event) {
  event.preventDefault();

  const title = document.getElementById('titulo').value;
  const url = document.getElementById('url').value;

  try {
    const response = await fetch(`${API_URL}/photos`, {
      method: 'POST',
      body: JSON.stringify({ title, url }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Erro ao incluir imagem');

    const newImage = await response.json();
    newImage.id = Math.random();

    localPhotos.push(newImage);
    localStorage.setItem('imagens', JSON.stringify(localPhotos));

    alert('Imagem adicionada com sucesso');
  } catch (error) {
    alert(error.message);
  }
}

async function updateImage() {

  const id = Number(document.getElementById('id-alterado').value);
  const title = document.getElementById('titulo-alterado').value;

  const imageIndex = allPhotos.findIndex(photo => photo.id === id);
  const localImageIndex = localPhotos.findIndex(photo => photo.id === id);
  if ((imageIndex === -1) && (localImageIndex === -1)) {
    return alert('Imagem não encontrada');
  } else if (localImageIndex !== -1) {
    localPhotos[localImageIndex].title = title;
    localStorage.setItem('imagens', JSON.stringify(localPhotos));
  } else if(imageIndex !== -1) {
    try {
    const response = await fetch(`${API_URL}/photos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        title,
        url: allPhotos[imageIndex].url,
        thumbnailUrl: allPhotos[imageIndex].thumbnailUrl
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Erro ao alterar imagem');

    console.log(response);

    alert('Imagem alterada com sucesso');
  } catch (error) {
    alert(error.message);
  }
}
  }

  

async function deleteImage() {

  const id = Number(document.getElementById('id-excluido').value);
  localPhotos = localPhotos.filter(photo => photo.id !== id);

  localStorage.setItem('imagens', JSON.stringify(localPhotos));
  alert('Imagem excluída com sucesso');
}

// ----------------------- Eventos -----------------------
document.addEventListener('DOMContentLoaded', () => {
  fetchImages();
});

document.getElementById('pagina-anterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    fetchImages(paginaAtual);
  }
});

document.getElementById('pagina-proxima').addEventListener('click', () => {
  paginaAtual++;
  fetchImages(paginaAtual);
});

document.getElementById('formulario-inserir').addEventListener('submit', addImage);
document.getElementById('formulario-alterar').addEventListener('submit', updateImage);
document.getElementById('formulario-deletar').addEventListener('submit', deleteImage);
