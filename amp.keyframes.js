/*              The MIT License (MIT)

Copyright (c) 2015 Microsoft Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.                       */

(function () {
    'use strict';

    amp.plugin('keyframes', function (options) {

        /******************** Plugin level variables **********************/

        //var extend = function () {
        //    var args, target, i, object, property;
        //    args = Array.prototype.slice.call(arguments);
        //    target = args.shift() || {};
        //    for (i in args) {
        //        object = args[i];
        //        for (property in object) {
        //            if (object.hasOwnProperty(property)) {
        //                if (typeof object[property] === 'object') {
        //                    target[property] = extend(target[property], object[property]);
        //                } else {
        //                    target[property] = object[property];
        //                }
        //            }
        //        }
        //    }
        //    return target;
        //}    
        //var settings = extend({}, defaults, options);

        var urlFormat = options.urlFormat;
        var stepSize = (!!options && !!options.stepSize) ? options.stepSize : 2;
        var player = this; 
        var progressControl = player.controlBar.progressControl;

        /******************** ELEMENTS & POSITIONS **********************/
        var getComputedStyle = function (el, pseudo) {
            return function (prop) {
                if (window.getComputedStyle) {
                    return window.getComputedStyle(el, pseudo)[prop];
                } else {
                    return el.currentStyle[prop];
                }
            };
        }

        var offsetParent = function (el) {
            if (el.nodeName !== 'HTML' && getComputedStyle(el)('position') === 'static') {
                return offsetParent(el.offsetParent);
            }
            return el;
        }

        //var getVisibleWidth = function (el, width) {
        //    var clip;

        //    if (width) {
        //        return parseFloat(width);
        //    }

        //    clip = getComputedStyle(el)('clip');
        //    if (clip !== 'auto' && clip !== 'inherit') {
        //        clip = clip.split(/(?:\(|\))/)[1].split(/(?:,| )/);
        //        if (clip.length === 4) {
        //            return (parseFloat(clip[1]) - parseFloat(clip[3]));
        //        }
        //    }
        //    return 0;
        //}

        var getScrollOffset = function () {
            if (window.pageXOffset) {
                return {
                    x: window.pageXOffset,
                    y: window.pageYOffset
                };
            }
            return {
                x: document.documentElement.scrollLeft,
                y: document.documentElement.scrollTop
            };
        }

        //hovering div style depends on input
        var hover_vertical_offset = 26;
        var hover_width = "90px";
        if (urlFormat.length > 0) {
            hover_vertical_offset = 111;
            hover_width = "200px";
        }

        //add the div hosting thumbnail
        var hover = document.createElement('div');
        hover.id = "hover";
        hover.style.top = -1 * (/*player.controlBar.el().offsetHeight + */hover_vertical_offset + 1) + "px";
        hover.style.display = "block";
        hover.style.width = hover_width;
        hover.style.position = "absolute";
        hover.innerHTML = "";
        
        //add an img element
        var thumbnail;
        if (urlFormat.length > 0) {
            thumbnail = document.createElement('img');
            thumbnail.id = "thumbnail";
            thumbnail.style.visibility = "visible";
            hover.appendChild(thumbnail);
        }

        player.controlBar.el().appendChild(hover);  

        /******************** EVENTS **********************/
        progressControl.on("mousemove", moveListener);

        function moveListener(event) {
            //determine mousetime
            var pageX = event.pageX;
            var clientX = event.clientX;
            var pageXOffset = getScrollOffset().x;
            var clientRect = offsetParent(progressControl.el()).getBoundingClientRect();
            var duration = player.duration();
            // find the page offset of the mouse
            var left = event.pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
            // subtract the page offset of the positioned offset parent
            left -= clientRect.left + pageXOffset;
            var mouseTime = (left - progressControl.el().offsetLeft) / progressControl.width() * duration;

            //to determine image src
            if (urlFormat.length > 1) {  //add image only if available
                var index = Math.floor(mouseTime / stepSize) + 1;
                var url = urlFormat + index + ".jpg";
                if (thumbnail.src != url) {
                    thumbnail.src = url;
                }
            }

            //hover positioning
            hover.style.visibility = "visible";
            if (left < hover.offsetWidth / 2) {
                hover.style.left = 0;
            } else if (left + hover.offsetWidth / 2 < progressControl.width() && left > hover.offsetWidth / 2) {
                hover.style.left = left - progressControl.el().offsetLeft - hover.offsetWidth / 2 + "px";
            } else {
                hover.style.left = progressControl.width() - hover.offsetWidth + "px";
            }
        }

        //hide when mouseout
        player.controlBar.progressControl.el().addEventListener("mouseout", function () {
            hover.style.visibility = "hidden";
            hover.style.left = "-1000px";
        });

        player.ready(function () {  //main function
            registerKeyframesEvents();
        });

        //register events to handle 
        function registerKeyframesEvents() {
            var events = [amp.eventName.ended,
                          amp.eventName.canplaythrough,
            ];

            for (var i = 0; i < events.length; i++) {
                player.addEventListener(events[i], keyframesEventHandler);
            }
        }

        function keyframesEventHandler(evt) {
            switch (evt.type) {
                case amp.eventName.canplaythrough:
                    //get video URL and build semi-complete image URL (missing [index].jpg)
                    if (urlFormat.indexOf("://") < 0) {  //if full URL is given, we use it as the customized image location
                        var url = player.currentSrc();
                        urlFormat = url.substring(0, url.indexOf(".ism")) + urlFormat;
                    }
                    break;
                case amp.eventName.ended:
                    player.poster("Content/images/HoloLens.jpg");
                    player.currentTime(0);
                    player.exitFullscreen();
                    break;
                default:
                    break;
            }
        }



    });
})();
