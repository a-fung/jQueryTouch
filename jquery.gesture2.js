(function ($) {
    $.fn.gesture = function (options) {
        if (!options || typeof (options) != "object") {
            options = {};
        }

        options = $.extend(
            {
                drag: true,
                scale: true,
                rotate: true,
                touchtarget: null
            },
            options);

        var touchtarget = options.touchtarget ? $(options.touchtarget) : this,
            _this = this,
            in_drag = false,
            in_gesture = false,
            original_x = 0,
            original_y = 0,
            original_css = "";

        var touch_handler = function (event) {
            if (in_gesture || !__getvalue__(options.drag)) return;
            if (in_drag) {
                var dx = ((event.touches.length == 0) ? event.pageX : event.touches[0].pageX) - original_x,
                    dy = ((event.touches.length == 0) ? event.pageY : event.touches[0].pageY) - original_y,
                    new_css = "translate(" + dx + "px," + dy + "px) " + original_css;
                _this.__transform__(new_css);
            } else {
                if (in_drag = event.type == "_gesture2_touch_start") {
                    original_x = event.touches[0].pageX;
                    original_y = event.touches[0].pageY;
                    original_css = _this.__transform__();
                    if (!original_css || original_css == "none") original_css = "";
                }
            }

            if (event.type == "_gesture2_touch_end") {
                in_drag = false;
            }
        };

        var gesture_handler = function (event) {
            in_drag = false;
            if (!__getvalue__(options.scale) && !__getvalue__(options.rotate)) return;
            if (in_gesture) {
                var dx = event.pageX - original_x,
                    dy = event.pageY - original_y,
                    new_css = (__getvalue__(options.drag) ? ("translate(" + event.pageX + "px," + event.pageY + "px) ") : ("translate(" + original_x + "px," + original_y + "px) ")) +
                        (__getvalue__(options.scale) ? ("scale(" + event.scale + ")") : "") +
                        (__getvalue__(options.rotate) ? ("rotate(" + event.rotation + "rad) ") : "") +
                        "translate(" + (-original_x) + "px," + (-original_y) + "px) " +
                        original_css;
                _this.__transform__(new_css);
            } else {
                in_gesture = true;
                original_css = _this.__transform__();
                original_x = event.pageX;
                original_y = event.pageY;
                if (!original_css || original_css == "none") original_css = "";
            }

            if (event.type == "_gesture2_gesture_end") {
                in_gesture = false;
            }
        };

        touchtarget.gestureInit({ prefix: "_gesture2_", gesture_prefix: "_gesture2_" });
        touchtarget.on("_gesture2_touch_start", touch_handler);
        touchtarget.on("_gesture2_touch_move", touch_handler);
        touchtarget.on("_gesture2_touch_end", touch_handler);
        touchtarget.on("_gesture2_gesture_start", gesture_handler);
        touchtarget.on("_gesture2_gesture_move", gesture_handler);
        touchtarget.on("_gesture2_gesture_end", gesture_handler);

        return this;
    };

    $.fn.__transform__ = function (value) {
        if (typeof (value) == "undefined") return this.css("transform");
        if (typeof (value) == "string") {

            if (!this.data("__offset__")) {
                this.css("transform", "");
                this.css("-moz-transform", "");
                this.css("-ms-transform", "");
                this.css("-o-transform", "");
                this.css("-webkit-transform", "");
                var offset = (-this.offset().left) + "px " + (-this.offset().top) + "px";
                this.css("transform-origin", offset);
                this.css("-moz-transform-origin", offset);
                this.css("-ms-transform-origin", offset);
                this.css("-o-transform-origin", offset);
                this.css("-webkit-transform-origin", offset);
                this.data("__offset__", offset);
            }

            this.css("transform", value);
            this.css("-moz-transform", value);
            this.css("-ms-transform", value);
            this.css("-o-transform", value);
            this.css("-webkit-transform", value);
        }

        return this;
    };
})(jQuery);

var __getvalue__ = function (value) {
    return (typeof (value) == "function") ? value() : value;
}