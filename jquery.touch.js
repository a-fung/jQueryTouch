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
                var currentTouchId = null;
                var currentTouchIndex = null;
                var newTouch = true;

                if (event.pointerType) {
                    if ((event.pointerType == event.MSPOINTER_TYPE_MOUSE && !options.mouse) || (event.pointerType == event.MSPOINTER_TYPE_PEN && !options.pen)) {
                        return;
                    }
                    currentTouchId = event.pointerId;
                }
                else if (event.changedTouches) {
                    currentTouchId = event.changedTouches[0].identifier;
                }

                var touch = null;
                if (event.pointerType) {
                    touch = {
                        id: event.pointerId,
                        clientX: event.clientX,
                        clientY: event.clientY,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        screenX: event.screenX,
                        screenY: event.screenY
                    };
                } else if (event.changedTouches) {
                    touch = {
                        id: event.changedTouches[0].identifier,
                        clientX: event.changedTouches[0].clientX,
                        clientY: event.changedTouches[0].clientY,
                        pageX: event.changedTouches[0].pageX,
                        pageY: event.changedTouches[0].pageY,
                        screenX: event.changedTouches[0].screenX,
                        screenY: event.changedTouches[0].screenY
                    };
                }

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

                var eventType;

                if (event.type == "touchstart" || event.type == "MSPointerDown" || event.type == "mousedown") {
                    if (touch !== null && newTouch) {
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
                    var removeHandlers = true;

                    if (touch !== null) {
                        touches = $(_this).data("_touches");
                        if (touches.length - 1 != currentTouchIndex) {
                            touches[currentTouchIndex] = touches[touches.length - 1];
                        }

                        touches.pop();
                        $(_this).data("_touches", touches);
                        removeHandlers = touches.length == 0;
                    }

                    if (removeHandlers) {

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
                        clientX: event.clientX,
                        clientY: event.clientY,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        screenX: event.screenX,
                        screenY: event.screenY,
                        touches: $(_this).data("_touches", touches)
                    });
                $(_this).trigger(tEvent);

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