/*!
* jQueryTouch v0.0.6
* https://github.com/a-fung/jQueryTouch
*
* Copyright 2012 Man Kwan Liu
* Released under the Apache License Version 2.0
* http://www.apache.org/licenses/
*
* Date: Wed Oct 2012 23:14:09 GMT-0700 (Pacific Daylight Time)
*/
(function ($) {
    // initiate gesture handler on jQuery objects
    // it will call touchInit, handle the touch events and trigger gesture events
    $.fn.gestureInit = function (options) {
        if (!options || typeof (options) != "object") {
            options = {};
        }

        // default options
        options = $.extend(
            {
                // use a prefix here to prevent others from overwriting/disposing
                // the touch handlers to be added
                prefix: "_gesture_",

                // add prefix to the touch events triggered
                gesture_prefix: ""
            },
            options);

        // use a default prefix if empty
        if (!options.prefix) options.prefix = "_gesture_";

        // the option to 
        var tOptions = {
            preventDefault: true,
            mouse: true,
            pen: true,
            maxtouch: 2, // gesture needs only two points
            prefix: options.prefix
        };

        var original_distance, original_angle, id1,
            sqr = function (n) { return n * n; }; // why JavaScript doesn't have Math.sqr() function?!

        var _gesture_handler = function (event) {
            var touches = [],
                eventType = null;

            if (event.touches.length == 2) { // gesture!
                touches = event.touches;
                if (event.type == options.prefix + "touch_start") { // gesture starts
                    eventType = "start";

                    // storing the original distance and angle between two touch points
                    original_distance = Math.sqrt(sqr(touches[0].pageX - touches[1].pageX) + sqr(touches[0].pageY - touches[1].pageY));
                    original_angle = Math.atan2(touches[0].pageY - touches[1].pageY, touches[0].pageX - touches[1].pageX);
                    id1 = touches[0].id;
                } else if (event.type == options.prefix + "touch_move") { // gesture moves
                    eventType = "move";
                }
            } else if (event.touches.length == 1 && event.type == options.prefix + "touch_end") { // gesture ends
                eventType = "end";

                var touch2 = {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY,
                    screenX: event.screenX,
                    screenY: event.screenY
                };

                // need to make sure the order is same as when gesture starts
                // to make the angle calculation correct
                touches = (id1 == event.touches[0].id) ? [event.touches[0], touch2] : [touch2, event.touches[0]];
            }

            if (eventType) { // gesture event
                var gEvent = $.Event(options.gesture_prefix + "gesture_" + eventType);
                gEvent = $.extend(
                    gEvent,
                    {
                        scale: Math.sqrt(sqr(touches[0].pageX - touches[1].pageX) + sqr(touches[0].pageY - touches[1].pageY)) / original_distance,
                        rotation: Math.atan2(touches[0].pageY - touches[1].pageY, touches[0].pageX - touches[1].pageX) - original_angle,

                        // all these are center of the two touch points
                        clientX: (touches[0].clientX + touches[1].clientX) / 2,
                        clientY: (touches[0].clientY + touches[1].clientY) / 2,
                        pageX: (touches[0].pageX + touches[1].pageX) / 2,
                        pageY: (touches[0].pageY + touches[1].pageY) / 2,
                        screenX: (touches[0].screenX + touches[1].screenX) / 2,
                        screenY: (touches[0].screenY + touches[1].screenY) / 2
                    });

                // triggering event in try/catch block
                try { $(this).trigger(gEvent); } catch (error) { console.log(error); }
            }
        };

        // initiates touch and add handlers
        this.touchInit(tOptions);
        this.on(options.prefix + "touch_start", _gesture_handler);
        this.on(options.prefix + "touch_move", _gesture_handler);
        this.on(options.prefix + "touch_end", _gesture_handler);
        this.data(options.gesture_prefix + "_gesture_handler", _gesture_handler);

        return this;
    };

    $.fn.gestureDispose = function (prefix, gesture_prefix) {
        if (!prefix || typeof (prefix) != "string") {
            prefix = "_gesture_";
        }

        if (!gesture_prefix || typeof (gesture_prefix) != "string") {
            prefix = "";
        }

        var _gesture_handler = this.data(gesture_prefix + "_gesture_handler");
        this.off(prefix + "touch_start", _gesture_handler);
        this.off(prefix + "touch_move", _gesture_handler);
        this.off(prefix + "touch_end", _gesture_handler);
        this.removeData(gesture_prefix + "_gesture_handler");
        this.touchDispose(prefix);

        return this;
    };
})(jQuery);
