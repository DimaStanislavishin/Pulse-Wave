
const songDatabase = [
    {
    id: 1,
    title: 'Electric Moonlight',
    artist: 'Neon Horizon',
    album: 'After Dark',
    duration: '3:45',
    genre: 'Електроніка',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'
    },
    {
    id: 2,
    title: 'Digital Soul',
    artist: 'Chrome Static',
    album: 'The Grid',
    duration: '4:12',
    genre: 'Електроніка',
    cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&q=80'
    },
    {
    id: 3,
    title: 'Rainy Rooftops',
    artist: 'Lo-fi Echo',
    album: 'Cozy Vibes',
    duration: '2:58',
    genre: 'Лоу-фай',
    cover: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&q=80'
  },
  {
    id: 4,
    title: 'Midnight Lofi',
    artist: 'Chill Beats',
    album: 'Night Sessions',
    duration: '3:22',
    genre: 'Лоу-фай',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80'
  },
  {
    id: 5,
    title: 'Starlight Orbit',
    artist: 'Cosmic Voyager',
    album: 'Deep Space',
    duration: '4:05',
    genre: 'Електроніка',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80'
  },
  {
    id: 6,
    title: 'Neon Pulse',
    artist: 'Hyperion Dreams',
    album: 'Hyperion Dreams',
    duration: '3:30',
    genre: 'Поп',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80'
  }
];

let favoriteTracks = [];
let isPlaying = false;

/**
 * 1. Навігація по сторінках
 * Переключення між головною, пошуком та бібліотекою
 */
function navigateTo(page) {
  const views = document.querySelectorAll('.view');
  views.forEach(view => view.classList.remove('active'));

  const targetView = document.getElementById(`view-${page}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Оновлюємо активну кнопку в навігації (десктоп)
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.nav-btn')?.classList.add('active');

  // Оновлюємо активну кнопку в мобільної навігації
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
  const mobileBtn = document.getElementById(`m-nav-${page}`);
  if (mobileBtn) {
    mobileBtn.classList.add('active');
  }
}

/**
 * 2. Плеєр: Управління музикою
 */
function playSong(title, artist, cover) {
  document.getElementById('current-title').textContent = title;
  document.getElementById('current-artist').textContent = artist;
  document.getElementById('current-cover').src = cover;
  isPlaying = true;
  updatePlayButton();
}

function togglePlay() {
  isPlaying = !isPlaying;
  updatePlayButton();
}

function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    const icon = playBtn.querySelector('span');
    if (isPlaying) {
      icon.textContent = 'pause';
    } else {
      icon.textContent = 'play_arrow';
    }
  }
}

function playPrevious() {
  console.log('Попередня пісня');
}

function playNext() {
  console.log('Наступна пісня');
}

function seekTrack(value) {
  console.log('Перемотка до:', value);
}

function changeVolume(value) {
  console.log('Гучність:', value);
}

/**
 * 3. Сторінка Пошуку
 * Дозволяє шукати треки за введеними символами в реальному часі
 */
function performSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const resultsContainer = document.getElementById('search-results-container');
  const songsList = document.getElementById('search-songs-list');
  const categoriesGrid = document.getElementById('search-grid');
  const genresSection = document.getElementById('search-genres-section');

  if (query.trim() === '') {
    // Якщо поле пошуку порожнє, показуємо жанри та ховаємо список результатів
    resultsContainer.style.display = 'none';
    genresSection.style.display = 'block';
    return;
  }

  // Фільтруємо базу даних пісень
  const filteredSongs = songDatabase.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query) ||
    song.genre.toLowerCase().includes(query)
  );

  // Очищуємо та наповнюємо список результатів
  songsList.innerHTML = '';
  if (filteredSongs.length > 0) {
    filteredSongs.forEach((song, index) => {
      songsList.innerHTML += `
        <div class="song-row" onclick="playSong('${song.title}', '${song.artist}', '${song.cover}')">
          <div class="song-num">${index + 1}</div>
          <img class="song-cover" src="${song.cover}" alt="cover"/>
          <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
          </div>
          <div class="song-album">${song.album}</div>
          <div class="song-duration">${song.duration}</div>
          <button class="song-action-btn" onclick="toggleFavorite(event, this)">
            <span class="material-symbols-outlined">favorite</span>
          </button>
        </div>
      `;
    });
  } else {
    songsList.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">Нічого не знайдено за вашим запитом.</p>';
  }

  // Показуємо результати та приховуємо базову сітку категорій
  resultsContainer.style.display = 'block';
  genresSection.style.display = 'none';
}

// Швидкий клік по жанру заповнює пошук
function filterSearchGenre(genreName) {
  document.getElementById('search-input').value = genreName;
  performSearch();
}

/**
 * 4. Сторінка Бібліотеки
 * Фільтрація списку збережених треків за допомогою вкладок
 */
function switchLibraryTab(tabName, clickedBtn) {
  // Візуально перемикаємо активну кнопку вкладки
  if (clickedBtn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  const songsList = document.getElementById('library-songs-list');
  songsList.innerHTML = '';

  let displayedSongs = [];
  if (tabName === 'all' || tabName === 'playlist') {
    displayedSongs = songDatabase;
  } else if (tabName === 'favorites') {
    // Фільтруємо за масивом обраних треків
    displayedSongs = songDatabase.filter(s => favoriteTracks.includes(s.id));
  }

  if (displayedSongs.length === 0) {
    songsList.innerHTML = '<p style="color: var(--text-muted); padding: 24px; text-align: center;">Тут порожньо.</p>';
    return;
  }

  displayedSongs.forEach((song, index) => {
    const isFav = favoriteTracks.includes(song.id);
    songsList.innerHTML += `
      <div class="song-row" onclick="playSong('${song.title}', '${song.artist}', '${song.cover}')">
        <div class="song-num">${index + 1}</div>
        <img class="song-cover" src="${song.cover}" alt="cover"/>
        <div class="song-info">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist}</div>
        </div>
        <div class="song-album">${song.album}</div>
        <div class="song-duration">${song.duration}</div>
        <button class="song-action-btn" onclick="toggleFavorite(event, this, ${song.id})">
          <span class="material-symbols-outlined" style="${isFav ? "font-variation-settings: 'FILL' 1; color: var(--primary-light);" : ""}">favorite</span>
        </button>
      </div>
    `;
  });
}

function toggleFavorite(event, button, songId) {
  event.stopPropagation();

  if (!songId) {
    const row = button.closest('.song-row');
    const title = row.querySelector('.song-title').textContent;
    const song = songDatabase.find(s => s.title === title);
    songId = song ? song.id : null;
  }

  if (!songId) return;

  const index = favoriteTracks.indexOf(songId);
  if (index > -1) {
    favoriteTracks.splice(index, 1);
    button.querySelector('span').style.fontVariationSettings = '';
    button.querySelector('span').style.color = '';
  } else {
    favoriteTracks.push(songId);
    button.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    button.querySelector('span').style.color = 'var(--primary-light)';
  }

  console.log('Улюблені пісні:', favoriteTracks);
}
