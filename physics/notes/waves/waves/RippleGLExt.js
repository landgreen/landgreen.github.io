"use strict";

/*
 * extends the base ripple class
 * adding logic to do the rippling and rendering within the GPU
 * the ripple animation only required 2D coordinates
 */

/* the rectangle vertices to draw the texture on */
Ripple.VERTICES = new Float32Array([/*BL*/-1, -1, 0, 0, /*TL*/-1, 1, 0, 1, /*TR*/1, 1, 1, 1, /*BR*/1, -1, 1, 0]);

/* the vertex shader used in the GPU */
Ripple.VERTEX_SHADER = "attribute vec2 a_position;\n\
attribute vec2 a_texCoord;\n\
varying vec2 v_texCoord;\n\
void main() {\n\
    gl_Position = vec4(a_position, 0.0, 1.0);\n\
    v_texCoord = a_texCoord;\n\
}";

/* the fragment shader used to generate the next ripple height buffer */
Ripple.GEN_NEXT_H_BUFFER_FRAGMENT_SHADER = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n\
precision highp float;\n\
#else\n\
    precision mediump float;\n\
#endif\n\
uniform float u_widthInc;  // the size of a pixel\n\
uniform float u_heightInc; // within the texture\n\
uniform float u_damping;\n\
uniform float u_dropX; // the location of a new drop\n\
uniform float u_dropY;\n\
uniform float u_dropSize; // size > 0 if new drop\n\
uniform sampler2D u_currHBuf;\n\
uniform sampler2D u_prevHBuf;\n\
varying vec2 v_texCoord;\n\
void main() {\n\
    if (u_dropSize > 0.0) { // a new drop is requested\n\
        // determine if this texel is the position of a new drop\n\
        bool isDropXLoc = abs(v_texCoord.x - u_dropX) < u_widthInc;\n\
        bool isDropYLoc = abs(v_texCoord.y - u_dropY) < u_heightInc;\n\
        if (isDropXLoc && isDropYLoc) { // create a drop \n\
            gl_FragColor.r = gl_FragColor.g = gl_FragColor.b = u_dropSize;\n\
        } else { // not the location of the drop\n\
            gl_FragColor = texture2D(u_currHBuf, v_texCoord);\n\
        }\n\
    } else { // move wave front\n\
        // calculate a new height based on the neighbouring heights\n\
        vec2 xinc = vec2(u_widthInc, 0); // increment to neighbouring texel\n\
        vec2 yinc = vec2(0, u_heightInc);\n\
        // sum the neighbouring heights\n\
        float sumH = texture2D(u_currHBuf, v_texCoord - xinc).r;\n\
        sumH += texture2D(u_currHBuf, v_texCoord + xinc).r;\n\
        sumH += texture2D(u_currHBuf, v_texCoord - yinc).r;\n\
        sumH += texture2D(u_currHBuf, v_texCoord + yinc).r;\n\
        // only divide by 2 in the average\n\
        // because the previous height is being subtracted out\n\
        float newH = (sumH / 2.0 - texture2D(u_prevHBuf, v_texCoord).r) * u_damping;\n\
        gl_FragColor.r = gl_FragColor.g = gl_FragColor.b = newH;\n\
    }\n\
    // set alpha to 1 in case the height map is rendered for testing\n\
    gl_FragColor.a = 1.0;\n\
}";

/* the fragment shader used to render the image */
Ripple.RENDER_FRAGMENT_SHADER = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n\
precision highp float;\n\
#else\n\
    precision mediump float;\n\
#endif\n\
uniform float u_refract;\n\
uniform sampler2D u_origImg;\n\
uniform sampler2D u_heights;\n\
varying vec2 v_texCoord;\n\
void main() {\n\
    // set the current pixel to a pixel from the original image\n\
    // based on an offset caused by the height of the pixel and refraction\n\
    float r = texture2D(u_heights, v_texCoord).r * u_refract;\n\
    float xCoord = clamp(v_texCoord.x + r, 0.0, 1.0);\n\
    float yCoord = clamp(v_texCoord.y + r, 0.0, 1.0);\n\
    gl_FragColor = texture2D(u_origImg, vec2(xCoord, yCoord));\n\
}";

