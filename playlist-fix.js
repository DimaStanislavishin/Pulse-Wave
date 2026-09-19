/*
 * Safe playlist compatibility layer.
 *
 * This file intentionally does not install a MutationObserver. The previous
 * version continuously removed .song-more-wrap while playlist-ui.js recreated
 * it, which caused an endless DOM mutation loop and made the whole interface
 * stop responding.
 */
(function () {
    'use strict';

    function removeLegacyMenusOnce() {
        document.querySelectorAll('.song-more-wrap').forEach(function (legacyMenu) {
            legacyMenu.remove();
        });
    }

    function closeLegacyPromptIfPresent() {
        // Do not intercept clicks or keyboard events. Native prompt/alert calls
        // are owned by the playlist picker and remain functional until it is
        // replaced by the picker modal itself.
        removeLegacyMenusOnce();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', closeLegacyPromptIfPresent, { once: true });
    } else {
        closeLegacyPromptIfPresent();
    }
})();
