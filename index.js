const appName = "Pulse Wave";
let apiHost = "https://discoveryprovider.audius.co"; // Початковий хост
let activeTracksList = []; // Свіжий список треків
let currentTrackIndex = -1; // Індекс поточної пісні

// КРОК 1: Автоматичний пошук робочого API сервера
function initAudius() {
    fetch("https://api.audius.co")
        .then(response => response.json())
        .then(result => {
            if (result.data && result.data.length > 0) {
                apiHost = result.data[0];
            }
            document.getElementById("host-name").innerText = apiHost.replace("https://", "");

            // Завантажуємо тренди відразу після підключення до сервера
            loadTopTracks();
        });
}




// КРОК 2: Завантаження ТОП треків з API
function loadTopTracks() {
    listTitle.innerText = "Популярне зараз 📈";
    let url = apiHost + "/v1/tracks/trending?app_name=" + appName;

    fetch(url)
        .then(response => response.json())
        .then(result => {
            activeTracksList = result.data;
            displayTracks(result.data);

            // ОНОВЛЕННЯ БАНЕРА ДАНІМИ З ТОП-1 ТРЕКУ НА ПЛАТФОРМІ!
            updateHeroBanner(result.data);
        });
}

function updateHeroBanner(tracks) {
    if (tracks && tracks.length > 0) {
        // Беремо найперший (найпопулярніший трек №1 у світі прямо зараз)
        let topTrack = tracks[0];
        let coverUrl = topTrack.artwork ? topTrack.artwork['480x480'] || topTrack.artwork['150x150'] : '';

        // Оновлюємо заголовок та опис банера на реальні дані
        heroTitle.innerHTML = topTrack.title;
        heroDesc.innerText = "Найактуальніший хіт на платформі сьогодні від автора " + topTrack.user.name + ". Занурюйтесь у справжнє живе звучання!";

        // Оновлюємо фон банера на реальну обкладинку треку
        if (coverUrl) {
            heroBanner.style.backgroundImage = "linear-gradient(rgba(27, 12, 43, 0.6), rgba(27, 12, 43, 0.95)), url('" + coverUrl + "')";
        }
    }
}

// КРОК 4: Пошук музики за текстом
function searchMusic() {
    let query = searchInput.value.trim();
    if (query === "") return;

    listTitle.innerText = "Результати пошуку для: " + query;
    let url = apiHost + "/v1/tracks/search?query=" + encodeURIComponent(query) + "&app_name=" + appName;

    fetch(url)
        .then(response => response.json())
        .then(result => {
            activeTracksList = result.data;
            displayTracks(result.data);
        });
}

// Швидкий пошук з плиток меню
function quickPlayKeyword(keyword) {
    searchInput.value = keyword;
    searchMusic();
}

// КРОК 5: Виведення списку треків у HTML-код сторінки
function displayTracks(tracks) {
    tracksListContainer.innerHTML = ""; // очищаємо попередній список

    if (tracks.length === 0) {
        tracksListContainer.innerHTML = "<li style='padding: 20px; text-align: center; color: #dcbfc7;'>Нічого не знайдено 😢</li>";
        return;
    }

    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        let coverUrl = track.artwork ? track.artwork['150x150'] : '';

        let li = document.createElement("li");
        li.className = "track-item";

        li.innerHTML = `
                    <div class="track-details">
                        <div class="track-pic">
                            ${coverUrl ? `<img src="${coverUrl}">` : `<span class="material-symbols-outlined" style="font-size: 18px; color: #dcbfc7;">music_note</span>`}
                        </div>
                        <div class="track-meta">
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.user.name}</div>
                        </div>
                    </div>
                    <span class="material-symbols-outlined" style="font-size: 20px; color: #ffb0cb;">play_circle</span>
                `;

        li.onclick = function () {
            currentTrackIndex = i;
            playSong(track);
        };

        tracksListContainer.appendChild(li);
    }
}

// КРОК 6: Запуск відтворення обраного треку
function playSong(track) {
    let streamUrl = apiHost + "/v1/tracks/" + track.id + "/stream?app_name=" + appName;
    let coverUrl = track.artwork ? track.artwork['150x150'] : '';

    // Оновлюємо нижній бар програвача
    document.getElementById("player-title").innerText = track.title;
    document.getElementById("player-artist").innerText = track.user.name;

    let coverImg = document.getElementById("player-cover");
    let coverPlaceholder = document.getElementById("player-placeholder-art");

    if (coverUrl) {
        coverImg.src = coverUrl;
        coverImg.style.display = "block";
        coverPlaceholder.style.display = "none";
    } else {
        coverImg.style.display = "none";
        coverPlaceholder.style.display = "flex";
    }

    // Запускаємо відтворення в audio
    audio.src = streamUrl;
    audio.play();

    document.getElementById("play-icon").innerText = "pause";
}

// Кнопка на банері "Слухати зараз" (тепер грає саме той трек, що відображений на банері!)
function playFeaturedSong() {
    if (activeTracksList.length > 0) {
        currentTrackIndex = 0;
        playSong(activeTracksList[0]);
    }
}









/**
         * 3. Сторінка Пошуку
         * Дозволяє шукай треки за введеними символами в реальному часі.
         */

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