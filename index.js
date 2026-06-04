// Pulse Wave — main script (refactored)
const appName = 'Pulse Wave';
let apiHost = 'https://discoveryprovider.audius.co'; // fallback host
let activeTracksList = [];
let currentTrackIndex = -1;

// minimal local DB for UI fallback
const songDatabase = [
    { id: 1, title: 'Electric Moonlight', artist: 'Neon Horizon', album: 'After Dark', duration: '3:45', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', genre: 'Електроніка' },
    { id: 2, title: 'Digital Soul', artist: 'Chrome Static', album: 'The Grid', duration: '4:12', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&q=80', genre: 'Електроніка' },
    { id: 3, title: 'Rainy Rooftops', artist: 'Lo-fi Echo', album: 'Cozy Vibes', duration: '2:58', cover: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&q=80', genre: 'Лоу-фай' }
];

let favoriteTracks = [];

// DOM refs
let tracksListContainer = null;
let heroBanner = null;
let heroTitle = null;
let heroDesc = null;
let audioEl = null;

function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

document.addEventListener('DOMContentLoaded', () => {
    tracksListContainer = document.getElementById('tracks-list') || document.getElementById('library-songs-list');
    heroBanner = document.querySelector('.hero-banner');
    heroTitle = document.querySelector('.hero-title');
    heroDesc = document.querySelector('.hero-desc');
    audioEl = document.getElementById('audio');

    if (audioEl) {
        audioEl.addEventListener('timeupdate', () => {
            const progress = document.getElementById('progress-bar');
            const currentTime = document.getElementById('current-time');
            const totalTime = document.getElementById('total-time');
            if (progress && audioEl.duration) progress.value = (audioEl.currentTime / audioEl.duration) * 100;
            if (currentTime) currentTime.innerText = formatTime(audioEl.currentTime);
            if (totalTime && audioEl.duration) totalTime.innerText = formatTime(audioEl.duration);
        });
        audioEl.addEventListener('ended', playNext);
    }

    renderRecommendedCards();
    initAudius();
});

function initAudius() {
    fetch('https://api.audius.co')
        .then(r => r.json())
        .then(result => {
            if (result && result.length) apiHost = result[0];
        })
        .catch(() => console.warn('Audius host detection failed — using fallback'))
        .finally(() => loadTopTracks());
}

function loadTopTracks() {
    const url = `${apiHost}/v1/tracks/trending?app_name=${encodeURIComponent(appName)}`;
    fetch(url)
        .then(r => r.json())
        .then(result => {
            if (result && result.data && result.data.length) {
                activeTracksList = result.data;
                displayTracks(result.data);
                updateHeroBanner(result.data);
            } else {
                // fallback to local
                activeTracksList = songDatabase.map(s => ({ id: s.id, title: s.title, user: { name: s.artist }, artwork: { '150x150': s.cover }, cover: s.cover }));
                displayTracks(activeTracksList);
                updateHeroBanner(activeTracksList);
            }
        })
        .catch(() => {
            activeTracksList = songDatabase.map(s => ({ id: s.id, title: s.title, user: { name: s.artist }, artwork: { '150x150': s.cover }, cover: s.cover }));
            displayTracks(activeTracksList);
            updateHeroBanner(activeTracksList);
        });
}

function updateHeroBanner(tracks) {
    if (!tracks || !tracks.length) return;
    const top = tracks[0];
    const cover = top.artwork ? (top.artwork['480x480'] || top.artwork['150x150']) : (top.cover || '');
    const artist = top.user ? top.user.name : (top.artist || '');
    if (heroTitle) heroTitle.innerText = top.title || heroTitle.innerText;
    if (heroDesc) heroDesc.innerText = `Найактуальніший хіт від ${artist}`;
    if (heroBanner && cover) heroBanner.style.backgroundImage = `linear-gradient(rgba(27,12,43,0.6), rgba(27,12,43,0.95)), url('${cover}')`;
}

function displayTracks(tracks) {
    const container = document.getElementById('tracks-list') || document.getElementById('search-songs-list') || tracksListContainer;
    if (!container) return;
    container.innerHTML = '';
    if (!tracks || !tracks.length) {
        container.innerHTML = "<li style='padding:20px;text-align:center;color:#dcbfc7;'>Нічого не знайдено 😢</li>";
        return;
    }
    tracks.forEach((track, i) => {
        const cover = track.artwork ? track.artwork['150x150'] : (track.cover || '');
        const artist = track.user ? track.user.name : (track.artist || '');
        const li = document.createElement('li');
        li.className = 'song-row';
        li.innerHTML = `
            <div class="song-num">${i+1}</div>
            <img class="song-cover" src="${cover}" alt="cover" />
            <div class="song-info"><div class="song-title">${track.title}</div><div class="song-artist">${artist}</div></div>
            <div class="song-album"></div>
            <div class="song-duration"></div>
            <button class="song-action-btn"><span class="material-symbols-outlined">play_arrow</span></button>
        `;
        li.addEventListener('click', () => { currentTrackIndex = i; playSong(track); });
        container.appendChild(li);
    });
}

function playSong(a, b, c) {
    // object form
    if (a && typeof a === 'object') {
        const track = a;
        const streamUrl = track.id && !track.cover ? `${apiHost}/v1/tracks/${track.id}/stream?app_name=${encodeURIComponent(appName)}` : (track.stream || track.cover || '');
        const cover = track.artwork ? track.artwork['150x150'] : (track.cover || '');
        const title = track.title || '';
        const artist = track.user ? track.user.name : (track.artist || '');
        const titleEl = document.getElementById('current-title');
        const artistEl = document.getElementById('current-artist');
        const coverEl = document.getElementById('current-cover');
        if (titleEl) titleEl.innerText = title;
        if (artistEl) artistEl.innerText = artist;
        if (coverEl && cover) coverEl.src = cover;
        if (audioEl && streamUrl) { audioEl.src = streamUrl; audioEl.play().catch(()=>{}); }
        return;
    }

    // string form: title, artist, cover
    const title = a || '';
    const artist = b || '';
    const cover = c || '';
    const titleEl = document.getElementById('current-title');
    const artistEl = document.getElementById('current-artist');
    const coverEl = document.getElementById('current-cover');
    if (titleEl) titleEl.innerText = title;
    if (artistEl) artistEl.innerText = artist;
    if (coverEl && cover) coverEl.src = cover;
    if (audioEl && (cover.endsWith('.mp3') || cover.endsWith('.wav') || cover.includes('audio') || cover.includes('.mp3'))) { audioEl.src = cover; audioEl.play().catch(()=>{}); }
}

function togglePlay() {
    if (!audioEl) return;
    if (audioEl.paused) audioEl.play().catch(()=>{});
    else audioEl.pause();
}

function playNext() {
    if (!activeTracksList || !activeTracksList.length) return;
    currentTrackIndex = (currentTrackIndex + 1) % activeTracksList.length;
    playSong(activeTracksList[currentTrackIndex]);
}

function playPrevious() {
    if (!activeTracksList || !activeTracksList.length) return;
    currentTrackIndex = (currentTrackIndex - 1 + activeTracksList.length) % activeTracksList.length;
    playSong(activeTracksList[currentTrackIndex]);
}

function seekTrack(value) {
    if (!audioEl || !audioEl.duration) return;
    const pct = Number(value);
    if (isNaN(pct)) return;
    audioEl.currentTime = audioEl.duration * (pct / 100);
}

function changeVolume(v) { if (!audioEl) return; audioEl.volume = Math.max(0, Math.min(1, Number(v) / 100)); }

function performSearch() {
    const q = (document.getElementById('search-input')?.value || '').toLowerCase();
    const resultsContainer = document.getElementById('search-results-container');
    const songsList = document.getElementById('search-songs-list');
    const categoriesGrid = document.getElementById('search-grid');
    if (!songsList || !resultsContainer || !categoriesGrid) return;
    if (!q.trim()) { resultsContainer.style.display = 'none'; categoriesGrid.style.display = 'grid'; return; }
    const filtered = songDatabase.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q));
    songsList.innerHTML = '';
    if (filtered.length) filtered.forEach((song, idx) => {
        const div = document.createElement('div'); div.className = 'song-row';
        div.innerHTML = `<div class="song-num">${idx+1}</div><img class="song-cover" src="${song.cover}"/><div class="song-info"><div class="song-title">${song.title}</div><div class="song-artist">${song.artist}</div></div><div class="song-album">${song.album}</div><div class="song-duration">${song.duration}</div><button class="song-action-btn"><span class="material-symbols-outlined">favorite</span></button>`;
        div.addEventListener('click', () => playSong(song)); songsList.appendChild(div);
    });
    if (!filtered.length) songsList.innerHTML = '<p style="color:var(--text-muted);padding:16px;">Нічого не знайдено за вашим запитом.</p>';
    resultsContainer.style.display = 'block'; categoriesGrid.style.display = 'none';
}

function filterSearchGenre(name) { const inp = document.getElementById('search-input'); if (!inp) return; inp.value = name; performSearch(); }

function switchLibraryTab(tabName, clickedBtn) {
    if (clickedBtn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
    }

    const songsList = document.getElementById('library-songs-list');
    if (!songsList) return;
    songsList.innerHTML = '';

    let displayedSongs = [];
    if (tabName === 'all' || tabName === 'playlist') displayedSongs = songDatabase;
    else if (tabName === 'favorites') displayedSongs = songDatabase.filter(s => favoriteTracks.includes(s.id));

    if (displayedSongs.length === 0) {
        songsList.innerHTML = '<p style="color: var(--text-muted); padding: 24px; text-align: center;">Тут порожньо.</p>';
        return;
    }

    displayedSongs.forEach((song, index) => {
        const isFav = favoriteTracks.includes(song.id);
        const div = document.createElement('div');
        div.className = 'song-row';
        div.innerHTML = `
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
        `;
        div.addEventListener('click', () => playSong(song));
        songsList.appendChild(div);
    });
}

function renderRecommendedCards() {
    const container = document.getElementById('tracks-list');
    if (!container) return;
    if (container.children.length) return;
    songDatabase.forEach(s => {
        const li = document.createElement('li');
        li.className = 'card';
        li.innerHTML = `
            <div class="card-img-wrapper"><img class="card-img" src="${s.cover}"/></div>
            <div class="card-title">${s.title}</div>
            <div class="card-subtitle">${s.artist}</div>
        `;
        li.addEventListener('click', () => playSong(s));
        container.appendChild(li);
    });
}

function toggleFavorite(event, el, id) {
    event?.stopPropagation();
    const trackId = id || (el && el.dataset && Number(el.dataset.id));
    if (!trackId) return;
    const idx = favoriteTracks.indexOf(trackId);
    if (idx === -1) favoriteTracks.push(trackId);
    else favoriteTracks.splice(idx, 1);
}

