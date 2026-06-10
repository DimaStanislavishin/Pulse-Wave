const playerAppName = 'Pulse Wave';
const defaultApiHost = 'https://discoveryprovider.audius.co';
const defaultCover = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80';

let audio = null;
let progressBar = null;
let currentTimeText = null;
let totalTimeText = null;
let currentTitle = null;
let currentArtist = null;
let currentCover = null;
let playButton = null;
let trackList = [];
let trackIndex = 0;
let shuffleEnabled = false;
let repeatEnabled = false;

function getPlayerApiHost() {
    return window.apiHost || defaultApiHost;
}

function formatPlayerTime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const restSeconds = Math.floor(seconds % 60);

    if (restSeconds < 10) {
        return minutes + ':0' + restSeconds;
    }

    return minutes + ':' + restSeconds;
}

function getPlayerCover(track) {
    if (track.artwork && track.artwork['150x150']) {
        return track.artwork['150x150'];
    }

    if (track.cover) {
        return track.cover;
    }

    return defaultCover;
}

function getPlayerArtist(track) {
    if (track.user && track.user.name) {
        return track.user.name;
    }

    if (track.artist) {
        return track.artist;
    }

    return 'Невідомий';
}

function getTrackStreamUrl(track) {
    if (!track) {
        return '';
    }

    if (typeof track.stream === 'string') {
        return track.stream;
    }

    if (track.stream && track.stream.url) {
        return track.stream.url;
    }

    if (track.stream_url) {
        return track.stream_url;
    }

    if (track.id) {
        return getPlayerApiHost() + '/v1/tracks/' + track.id + '/stream?app_name=' + encodeURIComponent(playerAppName);
    }

    return '';
}

function findTrackByTitle(title) {
    const lowerTitle = title.toLowerCase();
    const lists = [trackList, window.localTracks || []];

    for (let listIndex = 0; listIndex < lists.length; listIndex++) {
        const list = lists[listIndex];

        for (let i = 0; i < list.length; i++) {
            if (list[i].title && list[i].title.toLowerCase() === lowerTitle) {
                trackList = list;
                trackIndex = i;
                return list[i];
            }
        }
    }

    return null;
}

function findTrack(track) {
    if (typeof track === 'string') {
        return findTrackByTitle(track);
    }

    if (!track) {
        return null;
    }

    for (let i = 0; i < trackList.length; i++) {
        const item = trackList[i];

        if (item.id && track.id && String(item.id) === String(track.id)) {
            trackIndex = i;
            return item;
        }

        if (item.title && track.title && item.title.toLowerCase() === track.title.toLowerCase()) {
            trackIndex = i;
            return item;
        }
    }

    return track;
}

function updatePlayer(track) {
    if (!track) {
        return;
    }

    currentTitle.textContent = track.title || '';
    currentArtist.textContent = getPlayerArtist(track);
    currentCover.src = getPlayerCover(track);
}

function updatePlayIcon() {
    if (!playButton) {
        return;
    }

    const icon = playButton.querySelector('span');

    if (!icon) {
        return;
    }

    if (audio && !audio.paused) {
        icon.textContent = 'pause';
    } else {
        icon.textContent = 'play_arrow';
    }
}

function playCurrentAudio() {
    audio.play()
        .then(function() {
            updatePlayIcon();
        })
        .catch(function() {
            updatePlayIcon();
        });
}

function playSong(track) {
    if (!audio) {
        initializePlayer();
    }

    const foundTrack = findTrack(track);

    if (!foundTrack) {
        return;
    }

    const streamUrl = getTrackStreamUrl(foundTrack);

    if (!streamUrl) {
        return;
    }

    updatePlayer(foundTrack);
    audio.src = streamUrl;
    playCurrentAudio();
}

function togglePlay() {
    if (!audio) {
        initializePlayer();
    }

    if (!audio.src && trackList.length > 0) {
        playSong(trackList[trackIndex] || trackList[0]);
        return;
    }

    if (audio.paused) {
        playCurrentAudio();
    } else {
        audio.pause();
        updatePlayIcon();
    }
}

