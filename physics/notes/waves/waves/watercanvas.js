/*
 * Water Canvas by Almer Thie (http://code.almeros.com).
 * Description: A realtime water ripple effect on an HTML5 canvas. 
 * Copyright 2010 Almer Thie. All rights reserved.
 *
 * Example: http://code.almeros.com/code-examples/water-effect-canvas/
 * Tutorial: http://code.almeros.com/water-ripple-canvas-and-javascript
 */


////////////////////////////////////////////////////////////////////////////////
//                              WaterCanvas object                            //
////////////////////////////////////////////////////////////////////////////////

/**
 * This view object is responsible for applying the water ripple data state to an image and therefor 
 * is also responsible for the refraction effect of the light through the water.
 * 
 * @param {Number} width The width in pixels this canvas should be.
 * @param {Number} hight The hight in pixels this canvas should be.
 * @param {String} documentElement The div element ID to insert the canvas into.
 * @param {Object} waterModel A reference to a WaterModel object previously created.
 * @param {Object} props A key/value object which may contain the following properties:
 * 				backgroundImageUrl: 
 *						A relative URL to an image on your webserver. This cannot be a URL to an 
 *						image on another domain. The HTML5 Canvas element follows the Same Origin Policy.
 *				lightRefraction: 
 *						Sets how many pixels the refraction of light uses.
 * 				lightReflection: 
 *						Sets the amount of color highlighting.
 * 				maxFps: 
 *						Maximum Frames Per Second; The maximum reachable FPS highly depends on the system and 
 *						browser the water canvas is running on. You can't control that, but you can control the maximum 
 * 						FPS to keep systems from overloading, trying to reach the highest FPS.
 * 				showStats: 
 *						When set to true, it shows "FPS Canvas: " plus the current FPS of this view on the canvas.
 *
 * @constructor
 */
WaterCanvas = function (width, height, documentElement, waterModel, props) {
    // If a certain property is not set, use a default value
    props = props || {};
    this.backgroundImageUrl = props.backgroundImageUrl || null;
    this.lightRefraction = props.lightRefraction || 9.0;
    this.lightReflection = props.lightReflection || 0.1;
    this.showStats = props.showStats || false;

    this.width = width;
    this.height = height;
    this.documentElement = document.getElementById(documentElement);
    this.waterModel = waterModel;



    this.canvas = document.createElement('canvas');
    this.canvasHelp = document.createElement('canvas');

    if (!this.canvas.getContext || !this.canvasHelp.getContext) {
        alert("You need a browser that supports the HTML5 canvas tag.");
        return; // No point to continue
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctxHelp = this.canvasHelp.getContext('2d');

    this.setSize(width, height);
    this.documentElement.appendChild(this.canvas);




    // Find out the FPS at certain intervals
    this.fps = -1;
    if (this.showStats) {
        this.fpsCounter = 0;
        this.prevMs = 0;

        var self = this;
        setInterval(function () {
            self.findFps();
        }, 1000);
    }


    // Start the animation
    this.drawNextFrame();
}

/**
 * Sets the size of the canvas.
 *
 * @param {Number} width The width in pixels this canvas should be.
 * @param {Number} hight The hight in pixels this canvas should be.
 */
WaterCanvas.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;

    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);

    this.canvasHelp.setAttribute('width', this.width);
    this.canvasHelp.setAttribute('height', this.height);

    this.setBackground(this.backgroundImageUrl);
}

/**
 * Sets the image to perform the water rippling effect on. 
 *
 * Use an image from the same server as where this script lives. This is needed since browsers use the 
 * Same Origin Policy for savety reasons. If an empty URL is given, a standard canvas will be shown.
 *
 * @param {String} backgroundImageUrl (Relative) URL to an image on the same webserver as this script.						
 */
