/* Playlist picker and editor for Pulse Wave. Include after index.js/player.js. */
(function () {
    'use strict';

    const STORAGE_KEY = 'pulseWavePlaylists';
    const COVER_KEY = 'pulseWavePlaylistCovers';
    const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80';
    let activeTrack = null;
    let picker = null;
    let toast = null;

    function read(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value && typeof value === 'object' ? value : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function trackKey(track) {
        return track && track.id ? String(track.id) : (track && track.title) || '';
    }

    function getPlaylists() {
        const value = read(STORAGE_KEY, {});
        return Array.isArray(value) ? {} : value;
    }

    function showToast(message) {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'playlist-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () { toast.classList.remove('visible'); }, 3000);
    }

    function closePicker() {
        if (picker) picker.remove();
        picker = null;
    }

    function createPicker(track) {
        closePicker();
        activeTrack = track;
        const playlists = getPlaylists();
        const names = Object.keys(playlists);

        picker = document.createElement('div');
        picker.className = 'playlist-picker-backdrop';
        picker.innerHTML = '<section class="playlist-picker" role="dialog" aria-modal="true" aria-label="Добавить в плейлист">' +
            '<div class="playlist-picker-left">' +
            '<input class="playlist-search" type="search" placeholder="Поиск плейлиста" aria-label="Поиск плейлиста">' +
            '<button class="playlist-create" type="button"><span class="material-symbols-outlined">add</span>Создать плейлист</button>' +
            '<div class="playlist-picker-list"></div>' +
            '</div>' +
            '<div class="playlist-picker-right"><button class="playlist-picker-close" type="button" aria-label="Закрыть">×</button>' +
            '<h3>Добавить в плейлист</h3><p class="playlist-selected-track"></p>' +
            '<div class="playlist-choice-list"></div></div></section>';
        document.body.appendChild(picker);

        const search = picker.querySelector('.playlist-search');
        const leftList = picker.querySelector('.playlist-picker-list');
        const rightList = picker.querySelector('.playlist-choice-list');
        picker.querySelector('.playlist-picker-close').addEventListener('click', closePicker);
        picker.addEventListener('click', function (event) { if (event.target === picker) closePicker(); });
        picker.querySelector('.playlist-selected-track').textContent = track.title || 'Без названия';

        function render(filter) {
            leftList.innerHTML = '';
            rightList.innerHTML = '';
            Object.keys(playlists).filter(function (name) { return name.toLowerCase().includes((filter || '').toLowerCase()); }).forEach(function (name) {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'playlist-choice';
                item.innerHTML = '<span class="material-symbols-outlined">queue_music</span><span><b></b><small></small></span>';
                item.querySelector('b').textContent = name;
                item.querySelector('small').textContent = playlists[name].length + ' трек(ов)';
                item.addEventListener('click', function () { addTrack(name); });
                leftList.appendChild(item);
                rightList.appendChild(item.cloneNode(true));
                rightList.lastChild.addEventListener('click', function () { addTrack(name); });
            });
        }

        function addTrack(name) {
            if (!playlists[name].some(function (item) { return trackKey(item) === trackKey(activeTrack); })) {
                playlists[name].push(activeTrack);
                write(STORAGE_KEY, playlists);
                showToast('Трек «' + (activeTrack.title || 'Без названия') + '» был успешно добавлен!');
            } else {
                showToast('Трек уже есть в плейлисте «' + name + '»');
            }
            closePicker();
        }

        picker.querySelector('.playlist-create').addEventListener('click', function () {
            const name = window.prompt('Название плейлиста:', activeTrack.title || 'Новый плейлист');
            if (!name || !name.trim()) return;
            const cleanName = name.trim();
            if (playlists[cleanName]) {
                showToast('Плейлист с таким названием уже существует');
                return;
            }
            playlists[cleanName] = [activeTrack];
            write(STORAGE_KEY, playlists);
            showToast('Трек «' + (activeTrack.title || 'Без названия') + '» был успешно добавлен!');
            closePicker();
            renderPlaylistCards();
        });
        search.addEventListener('input', function () { render(search.value); });
        render('');
    }

    function renderPlaylistCards() {
        const container = document.getElementById('library-playlists');
        if (!container) return;
        const playlists = getPlaylists();
        container.querySelectorAll('[data-user-playlist]').forEach(function (card) { card.remove(); });
        Object.keys(playlists).forEach(function (name) {
            const card = document.createElement('div');
            card.className = 'card user-playlist-card';
            card.dataset.userPlaylist = name;
            const cover = playlists[name][0] && (playlists[name][0].cover || DEFAULT_COVER);
            card.innerHTML = '<div class="card-img-wrapper"><img class="card-img" alt="Обложка плейлиста"><button class="card-play-btn" type="button"><span class="material-symbols-outlined">play_arrow</span></button></div><div class="card-title"></div><div class="card-subtitle"></div>';
            card.querySelector('img').src = cover;
            card.querySelector('.card-title').textContent = name;
            card.querySelector('.card-subtitle').textContent = playlists[name].length + ' трек(ов)';
            card.addEventListener('click', function () {
                if (typeof window.setTrackList === 'function') window.setTrackList(playlists[name], 0);
                if (playlists[name][0] && typeof window.playSong === 'function') window.playSong(playlists[name][0]);
            });
            container.appendChild(card);
        });
    }

    function getTrackFromRow(row) {
        const title = row.querySelector('.song-title');
        const artist = row.querySelector('.song-artist');
        if (!title) return null;
        const lists = [window.localTracks || [], window.activeTracks || []];
        for (let i = 0; i < lists.length; i++) {
            const found = lists[i].find(function (track) {
                return track.title === title.textContent && (!artist || (track.artist || (track.user && track.user.name)) === artist.textContent);
            });
            if (found) return found;
        }
        return { title: title.textContent, artist: artist ? artist.textContent : '' };
    }

    function enhanceRows() {
        document.querySelectorAll('.song-row').forEach(function (row) {
            if (row.querySelector('.playlist-more-button')) return;
            const track = getTrackFromRow(row);
            if (!track) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'song-action-btn playlist-more-button';
            button.title = 'Действия с треком';
            button.innerHTML = '<span class="material-symbols-outlined">more_vert</span>';
            button.addEventListener('click', function (event) { event.stopPropagation(); createPicker(track); });
            row.appendChild(button);
        });
    }

    const style = document.createElement('style');
    style.textContent = '.playlist-more-button{display:none!important}.song-row:hover .playlist-more-button,.playlist-more-button:focus{display:flex!important}.playlist-picker-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}.playlist-picker{display:grid;grid-template-columns:minmax(250px,35%) minmax(300px,1fr);width:min(760px,100%);max-height:min(560px,90vh);overflow:hidden;background:#292929;border-radius:10px;box-shadow:0 20px 70px #000;color:var(--text-main)}.playlist-picker-left{border-right:1px solid rgba(255,255,255,.1);padding:14px;overflow:auto}.playlist-picker-right{position:relative;padding:30px 24px;overflow:auto}.playlist-picker-right h3{font-size:22px;margin-bottom:10px}.playlist-search{width:100%;padding:12px 14px;background:#404040;border:0;border-radius:8px;color:#fff;font-size:16px;outline:0}.playlist-create{width:100%;margin:14px 0;padding:12px;background:none;border:0;color:#fff;text-align:left;font-size:16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.12)}.playlist-choice{display:flex;align-items:center;gap:12px;width:100%;padding:12px 8px;border:0;background:none;color:#fff;text-align:left;border-radius:6px;cursor:pointer}.playlist-choice:hover{background:#3b3b3b}.playlist-choice small{display:block;color:var(--text-muted);margin-top:3px}.playlist-picker-close{position:absolute;right:14px;top:8px;background:none;border:0;color:#fff;font-size:28px;cursor:pointer}.playlist-selected-track{color:var(--text-muted);margin-bottom:20px}.playlist-toast{position:fixed;left:50%;bottom:calc(var(--player-height) + 18px);transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:3000;background:#2d1a55;color:#fff;border:1px solid #854dff;border-radius:8px;padding:12px 18px;box-shadow:0 8px 30px #000;transition:opacity .2s,transform .2s}.playlist-toast.visible{opacity:1;transform:translate(-50%,0)}@media(max-width:600px){.playlist-picker{grid-template-columns:1fr;max-height:85vh}.playlist-picker-right{display:none}.playlist-picker-left{border-right:0}.playlist-toast{width:calc(100% - 24px);text-align:center}}';
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', function () {
        enhanceRows();
        renderPlaylistCards();
        const observer = new MutationObserver(function () { enhanceRows(); });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
