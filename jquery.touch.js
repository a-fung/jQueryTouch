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
    // initiate touch handler on jQuery objects
    $.fn.touchInit = function (options) {
        if (!options || typeof (options) != "object") {
            options = {};
        }

        // default options
        options = $.extend(
            {
                // prevent default click/touch handlers
                preventDefault: true,

                // handle mouse event
                mouse: true,

                // handle pen event (IE 10 only)
                pen: true,

                // max number of touch (mouse) point to handle
                // more touch events at the same time will be ignored
                // -1 means unlimited
                maxtouch: -1,

                // add prefix to the touch events triggered
                // useful when you want to add handlers with different options
                prefix: ""
            },
            options);

        // nothing to do
        if (options.maxtouch == 0) return this;

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
            var _this = this,
                _touch_handler = null,
                touches = null;

            // an array to store the touches we are handling
            $(this).data(options.prefix + "_touches", []);

            _touch_handler = function (event) {
                var touchArray = [];

                if (event.pointerType) {
                    // check if mouse/pen event should be ignored
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
                    // there might be more than 1 touch points in one native event in webkit browsers
                    // loop thru the changedTouches list
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
                    // This is a mouse event
                    // Give it an ID of -1
                    touchArray[0] = {
                        id: -1,
                        clientX: event.clientX,
                        clientY: event.clientY,
                        pageX: event.pageX,
                        pageY: event.pageY,
                        screenX: event.screenX,
                        screenY: event.screenY
                    };
                }

                // loop thru the touches in this event
                for (var i = 0; i < touchArray.length; i++) {
                    var touch = touchArray[i],
                        currentTouchIndex = null,
                        newTouch = true,
                        eventType;

                    touches = $(_this).data(options.prefix + "_touches");

                    // search the touch array to see if this is a touch we're handling
                    for (var j = 0; j < touches.length; j++) {
                        if (touches[j].id == touch.id) {
                            newTouch = false;
                            touches[j] = touch; // update the touch object
                            $(_this).data(options.prefix + "_touches", touches);
                            currentTouchIndex = j;
                            break;
                        }
                    }

                    // this is not a touch we're handling
                    if (newTouch && this != _this) {
                        continue;
                    }

                    if (event.type == "touchstart" || event.type == "MSPointerDown" || event.type == "mousedown") { // "start" of a touch/click
                        if (newTouch) {
                            if (options.maxtouch < 0 || options.maxtouch > touches.length) { // check to see if we have quota to handle this touch
                                // add the touch to touch array
                                touches[touches.length] = touch;
                                $(this).data(options.prefix + "_touches", touches);
                            } else {
                                // ignore
                                continue;
                            }

                            // add "move", "end" and "cancel" event listeners only after a "start" event
                            if (event.pointerType) {
                                document.addEventListener("MSPointerMove", _touch_handler, false);
                                document.addEventListener("MSPointerUp", _touch_handler, false);
                                document.addEventListener("MSPointerCancel", _touch_handler, false);
                            } else {
                                document.addEventListener("touchmove", _touch_handler, false);
                                document.addEventListener("touchend", _touch_handler, false);
                                document.addEventListener("touchcancel", _touch_handler, false);

                                if (options.mouse) { // ignore mouse?
                                    $(document).on("mousemove", _touch_handler);
                                    $(document).on("mouseup", _touch_handler);
                                }
                            }
                        }

                        eventType = "start";
                    } else if (event.type == "touchmove" || event.type == "MSPointerMove" || event.type == "mousemove") { // "move" event
                        eventType = "move";
                    } else if (event.type == "touchend" || event.type == "touchcancel" || event.type == "MSPointerUp" || event.type == "MSPointerCancel" || event.type == "mouseup") { // "end"/"cancel" event
                        // remove the current touch from touch array
                        if (touches.length - 1 != currentTouchIndex) {
                            touches[currentTouchIndex] = touches[touches.length - 1];
                        }

                        touches.pop();
                        $(_this).data(options.prefix + "_touches", touches);

                        // if the array is empty, removing the "move", "end" and "cancel" event listeners
                        if (touches.length == 0) {
                            if (event.pointerType) {
                                document.removeEventListener("MSPointerMove", _touch_handler, false);
                                document.removeEventListener("MSPointerUp", _touch_handler, false);
                                document.removeEventListener("MSPointerCancel", _touch_handler, false);
                            } else {
                                document.removeEventListener("touchmove", _touch_handler, false);
                                document.removeEventListener("touchend", _touch_handler, false);
                                document.removeEventListener("touchcancel", _touch_handler, false);

                                if (options.mouse) { // ignore mouse?
                                    $(document).off("mousemove", _touch_handler);
                                    $(document).off("mouseup", _touch_handler);
                                }
                            }
                        }

                        eventType = "end";
                    } else { // Unknown event
                        continue;
                    }

                    // the event we are triggering
                    var tEvent = $.Event(options.prefix + "touch_" + eventType);

                    // get the touch coordinates from the touch object
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
                            touches: touches
                        });

                    // trigger the event in a try/catch block
                    // because we do not want any exception to stop the current function
                    try { $(_this).trigger(tEvent); } catch (error) { console.log(error); }
                }

                // prevent default handlers
                if (options.preventDefault) {
                    event.preventDefault && event.preventDefault();
                    return false;
                }
            };

            // only add "start" handlers
            if (window.navigator.msPointerEnabled) {
                this.addEventListener("MSPointerDown", _touch_handler, false);
            } else {
                this.addEventListener("touchstart", _touch_handler, false);
                options.mouse && $(this).on("mousedown", _touch_handler);
            }

            // store the event handler for dispose method
            $(this).data(options.prefix + "_touch_handler", _touch_handler);
        });

        return this;
    };

    // dispose all the touch handlers
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

        this.each(function () {
            // remove all handlers
            var _touch_handler = $(this).data(prefix + "_touch_handler");

            this.removeEventListener("MSPointerDown", _touch_handler, false);
            this.removeEventListener("touchstart", _touch_handler, false);
            $(this).off("mousedown", _touch_handler);

            document.removeEventListener("MSPointerMove", _touch_handler, false);
            document.removeEventListener("MSPointerUp", _touch_handler, false);
            document.removeEventListener("MSPointerCancel", _touch_handler, false);

            document.removeEventListener("touchmove", _touch_handler, false);
            document.removeEventListener("touchend", _touch_handler, false);
            document.removeEventListener("touchcancel", _touch_handler, false);

            $(this).off("mousemove", _touch_handler);
            $(this).off("mouseup", _touch_handler);

            $(this).removeData(prefix + "_touch_handler");
            $(this).removeData(prefix + "_touches");
        });

        return this;
    };
})(jQuery);