WaterCanvas.prototype.setBackground = function (backgroundImageUrl) {
    this.backgroundImageUrl = backgroundImageUrl == "" ? null : backgroundImageUrl;
    this.pixelsIn = null;

    if (this.backgroundImageUrl != null) {

        // Background image loading
        this.backgroundImg = new Image();

        var self = this;
        this.backgroundImg.onload = function () {
            self.ctxHelp.drawImage(self.backgroundImg, 0, 0, self.width, self.height);

            // Get the canvas pixel data
            var imgDataIn = self.ctxHelp.getImageData(0, 0, self.width, self.height);
            self.pixelsIn = imgDataIn.data;

            // Also paint it on the output canvas
            self.ctx.putImageData(imgDataIn, 0, 0);
        }
        this.backgroundImg.src = this.backgroundImageUrl;

    } else {

        var radgrad = pointerCtx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, this.height / 2);
        radgrad.addColorStop(0, '#4af');
        radgrad.addColorStop(1, '#000');

        this.ctxHelp.fillStyle = radgrad;
        this.ctxHelp.fillRect(0, 0, this.width, this.height);

        this.ctxHelp.shadowColor = "white";
        this.ctxHelp.shadowOffsetX = 0;
        this.ctxHelp.shadowOffsetY = 0;
        this.ctxHelp.shadowBlur = 10;

        this.ctxHelp.textBaseline = "top";
        this.ctxHelp.font = 'normal 200 45px verdana';
        this.ctxHelp.fillStyle = "white";
        this.ctxHelp.fillText("Water Canvas", 10, (this.height / 2) - 40);
        this.ctxHelp.font = 'normal 200 12px verdana';
        this.ctxHelp.fillText("Move your mouse over this canvas to move the water.", 10, (this.height / 2) + 10);
        this.ctxHelp.fillText("By Almeros 2010, See http://code.almeros.com", 10, (this.height / 2) + 30);

        // Get the canvas pixel data
        var imgDataIn = this.ctxHelp.getImageData(0, 0, this.width, this.height);
        this.pixelsIn = imgDataIn.data;

        // Also paint it on the output canvas
        this.ctx.putImageData(imgDataIn, 0, 0);

    }
}

/**
 * Renders the next frame and draws it on the canvas. 
 * Also handles calling itself again via requestAnim(ation)Frame.
 *
 * @private
 */
WaterCanvas.prototype.drawNextFrame = function () {
    if (this.pixelsIn == null || !this.waterModel.isEvolving()) {
        // Wait some time and try again
        var self = this;
        setTimeout(function () {
            self.drawNextFrame();
        }, 50);

        // Nothing else to do for now
        return;
    }


    // Make the canvas give us a CanvasDataArray. 
    // Creating an array ourselves is slow!!!
    // https://developer.mozilla.org/en/HTML/Canvas/Pixel_manipulation_with_canvas
    var imgDataOut = this.ctx.getImageData(0, 0, this.width, this.height);
    var pixelsOut = imgDataOut.data;
    for (var i = 0; n = pixelsOut.length, i < n; i += 4) {
        var pixel = i / 4;
        var x = pixel % this.width;
        var y = (pixel - x) / this.width;

        var strength = this.waterModel.getWater(x, y);


        // Refraction of light in water
        var refraction = Math.round(strength * this.lightRefraction);

        var xPix = x + refraction;
        var yPix = y + refraction;

        if (xPix < 0) xPix = 0;
        if (yPix < 0) yPix = 0;
        if (xPix > this.width - 1) xPix = this.width - 1;
        if (yPix > this.height - 1) yPix = this.height - 1;



        // Get the pixel from input
        var iPix = ((yPix * this.width) + xPix) * 4;
        var red = this.pixelsIn[iPix];
        var green = this.pixelsIn[iPix + 1];
        var blue = this.pixelsIn[iPix + 2];


        // Set the pixel to output
        strength *= this.lightReflection;
        strength += 1.0;

        pixelsOut[i] = red *= strength;
        pixelsOut[i + 1] = green *= strength;
        pixelsOut[i + 2] = blue *= strength;
        pixelsOut[i + 3] = 255; // alpha 
    }

    this.ctx.putImageData(imgDataOut, 0, 0);



    if (this.showStats) {
        this.fpsCounter++;


        this.ctx.textBaseline = "top";
        this.ctx.font = 'normal 200 10px arial';

        this.ctx.fillStyle = "white";
        this.ctx.fillText("FPS Canvas: " + this.getFps(), 10, 10);
        this.ctx.fillText("FPS Water: " + this.waterModel.getFps(), 10, 20);

        this.ctx.shadowColor = "black";
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 2;
    }



    // Make the browser call this function at a new render frame
    var self = this; // For referencing 'this' in internal eventListeners
    requestAnimFrame(function () {
        self.drawNextFrame()
    }, this.canvas);

}

