
export const BlockUI = {

    showReloadOverlay: function() {
        document.getElementById('preloader').classList.remove('no-display');
    },

    fadeOutReloadOverlay: function() {
        document.getElementById('preloader').classList.add('no-display');
    }

}

/**
 * Flash message: for flashing messages out to the top right corner.
 */
export const FlashMsg = {

    message: function (msg, type, time) {
        BlockUI.fadeOutReloadOverlay();
        type = type || 'info';
        time = time || 1000;
        var flashContainer = document.getElementById('flash-container');
        flashContainer.innerHTML = '<div class="' + type + ' message">' + msg + '</div>';
        flashContainer.classList.add('showing');
        setTimeout(function () {
            flashContainer.classList.remove('showing');
        }, time);
    },

    success: function (msg, time) {
        FlashMsg.message(msg, 'success', time);
    },

    error: function (msg, time) {
        time = time || 5000;
        FlashMsg.message(msg, 'error', time);
    }

}
