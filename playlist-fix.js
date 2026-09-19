/* Final playlist cleanup: keep one track menu and replace browser prompts. */
(function () {
    'use strict';

    function getTrackByTitle(title) {
        var lists = [window.localTracks || [], window.activeTracks || []];
        for (var i = 0; i < lists.length; i++) {
            for (var j = 0; j < lists[i].length; j++) {
                if (lists[i][j].title === title) return lists[i][j];
            }
        }
        return { title: title };
    }

    function removeLegacyMenus() {
        document.querySelectorAll('.song-more-wrap').forEach(function (legacy) {
            legacy.remove();
        });
    }

    function replaceCreateButton() {
        document.querySelectorAll('.playlist-create').forEach(function (oldButton) {
            if (oldButton.dataset.customCreate === 'true') return;
            var button = oldButton.cloneNode(true);
            button.dataset.customCreate = 'true';
            oldButton.replaceWith(button);
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                openCreateModal();
            });
        });
    }

    function openCreateModal() {
        if (document.querySelector('.playlist-create-modal')) return;
        var picker = document.querySelector('.playlist-picker');
        var titleNode = picker && picker.querySelector('.playlist-selected-track');
        var trackTitle = titleNode ? titleNode.textContent.trim() : '';
        var track = getTrackByTitle(trackTitle);
        var modal = document.createElement('div');
        modal.className = 'playlist-create-modal';
        modal.innerHTML = '<div class="playlist-create-dialog" role="dialog" aria-modal="true" aria-labelledby="playlist-create-title"><h3 id="playlist-create-title">Создать плейлист</h3><label>Название плейлиста<input class="playlist-name-input" type="text" maxlength="80"></label><div class="playlist-create-actions"><button type="button" class="playlist-cancel">Отмена</button><button type="button" class="playlist-save">Создать</button></div></div>';
        document.body.appendChild(modal);
        var input = modal.querySelector('.playlist-name-input');
        input.value = track.title || 'Новый плейлист';
        input.select();
        function close() { modal.remove(); }
        modal.addEventListener('click', function (event) { if (event.target === modal) close(); });
        modal.querySelector('.playlist-cancel').addEventListener('click', close);
        modal.querySelector('.playlist-save').addEventListener('click', function () {
            var name = input.value.trim();
            if (!name) { input.focus(); return; }
            var data;
            try { data = JSON.parse(localStorage.getItem('pulseWavePlaylists')) || {}; } catch (error) { data = {}; }
            if (data[name]) { input.setCustomValidity('Плейлист уже существует'); input.reportValidity(); return; }
            data[name] = trackTitle ? [track] : [];
            localStorage.setItem('pulseWavePlaylists', JSON.stringify(data));
            close();
            var toast = document.querySelector('.playlist-toast');
            if (toast) {
                toast.textContent = trackTitle ? 'Трек «' + trackTitle + '» был успешно добавлен!' : 'Плейлист создан';
                toast.classList.add('visible');
                setTimeout(function () { toast.classList.remove('visible'); }, 3000);
            }
            document.querySelectorAll('[data-user-playlist]').forEach(function (card) { card.remove(); });
            document.dispatchEvent(new CustomEvent('playlistchanged'));
        });
        input.addEventListener('keydown', function (event) { if (event.key === 'Enter') modal.querySelector('.playlist-save').click(); if (event.key === 'Escape') close(); });
    }

    var style = document.createElement('style');
    style.textContent = '.song-more-wrap{display:none!important}.playlist-create-modal{position:fixed;inset:0;z-index:4000;background:rgba(0,0,0,.68);display:flex;align-items:center;justify-content:center;padding:20px}.playlist-create-dialog{width:min(480px,100%);background:#242424;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:26px;box-shadow:0 20px 70px #000}.playlist-create-dialog h3{font-size:24px;margin:0 0 20px}.playlist-create-dialog label{display:block;color:#ddd;font-size:15px}.playlist-name-input{display:block;width:100%;margin-top:8px;padding:13px 14px;border:1px solid #777;border-radius:8px;background:#171717;color:#fff;font-size:17px;outline:none}.playlist-name-input:focus{border-color:var(--primary-light);box-shadow:0 0 0 2px rgba(206,189,255,.25)}.playlist-create-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.playlist-create-actions button{border:0;border-radius:22px;padding:10px 20px;cursor:pointer;font-size:15px}.playlist-cancel{background:#444;color:#fff}.playlist-save{background:var(--primary-light);color:#171717;font-weight:600}';
    document.head.appendChild(style);

    function sync() {
        removeLegacyMenus();
        replaceCreateButton();
    }

    document.addEventListener('DOMContentLoaded', function () {
        sync();
        var observer = new MutationObserver(sync);
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