function playNext() {
    if (trackList.length === 0) {
        return;
    }

    if (shuffleEnabled && trackList.length > 1) {
        let nextIndex = trackIndex;

        while (nextIndex === trackIndex) {
            nextIndex = Math.floor(Math.random() * trackList.length);
        }

        trackIndex = nextIndex;
    } else {
        trackIndex++;

        if (trackIndex >= trackList.length) {
            trackIndex = 0;
        }
    }

    playSong(trackList[trackIndex]);
}

function playPrevious() {
    if (trackList.length === 0) {
        return;
    }

    if (shuffleEnabled && trackList.length > 1) {
        let previousIndex = trackIndex;

        while (previousIndex === trackIndex) {
            previousIndex = Math.floor(Math.random() * trackList.length);
        }

        trackIndex = previousIndex;
    } else {
        trackIndex--;

        if (trackIndex < 0) {
            trackIndex = trackList.length - 1;
        }
    }

    playSong(trackList[trackIndex]);
}

function seekTrack(value) {
    if (audio && audio.duration) {
        audio.currentTime = audio.duration * (Number(value) / 100);
    }
}

function changeVolume(value) {
    if (audio) {
        audio.volume = Number(value) / 100;
    }
}

function setButtonActive(buttonId, isActive) {
    const button = document.getElementById(buttonId);

    if (!button) {
        return;
    }

    if (isActive) {
        button.style.color = '#ff6b9d';
        button.style.fontWeight = 'bold';
    } else {
        button.style.color = '';
        button.style.fontWeight = '';
    }
}

function toggleShuffle() {
    shuffleEnabled = !shuffleEnabled;
    setButtonActive('shuffle-icon', shuffleEnabled);
}

function toggleRepeat() {
    repeatEnabled = !repeatEnabled;
    setButtonActive('repeat-icon', repeatEnabled);
}

function updateProgress() {
    if (audio && audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        totalTimeText.textContent = formatPlayerTime(audio.duration);
    }

    if (audio) {
        currentTimeText.textContent = formatPlayerTime(audio.currentTime);
    }
}

function onSongEnded() {
    updatePlayIcon();

    if (repeatEnabled) {
        audio.currentTime = 0;
        playCurrentAudio();
    } else {
        playNext();
    }
}

function setTrackList(tracks, startIndex) {
    if (!Array.isArray(tracks)) {
        return;
    }

    trackList = tracks;
    trackIndex = startIndex || 0;
}

function navigateTo(pageName, event) {
    if (event) {
        event.preventDefault();
    }

    const views = document.querySelectorAll('.view');

    for (let i = 0; i < views.length; i++) {
        views[i].classList.remove('active');
    }

    const currentView = document.getElementById('view-' + pageName);

    if (currentView) {
        currentView.classList.add('active');
    }

    const buttons = document.querySelectorAll('aside nav .nav-btn');

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    if (pageName === 'home' && buttons[0]) {
        buttons[0].classList.add('active');
    }

    if (pageName === 'search' && buttons[1]) {
        buttons[1].classList.add('active');
    }

    if (pageName === 'library' && buttons[2]) {
        buttons[2].classList.add('active');
    }
}

function initializePlayer() {
    audio = document.getElementById('audio');
    progressBar = document.getElementById('progress-bar');
    currentTimeText = document.getElementById('current-time');
    totalTimeText = document.getElementById('total-time');
    currentTitle = document.getElementById('current-title');
    currentArtist = document.getElementById('current-artist');
    currentCover = document.getElementById('current-cover');
    playButton = document.getElementById('play-btn');

    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'audio';
        audio.preload = 'metadata';
        document.body.appendChild(audio);
    }

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onSongEnded);

    changeVolume(75);
    updatePlayIcon();
}

document.addEventListener('DOMContentLoaded', initializePlayer);

window.playSong = playSong;
window.togglePlay = togglePlay;
window.playNext = playNext;
window.playPrevious = playPrevious;
window.seekTrack = seekTrack;
window.changeVolume = changeVolume;
window.setTrackList = setTrackList;
window.navigateTo = navigateTo;
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
