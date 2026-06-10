const appName = "Pulse Wave";
let apiHost = "https://discoveryprovider.audius.co";

let activeTracksList = [];
let searchResultsList = [];

function getCoverUrl(track) {
    if (track.artwork && track.artwork['150x150']) {
        return track.artwork['150x150'];
    }
    if (track.cover) {
        return track.cover;
    }
    return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80';
}

function getArtistName(track) {
    if (track.user && track.user.name) {
        return track.user.name;
    }
    if (track.artist) {
        return track.artist;
    }
    return 'Невідомий';
}

const songDatabase = [
    { id: 1, title: 'Electric Moonlight', artist: 'Neon Horizon', album: 'After Dark', duration: '3:45', genre: 'Електроніка', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Digital Soul', artist: 'Chrome Static', album: 'The Grid', duration: '4:12', genre: 'Електроніка', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'Rainy Rooftops', artist: 'Lo-fi Echo', album: 'Cozy Vibes', duration: '2:58', genre: 'Лоу-фай', cover: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Midnight Lofi', artist: 'Chill Beats', album: 'Night Sessions', duration: '3:22', genre: 'Лоу-фай', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 5, title: 'Starlight Orbit', artist: 'Cosmic Voyager', album: 'Deep Space', duration: '4:05', genre: 'Електроніка', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 6, title: 'Neon Pulse', artist: 'Hyperion Dreams', album: 'Hyperion Dreams', duration: '3:30', genre: 'Поп', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
];

let favoriteTracks = [];
try {
    const savedFavs = localStorage.getItem('favoriteTracks');
    if (savedFavs) {
        favoriteTracks = JSON.parse(savedFavs);
    }
} catch (e) {}

let tracksListContainer = null;
let heroBanner = null;
let heroTitle = null;
let heroDesc = null;
let searchInput = null;
let searchResultsContainer = null;
let genresSection = null;

document.addEventListener('DOMContentLoaded', function() {
    tracksListContainer = document.getElementById('tracks-list');
    heroBanner = document.querySelector('.hero-banner');
    heroTitle = document.querySelector('.hero-title');
    heroDesc = document.querySelector('.hero-desc');
    searchInput = document.getElementById('search-input');
    searchResultsContainer = document.getElementById('search-results-container');
    genresSection = document.getElementById('genres-section');

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    loadLocalTracks();
    initAudius();
    switchLibraryTab('all');
});

function loadLocalTracks() {
    activeTracksList = songDatabase.slice();
    if (typeof window.setTrackList === 'function') {
        window.setTrackList(activeTracksList, 0);
    }
    displayTracks(activeTracksList);
    updateHeroBanner(activeTracksList);
}

function loadTrendingTracks() {
    var url = apiHost + '/v1/tracks/trending?app_name=' + appName + '&limit=10';
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            var tracks = Array.isArray(result) ? result : (result.data || []);
            if (tracks.length > 0) {
                activeTracksList = tracks;
                if (typeof window.setTrackList === 'function') {
                    window.setTrackList(tracks, 0);
                }
                displayTracks(tracks);
                updateHeroBanner(tracks);
            }
        })
        .catch(function() {});
}

function displayTracks(tracks) {
    if (!tracksListContainer) {
        return;
    }
    tracksListContainer.innerHTML = '';
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const cover = getCoverUrl(track);
        const artist = getArtistName(track);
        let duration = track.duration || '';
        if (typeof duration === 'number') {
            duration = formatTime(duration);
        }
        const li = document.createElement('li');
        li.className = 'song-row';
        li.style.cursor = 'pointer';
        li.innerHTML = '<div class="song-num">' + (i + 1) + '</div>' +
            '<img class="song-cover" src="' + cover + '" alt="cover" />' +
            '<div class="song-info"><div class="song-title">' + track.title + '</div><div class="song-artist">' + artist + '</div></div>' +
            '<div class="song-album">' + (track.album || track.genre || '') + '</div>' +
            '<div class="song-duration">' + duration + '</div>' +
            '<button class="song-action-btn"><span class="material-symbols-outlined">play_arrow</span></button>';
        li.addEventListener('click', function() {
            if (typeof window.setTrackList === 'function') {
                window.setTrackList(activeTracksList, i);
            }
            playSong(track);
        });
        tracksListContainer.appendChild(li);
    }
}

function updateHeroBanner(tracks) {
    if (!tracks || !tracks.length) {
        return;
    }
    const top = tracks[0];
    const cover = getCoverUrl(top);
    const artist = getArtistName(top);
    if (heroTitle) {
        heroTitle.innerText = top.title;
    }
    if (heroDesc) {
        heroDesc.innerText = 'Найактуальніший хіт від ' + artist;
    }
    if (heroBanner && cover) {
        heroBanner.style.backgroundImage = 'linear-gradient(rgba(27,12,43,0.6), rgba(27,12,43,0.95)), url(' + cover + ')';
    }
}

