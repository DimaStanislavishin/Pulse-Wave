// player.js — shared audio player for Pulse Wave
const playerAppName = 'Pulse Wave';
let playerApiHost = 'https://discoveryprovider.audius.co';
let playerAudio = null;
let playerProgressBar = null;
let playerCurrentTime = null;
let playerTotalTime = null;
let playerTitle = null;
let playerArtist = null;
let playerCover = null;
let playerPlayButton = null;
let playerTracks = [];
let playerIndex = -1;

function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function setTrackList(tracks, startIndex = 0) {
    if (!Array.isArray(tracks)) return;
    playerTracks = tracks;
    playerIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
}

function navigateTo(eventOrPage, pageName) {
    let targetPage = pageName;
    let evt = eventOrPage;
    if (typeof eventOrPage === 'string') {
        targetPage = eventOrPage;
        evt = window.event;
    }

    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(`view-${targetPage}`);
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    evt?.target?.closest('.nav-btn')?.classList.add('active');

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
    const mobileBtn = document.getElementById(`m-nav-${targetPage}`);
    if (mobileBtn) mobileBtn.classList.add('active');
}

function initPlayerHost() {
    fetch('https://api.audius.co')
        .then(r => r.json())
        .then(result => {
            if (result && result.length) playerApiHost = result[0];
        })
        .catch(() => console.warn('Audius host detection failed — using fallback'));
}

function resolveStreamUrl(track) {
    if (!track) return '';
    if (track.id) {
        return `${playerApiHost}/v1/tracks/${track.id}/stream?app_name=${encodeURIComponent(playerAppName)}`;
    }
    if (track.stream) {
        return track.stream;
    }
    return '';
}

function updatePlayerUI(track) {
    if (!track) return;
    const coverUrl = track.artwork ? (track.artwork['150x150'] || '') : (track.cover || '');
    if (playerTitle) playerTitle.innerText = track.title || '';
    if (playerArtist) playerArtist.innerText = track.user?.name || (track.artist || '');
    if (playerCover && coverUrl) playerCover.src = coverUrl;
}

function applyPlayState() {
    if (!playerPlayButton) return;
    const icon = playerPlayButton.querySelector('span');
    if (!icon) return;
    icon.textContent = playerAudio && !playerAudio.paused ? 'pause' : 'play_arrow';
}

function playSong(trackOrTitle, artist, cover) {
    let track = trackOrTitle;
    if (typeof trackOrTitle === 'string') {
        track = { title: trackOrTitle, user: { name: artist || '' }, artwork: { '150x150': cover || '' }, cover: cover || '' };
    }
    if (!track) return;
    updatePlayerUI(track);

    const streamUrl = resolveStreamUrl(track);
    if (streamUrl && playerAudio) {
        playerAudio.src = streamUrl;
        playerAudio.play().catch(() => {});
    }
    applyPlayState();
}

function togglePlay() {
    if (!playerAudio) return;
    if (playerAudio.paused) {
        playerAudio.play().catch(() => {});
    } else {
        playerAudio.pause();
    }
    applyPlayState();
}

function playNext() {
    if (!playerTracks || playerTracks.length === 0) return;
    playerIndex = (playerIndex + 1) % playerTracks.length;
    const nextTrack = playerTracks[playerIndex];
    if (nextTrack) playSong(nextTrack);
}

function playPrevious() {
    if (!playerTracks || playerTracks.length === 0) return;
    playerIndex = (playerIndex - 1 + playerTracks.length) % playerTracks.length;
    const prevTrack = playerTracks[playerIndex];
    if (prevTrack) playSong(prevTrack);
}

function seekTrack(value) {
    if (!playerAudio || !playerAudio.duration) return;
    const pct = Number(value);
    if (isNaN(pct)) return;
    playerAudio.currentTime = playerAudio.duration * (pct / 100);
}

function changeVolume(value) {
    if (!playerAudio) return;
    playerAudio.volume = Math.max(0, Math.min(1, Number(value) / 100));
}

function initializePlayerElements() {
    playerAudio = document.getElementById('audio');
    playerProgressBar = document.getElementById('progress-bar');
    playerCurrentTime = document.getElementById('current-time');
    playerTotalTime = document.getElementById('total-time');
    playerTitle = document.getElementById('current-title');
    playerArtist = document.getElementById('current-artist');
    playerCover = document.getElementById('current-cover');
    playerPlayButton = document.getElementById('play-btn');

    if (!playerAudio) {
        playerAudio = document.createElement('audio');
        playerAudio.id = 'audio';
        playerAudio.preload = 'metadata';
        document.body.appendChild(playerAudio);
    }

    if (playerAudio) {
        playerAudio.addEventListener('timeupdate', () => {
            if (playerProgressBar && playerAudio.duration) {
                playerProgressBar.value = (playerAudio.currentTime / playerAudio.duration) * 100;
            }
            if (playerCurrentTime) playerCurrentTime.innerText = formatTime(playerAudio.currentTime);
            if (playerTotalTime && playerAudio.duration) playerTotalTime.innerText = formatTime(playerAudio.duration);
        });

        playerAudio.addEventListener('ended', () => {
            applyPlayState();
            playNext();
        });
    }

    applyPlayState();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePlayerElements();
    initPlayerHost();
});

window.playSong = playSong;
window.togglePlay = togglePlay;
window.playNext = playNext;
window.playPrevious = playPrevious;
window.seekTrack = seekTrack;
window.changeVolume = changeVolume;
window.setTrackList = setTrackList;
window.navigateTo = navigateTo;
