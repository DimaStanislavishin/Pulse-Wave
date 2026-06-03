const appName = "Pulse Wave";
let apiHost = "https://discoveryprovider.audius.co";
let activeTracksList = [];
let currentTrackIndex = -1;
let audio = null;

// DOM елементи
let searchInput, searchResultsContainer, searchSongsList, listTitle, tracksListContainer;
let playerTitle, playerArtist, playerCover, playIcon, progressBar, currentTimeLabel, totalTimeLabel;

// Ініціалізація при завантаженні
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Ініціалізація Audius API");
    
    // Отримуємо DOM елементи
    searchInput = document.getElementById("search-input");
    searchResultsContainer = document.getElementById("search-results-container");
    searchSongsList = document.getElementById("search-songs-list");
    listTitle = document.querySelector("h2.section-title") || document.createElement("h2");
    tracksListContainer = document.getElementById("search-songs-list");
    
    playerTitle = document.getElementById("current-title");
    playerArtist = document.getElementById("current-artist");
    playerCover = document.getElementById("current-cover");
    playIcon = document.getElementById("play-btn");
    progressBar = document.getElementById("progress-bar");
    currentTimeLabel = document.getElementById("current-time");
    totalTimeLabel = document.getElementById("total-time");
    
    audio = createAudioElement();
    
    // Слухаємо введення у пошук
    if (searchInput) {
        searchInput.addEventListener("input", performSearch);
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    // Ініціалізуємо Audius
    initAudius();
});

// КРОК 1: Автоматичний пошук робочого API сервера
function initAudius() {
    fetch("https://api.audius.co")
        .then(response => response.json())
        .then(result => {
            if (result.data && result.data.length > 0) {
                apiHost = result.data[0];
            }
            console.log("✅ Audius HOST:", apiHost);
        })
        .catch(error => {
            console.error("❌ Помилка підключення до Audius:", error);
        });
}

// КРОК 2: Пошук музики в реальному часі
function performSearch() {
    let query = searchInput.value.trim();
    
    if (query === "") {
        searchResultsContainer.innerHTML = "";
        return;
    }
    
    searchResultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #cbc3da;">⏳ Пошук музики...</div>';
    
    console.log("🔍 Пошук:", query);
    searchMusic(query);
}

// КРОК 3: Запит до API для пошуку
function searchMusic(query) {
    let url = apiHost + "/v1/tracks/search?query=" + encodeURIComponent(query) + "&app_name=" + appName + "&limit=20";

    console.log("🔗 URL запиту:", url);

    fetch(url)
        .then(response => response.json())
        .then(result => {
            console.log("📥 Результати пошуку:", result);
            
            if (result.data && result.data.length > 0) {
                activeTracksList = result.data;
                displayTracks(result.data);
            } else {
                searchResultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #dcbfc7;">😢 Нічого не знайдено</div>';
            }
        })
        .catch(error => {
            console.error("❌ Помилка пошуку:", error);
            searchResultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #ff6b6b;">❌ Помилка при пошуку</div>';
        });
}

// КРОК 4: Швидкий пошук за жанром/ключовим словом
function quickSearch(keyword) {
    if (searchInput) {
        searchInput.value = keyword;
        performSearch();
    }
}