/**
 * Determine the Frames Per Second. 
 * Called at regular intervals by an internal setInterval.
 *
 * @private
 */
WaterCanvas.prototype.findFps = function () {
    if (!this.showStats)
        return;

    var nowMs = new Date().getTime();
    var diffMs = nowMs - this.prevMs;

    this.fps = Math.round(((this.fpsCounter * 1000) / diffMs) * 10.0) / 10.0;

    this.prevMs = nowMs;
    this.fpsCounter = 0;
}

/**
 * @returns The Frames Per Second that was last rendered.
 */
WaterCanvas.prototype.getFps = function () {
    return this.fps;
}

/**
 * Sets the a amount of refraction of light through the water.
 *
 * @param {Number} lightRefraction The a amount of refraction of light.
 */
WaterCanvas.prototype.setLightRefraction = function (lightRefraction) {
    this.lightRefraction = lightRefraction;
}

/**
 * Sets the a amount of reflection of light on the water.
 *
 * @param {Number} lightRefraction The a amount of reflection of light.
 */
WaterCanvas.prototype.setLightReflection = function (lightReflection) {
    this.lightReflection = lightReflection;
}





////////////////////////////////////////////////////////////////////////////////
//                              WaterModel object                             //
////////////////////////////////////////////////////////////////////////////////

/**
 * Model object that is responsible for holding, manipulating and updating the water ripple data.
 * 
 * @param {Number} width The width in pixels this model should work with.
 * @param {Number} hight The hight in pixels this model should work with.
 * @param {Object} props A key/value object which may contain the following properties:
 * 				resolution:  
 *						Sets the pixelsize to use in the model. The higher hte better the performance, but 
 *						you may want to use interpolation to prefent visible block artifacts.
 *				interpolate: 
 *						When the resolution is set higher then 1.0, you can set this to true to use interpolation.
 *				damping: 
 *						Effectively sets how long water ripples travel.
 *				clipping: 
 *						Multiple waves add up. This may create a wave that's to high or low. The clipping value sets 
 *						the absolute maximum a water pixel value may have in the model.
 *				evolveThreshold: 
 *						To prevent this  script from always taking up CPU cycles, even when no water rippling 
 *						is going on in the model (your website is on a non visible tab) you can set a threshold. When 
 *						no water pixel is above this absolute value, the WaterModel and the WaterCanvas will both stop 
 *						rendering until new waves are created by the user.
 *				maxFps: 
 *						Maximum Frames Per Second; The maximum reachable FPS highly depends on the system and browser 
 *						the water canvas is running on. You can't control that, but you can control the maximum FPS to 
 *						keep systems from overloading, trying to reach the highest FPS.
 *				showStats: 
 *						When set to true, it shows "FPS Water: " plus the current FPS of this model on the canvas.
 *
 * @constructor
 */
WaterModel = function (width, height, props) {
    // If a certain property is not set, use a default value
    props = props || {};
    this.resolution = props.resolution || 2.0;
    this.interpolate = props.interpolate || false;
    this.damping = props.damping || 0.985;
    this.clipping = props.clipping || 5;
    this.maxFps = props.maxFps || 30;
    this.showStats = props.showStats || false;
    this.evolveThreshold = props.evolveThreshold || 0.05;

    this.width = Math.ceil(width / this.resolution);
    this.height = Math.ceil(height / this.resolution);



    // Create water model 2D arrays
    this.resetSizeAndResolution(width, height, this.resolution)
    this.swapMap;

    this.setMaxFps(this.maxFps);

    this.evolving = false; // Holds whether it's needed to render frames



    // Find out the FPS at certain intervals
    this.fps = -1;
    if (this.showStats) {
        this.fpsCounter = 0;
        this.prevMs = 0;

        var self = this;
        setInterval(function () {
            self.findFps();
        }, 1000);
    }
}

