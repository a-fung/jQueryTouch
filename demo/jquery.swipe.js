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
(function($){$.fn.swipe=function(c,d){if(typeof(c)!="function")return this;if(!d||typeof(d)!="object"){d={}}d=$.extend({preventDefault:true,mouse:true,pen:true,distance:50},d);var e={preventDefault:d.preventDefault,mouse:d.mouse,pen:d.pen,maxtouch:1,prefix:"_swipe_"};var f,original_x,original_y,sqr=function(n){return n*n};var g=function(a){if(a.type=="_swipe_touch_start"){f=true;original_x=a.pageX;original_y=a.pageY}else{if(f){if(Math.sqrt(sqr(a.pageX-original_x)+sqr(a.pageY-original_y))>=d.distance){f=false;var b,angle=Math.atan2(a.pageY-original_y,a.pageX-original_x)/Math.PI*8;if(angle<-7){b="left"}else if(angle<-5){b="upleft"}else if(angle<-3){b="up"}else if(angle<-1){b="upright"}else if(angle<1){b="right"}else if(angle<3){b="downright"}else if(angle<5){b="down"}else if(angle<7){b="downleft"}else{b="left"}try{c(b)}catch(error){console.log(error)}}}if(a.type=="_swipe_touch_end"){f=false}}};this.touchInit(e);this.on("_swipe_touch_start",g);this.on("_swipe_touch_move",g);this.on("_swipe_touch_end",g);return this}})(jQuery);