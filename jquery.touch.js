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
                pen: true
            },
            options);


        if (window.navigator.msPointerEnabled) { // IE10 with touch
            if (options.preventDefault) {
                // make default pan and zoom disabled
                this.css("-ms-touch-action", "none");
            }
        }

        this.each(function () {
            var _this = this;
            var _touch_handler = null;
            var touches = null;
            $(this).data("_touches", []);

            // adding touch handler
            _touch_handler = function (event) {
                var currentTouchArray = [],
                    touchArray = [];

                if (event.pointerType) {
                    if ((event.pointerType == event.MSPOINTER_TYPE_MOUSE && !options.mouse) || (event.pointerType == event.MSPOINTER_TYPE_PEN && !options.pen)) {
                        return;
                    }

                    currentTouchArray[0] = event.pointerId;
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
                        currentTouchArray[i] = event.changedTouches[i].identifier;
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
                    currentTouchArray[0] = 0;
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

                for (i in currentTouchArray) {
                    var touch = touchArray[i],
                        currentTouchId = currentTouchArray[i],
                        currentTouchIndex = null,
                        newTouch = true,
                        eventType;

                    if (currentTouchId !== null) {
                        touches = $(_this).data("_touches");

                        for (i in touches) {
                            if (touches[i].id == currentTouchId) {
                                newTouch = false;
                                touches[i] = touch; // update the touch object
                                $(_this).data("_touches", touches);
                                currentTouchIndex = i;
                                break;
                            }
                        }

                        if (newTouch && this != _this) { // move or end touch not starting from the target element
                            return;
                        }
                    }

                    if (event.type == "touchstart" || event.type == "MSPointerDown" || event.type == "mousedown") {
                        if (newTouch) {
                            touches = $(this).data("_touches");
                            touches[touches.length] = touch;
                            $(this).data("_touches", touches);
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

                        eventType = "tstart";
                    } else if (event.type == "touchmove" || event.type == "MSPointerMove" || event.type == "mousemove") {
                        eventType = "tmove";
                    } else if (event.type == "touchend" || event.type == "touchcancel" || event.type == "MSPointerUp" || event.type == "MSPointerCancel" || event.type == "mouseup") {
                        touches = $(_this).data("_touches");
                        if (touches.length - 1 != currentTouchIndex) {
                            touches[currentTouchIndex] = touches[touches.length - 1];
                        }

                        touches.pop();
                        $(_this).data("_touches", touches);

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

                        eventType = "tend";
                    } else { // Unknown event
                        return;
                    }

                    var tEvent = $.Event(eventType);
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
                        touches: $(_this).data("_touches")
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
            $(this).data("_touch_handler", _touch_handler);
        });
    };

    $.fn.touchDispose = function () {
        // tries to remove everything
        this.css("-ms-touch-action", "");

        this.each(function () {
            var _touch_handler = $(this).data("_touch_handler");

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

            $(this).removeData("_touch_handler");
            $(this).removeData("_touches");
        });
    };
})(jQuery);