/**
 * Gets the (interpolated) water value of an coordinate.
 *
 * @param {Number} x The X position.
 * @param {Number} y The Y position.
 *
 * @returns A float value representing the hight of the water.
 */
WaterModel.prototype.getWater = function (x, y) {
    xTrans = x / this.resolution;
    yTrans = y / this.resolution;

    if (!this.interpolate || this.resolution == 1.0) {
        xF = Math.floor(xTrans);
        yF = Math.floor(yTrans);

        if (xF > this.width - 1 || yF > this.height - 1)
            return 0.0;

        return this.depthMap1[xF][yF];
    }


    // Else use Bilinear Interpolation
    xF = Math.floor(xTrans);
    yF = Math.floor(yTrans);
    xC = Math.ceil(xTrans);
    yC = Math.ceil(yTrans);

    if (xC > this.width - 1 || yC > this.height - 1)
        return 0.0;

    // Now get 4 points from the array
    var br = this.depthMap1[xF][yF];
    var bl = this.depthMap1[xC][yF];
    var tr = this.depthMap1[xF][yC];
    var tl = this.depthMap1[xC][yC];

    // http://tech-algorithm.com/articles/bilinear-image-scaling/
    //	D   C
    //	  Y
    //	B	A
    // Y = A(1-w)(1-h) + B(w)(1-h) + C(h)(1-w) + Dwh

    var xChange = xC - xTrans;
    var yChange = yC - yTrans;
    var intpVal =
        tl * (1 - xChange) * (1 - yChange) +
        tr * (xChange) * (1 - yChange) +
        bl * (yChange) * (1 - xChange) +
        br * xChange * yChange;

    return intpVal;
}

/**
 * Sets bilinear interpolation on or off. Interpolation will give a more smooth effect
 * when a higher resolution is used, but needs CPU resources for that.
 *
 * @param {Boolean} interpolate Whether to use interpolation or not
 */
WaterModel.prototype.setInterpolation = function (interpolate) {
    this.interpolate = interpolate;
}

/**
 * Gets the (interpolated) water value of an coordinate.
 *
 * @param {Number} x The X position. The center of where the array2d will be placed.
 * @param {Number} y The Y position. The center of where the array2d will be placed.
 * @param {Number} pressure The factor to multiply the array2d values with while adding the array2d to the model.
 * @param {Array} array2d A 2D array containing float values between -1.0 and 1.0 in a pattern.
 */
WaterModel.prototype.touchWater = function (x, y, pressure, array2d) {
    this.evolving = true;

    x = Math.floor(x / this.resolution);
    y = Math.floor(y / this.resolution);

    // Place the array2d in the center of the mouse position
    if (array2d.length > 4 || array2d[0].length > 4) {
        x -= array2d.length / 2;
        y -= array2d[0].length / 2;
    }

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > this.width) x = this.width;
    if (y > this.height) y = this.height;

    // Big pixel block
    for (var i = 0; i < array2d.length; i++) {
        for (var j = 0; j < array2d[0].length; j++) {

            if (x + i >= 0 && y + j >= 0 && x + i <= this.width - 1 && y + j <= this.height - 1) {
                this.depthMap1[x + i][y + j] -= array2d[i][j] * pressure;
            }

        }
    }
}

/**
 * Renders the next frame in the model. The water ripples will be evolved one step.
 * Called at regular intervals by an internal setInterval.
 *
 * @private
 */
