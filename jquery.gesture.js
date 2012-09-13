(function ($) {
    $.fn.gestureInit = function (options) {
        if (!this.isTouchSupported()) {
            return;
        }

        if (!options || typeof (options) != "object") {
            options = {};
        }

        options = $.extend(
            {
                prefix: "_gesture_"
            },
            options);

        if (!options.prefix) options.prefix = "_gesture_";

        tOptions = {
            preventDefault: true,
            mouse: false,
            pen: false,
            maxtouch: 2,
            prefix: options.prefix
        };

        var _gesture_handler = function (event) {
            var touches = [],
                eventType = null;
            if (event.touches.length == 2) {
                touches = event.touches;
                if (event.type == options.prefix + "touch_start") {
                    eventType = "start";
                } else if (event.type == options.prefix + "touch_move") {
                    eventType = "move";
                }
            } else if (event.touches.length == 1) {
                if (event.type == options.prefix + "touch_end") {
                    eventType = "end";
                }
            }

            if (eventType) {
                var gEvent = $.Event("gesture_" + eventType);
                try { $(this).trigger(gEvent); } catch (error) { }
            }
        };

        this.touchInit(options);
        this.on(options.prefix + "touch_start", _gesture_handler);
        this.on(options.prefix + "touch_move", _gesture_handler);
        this.on(options.prefix + "touch_end", _gesture_handler);
        this.data("_gesture_handler", _gesture_handler);
    };

    $.fn.gestureDispose = function (prefix) {
        if (!prefix || typeof (prefix) != "string") {
            prefix = "_gesture_";
        }

        var _gesture_handler = this.data("_gesture_handler");
        this.off(prefix + "touch_start", _gesture_handler);
        this.off(prefix + "touch_move", _gesture_handler);
        this.off(prefix + "touch_end", _gesture_handler);
        this.removeData("_gesture_handler");
        this.touchDispose("_gesture_");
    };
})(jQuery);