Ripple.glShaders = {
    genNextHBuf: {
        vShader: Ripple.VERTEX_SHADER,
        fShader: Ripple.GEN_NEXT_H_BUFFER_FRAGMENT_SHADER
    }, renderTexture: {
        vShader: Ripple.VERTEX_SHADER,
        fShader: Ripple.RENDER_FRAGMENT_SHADER
    }
};

/*
 * initialize WebGL for the ripple controller
 * init({ baseOptions, invertMouseY, customWebGL, ignoreWebGLError, debug })
 */
Ripple.origInit = Ripple.init;
Ripple.init = function (options) {
    if (Ripple.debug || options.debug) console.debug("initRippleGLExt");
    if (!options) options = {};
    options.invertMouseY = true; // invert because height buffer is created upside down
    if (options.customWebGL) {
        // custom WebGL implementations will provide their own versions code
        Ripple.initHBuf = Ripple.origInitHBuf; delete Ripple.origInitHBuf;
        Ripple.createDrop = Ripple.origCreateDrop; delete Ripple.origCreateDrop;
    }
    Ripple.ignoreWebGLError = options.ignoreWebGLError || false;
    Ripple.origInit(options);
};

/* initialization of WebGL to run after all resources are loaded */
Ripple.origResourcesReady = Ripple.resourcesReady;
Ripple.resourcesReady = function () {
    if (Ripple.debug) console.debug("initCanvasGL");
    if (window.WebGLDebugUtils) {
        var canvas = document.getElementById("rippleCanvas");
        WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
        window.loseContext = canvas.loseContext;
    }
    // load the shaders asynchronously
    // the code is provided in this file and does not need to be loaded
    // but this is kept in case it is changed
    WebGL.loadShaders(Ripple.glShaders, function () {
        Ripple.glContext = Ripple.initGL();
        if (Ripple.glContext) Ripple.origResourcesReady();
    });
};

/* resize the canvas and everything relying on that size */
Ripple.origResizeCanvas = Ripple.resizeCanvas;
Ripple.resizeCanvas = function () {
    if (Ripple.debug) console.debug("resizeCanvasGL");
    Ripple.glContext.canvas.width = document.body.clientWidth; // exclude scrollbars
    Ripple.glContext.canvas.height = document.body.clientHeight;
    Ripple.initHBuf();
    Ripple.initImage();
    Ripple.initGpu();
    Ripple.render();
    Ripple.resizeComplete();
};

/* setup the ripple height buffers */
Ripple.origInitHBuf = Ripple.initHBuf;
Ripple.initHBuf = function (width, height) {
    if (Ripple.debug) console.debug("initHBufGL");
    Ripple.origInitHBuf(width, height);
    // WebGL uses RGBA data instead of a single height, but R=G=B
    Ripple.hBuf().curr = new Float32Array(Ripple.hBuf().size * 4);
    Ripple.hBuf().prev = new Float32Array(Ripple.hBuf().curr.length);
};

/* reinitializes the ripple buffers and sets the image to the original image */
Ripple.origResetAnimation = Ripple.resetAnimation;
Ripple.resetAnimation = function () {
    if (Ripple.debug) console.debug("resetAnimationGL");
    FPS.reset();
    Ripple.initHBuf(Ripple.hBuf().width, Ripple.hBuf().height);
    Ripple.resetImage();
    Ripple.initGpu();
    Ripple.render();
};

/* initilize the WebGL engine and the shader code */
Ripple.initGL = function () {
    if (Ripple.debug) console.debug("initGL");
    var gl = WebGL.setup(document.getElementById("rippleCanvas"), Ripple.glContextRestored, undefined, Ripple.ignoreWebGLError);
    if (!gl) return;
    // https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float
    if (!WebGL.getExtension("OES_texture_float")) return gl = undefined;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    WebGL.initMultipleShaders(Ripple.glShaders);
    return gl;
};

/* reinitialized the simulation if the WebGL context is lost */
Ripple.glContextRestored = function () {
    Ripple.glContext = Ripple.initGL();
    Ripple.initGpu();
    Ripple.render();
};

