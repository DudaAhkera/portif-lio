const container = document.getElementById('characters');
const visibleCards = 4;
const cardsPerCarousel = 10;

async function fetchCharacters() {
  try {
    const response = await fetch('https://apisimpsons.fly.dev/api/personajes?limit=100');
    const data = await response.json();
    allCharacters = data.docs;
    createCarousels(data.docs);
  } catch (error) {
    container.innerHTML = `<p>Erro ao carregar os personagens 😢</p>`;
    console.error('Erro ao buscar API:', error);
  }
}

function createCarousels(characters) {
  const totalCarousels = Math.ceil(characters.length / cardsPerCarousel);
  container.innerHTML = '';

  for (let i = 0; i < totalCarousels; i++) {
    const slice = characters.slice(i * cardsPerCarousel, (i + 1) * cardsPerCarousel);
    const carouselId = `carousel-${i}`;
    const indicatorsId = `indicators-${i}`;

    const carouselHTML = `
      <div class="carousel-container">
        <div class="carousel-track" id="${carouselId}">
          ${slice.map(char => `
            <div class="character-card">
              <div class="card-header">
                <h3>${char.Nombre}</h3>
                <span class="heart">♥</span>
              </div>
              <img src="${char.Imagen}" alt="${char.Nombre}">
              <div class="card-description">
                <p><strong>Ocupação:</strong> ${char.Ocupacion || 'Desconhecida'}</p>
                <p><strong>História:</strong> "${char.Historia}"</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="carousel-indicators" id="${indicatorsId}"></div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', carouselHTML);
    initCarousel(carouselId, indicatorsId, slice.length);
  }

  document.querySelectorAll('.heart').forEach(heart => {
    const parentCard = heart.closest('.character-card');
    const name = parentCard.querySelector('h3').textContent;
    const id = allCharacters.find(c => c.Nombre === name)?._id;
  
    if (!id) return;
  
    // Marcar corações já salvos
    const saved = JSON.parse(localStorage.getItem('simpsonsFavorites')) || [];
    if (saved.includes(id)) {
      heart.classList.add('filled');
    }
  
    heart.addEventListener('click', () => {
      heart.classList.toggle('filled');
  
      const favorites = JSON.parse(localStorage.getItem('simpsonsFavorites')) || [];
  
      if (heart.classList.contains('filled')) {
        favorites.push(id);
      } else {
        const index = favorites.indexOf(id);
        if (index > -1) favorites.splice(index, 1);
      }
  
      localStorage.setItem('simpsonsFavorites', JSON.stringify(favorites));
    });
  });
  
}

function initCarousel(trackId, indicatorsId, totalCards) {
  const carousel = document.getElementById(trackId);
  const indicators = document.getElementById(indicatorsId);

  const totalPages = Math.ceil(totalCards / visibleCards);
  let currentPage = 0;
  let autoScroll = true;

  const updateCarousel = () => {
    const card = carousel.querySelector('.character-card');
    if (!card) return;
    const cardWidth = card.offsetWidth + 16; 
    const offset = currentPage * cardWidth * visibleCards;
    carousel.style.transform = `translateX(-${offset}px)`;

    indicators.querySelectorAll('button').forEach((btn, i) => {
      btn.classList.toggle('active', i === currentPage);
    });
  };

  // Criar os botões (bolinhas)
  for (let i = 0; i < totalPages; i++) {
    const button = document.createElement('button');
    button.classList.add('indicator-btn');
    if (i === 0) button.classList.add('active');
    button.addEventListener('click', () => {
      currentPage = i;
      autoScroll = false;
      updateCarousel();
    });
    indicators.appendChild(button);
  }

  // Scroll automático
  setInterval(() => {
    if (!autoScroll) return;
    currentPage = (currentPage + 1) % totalPages;
    updateCarousel();
  }, 3000); // troca a cada 3 segundos

  // Pausar se o usuário clicar
  carousel.addEventListener('click', () => {
    autoScroll = false;
  });

  setTimeout(updateCarousel, 100);
}

fetchCharacters();

let allCharacters = [];
let showingFavorites = false;

const favoritesBtn = document.createElement('button');
favoritesBtn.id = 'favorites-toggle';
favoritesBtn.textContent = '❤️ Ver Favoritos';
document.body.appendChild(favoritesBtn);

favoritesBtn.addEventListener('click', () => {
  if (showingFavorites) {
    // Limpar favoritos
    localStorage.removeItem('simpsonsFavorites');
    showingFavorites = false;
    favoritesBtn.textContent = '❤️ Ver Favoritos';
    createCarousels(allCharacters);
  } else {  
    const favoriteIds = JSON.parse(localStorage.getItem('simpsonsFavorites')) || [];
    const favoriteChars = allCharacters.filter(char => favoriteIds.includes(char._id));
    createCarousels(favoriteChars);
    favoritesBtn.textContent = '👥 Ver Todos';
    showingFavorites = true;
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('simpsons-theme');
  const playBtn = document.getElementById('play-theme-btn');

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = 'Pause';
    } else {
      audio.pause();
      playBtn.textContent = 'Play';
    }
  });

  audio.addEventListener('ended', () => {
    playBtn.textContent = 'Play';
  });
});