function initAudius() {
    fetch('https://api.audius.co')
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            if (result && result.length > 0) {
                apiHost = result[Math.floor(Math.random() * result.length)];
            }
            loadTrendingTracks();
        })
        .catch(function() {
            loadTrendingTracks();
        });
}

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (query === '') {
        if (searchResultsContainer) searchResultsContainer.style.display = 'none';
        if (genresSection) genresSection.style.display = 'block';
        var trendsSection = document.getElementById('trends-section');
        if (trendsSection) trendsSection.style.display = 'block';
        return;
    }

    if (genresSection) genresSection.style.display = 'none';
    var trendsSection = document.getElementById('trends-section');
    if (trendsSection) trendsSection.style.display = 'none';
    if (searchResultsContainer) {
        searchResultsContainer.style.display = 'block';
        searchResultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #cbc3da;">⏳ Пошук музики...</div>';
    }

    const localResults = [];
    for (let i = 0; i < songDatabase.length; i++) {
        const song = songDatabase[i];
        if (song.title.toLowerCase().indexOf(query) !== -1 ||
            song.artist.toLowerCase().indexOf(query) !== -1 ||
            (song.genre && song.genre.toLowerCase().indexOf(query) !== -1)) {
            localResults.push(song);
        }
    }

    const url = apiHost + '/v1/tracks/search?query=' + encodeURIComponent(query) + '&app_name=' + appName + '&limit=15';
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            const globalTracks = Array.isArray(result) ? result : (result.data || []);
            renderSearchResults(localResults, globalTracks);
        })
        .catch(function() {
            renderSearchResults(localResults, []);
        });
}

function quickSearch(keyword) {
    if (searchInput) {
        searchInput.value = keyword;
        performSearch();
    }
}

function renderSearchResults(localTracks, globalTracks) {
    if (!searchResultsContainer) {
        return;
    }
    searchResultsContainer.innerHTML = '';
    searchResultsList = [];

    if (localTracks.length === 0 && globalTracks.length === 0) {
        searchResultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #dcbfc7;">😢 Нічого не знайдено.</div>';
        return;
    }

    let idx = 0;

    if (localTracks.length > 0) {
        const h = document.createElement('h3');
        h.style.cssText = 'margin: 16px 0 8px 0; font-size: 16px; color: #ff6b9d; font-weight: 600;';
        h.innerText = 'У вашій бібліотеці';
        searchResultsContainer.appendChild(h);

        const list = document.createElement('div');
        list.className = 'song-list';
        for (let i = 0; i < localTracks.length; i++) {
            const track = localTracks[i];
            searchResultsList.push(track);
            list.appendChild(makeSongRow(track, idx + 1, idx));
            idx++;
        }
        searchResultsContainer.appendChild(list);
    }

    if (globalTracks.length > 0) {
        const h = document.createElement('h3');
        h.style.cssText = 'margin: 24px 0 8px 0; font-size: 16px; color: #ff6b9d; font-weight: 600;';
        h.innerText = 'Результати з мережі';
        searchResultsContainer.appendChild(h);

        const list = document.createElement('div');
        list.className = 'song-list';
        for (let i = 0; i < globalTracks.length; i++) {
            const track = globalTracks[i];
            searchResultsList.push(track);
            list.appendChild(makeSongRow(track, idx + 1, idx));
            idx++;
        }
        searchResultsContainer.appendChild(list);
    }
}

function makeSongRow(track, displayNum, playIndex) {
    let isFav = false;
    for (let f = 0; f < favoriteTracks.length; f++) {
        if (String(favoriteTracks[f].id) === String(track.id)) {
            isFav = true;
            break;
        }
    }

    let coverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80';
    if (track.artwork && track.artwork['150x150']) {
        coverUrl = track.artwork['150x150'];
    } else if (track.cover) {
        coverUrl = track.cover;
    }

    let artistName = 'Невідомий';
    if (track.user && track.user.name) {
        artistName = track.user.name;
    } else if (track.artist) {
        artistName = track.artist;
    }

    let durationStr = '0:00';
    if (typeof track.duration === 'string') {
        durationStr = track.duration;
    } else if (typeof track.duration === 'number') {
        durationStr = formatTime(track.duration);
    }

    const row = document.createElement('div');
    row.className = 'song-row';
    row.style.cursor = 'pointer';

    const favStyle = isFav ? "font-variation-settings: 'FILL' 1; color: #ff6b9d;" : '';

    row.innerHTML = '<div class="song-num">' + displayNum + '</div>' +
        '<img class="song-cover" src="' + coverUrl + '" alt="cover"/>' +
        '<div class="song-info">' +
            '<div class="song-title">' + track.title + '</div>' +
            '<div class="song-artist">' + artistName + '</div>' +
        '</div>' +
        '<div class="song-album">' + (track.genre || track.album || '') + '</div>' +
        '<div class="song-duration">' + durationStr + '</div>' +
        '<button class="song-action-btn">' +
            '<span class="material-symbols-outlined" style="' + favStyle + '">favorite</span>' +
        '</button>';

    const favBtn = row.querySelector('.song-action-btn');
    favBtn.addEventListener('click', function(event) {
        toggleFavorite(event, favBtn, track);
    });

    row.addEventListener('click', function(e) {
        if (!e.target.closest('.song-action-btn')) {
            if (typeof window.setTrackList === 'function') {
                window.setTrackList(searchResultsList, playIndex);
            }
            playSong(track);
        }
    });

    return row;
}

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) {
        return '0:00';
    }
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ':' + formattedSeconds;
}

