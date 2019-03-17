"use strict";

/* Ripple namespace */
var Ripple = function () { // private interface

    var _damping = 0.99, _refract = 1.33, _dropSize = 0.2, _rainInterval = 1000 / 60 /* ms per drop */, _waveInterval = 1000 / 60;
    var _hBuf = {}, _origImageData, _origImageBuf, _currImageData, _currImageBuf;
    var _animRunning = false, _raining = false, _prevRainTS = 0, _prevWaveTS;
    var _resizeId, _mouseButtonDown = false, _invertMouseY = false;
    var _canvas, _context, _txtFps;

    /* return a single pixel image data URL for the given color array */
    function getColorUrl(color) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(1, 1);
        imageData.data[0] = (color[0] || 0) * 255;
        imageData.data[1] = (color[1] || 0) * 255;
        imageData.data[2] = (color[2] || 0) * 255;
        imageData.data[3] = (color[3] || 1) * 255;
        canvas.width = 1;
        canvas.height = 1;
        context.putImageData(imageData, 0, 0, 0, 0, 1, 1);
        return canvas.toDataURL("image/png");
    }

    /*
     * get the URL from the document body background image
     * expects the background-image CSS format to be: url("actual_url")
     */
    function getBgImageUrl() {
        var url = getComputedStyle(document.body).backgroundImage.toLowerCase();
        // some browsers do not include quotes within the URL brackets
        url = url.replace(/"/g, "").replace(/'/g, "");
        // strip off URL container: url("actual_url")
        if (url && url.indexOf("url") === 0) url = url.substring(4, url.length - 1);
        return url;
    }

    /*
     * returns an array of the document body background color
     * expects the background-color CSS format to be: rgb[a](r,g,b[,a])
     */
    function getBgColor() {
        var color = getComputedStyle(document.body).backgroundColor.toLowerCase();
        // strip off rgb[a] container: rgb(r,g,b[,a])
        if (color && color.indexOf("rgb") === 0) {
            (color = color.substring(4, color.length - 1).replace(/ /g, "").split(",")).push("255");
        } else if (color && color.indexOf("rgba") === 0) {
            color = color.substring(5, color.length - 1).replace(/ /g, "").split(",");
        }
        if (color) color.forEach(function (val, i, arr) { arr[i] = parseInt(val); });
        return color;
    }

    /* setup pre-calculated values to speed up computation in loops */
    var _hBufMaxX, _hBufMaxY, _imgWidth, _imgHeight, _imgMaxX, _imgMaxY, _imgToBufX, _imgToBufY, _refract255;
    function setPreCalcs() {
        _hBufMaxX = _hBuf.width - 1;
        _hBufMaxY = _hBuf.height - 1;
        if (_origImageData) {
            _imgWidth = _origImageData.width;
            _imgHeight = _origImageData.height;
            _imgMaxX = _imgWidth - 1;
            _imgMaxY = _imgHeight - 1;
            _imgToBufX = _hBuf.width / _imgWidth;
            _imgToBufY = _hBuf.height / _imgHeight;
        }
        _refract255 = 255 * _refract;
    }

    return { // public interface

        debug: false,

        /*
         * initialize the ripple controller
         * init({damping, refract, dropSize, raining, rainInterval, waveInterval, invertMouseY, imgSrc, debug })
         */
        init: function (options) {
            // copy the options into the ripple controller
            if (!options) options = {};
            if (options.debug !== undefined) Ripple.debug = options.debug;
            if (Ripple.debug) console.debug("initRipple");
            if (options.damping !== undefined) _damping = options.damping;
            if (options.refract !== undefined) _refract = options.refract;
            if (options.dropSize !== undefined) _dropSize = options.dropSize;
            if (options.raining !== undefined) _raining = options.raining;
            if (options.rainInterval !== undefined) _rainInterval = options.rainInterval;
            if (options.waveInterval !== undefined) _waveInterval = options.waveInterval;
            if (options.invertMouseY !== undefined) _invertMouseY = options.invertMouseY;
            // setup the canvas as a full screen background
            _canvas = document.createElement("canvas");
            _canvas.id = "rippleCanvas";
            _canvas.style.position = "fixed";
            _canvas.style.left = 0;
            _canvas.style.top = 0;
            _canvas.style.zIndex = -1;
            document.body.appendChild(_canvas);
            // setup the frames per second control
            _txtFps = document.getElementById("txtFps");
            if (!_txtFps) {
                // create a frames per second hidden container
                // so it does not need to be tested for later
                _txtFps = document.createElement("div");
                _txtFps.id = "txtFps";
                if (!Ripple.debug) _txtFps.style.display = "none";
                else {
                    _txtFps.style.position = "fixed";
                    _txtFps.style.left = 0;
                    _txtFps.style.bottom = 0;
                    _txtFps.style.zIndex = 1;
                    _txtFps.style.color = "rgba(255,255,255,0.5)";
                    _txtFps.style.cursor = "default";
                    _txtFps.innerHTML = "0 fps";
                }
                document.body.appendChild(_txtFps);
            }
            // setup the original background image
            // use the document body background image or color
            // if no image is given in the options
            var bgImg = document.createElement("img");
            bgImg.id = "rippleImage";
            bgImg.style.display = "none";
            bgImg.crossOrigin = "anonymous";
            bgImg.onload = Ripple.resourcesReady;
            bgImg.src = options.imgSrc || getBgImageUrl() || getColorUrl(getBgColor());
            document.body.appendChild(bgImg);
        },

        /* initialization to run after all resources are loaded */
        resourcesReady: function () {
            if (Ripple.debug) console.debug("resourcesReady");
            Ripple.resizeCanvas();
            if (window.Input) Input.addMouseEvents(document.body, Ripple.mouseDownFunc, Ripple.mouseUpFunc, Ripple.mouseMoveFunc);
            window.onresize = function () {
                // too many resize calls can cause out of memory failures
                // because of large buffers being created
                // delay the resize to minimize calls
                if (!_resizeId) {
                    if (Ripple.debug) console.debug("resize queued");
                    _resizeId = setTimeout(Ripple.resizeCanvas, 100);
                }
            };
            if (_raining) Ripple.startRain();
        },

        /* resize the canvas and everything relying on that size */
        resizeCanvas: function () {
            if (Ripple.debug) console.debug("resizeCanvas");
            _canvas.width = document.body.clientWidth; // exclude scrollbars
            _canvas.height = document.body.clientHeight;
            Ripple.initHBuf();
            Ripple.initImage({ canvas: _canvas });
            Ripple.render();
            Ripple.resizeComplete();
        },
        /* allows overriding functionality to finish the resize cycle */
        resizeComplete: function () {
            if (Ripple.debug) console.debug("resize complete");
            _resizeId = undefined;
        },

        /* setup the ripple height buffers */
        initHBuf: function (width, height) {
            if (Ripple.debug) console.debug("initHBuf");
            _hBuf.width = Math.round(width) || _canvas.width;
            _hBuf.height = Math.round(height) || _canvas.height;
            _hBuf.size = _hBuf.width * _hBuf.height;
            _hBuf.curr = new Float32Array(_hBuf.size);
            _hBuf.prev = new Float32Array(_hBuf.size);
            setPreCalcs();
        },
        /* return the ripple height buffer container */
        hBuf: function () { return _hBuf; },

        /*
         * get/set the ripple damping factor
         * this affects how long the ripples last
         */
        damping: function (val) { if (val !== undefined) _damping = parseFloat(val); else return _damping; },
        /*
         * get/set the ripple refraction index
         * this affects how much distortion the ripples create
         */
        refract: function (val) { if (val !== undefined) { _refract = parseFloat(val); setPreCalcs(); } else return _refract; },
        /*
         * get/set the ripple drop size
         * this affects the height of the initial ripple
         */
        dropSize: function (val) { if (val !== undefined) _dropSize = parseFloat(val); else return _dropSize; },
        /*
         * get/set the rain interval in millisecond per drop
         * this affects how frequently rain drops occur
         */
        rainInterval: function (val) { if (val !== undefined) _rainInterval = parseFloat(val); else return _rainInterval; },
        /*
         * get/set the wave interval in millisecond per drop
         * this affects how fast the wave front travels
         */
        waveInterval: function (val) { if (val !== undefined) _waveInterval = parseFloat(val); else return _waveInterval; },

        /*
         * initialize the original background image
         * initImage({canvas, img, areaLeft, areaTop, areaWidth, areaHeight, textTop})
         */
        initImage: function (options) {
            if (Ripple.debug) console.debug("initImage");
            if (!options) options = {};
            var canvas = options.canvas;
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.width = document.body.clientWidth;
                canvas.height = document.body.clientHeight;
            }
            var img = options.img || document.getElementById("rippleImage");
            // check if the image given is a color array and initialize with background color
            if (Array.isArray(options.img)) (img = document.createElement("img")).src = getColorUrl(options.img);
            // setup the area of the image to use
            var areaLeft = options.areaLeft || 0;
            var areaTop = options.areaTop || 0;
            var areaWidth = options.areaWidth || canvas.width;
            var areaHeight = options.areaHeight || canvas.height;
            // setup to flip the image if required
            var context = canvas.getContext("2d");
            if (options.flipY) {
                context.scale(1, -1);
                context.translate(0, -canvas.height);
            }
            // draw the image to the entire canvas
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            // draw the text over the image
            if (options.textTop !== undefined) {
                var textTop = options.textTop;
                context.fillStyle = "#fff";
                context.shadowColor = "#000";
                context.shadowBlur = 10;
                context.font = "48px Verdana";
                var text = "Water Ripple";
                var x = areaLeft + (areaWidth - context.measureText(text).width) / 2, y = textTop + areaTop + 50;
                context.fillText(text, x, y);
                context.font = "20px Verdana";
                text = "click to create a ripple";
                x = areaLeft + (areaWidth - context.measureText(text).width) / 2, y = textTop + areaTop + 80;
                context.fillText(text, x, y);
                text = "click and drag to create a swish";
                x = areaLeft + (areaWidth - context.measureText(text).width) / 2, y = textTop + areaTop + 105;
                context.fillText(text, x, y);
            }
            // get the image from the area of effect and setup the original image buffer
            Ripple.origImageData(context.getImageData(areaLeft, areaTop, areaWidth, areaHeight));
            setPreCalcs();
        },
        /* reset the currently drawn image to the original image */
        resetImage: function () { _currImageBuf.set(_origImageBuf); },
        /*
         * get/set the original image data objects
         * also recreates the current image data objects
         */
        origImageData: function (val) {
            if (val !== undefined) {
                _origImageData = val;
                _origImageBuf = _origImageData.data;
                // creating image data objects can be done using the document object
                // but, the document object is not available in worker threads
                // and IE and Edge do not handle new ImageData
                if (typeof document === "undefined") {
                    _currImageData = new ImageData(_origImageData.width, _origImageData.height);
                } else _currImageData = document.createElement("canvas").getContext("2d").createImageData(_origImageData.width, _origImageData.height);
                // set the current image data from the new image data
                // so that alpha values do not need to be copied in loops
                // this speeds up rendering
                if (_currImageData.data.set) _currImageData.data.set(_origImageBuf);
                else { // some browser canvas elements are CanvasPixelArray which does not have a set method
                    for (var i = 0; i < _currImageData.data.length; i++) _currImageData.data[i] = _origImageBuf[i];
                }
                _currImageBuf = _currImageData.data;
                setPreCalcs();
            } else return _origImageData;
        },
        /* returns the current image data object */
        currImageData: function () { return _currImageData; },
        /* sets the current image data buffer; used to pass between worker threads */
        setCurrImageBuf: function (val) { _currImageBuf = val; },

        /* returns a boolean indicating if the animation is running */
        animRunning: function () { return _animRunning; },
        /* starts the animation loop */
        startAnimation: function () {
            if (window.FPS) FPS.reset();
            _prevWaveTS = undefined;
            if (!_animRunning) requestAnimationFrame(Ripple.animLoop);
            _animRunning = true;
        },
        /* stops the animation loop; keepRaining will maintain the current raining state */
        stopAnimation: function (keepRaining) {
            _animRunning = false;
            if (!keepRaining) Ripple.stopRain();
            _txtFps.innerHTML = "The animation has been stopped. Click to restart.";
        },
        /* reinitializes the ripple buffers and sets the image to the original image */
        resetAnimation: function () {
            if (window.FPS) FPS.reset();
            Ripple.initHBuf(_hBuf.width, _hBuf.height);
            Ripple.resetImage();
            Ripple.render();
        },

        /* returns a boolean indicating if the animation is generating rain drops */
        raining: function () { return _raining; },
        /* turns on rain drops in the animation */
        startRain: function () { _raining = true; Ripple.startAnimation(); },
        /* turns off rain drops in the animation */
        stopRain: function () { _raining = false; },

        /*
         * gets/sets the boolean indicating if mouse Y coordintates are inverted
         * used when background images are stored inverted
         */
        invertMouseY: function (val) { if (val !== undefined) _invertMouseY = val; else return _invertMouseY; },
        /*
         * default function called when the mouse button is pressed
         * generates ripples and starts the animation
         */
        mouseDownFunc: function (ev) {
            _mouseButtonDown = true;
            var mousePos = Input.getMousePos(ev, _invertMouseY);
            Ripple.createDrop(mousePos[0], mousePos[1], _dropSize);
            if (!_animRunning) Ripple.startAnimation();
        },
        /* default function called when the mouse button is released */
        mouseUpFunc: function () { _mouseButtonDown = false; },
        /* default function called when the mouse is moved; calls mouseDownFunc */
        mouseMoveFunc: function (ev) {
            if (ev.touches) ev.preventDefault(); // prevent touch refresh on swipe down
            if (_mouseButtonDown) Ripple.mouseDownFunc(ev);
        },

        /*
         * calculates and displays the frames per second
         * also stops the animation if the frame rate is too low
         * unless noLimit is requested
         */
        calcFps: function (noLimit) {
            if (!window.FPS) { _txtFps.innerHTML = "N/A"; return 0; }
            var fpsNum = FPS.calc();
            if (fpsNum && fpsNum < 2 && !noLimit) {
                Ripple.stopAnimation(true);
                _txtFps.innerHTML = "The animation has been stopped (the page might be too slow). Click to restart.";
            } else if (_animRunning) _txtFps.innerHTML = fpsNum.toFixed(0).replace("Infinity", 0) + " fps";
            return fpsNum;
        },

        /*
         * the main animation loop for the ripple simulation
         * creates rain drops, moves the wave front and renders the image
         */
        animLoop: function (timestamp) {
            Ripple.createRainDrop(timestamp);
            var animChanging = Ripple.genNextWave(timestamp);
            Ripple.genNextFrame();
            Ripple.render();
            if (!animChanging && !_raining) Ripple.stopAnimation();
            if (_animRunning) requestAnimationFrame(Ripple.animLoop);
        },

        /* create a rain drop if the required interval has passed */
        createRainDrop: function (currTS) {
            if (_animRunning && _raining && currTS > _prevRainTS + _rainInterval) {
                _prevRainTS = currTS;
                Ripple.createDrop(Math.floor(Math.random() * _origImageData.width),
                                  Math.floor(Math.random() * _origImageData.height),
                                  Math.random() * _dropSize);
            }
        },

        /* create a drop within the current ripple buffer */
        createDrop: function (x, y, size) {
            if (Ripple.debug) console.debug("createDrop");
            var xHBuf = Math.floor(x * _imgToBufX);
            var yHBuf = Math.floor(y * _imgToBufY);
            var iHBuf = _hBuf.width * yHBuf + xHBuf;
            _hBuf.curr[iHBuf] = size;
        },

        /*
         * moves the wave front if the required interval has passed
         * could generate multiple calls to genNextHBuf
         * if wave speed is faster than animation speed
         * logic is provided to prevent a runaway loop, and
         * to limit the time spent generating waves in the render loop
         */
        genNextWave: function (currTS) {
            var animChanging = true;
            if (!_prevWaveTS) _prevWaveTS = currTS;
            else if (_animRunning) {
                var limit = 10; // limit runaway loop
                while (currTS >= _prevWaveTS + _waveInterval && limit-- > 0) {
                    var timeToRunGenNextHBuf = new Date().getTime(); // in ms
                    animChanging = Ripple.genNextHBuf();
                    _prevWaveTS = _prevWaveTS + _waveInterval;
                    timeToRunGenNextHBuf = new Date().getTime() - timeToRunGenNextHBuf;
                    // prevent genNextHBuf from taking too much of the animLoop time
                    if (timeToRunGenNextHBuf > 0.25 * _waveInterval) _prevWaveTS = currTS;
                }
            }
            return animChanging;
        },

        /*
         * generate the next ripple buffer which advances the wave front
         * returns a flag indicating if the ripples are still evolving
         */
        genNextHBuf: function () {
            if (Ripple.debug) console.debug("genNextHBuf");
            var animChanging = false;
            // calculate a new height based on the neighbouring heights
            // the outer edge of the buffer is not modified
            // so that bounds checking does not need to be done in the loop
            // also ensures that the waves reflect at the boundaries
            for (var y = 1; y < _hBufMaxY; y++) {
                for (var x = 1; x < _hBufMaxX; x++) {
                    var iHBuf = _hBuf.width * y + x;
                    // sum the neighbouring heights
                    var sum = _hBuf.curr[iHBuf - 1];
                    sum += _hBuf.curr[iHBuf + 1];
                    sum += _hBuf.curr[iHBuf - _hBuf.width];
                    sum += _hBuf.curr[iHBuf + _hBuf.width];
                    var prevH = _hBuf.prev[iHBuf];
                    // only divide by 2 in the average
                    // because the previous height is being subtracted out
                    var newH = (sum / 2 - prevH) * _damping;
                    // new heights are written into previous buffer
                    // so that a new array is not needed
                    _hBuf.prev[iHBuf] = newH;
                    // the absolute value operation slows this down
                    if (Math.abs(newH - prevH) >= 0.001) animChanging = true;
                }
            }
            // newHBuf is written into prevHBuf so swap is needed after complete
            var swapBuf = _hBuf.curr; _hBuf.curr = _hBuf.prev; _hBuf.prev = swapBuf;
            return animChanging;
        },

        /*
         * a faster version of moving the wave front
         * does not provide evolving logic; always returns true
         */
        genNextHBufFast: function () {
            if (Ripple.debug) console.debug("genNextHBufFast");
            for (var y = 1; y < _hBufMaxY; y++) {
                for (var x = 1; x < _hBufMaxX; x++) {
                    var iHBuf = _hBuf.width * y + x;
                    var sum = _hBuf.curr[iHBuf - 1];
                    sum += _hBuf.curr[iHBuf + 1];
                    sum += _hBuf.curr[iHBuf - _hBuf.width];
                    sum += _hBuf.curr[iHBuf + _hBuf.width];
                    var newH = (sum / 2 - _hBuf.prev[iHBuf]) * _damping;
                    _hBuf.prev[iHBuf] = newH;
                }
            }
            var swapBuf = _hBuf.curr; _hBuf.curr = _hBuf.prev; _hBuf.prev = swapBuf;
            return true;
        },

        /*
         * generates the next image frame to render
         * this loop is the slowest part of the simulation
         */
        genNextFrame: function () {
            if (Ripple.debug) console.debug("genNextFrame");
            // loop through all the pixels
            // set the current pixel to a pixel from the original image
            // based on an offset caused by the height of the pixel and refraction
            for (var y = 0; y < _imgHeight; y++) {
                for (var x = 0; x < _imgWidth; x++) {
                    var xHBuf = Math.floor(x * _imgToBufX);
                    var yHBuf = Math.floor(y * _imgToBufY);
                    var iHBuf = _hBuf.width * yHBuf + xHBuf;
                    var r = _hBuf.curr[iHBuf] * _refract255;
                    var xSrc = x + r;
                    var ySrc = y + r;
                    if (xSrc < 0) xSrc = 0;
                    if (xSrc > _imgMaxX) xSrc = _imgMaxX;
                    if (ySrc < 0) ySrc = 0;
                    if (ySrc > _imgMaxY) ySrc = _imgMaxY;
                    var iDest = (_imgWidth * y + x) * 4;
                    // CAUTION: it is tempting to move the 2 Math.round operations
                    // to the setting of r and use just 1 operation, but for some
                    // reason this dramatically slows performance in worker threads???
                    var iSrc = (_imgWidth * Math.round(ySrc) + Math.round(xSrc)) * 4;
                    //if (isNaN(iDest) || isNaN(iSrc)) console.log(x, y, iDest, iSrc);
                    _currImageBuf[iDest++] = _origImageBuf[iSrc++];
                    _currImageBuf[iDest++] = _origImageBuf[iSrc++];
                    _currImageBuf[iDest++] = _origImageBuf[iSrc++];
                }
            }
        },

        /* draws the current image data to the canvas and calculates frames per second */
        render: function () {
            if (Ripple.debug) console.debug("render");
            if (!_context) _context = _canvas.getContext("2d");
            _context.putImageData(_currImageData, 0, 0);
            Ripple.calcFps();
        }

    }; // end public interface

}(); // end Ripple namespace