WaterModel.prototype.renderNextFrame = function () {
    if (!this.evolving)
        return;

    this.evolving = false;

    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {

            // Handle borders correctly
            var val = (x == 0 ? 0 : this.depthMap1[x - 1][y]) +
                (x == this.width - 1 ? 0 : this.depthMap1[x + 1][y]) +
                (y == 0 ? 0 : this.depthMap1[x][y - 1]) +
                (y == this.height - 1 ? 0 : this.depthMap1[x][y + 1]);

            // Damping
            val = ((val / 2.0) - this.depthMap2[x][y]) * this.damping;

            // Clipping prevention
            if (val > this.clipping) val = this.clipping;
            if (val < -this.clipping) val = -this.clipping;

            // Evolve check
            if (Math.abs(val) > this.evolveThreshold)
                this.evolving = true;


            this.depthMap2[x][y] = val;
        }
    }

    // Swap buffer references
    this.swapMap = this.depthMap1;
    this.depthMap1 = this.depthMap2;
    this.depthMap2 = this.swapMap;

    this.fpsCounter++;
}

/**
 * Tells if the WaterModel is currently evolving. When all postions in the model are below a threshold 
 * (evolveThreshold), evolving will be set to false. This saves resources, especially when the canvas 
 * is not visible on screen.
 *
 * @returns A boolean that tells if the WaterModel is currently in evolving state.
 */
WaterModel.prototype.isEvolving = function () {
    return this.evolving;
}

/**
 * Determine the Frames Per Second. 
 * Called at regular intervals by an internal setInterval.
 *
 * @private
 */
WaterModel.prototype.findFps = function () {
    if (!this.showStats)
        return;

    var nowMs = new Date().getTime();
    var diffMs = nowMs - this.prevMs;

    this.fps = Math.round(((this.fpsCounter * 1000) / diffMs) * 10.0) / 10.0;

    this.prevMs = nowMs;
    this.fpsCounter = 0;
}

/**
 * @returns The Frames Per Second that was last rendered.
 */
WaterModel.prototype.getFps = function () {
    return this.fps;
}

/**
 * Sets the maximum frames per second to render. Use this to set a limit and release resources for other processes.
 *
 * @param {Number} maxFps The maximum frames per second to render.
 */
WaterModel.prototype.setMaxFps = function (maxFps) {
    this.maxFps = maxFps;

    clearInterval(this.maxFpsInterval);

    // Updating of the animation
    var self = this; // For referencing 'this' in internal eventListeners	

    if (this.maxFps > 0) {
        this.maxFpsInterval = setInterval(function () {
            self.renderNextFrame();
        }, 1000 / this.maxFps);
    }
}

/**
 * Effectively sets how long water ripples travel.
 *
 * @param {Number} damping The amount of strength to pass on from postion to surrounding positions.
 */
WaterModel.prototype.setDamping = function (damping) {
    this.damping = damping;
}

/**
 * Effectively sets how long water ripples travel.
 * 
 * @param {Number} width The width in pixels this model should work with.
 * @param {Number} hight The hight in pixels this model should work with.
 * @param {Number} resolution The pixel size of a models position. The higher the resolution, the less positions to render, the faster. 
 */
WaterModel.prototype.resetSizeAndResolution = function (width, height, resolution) {
    this.width = Math.ceil(width / resolution);
    this.height = Math.ceil(height / resolution);
    this.resolution = resolution;

    this.depthMap1 = new Array(this.width);
    this.depthMap2 = new Array(this.width);
    for (var x = 0; x < this.width; x++) {
        this.depthMap1[x] = new Array(this.height);
        this.depthMap2[x] = new Array(this.height);

        for (var y = 0; y < this.height; y++) {
            this.depthMap1[x][y] = 0.0;
            this.depthMap2[x][y] = 0.0;
        }
    }
}






////////////////////////////////////////////////////////////////////////////////
//                                 Util functions                             //
////////////////////////////////////////////////////////////////////////////////

/**
 * A class to mimic rain on the given waterModel with raindrop2dArray's as raindrops.
 */
RainMaker = function (width, height, waterModel, raindrop2dArray) {
    this.width = width;
    this.height = height;
    this.waterModel = waterModel;
    this.raindrop2dArray = raindrop2dArray;

    this.rainMinPressure = 1;
    this.rainMaxPressure = 3;
}

RainMaker.prototype.raindrop = function () {
    var x = Math.floor(Math.random() * this.width);
    var y = Math.floor(Math.random() * this.height);
    this.waterModel.touchWater(x, y, this.rainMinPressure + Math.random() * this.rainMaxPressure, this.raindrop2dArray);
}

