(function ($) {
    $.fn.gestureInit = function (options) {
        if (!this.isTouchSupported()) {
            return;
        }

        if (!options || typeof (options) != "object") {
            options = {};
        }
    };
})(jQuery);
