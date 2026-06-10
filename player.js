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
let isShuffle = false;
let isRepeat = false;

const fallbackSongs = [
    { id: 1, title: 'Electric Moonlight', artist: 'Neon Horizon', album: 'After Dark', duration: '3:45', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Digital Soul', artist: 'Chrome Static', album: 'The Grid', duration: '4:12', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'Rainy Rooftops', artist: 'Lo-fi Echo', album: 'Cozy Vibes', duration: '2:58', cover: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Midnight Lofi', artist: 'Chill Beats', album: 'Night Sessions', duration: '3:22', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 5, title: 'Starlight Orbit', artist: 'Cosmic Voyager', album: 'Deep Space', duration: '4:05', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 6, title: 'Neon Pulse', artist: 'Hyperion Dreams', album: 'Hyperion Dreams', duration: '3:30', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80', stream: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
];

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) {
        return '0:00';
    }
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ':' + formattedSeconds;
}

function setTrackList(tracks, startIndex) {
    playerTracks = tracks;
    playerIndex = startIndex;
}

function navigateTo(pageName) {
    const views = document.querySelectorAll('.view');
    for (let i = 0; i < views.length; i++) {
        views[i].classList.remove('active');
    }
    const targetView = document.getElementById('view-' + pageName);
    if (targetView) {
        targetView.classList.add('active');
    }

    const navButtons = document.querySelectorAll('aside nav .nav-btn');
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove('active');
    }
    let asideIndex = 0;
    if (pageName === 'search') asideIndex = 1;
    else if (pageName === 'library') asideIndex = 2;
    if (navButtons[asideIndex]) {
        navButtons[asideIndex].classList.add('active');
    }
}

function initPlayerHost() {
    fetch('https://api.audius.co')
        .then(function(r) {
            return r.json();
        })
        .then(function(result) {
            if (result && result.length) {
                playerApiHost = result[Math.floor(Math.random() * result.length)];
            }
        })
        .catch(function(err) {
            console.warn(err);
        });
}

function resolveStreamUrl(track) {
    if (!track) {
        return '';
    }
    if (track.stream) {
        return track.stream;
    }
    if (track.id) {
        return playerApiHost + '/v1/tracks/' + track.id + '/stream?app_name=' + encodeURIComponent(playerAppName);
    }
    return '';
}

