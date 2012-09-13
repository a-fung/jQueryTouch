(function ($) {
    $.fn.isTouchSupported = function () {
        return ('ontouchstart' in window) || window.navigator.msPointerEnabled;
    };

    $.fn.touchInit = function (options) {
        if (!options || typeof (options) != "object") {
            options = {};
        }

        options = $.extend(
            {
                preventDefault: true,
                mouse: true,
                pen: true,
                maxtouch: -1,
                prefix: ""
            },
            options);

        if (window.navigator.msPointerEnabled) { // IE10 with touch
            if (options.preventDefault) {
                var cssNeeded = this.data("_touchtrack-ms-touch-action");
                if (cssNeeded == undefined || cssNeeded == null) {
                    cssNeeded = [];
                }

                cssNeeded[options.prefix + "_track"] = true;
                this.data("_touchtrack-ms-touch-action", cssNeeded);

                // make default pan and zoom disabled
                this.css("-ms-touch-action", "none");
            }
        }

        this.each(function () {
            var _this = this;
            var _touch_handler = null;
            var touches = null;
            $(this).data(options.prefix + "_touches", []);

            // adding touch handler
            _touch_handler = function (event) {
                var touchArray = [];

                if (event.pointerType) {
                    if ((event.pointerType == event.MSPOINTER_TYPE_MOUSE && !options.mouse) || (event.pointerType == event.MSPOINTER_TYPE_PEN && !options.pen)) {
                        return;
                    }

                    touchArray[0] = {
                        id: event.pointerId,
                        clientX: event.clientX,
                        clientY: event.clientY,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        screenX: event.screenX,
                        screenY: event.screenY
                    };
                } else if (event.changedTouches) {
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        touchArray[i] = {
                            id: event.changedTouches[i].identifier,
                            clientX: event.changedTouches[i].clientX,
                            clientY: event.changedTouches[i].clientY,
                            pageX: event.changedTouches[i].pageX,
                            pageY: event.changedTouches[i].pageY,
                            screenX: event.changedTouches[i].screenX,
                            screenY: event.changedTouches[i].screenY
                        };
                    }
                } else {
                    touchArray[0] = {
                        id: 0,
                        clientX: event.clientX,
                        clientY: event.clientY,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        screenX: event.screenX,
                        screenY: event.screenY
                    };
                }

                for (i in touchArray) {
                    var touch = touchArray[i],
                        currentTouchIndex = null,
                        newTouch = true,
                        eventType;

                    touches = $(_this).data(options.prefix + "_touches");

                    for (i in touches) {
                        if (touches[i].id == touch.id) {
                            newTouch = false;
                            touches[i] = touch; // update the touch object
                            $(_this).data(options.prefix + "_touches", touches);
                            currentTouchIndex = i;
                            break;
                        }
                    }

                    if (newTouch && this != _this) {
                        continue;
                    }

                    if (event.type == "touchstart" || event.type == "MSPointerDown" || event.type == "mousedown") {
                        if (newTouch) {
                            touches = $(this).data(options.prefix + "_touches");
                            if (options.maxtouch < 0 || options.maxtouch > touch.length) {
                                touches[touches.length] = touch;
                                $(this).data(options.prefix + "_touches", touches);
                            } else {
                                continu;
                            }
                        }

                        if (event.pointerType) {
                            document.addEventListener("MSPointerMove", _touch_handler, false);
                            document.addEventListener("MSPointerUp", _touch_handler, false);
                            document.addEventListener("MSPointerCancel", _touch_handler, false);
                        } else {
                            document.addEventListener("touchmove", _touch_handler, false);
                            document.addEventListener("touchend", _touch_handler, false);
                            document.addEventListener("touchcancel", _touch_handler, false);

                            if (options.mouse) {
                                document.addEventListener("mousemove", _touch_handler, false);
                                document.addEventListener("mouseup", _touch_handler, false);
                            }
                        }

                        eventType = "start";
                    } else if (event.type == "touchmove" || event.type == "MSPointerMove" || event.type == "mousemove") {
                        eventType = "move";
                    } else if (event.type == "touchend" || event.type == "touchcancel" || event.type == "MSPointerUp" || event.type == "MSPointerCancel" || event.type == "mouseup") {
                        touches = $(_this).data(options.prefix + "_touches");
                        if (touches.length - 1 != currentTouchIndex) {
                            touches[currentTouchIndex] = touches[touches.length - 1];
                        }

                        touches.pop();
                        $(_this).data(options.prefix + "_touches", touches);

                        if (touches.length == 0) {

                            if (event.pointerType) {
                                document.removeEventListener("MSPointerMove", _touch_handler, false);
                                document.removeEventListener("MSPointerUp", _touch_handler, false);
                                document.removeEventListener("MSPointerCancel", _touch_handler, false);
                            } else {
                                document.removeEventListener("touchmove", _touch_handler, false);
                                document.removeEventListener("touchend", _touch_handler, false);
                                document.removeEventListener("touchcancel", _touch_handler, false);

                                if (options.mouse) {
                                    document.removeEventListener("mousemove", _touch_handler, false);
                                    document.removeEventListener("mouseup", _touch_handler, false);
                                }
                            }
                        }

                        eventType = "end";
                    } else { // Unknown event
                        continue;
                    }

                    var tEvent = $.Event(options.prefix + "touch_" + eventType);
                    tEvent = $.extend(
                        tEvent,
                        {
                            originalType: event.type,
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                            pageX: touch.pageX,
                            pageY: touch.pageY,
                            screenX: touch.screenX,
                            screenY: touch.screenY,
                            touches: $(_this).data(options.prefix + "_touches")
                        });

                    try { $(_this).trigger(tEvent); } catch (error) { }
                }

                if (options.preventDefault) {
                    event.preventDefault && event.preventDefault();
                    return false;
                }
            };

            if (window.navigator.msPointerEnabled) {
                this.addEventListener("MSPointerDown", _touch_handler, false);
            } else {
                this.addEventListener("touchstart", _touch_handler, false);
                options.mouse && this.addEventListener("mousedown", _touch_handler, false);
            }
            $(this).data(options.prefix + "_touch_handler", _touch_handler);
        });
    };

    $.fn.touchDispose = function (prefix) {
        if (!prefix || typeof (prefix) != "string") {
            prefix = "";
        }

        if (window.navigator.msPointerEnabled) { // IE10 with touch
            var cssNeeded = this.data("_touchtrack-ms-touch-action");
            if (cssNeeded == undefined || cssNeeded == null) {
                cssNeeded = [];
            }

            delete cssNeeded[options.prefix + "_track"];
            this.data("_touchtrack-ms-touch-action", cssNeeded);

            var i = 0;
            for (j in cssNeeded) i++;
            if (i == 0) this.css("-ms-touch-action", "");
        }
        this.css("-ms-touch-action", "");

        this.each(function () {
            var _touch_handler = $(this).data(prefix + "_touch_handler");

            this.removeEventListener("MSPointerDown", _touch_handler, false);
            this.removeEventListener("touchstart", _touch_handler, false);
            this.removeEventListener("mousedown", _touch_handler, false);

            document.removeEventListener("MSPointerMove", _touch_handler, false);
            document.removeEventListener("MSPointerUp", _touch_handler, false);
            document.removeEventListener("MSPointerCancel", _touch_handler, false);

            document.removeEventListener("touchmove", _touch_handler, false);
            document.removeEventListener("touchend", _touch_handler, false);
            document.removeEventListener("touchcancel", _touch_handler, false);

            document.removeEventListener("mousemove", _touch_handler, false);
            document.removeEventListener("mouseup", _touch_handler, false);

            $(this).removeData(prefix + "_touch_handler");
            $(this).removeData(prefix + "_touches");
        });
    };
})(jQuery);
