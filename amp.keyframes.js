
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
        if (urlFormat.length > 1) {
            hover_vertical_offset = 113;
            hover_width = "200px";
        }

        //add the div hosting thumbnail
        var hover = document.createElement('div');
        hover.id = "hover";
        hover.style.top = -1 * (/*player.controlBar.el().offsetHeight + */hover_vertical_offset + 8) + "px";
        hover.style.display = "block";
        hover.style.width = hover_width;
        hover.style.position = "absolute";
        hover.innerHTML = "";
        
        //add an img element
        var thumbnail;
        if (urlFormat.length > 1) {
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

        //ended event
        player.addEventListener(amp.eventName.ended, function () {
            player.poster("Content/images/HoloLens.jpg");
            player.currentTime(0);
            player.exitFullscreen();
        });

    });
})();