/* setup the data on the GPU */
Ripple.initGpu = function () {
    if (Ripple.debug) console.debug("initGpu");
    WebGL.deleteObjects(Ripple.gpuObjects);
    Ripple.gpuObjects = { offScrBuf: Ripple.glContext.createFramebuffer() };
    var textureOptions = { UNPACK_FLIP_Y_WEBGL: false, TEXTURE_MIN_FILTER: Ripple.glContext.NEAREST, TEXTURE_MAG_FILTER: Ripple.glContext.NEAREST };

    WebGL.useProgram(Ripple.glShaders.genNextHBuf);
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_widthInc, 1 / Ripple.hBuf().width);
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_heightInc, 1 / Ripple.hBuf().height);
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_damping, Ripple.damping());
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_dropSize, -1);
    // vertex position and texture coordinates are interleaved in the same array
    Ripple.gpuObjects.positionBuf = WebGL.bindNewBuffer(Ripple.glContext.ARRAY_BUFFER, Ripple.VERTICES, Ripple.glShaders.genNextHBuf.a_position, 2, Ripple.glContext.FLOAT, 16, 0);
    Ripple.gpuObjects.texCoordBuf = WebGL.bindNewBuffer(Ripple.glContext.ARRAY_BUFFER, Ripple.VERTICES, Ripple.glShaders.genNextHBuf.a_texCoord, 2, Ripple.glContext.FLOAT, 16, 8);
    // create 3 textures to store the current, previous and new ripple height buffers
    // the GPU cannot write to a buffer it is reading from like the JavaScript implementation
    // floating point textures are used, which is a WebGL extension
    Ripple.gpuObjects.newHTex = WebGL.bindNewTexture(undefined, undefined, undefined, textureOptions, Ripple.hBuf().width, Ripple.hBuf().height, Ripple.glContext.RGBA, Ripple.glContext.FLOAT);
    Ripple.glShaders.genNextHBuf.currHTexUnit = Ripple.glContext.TEXTURE1;
    Ripple.gpuObjects.currHTex = WebGL.bindNewTexture(Ripple.glShaders.genNextHBuf.currHTexUnit, Ripple.hBuf().curr, Ripple.glShaders.genNextHBuf.u_currHBuf, textureOptions, Ripple.hBuf().width, Ripple.hBuf().height, Ripple.glContext.RGBA, Ripple.glContext.FLOAT);
    Ripple.glShaders.genNextHBuf.prevHTexUnit = Ripple.glContext.TEXTURE2;
    Ripple.gpuObjects.prevHTex = WebGL.bindNewTexture(Ripple.glShaders.genNextHBuf.prevHTexUnit, Ripple.hBuf().prev, Ripple.glShaders.genNextHBuf.u_prevHBuf, textureOptions, Ripple.hBuf().width, Ripple.hBuf().height, Ripple.glContext.RGBA, Ripple.glContext.FLOAT);

    WebGL.useProgram(Ripple.glShaders.renderTexture);
    Ripple.glContext.uniform1f(Ripple.glShaders.renderTexture.u_refract, Ripple.refract());
    WebGL.bindBuffer(Ripple.glContext.ARRAY_BUFFER, Ripple.gpuObjects.positionBuf, Ripple.glShaders.renderTexture.a_position, 2, Ripple.glContext.FLOAT, 16, 0);
    WebGL.bindBuffer(Ripple.glContext.ARRAY_BUFFER, Ripple.gpuObjects.texCoordBuf, Ripple.glShaders.renderTexture.a_texCoord, 2, Ripple.glContext.FLOAT, 16, 8);
    Ripple.gpuObjects.origImgTex = WebGL.bindNewTexture(Ripple.glContext.TEXTURE3, Ripple.origImageData(), Ripple.glShaders.renderTexture.u_origImg);
};

