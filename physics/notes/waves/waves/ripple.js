/**
 * Water ripple effect.
 * Original code (Java) by Neil Wallis 
 * @link http://www.neilwallis.com/java/water.html
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
function waterRipple(img) {
    img.style.display = "none" //hide original image
    var canvas = document.createElement('canvas'),
        /** @type {CanvasRenderingContext2D} */
        ctx = canvas.getContext('2d'),
        width = img.width,
        height = img.height,
        half_width = width >> 1,
        half_height = height >> 1,
        size = width * (height + 2) * 2,
        delay = 30,
        oldind = width,
        newind = width * (height + 3),
        riprad = 3,
        ripplemap = [],
        last_map = [],
        ripple,
        texture;
    // line_width = 20,
    // step = line_width * 2,
    // count = height / line_width;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0);
    canvas.style.left = img.offsetLeft + 'px';
    canvas.style.top = img.offsetTop + 'px';

    img.parentNode.insertBefore(canvas, img);

    texture = ctx.getImageData(0, 0, width, height);
    ripple = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < size; i++) {
        last_map[i] = ripplemap[i] = 0;
    }

    /**
     * Main loop
     */
    function run() {
        newframe();
        ctx.putImageData(ripple, 0, 0);
    }

    /**
     * Disturb water at specified point
     */
    function disturb(dx, dy) {
        dx <<= 0;
        dy <<= 0;

        for (var j = dy - riprad; j < dy + riprad; j++) {
            for (var k = dx - riprad; k < dx + riprad; k++) {
                ripplemap[oldind + (j * width) + k] += 128;
            }
        }
    }

    /**
     * Generates new ripples
     */
    function newframe() {
        var a, b, data, cur_pixel, new_pixel, old_data;

        var t = oldind;
        oldind = newind;
        newind = t;
        var i = 0;

        // create local copies of variables to decrease
        // scope lookup time in Firefox
        var _width = width,
            _height = height,
            _ripplemap = ripplemap,
            _last_map = last_map,
            _rd = ripple.data,
            _td = texture.data,
            _half_width = half_width,
            _half_height = half_height;

        for (var y = 0; y < _height; y++) {
            for (var x = 0; x < _width; x++) {
                var _newind = newind + i,
                    _mapind = oldind + i;
                data = (
                    _ripplemap[_mapind - _width] +
                    _ripplemap[_mapind + _width] +
                    _ripplemap[_mapind - 1] +
                    _ripplemap[_mapind + 1]) >> 1;

                data -= _ripplemap[_newind];
                data -= data >> 5;

                _ripplemap[_newind] = data;

                //where data=0 then still, where data>0 then wave
                data = 1024 - data;

                old_data = _last_map[i];
                _last_map[i] = data;

                if (old_data != data) {
                    //offsets
                    a = (((x - _half_width) * data / 1024) << 0) + _half_width;
                    b = (((y - _half_height) * data / 1024) << 0) + _half_height;

                    //bounds check
                    if (a >= _width) a = _width - 1;
                    if (a < 0) a = 0;
                    if (b >= _height) b = _height - 1;
                    if (b < 0) b = 0;

                    new_pixel = (a + (b * _width)) * 4;
                    cur_pixel = i * 4;

                    _rd[cur_pixel] = _td[new_pixel];
                    _rd[cur_pixel + 1] = _td[new_pixel + 1];
                    _rd[cur_pixel + 2] = _td[new_pixel + 2];
                }

                ++i;
            }
        }
    }

    canvas.onmousemove = function ( /* Event */ evt) {
        disturb(evt.offsetX || evt.layerX, evt.offsetY || evt.layerY);
    };

    setInterval(run, delay);

    // generate random ripples
    var rnd = Math.random;
    setInterval(function () {
        disturb(rnd() * width, rnd() * height);
    }, 700);

};