RainMaker.prototype.setRaindropsPerSecond = function (rps) {
    this.rps = rps;

    clearInterval(this.rainInterval);

    if (this.rps > 0) {
        var self = this;
        this.rainInterval = setInterval(function () {
            self.raindrop();
        }, 1000 / this.rps);
    }
}

RainMaker.prototype.setRainMinPressure = function (rainMinPressure) {
    this.rainMinPressure = rainMinPressure;
}

RainMaker.prototype.setRainMaxPressure = function (rainMaxPressure) {
    this.rainMaxPressure = rainMaxPressure;
}

/**
 * Enables mouse interactivity by adding event listeners to the given documentElement and
 * using the mouse coordinates to 'touch' the water.
 */
function enableMouseInteraction(waterModel, documentElement) {
    var mouseDown = false;

    var canvasHolder = document.getElementById(documentElement);

    canvasHolder.addEventListener("mousedown", function (e) {
        mouseDown = true;
        var x = (e.clientX - canvasHolder.offsetLeft) + document.body.scrollLeft + document.documentElement.scrollLeft;
        var y = (e.clientY - canvasHolder.offsetTop) + document.body.scrollTop + document.documentElement.scrollTop;
        waterModel.touchWater(x, y, 1.5, mouseDown ? finger : pixel);
    }, false);

    canvasHolder.addEventListener("mouseup", function (e) {
        mouseDown = false;
    }, false);

    canvasHolder.addEventListener("mousemove", function (e) {
        var x = (e.clientX - canvasHolder.offsetLeft) + document.body.scrollLeft + document.documentElement.scrollLeft;
        var y = (e.clientY - canvasHolder.offsetTop) + document.body.scrollTop + document.documentElement.scrollTop;
        // mozPressure: https://developer.mozilla.org/en/DOM/Event/UIEvent/MouseEvent
        waterModel.touchWater(x, y, 1.5, mouseDown ? finger : pixel);
    }, false);
}

/**
 * Creates a canvas with a radial gradient from white in the center to black on the outside.
 */
function createRadialCanvas(width, height) {
    // Create a canvas
    var pointerCanvas = document.createElement('canvas');
    pointerCanvas.setAttribute('width', width);
    pointerCanvas.setAttribute('height', height);
    pointerCtx = pointerCanvas.getContext('2d');

    // Create a drawing on the canvas
    var radgrad = pointerCtx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height / 2);
    radgrad.addColorStop(0, '#fff');
    radgrad.addColorStop(1, '#000');

    pointerCtx.fillStyle = radgrad;
    pointerCtx.fillRect(0, 0, width, height);

    return pointerCanvas;
}

/**	
 * Creates a 2D pointer array from a given canvas with a grayscale image on it. 
 * This canvas image is then converted to a 2D array with values between -1.0 and 0.0.
 * 
 * Example:
 * 	var array2d = [
 * 		[0.5, 1.0, 0.5], 
 * 		[1.0, 1.0, 1.0], 
 * 		[0.5, 1.0, 0.5]
 * 	];
 */
function create2DArray(canvas) {
    var width = canvas.width;
    var height = canvas.height;

    // Create an empty 2D  array
    var pointerArray = new Array(width);
    for (var x = 0; x < width; x++) {
        pointerArray[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            pointerArray[x][y] = 0.0;
        }
    }

    // Convert gray scale canvas to 2D array
    var pointerCtx = canvas.getContext('2d');
    var imgData = pointerCtx.getImageData(0, 0, width, height);
    var pixels = imgData.data;

    for (var i = 0; n = pixels.length, i < n; i += 4) {
        // Get the pixel from input
        var pixVal = pixels[i]; // only use red
        var arrVal = pixVal / 255.0;

        var pixel = i / 4;
        var x = pixel % width;
        var y = (pixel - x) / width;

        pointerArray[x][y] = arrVal;
    }

    return pointerArray;
}

// requestAnimFrame (NB: NOT requestAnimationFrame) will be used, 
// so make sure it's available. Credits @mrdoob
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();