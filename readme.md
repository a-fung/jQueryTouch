jQuery Touch Library
====================

This is a jQuery library that enables web developers to easily add touch to their web sites. This library supports iOS devices, Android devices and IE10 running in touch devices. It can also handle touch and mouse clicks at the same time.

Quick start
-----------

Simply download and add `jquery.touch.js` to your website.
Make a call to `$("#touch-target").touchInit()`
And then `"touch_start"`, `"touch_move"` and `"touch_end"` events will start being triggered from the element.

You can use `$("#touch-target").on("touch_start", handler)` to handle unified touch events.