function switchLibraryTab(tabName, clickedBtn) {
    if (clickedBtn) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        for (let i = 0; i < tabBtns.length; i++) {
            tabBtns[i].classList.remove('active');
        }
        clickedBtn.classList.add('active');
    }

    const songsList = document.getElementById('library-songs-list');
    if (!songsList) {
        return;
    }
    songsList.innerHTML = '';

    let displayedSongs = [];
    if (tabName === 'all' || tabName === 'playlist') {
        displayedSongs = songDatabase;
    } else if (tabName === 'favorites') {
        displayedSongs = favoriteTracks;
    }

    if (displayedSongs.length === 0) {
        songsList.innerHTML = '<p style="color: var(--text-muted); padding: 24px; text-align: center;">Тут порожньо 😢</p>';
        return;
    }

    for (let i = 0; i < displayedSongs.length; i++) {
        const song = displayedSongs[i];

        let isFav = false;
        for (let f = 0; f < favoriteTracks.length; f++) {
            if (String(favoriteTracks[f].id) === String(song.id)) {
                isFav = true;
                break;
            }
        }

        let coverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80';
        if (song.artwork && song.artwork['150x150']) {
            coverUrl = song.artwork['150x150'];
        } else if (song.cover) {
            coverUrl = song.cover;
        }

        let artistName = 'Невідомий';
        if (song.user && song.user.name) {
            artistName = song.user.name;
        } else if (song.artist) {
            artistName = song.artist;
        }

        let durationStr = '0:00';
        if (typeof song.duration === 'string') {
            durationStr = song.duration;
        } else if (typeof song.duration === 'number') {
            durationStr = formatTime(song.duration);
        }

        const favStyle = isFav ? "font-variation-settings: 'FILL' 1; color: #ff6b9d;" : '';

        const div = document.createElement('div');
        div.className = 'song-row';
        div.style.cursor = 'pointer';
        div.innerHTML = '<div class="song-num">' + (i + 1) + '</div>' +
            '<img class="song-cover" src="' + coverUrl + '" alt="cover"/>' +
            '<div class="song-info">' +
                '<div class="song-title">' + song.title + '</div>' +
                '<div class="song-artist">' + artistName + '</div>' +
            '</div>' +
            '<div class="song-album">' + (song.album || song.genre || '') + '</div>' +
            '<div class="song-duration">' + durationStr + '</div>' +
            '<button class="song-action-btn">' +
                '<span class="material-symbols-outlined" style="' + favStyle + '">favorite</span>' +
            '</button>';

        const favBtn = div.querySelector('.song-action-btn');
        favBtn.addEventListener('click', function(event) {
            toggleFavorite(event, favBtn, song);
        });

        div.addEventListener('click', function(event) {
            if (!event.target.closest('.song-action-btn')) {
                if (typeof window.setTrackList === 'function') {
                    window.setTrackList(displayedSongs, i);
                }
                playSong(song);
            }
        });
        songsList.appendChild(div);
    }
}

function toggleFavorite(event, button, track) {
    if (event) {
        event.stopPropagation();
    }

    let trackToSave = track;

    if (!trackToSave) {
        const row = button.closest('.song-row');
        if (row) {
            const titleEl = row.querySelector('.song-title');
            if (titleEl) {
                for (let i = 0; i < songDatabase.length; i++) {
                    if (songDatabase[i].title === titleEl.textContent) {
                        trackToSave = songDatabase[i];
                        break;
                    }
                }
            }
        }
    }

    if (!trackToSave) {
        return;
    }

    let foundIdx = -1;
    for (let i = 0; i < favoriteTracks.length; i++) {
        if (String(favoriteTracks[i].id) === String(trackToSave.id)) {
            foundIdx = i;
            break;
        }
    }

    const span = button.querySelector('span');
    if (foundIdx > -1) {
        favoriteTracks.splice(foundIdx, 1);
        if (span) {
            span.style.fontVariationSettings = '';
            span.style.color = '';
        }
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.textContent.trim() === 'Улюблені') {
            switchLibraryTab('favorites');
        }
    } else {
        favoriteTracks.push(trackToSave);
        if (span) {
            span.style.fontVariationSettings = "'FILL' 1";
            span.style.color = '#ff6b9d';
        }
    }

    try {
        localStorage.setItem('favoriteTracks', JSON.stringify(favoriteTracks));
    } catch (e) {}
}

window.performSearch = performSearch;
window.quickSearch = quickSearch;
window.switchLibraryTab = switchLibraryTab;
window.toggleFavorite = toggleFavorite;
