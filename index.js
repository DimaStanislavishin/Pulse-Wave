/**
         * 3. Сторінка Пошуку
         * Дозволяє шукай треки за введеними символами в реальному часі.
         */

const appName = "Maloney";
let apiHost = "https://discoveryprovider.audius.co"; // Початковий хост
let activeTracksList = []; // Свіжий список треків
let currentTrackIndex = -1; // Індекс поточної пісні

function performSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const resultsContainer = document.getElementById('search-results-container');
  const songsList = document.getElementById('search-songs-list');
  const categoriesGrid = document.getElementById('search-grid');

  if (query.trim() === '') {
    // Якщо поле пошуку порожнє, показуємо жанри та ховаємо список результатів
    resultsContainer.style.display = 'none';
    categoriesGrid.style.display = 'grid';
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
  categoriesGrid.style.display = 'none';
}

// Швидкий клік по жанру заповнює пошук
function filterSearchGenre(genreName) {
  document.getElementById('search-input').value = genreName;
  performSearch();
}

/**
 * 4. Сторінка Бібліотеки
 * Фільтрація списку збережених треків за допомогою вкладок.
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