/* create a drop within the current ripple buffer */
Ripple.origCreateDrop = Ripple.createDrop;
Ripple.createDrop = function (x, y, size) {
    if (Ripple.debug) console.debug("createDropGL");
    WebGL.useProgram(Ripple.glShaders.genNextHBuf);
    // set the new drop parameters
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_dropX, x / Ripple.hBuf().width);
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_dropY, y / Ripple.hBuf().height);
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_dropSize, size);
    // generate the next ripple buffer with the new drop advancing the wave front
    // the buffer is generated off screen in a new texture
    Ripple.glContext.bindFramebuffer(Ripple.glContext.FRAMEBUFFER, Ripple.gpuObjects.offScrBuf);
    Ripple.glContext.framebufferTexture2D(Ripple.glContext.FRAMEBUFFER, Ripple.glContext.COLOR_ATTACHMENT0, Ripple.glContext.TEXTURE_2D, Ripple.gpuObjects.newHTex, 0);
    Ripple.glContext.viewport(0, 0, Ripple.hBuf().width, Ripple.hBuf().height);
    Ripple.glContext.clear(Ripple.glContext.COLOR_BUFFER_BIT);
    Ripple.glContext.drawArrays(Ripple.glContext.TRIANGLE_FAN, 0, 4);
    // restore the frame buffer so drawing is no longer off screen
    Ripple.glContext.bindFramebuffer(Ripple.glContext.FRAMEBUFFER, undefined);
    // next wave advances should not create a new drop
    Ripple.glContext.uniform1f(Ripple.glShaders.genNextHBuf.u_dropSize, -1);
    // make the new ripple height buffer the current height buffer
    WebGL.bindTexture(Ripple.glShaders.genNextHBuf.currHTexUnit, Ripple.gpuObjects.newHTex);
    var swapHTex = Ripple.gpuObjects.currHTex;
    Ripple.gpuObjects.currHTex = Ripple.gpuObjects.newHTex;
    Ripple.gpuObjects.newHTex = swapHTex;
};

/*
 * generate the next ripple buffer which advances the wave front
 * does not provide evolving logic; always returns true
 */
Ripple.origGenNextHBuf = Ripple.genNextHBuf;
Ripple.genNextHBuf = function () {
    if (Ripple.debug) console.debug("genNextHBufGL");
    WebGL.useProgram(Ripple.glShaders.genNextHBuf);
    // generate the next ripple buffer advancing the wave front
    // the buffer is generated off screen in a new texture
    Ripple.glContext.bindFramebuffer(Ripple.glContext.FRAMEBUFFER, Ripple.gpuObjects.offScrBuf);
    Ripple.glContext.framebufferTexture2D(Ripple.glContext.FRAMEBUFFER, Ripple.glContext.COLOR_ATTACHMENT0, Ripple.glContext.TEXTURE_2D, Ripple.gpuObjects.newHTex, 0);
    Ripple.glContext.viewport(0, 0, Ripple.hBuf().width, Ripple.hBuf().height);
    Ripple.glContext.clear(Ripple.glContext.COLOR_BUFFER_BIT);
    Ripple.glContext.drawArrays(Ripple.glContext.TRIANGLE_FAN, 0, 4);
    // restore the frame buffer so drawing is no longer off screen
    Ripple.glContext.bindFramebuffer(Ripple.glContext.FRAMEBUFFER, undefined);
    // make the new ripple height buffer the current height buffer
    // and the current height buffer the previous height buffer
    // the old previous buffer becomes the new buffer for the next iteration
    WebGL.bindTexture(Ripple.glShaders.genNextHBuf.prevHTexUnit, Ripple.gpuObjects.currHTex);
    WebGL.bindTexture(Ripple.glShaders.genNextHBuf.currHTexUnit, Ripple.gpuObjects.newHTex);
    var swapHTex = Ripple.gpuObjects.prevHTex;
    Ripple.gpuObjects.prevHTex = Ripple.gpuObjects.currHTex;
    Ripple.gpuObjects.currHTex = Ripple.gpuObjects.newHTex;
    Ripple.gpuObjects.newHTex = swapHTex;
    return true;
};

/* rendering is done in the GPU so no frame generation is needed CPU side */
Ripple.origGenNextFrame = Ripple.genNextFrame;
Ripple.genNextFrame = function () { }; // do nothing

/* draws the current image data to the canvas and calculates frames per second */
Ripple.origRender = Ripple.render;
Ripple.render = function () {
    if (Ripple.debug) console.debug("renderGL");
    WebGL.useProgram(Ripple.glShaders.renderTexture);
    WebGL.bindTexture(Ripple.glContext.TEXTURE0, Ripple.gpuObjects.currHTex);
    Ripple.glContext.viewport(0, 0, Ripple.glContext.canvas.width, Ripple.glContext.canvas.height);
    Ripple.glContext.clear(Ripple.glContext.COLOR_BUFFER_BIT);
    Ripple.glContext.drawArrays(Ripple.glContext.TRIANGLE_FAN, 0, 4);
    Ripple.calcFps();
};