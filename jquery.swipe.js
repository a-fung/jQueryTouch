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
    // an easy to use swipe function
    $.fn.swipe = function (handler, options) {
        if (typeof (handler) != "function") return this;

        if (!options || typeof (options) != "object") {
            options = {};
        }

        // default options
        options = $.extend(
            {
                preventDefault: true,
                mouse: true,
                pen: true,
                distance: 50 // default distance to trigger a swipe
            },
            options);

        // touch init options
        var tOptions = {
            preventDefault: options.preventDefault,
            mouse: options.mouse,
            pen: options.pen,
            maxtouch: 1, // swipe needs only 1 touch point
            prefix: "_swipe_"
        };

        var in_swipe, original_x, original_y,
            sqr = function (n) { return n * n; };

        var _handler = function (event) {
            if (event.type == "_swipe_touch_start") {
                in_swipe = true;
                original_x = event.pageX;
                original_y = event.pageY;
            } else {
                if (in_swipe) {
                    if (Math.sqrt(sqr(event.pageX - original_x) + sqr(event.pageY - original_y)) >= options.distance) {
                        in_swipe = false;
                        var direction,
                            angle = Math.atan2(event.pageY - original_y, event.pageX - original_x) / Math.PI * 8;

                        if (angle < -7) {
                            direction = "left";
                        } else if (angle < -5) {
                            direction = "upleft";
                        } else if (angle < -3) {
                            direction = "up";
                        } else if (angle < -1) {
                            direction = "upright";
                        } else if (angle < 1) {
                            direction = "right";
                        } else if (angle < 3) {
                            direction = "downright";
                        } else if (angle < 5) {
                            direction = "down";
                        } else if (angle < 7) {
                            direction = "downleft";
                        } else {
                            direction = "left";
                        }

                        try { handler(direction); } catch (error) { console.log(error); }
                    }
                }

                if (event.type == "_swipe_touch_end") {
                    in_swipe = false;
                }
            }
        };

        // touch init and handlers adding
        this.touchInit(tOptions);
        this.on("_swipe_touch_start", _handler);
        this.on("_swipe_touch_move", _handler);
        this.on("_swipe_touch_end", _handler);

        return this;
    };
})(jQuery);