function updatePlayerUI(track) {
    if (!track) {
        return;
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

    if (playerTitle) playerTitle.innerText = track.title || '';
    if (playerArtist) playerArtist.innerText = artistName;
    if (playerCover) playerCover.src = coverUrl;
}

function applyPlayState() {
    if (!playerPlayButton) {
        return;
    }
    const icon = playerPlayButton.querySelector('span');
    if (!icon) {
        return;
    }
    if (playerAudio && !playerAudio.paused) {
        icon.textContent = 'pause';
    } else {
        icon.textContent = 'play_arrow';
    }
}

function playSong(trackOrTitle, artist, cover) {
    if (!playerAudio) {
        initializePlayerElements();
    }

    let track = trackOrTitle;
    if (typeof trackOrTitle === 'string') {
        track = {
            title: trackOrTitle,
            artist: artist || '',
            cover: cover || ''
        };
    }
    if (!track) {
        return;
    }

    let found = false;
    if (playerTracks && playerTracks.length > 0) {
        for (let i = 0; i < playerTracks.length; i++) {
            const t = playerTracks[i];
            if ((t.id && track.id && String(t.id) === String(track.id)) || (t.title && track.title && t.title.toLowerCase() === track.title.toLowerCase())) {
                playerIndex = i;
                track = t;
                found = true;
                break;
            }
        }
    }
    
    if (!found) {
        for (let i = 0; i < fallbackSongs.length; i++) {
            const t = fallbackSongs[i];
            if (t.title && track.title && t.title.toLowerCase() === track.title.toLowerCase()) {
                playerTracks = fallbackSongs;
                playerIndex = i;
                track = t;
                found = true;
                break;
            }
        }
    }

    updatePlayerUI(track);

    const streamUrl = resolveStreamUrl(track);
    if (streamUrl && playerAudio) {
        playerAudio.src = streamUrl;
        playerAudio.play()
            .then(function() {
                applyPlayState();
            })
            .catch(function(err) {
                console.error(err);
                applyPlayState();
            });
    }
    applyPlayState();
}

function togglePlay() {
    if (!playerAudio) {
        initializePlayerElements();
    }
    if (!playerAudio) {
        return;
    }
    if (playerAudio.paused) {
        playerAudio.play().then(function() {
            applyPlayState();
        }).catch(function(err) {});
    } else {
        playerAudio.pause();
        applyPlayState();
    }
}

function playNext() {
    if (!playerAudio) {
        initializePlayerElements();
    }
    if (!playerTracks || playerTracks.length === 0) {
        return;
    }
    
    if (isShuffle && playerTracks.length > 1) {
        let newIndex = playerIndex;
        while (newIndex === playerIndex) {
            newIndex = Math.floor(Math.random() * playerTracks.length);
        }
        playerIndex = newIndex;
    } else {
        playerIndex = (playerIndex + 1) % playerTracks.length;
    }
    
    const nextTrack = playerTracks[playerIndex];
    if (nextTrack) {
        playSong(nextTrack);
    }
}

function playPrevious() {
    if (!playerAudio) {
        initializePlayerElements();
    }
    if (!playerTracks || playerTracks.length === 0) {
        return;
    }
    
    if (isShuffle && playerTracks.length > 1) {
        let newIndex = playerIndex;
        while (newIndex === playerIndex) {
            newIndex = Math.floor(Math.random() * playerTracks.length);
        }
        playerIndex = newIndex;
    } else {
        playerIndex = (playerIndex - 1 + playerTracks.length) % playerTracks.length;
    }
    
    const prevTrack = playerTracks[playerIndex];
    if (prevTrack) {
        playSong(prevTrack);
    }
}

function seekTrack(value) {
    if (!playerAudio) {
        initializePlayerElements();
    }
    if (!playerAudio || !playerAudio.duration) {
        return;
    }
    playerAudio.currentTime = playerAudio.duration * (Number(value) / 100);
}

function changeVolume(value) {
    if (!playerAudio) {
        initializePlayerElements();
    }
    if (!playerAudio) {
        return;
    }
    playerAudio.volume = Number(value) / 100;
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffle-icon');
    if (btn) {
        if (isShuffle) {
            btn.style.color = '#ff6b9d';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.color = '';
            btn.style.fontWeight = '';
        }
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    const btn = document.getElementById('repeat-icon');
    if (btn) {
        if (isRepeat) {
            btn.style.color = '#ff6b9d';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.color = '';
            btn.style.fontWeight = '';
        }
    }
}

function handleTimeUpdate() {
    if (playerAudio && playerProgressBar && playerAudio.duration) {
        playerProgressBar.value = (playerAudio.currentTime / playerAudio.duration) * 100;
    }
    if (playerAudio && playerCurrentTime) {
        playerCurrentTime.innerText = formatTime(playerAudio.currentTime);
    }
    if (playerAudio && playerTotalTime && playerAudio.duration) {
        playerTotalTime.innerText = formatTime(playerAudio.duration);
    }
}

function handleTrackEnded() {
    applyPlayState();
    if (isRepeat) {
        if (playerAudio) {
            playerAudio.currentTime = 0;
            playerAudio.play().then(function() {
                applyPlayState();
            }).catch(function() {});
        }
    } else {
        playNext();
    }
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
        if (document.body) {
            document.body.appendChild(playerAudio);
        }
    }

    if (playerAudio) {
        playerAudio.removeEventListener('timeupdate', handleTimeUpdate);
        playerAudio.addEventListener('timeupdate', handleTimeUpdate);
        playerAudio.removeEventListener('ended', handleTrackEnded);
        playerAudio.addEventListener('ended', handleTrackEnded);
    }

    applyPlayState();
}

document.addEventListener('DOMContentLoaded', function() {
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
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