// КРОК 5: Виведення списку треків
function displayTracks(tracks) {
    if (!searchResultsContainer) return;
    
    searchResultsContainer.innerHTML = '<h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600;">Знайдені пісні (' + tracks.length + ')</h3>';
    
    let songList = document.createElement("div");
    songList.className = "song-list";

    if (tracks.length === 0) {
        songList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dcbfc7;">Нічого не знайдено 😢</div>';
        searchResultsContainer.appendChild(songList);
        return;
    }

    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        let coverUrl = track.artwork ? track.artwork['150x150'] : '';

        let songRow = document.createElement("div");
        songRow.className = "song-row";
        songRow.style.cursor = "pointer";

        songRow.innerHTML = `
            <div class="song-num" style="color: var(--primary-color); font-weight: 700;">${i + 1}</div>
            ${coverUrl ? `<img class="song-cover" src="${coverUrl}" alt="cover"/>` : '<div class="song-cover" style="background: linear-gradient(135deg, #6b21ff, #854dff); display: flex; align-items: center; justify-content: center; border-radius: 6px;"><span class="material-symbols-outlined" style="color: #fff; font-size: 24px;">music_note</span></div>'}
            <div class="song-info">
                <div class="song-title">${escapeHtml(track.title)}</div>
                <div class="song-artist">${escapeHtml(track.user?.name || 'Невідомий')}</div>
            </div>
            <div class="song-album">${escapeHtml(track.genre || 'N/A')}</div>
            <div class="song-duration">${formatDuration(track.duration)}</div>
            <button class="song-action-btn" onclick="toggleFavorite(event, this)">
                <span class="material-symbols-outlined">favorite</span>
            </button>
        `;

        songRow.onclick = function(e) {
            if (!e.target.closest('.song-action-btn')) {
                currentTrackIndex = i;
                playSong(track);
            }
        };

        songList.appendChild(songRow);
    }
    
    searchResultsContainer.appendChild(songList);
}

// КРОК 6: Запуск відтворення треку
function playSong(track) {
    // Перевіряємо чи у треку є ID
    if (!track.id) {
        console.error("❌ Трек не має ID:", track);
        alert("⚠️ Цей трек не можна відтворити");
        return;
    }

    let streamUrl = apiHost + "/v1/tracks/" + track.id + "/stream?app_name=" + appName;
    let coverUrl = track.artwork ? track.artwork['150x150'] : '';

    console.log("▶️ Грає:", track.title);
    console.log("🔗 Stream URL:", streamUrl);

    if (playerTitle) playerTitle.innerText = track.title;
    if (playerArtist) playerArtist.innerText = track.user?.name || 'Невідомий';
    if (playerCover) playerCover.src = coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80';
    
    if (totalTimeLabel) totalTimeLabel.innerText = formatDuration(track.duration);
    if (progressBar) progressBar.value = 0;

    audio.src = streamUrl;
    audio.play().catch(error => {
        console.error("❌ Помилка відтворення:", error);
        alert("⚠️ Не удалось запустити музику. Спробуйте іншу пісню.");
    });

    if (playIcon) {
        playIcon.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">pause</span>';
    }
}

// Допоміжні функції
function escapeHtml(text) {
    let map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDuration(ms) {
    if (!ms) return "0:00";
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function toggleFavorite(event, button) {
    event.stopPropagation();
    button.classList.toggle("active");
    button.style.color = button.classList.contains("active") ? "#ff6b9d" : "var(--text-muted)";
}

function togglePlay() {
    if (!audio) return;
    
    let playBtn = document.getElementById("play-btn");
    
    if (audio.paused) {
        audio.play().catch(error => {
            console.error("❌ Помилка при відтворенні:", error);
        });
        if (playBtn) playBtn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">pause</span>';
    } else {
        audio.pause();
        if (playBtn) playBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    }
}

function seekTrack(value) {
    if (audio && audio.duration) {
        audio.currentTime = (value / 100) * audio.duration;
    }
}

function changeVolume(value) {
    if (audio) {
        audio.volume = value / 100;
    }
}

function playNext() {
    if (activeTracksList.length > 0) {
        currentTrackIndex = (currentTrackIndex + 1) % activeTracksList.length;
        playSong(activeTracksList[currentTrackIndex]);
    }
}

function playPrevious() {
    if (activeTracksList.length > 0) {
        currentTrackIndex = (currentTrackIndex - 1 + activeTracksList.length) % activeTracksList.length;
        playSong(activeTracksList[currentTrackIndex]);
    }
}

function createAudioElement() {
    let audio = document.createElement("audio");
    audio.crossOrigin = "anonymous";
    
    audio.addEventListener("timeupdate", () => {
        if (progressBar && audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            if (currentTimeLabel) currentTimeLabel.innerText = formatDuration(audio.currentTime * 1000);
        }
    });
    
    audio.addEventListener("ended", () => {
        if (playIcon) playIcon.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    });
    
    return audio;
}

function switchLibraryTab(tabName, clickedBtn) {
  // Візуально перемикаємо активну кнопку вкладки
  if (clickedBtn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
  }