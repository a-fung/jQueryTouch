(function ($) {
    $.fn.gestureInit = function (options) {
        if (!options || typeof (options) != "object") {
            options = {};
        }

        options = $.extend(
            {
                prefix: "_gesture_",
                gesture_prefix: ""
            },
            options);

        if (!options.prefix) options.prefix = "_gesture_";

        var tOptions = {
            preventDefault: true,
            mouse: true,
            pen: true,
            maxtouch: 2,
            prefix: options.prefix
        };

        var original_distance, original_angle, id1;

        var _gesture_handler = function (event) {
            var touches = [],
                eventType = null;
            if (event.touches.length == 2) {
                touches = event.touches;
                if (event.type == options.prefix + "touch_start") {
                    eventType = "start";
                    original_distance = Math.sqrt(Math.sqr(touches[0].pageX - touches[1].pageX) + Math.sqr(touches[0].pageY - touches[1].pageY));
                    original_angle = Math.atan2(touches[0].pageY - touches[1].pageY, touches[0].pageX - touches[1].pageX);
                    id1 = touches[0].id;
                } else if (event.type == options.prefix + "touch_move") {
                    eventType = "move";
                }
            } else if (event.touches.length == 1 && event.type == options.prefix + "touch_end") {
                eventType = "end";
                var touch2 = {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY,
                    screenX: event.screenX,
                    screenY: event.screenY
                };
                touches = (id1 == event.touches[0].id) ? [event.touches[0], touch2] : [touch2, event.touches[0]];
            }

            if (eventType) {
                var gEvent = $.Event(options.gesture_prefix + "gesture_" + eventType);
                gEvent = $.extend(
                    gEvent,
                    {
                        scale: Math.sqrt(Math.sqr(touches[0].pageX - touches[1].pageX) + Math.sqr(touches[0].pageY - touches[1].pageY)) / original_distance,
                        rotation: Math.atan2(touches[0].pageY - touches[1].pageY, touches[0].pageX - touches[1].pageX) - original_angle,
                        clientX: (touches[0].clientX + touches[1].clientX) / 2,
                        clientY: (touches[0].clientY + touches[1].clientY) / 2,
                        pageX: (touches[0].pageX + touches[1].pageX) / 2,
                        pageY: (touches[0].pageY + touches[1].pageY) / 2,
                        screenX: (touches[0].screenX + touches[1].screenX) / 2,
                        screenY: (touches[0].screenY + touches[1].screenY) / 2
                    });

                try { $(this).trigger(gEvent); } catch (error) { console.log(error); }
                //$(this).trigger(gEvent);
            }
        };

        this.touchInit(tOptions);
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

Math.sqr = function (number) {
    return number * number;
};
