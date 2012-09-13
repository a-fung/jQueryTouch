(function ($) {
    $.fn.gestureInit = function () {
        if (!this.isTouchSupported()) {
            return;
        }

        if (!options || typeof (options) != "object") {
            options = {};
        }

        var options = {
            preventDefault: true,
            mouse: false,
            pen: false,
            prefix: "_gesture_"
        };

        var _gesture_handler = function (event) {
        };

        this.touchInit(options);
        this.on("_gesture_tstart", _gesture_handler);
        this.on("_gesture_tmove", _gesture_handler);
        this.on("_gesture_tend", _gesture_handler);
        this.data("_gesture_handler", _gesture_handler);
    };

    $.fn.gestureDispose = function () {
        var _gesture_handler = this.data("_gesture_handler");
        this.off("_gesture_tstart", _gesture_handler);
        this.off("_gesture_tmove", _gesture_handler);
        this.off("_gesture_tend", _gesture_handler);
        this.removeData("_gesture_handler");
        this.touchDispose("_gesture_");
    };
})(jQuery);
