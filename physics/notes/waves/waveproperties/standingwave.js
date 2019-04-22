/*
---Todo-----
add option for open on left or right (not negating the amplitude after a reflection)
add option for circular cavity (not negating the amplitude after a reflection, plus starting every wave on the left)

show a single wave reflecting
    show how it flips amplitude
    possibly by highlighting one spot on the wave and progressing it forward.

*/


const wave = function () {
    const origin = { //origin of x,y axes
        x: 0,
        y: 200
    };
    const velocity = 400;
    let reflections = 32
    const totalPaths = 18 //how many paths are drawn in the SVG, the rest are just calculated for the superposition path
    let dampening = -1 //lower values simulate energy loss, but don't make the standing waves as distinct
    let wavelength = 6 * 100;
    document.getElementById("wavelength").value = wavelength / 100;


    let phase = 100;
    phase = phase % wavelength; //makes the switch smoother

    const width = Math.floor((document.body.clientWidth - 20) / 100) * 100 //scale width to even multiples of 100 pixels plus ten for borders
    document.getElementById("standing-wave").setAttribute("width", width);
    document.getElementById("standing-wave-border").setAttribute("d", "M0 0 v400 M" + width + " 0 v400");
    //update answer to question based on width
    let out = "λ = "
    for (let i = 1; i < 25; i++) {
        out += Math.round(2 * width / 100 / i * 1000) / 1000 + ", &nbsp;"
    }
    document.getElementById("list-standing").innerHTML = out + "..."
    // document.getElementById("list-standing").innerHTML = `λ = ${(L).toFixed(0)}, ${(L/2).toFixed(0)}, ${(L/3).toFixed(1)}, ${(L/4).toFixed(1)}, ${(L/5).toFixed(2)}, ${(L/6).toFixed(2)}, ${(L/7).toFixed(2)}, ${(L/8).toFixed(2)}, ${(L/9).toFixed(2)}, ${(L/10).toFixed(2)}, ${(L/11).toFixed(2)}, ${(L/12).toFixed(2)}, ${(L/13).toFixed(3)}, ${(L/14).toFixed(3)}, ${(L/16).toFixed(3)}, ${(L/17).toFixed(3)}, ${(L/18).toFixed(3)}, ${(L/19).toFixed(3)}, ${(L/20).toFixed(3)}, ${(L/21).toFixed(3)}, ${(L/22).toFixed(3)}, ${(L/23).toFixed(4)}, ${(L/24).toFixed(4)}, ${Math.round(L/23*1000)/1000},  ...`


    document.getElementById("wavelength").addEventListener("input", () => {
        wavelength = Math.max(Number(document.getElementById("wavelength").value) * 100, 1);
        document.getElementById("wavelength-slider").value = wavelength / 100
        phase = phase % wavelength; //makes the switch smoother
    }, false);

    document.getElementById("wavelength-slider").addEventListener("input", () => {
        wavelength = Math.max(Number(document.getElementById("wavelength-slider").value) * 100, 1);
        document.getElementById("wavelength").value = wavelength / 100
        phase = phase % wavelength; //makes the switch smoother
    }, false);

    // document.getElementById("reflections").addEventListener("input", () => {
    //     reflections = Math.max(16, Math.floor(Number(document.getElementById("reflections").value)))
    //     document.getElementById("reflections-slider").value = reflections
    // }, false);

    // document.getElementById("reflections-slider").addEventListener("input", () => {
    //     reflections = Math.max(16, Math.floor(Number(document.getElementById("reflections-slider").value)))
    //     document.getElementById("reflections").value = reflections
    // }, false);

    // document.getElementById("dampening").addEventListener("input", () => {
    //     const value = Number(document.getElementById("dampening").value)
    //     dampening = -Math.min(1, Math.max(0, value))
    //     document.getElementById("dampening-slider").value = -dampening
    // }, false);

    // document.getElementById("dampening-slider").addEventListener("input", () => {
    //     const value = Number(document.getElementById("dampening-slider").value)
    //     dampening = -Math.min(1, Math.max(0, value))
    //     document.getElementById("dampening").value = -dampening
    // }, false);

    function draw() {
        // document.getElementById("incident-wave-form-path").setAttribute("stroke-dashoffset", -phase * 2);  
        phase += velocity / 60; //move the waves forward in time
        const frequency = 2 * Math.PI / wavelength
        let wave, d
        let amplitude = 50
        let offset = 0
        let sum = []; //array that stores the superposition data from reflected and incident waves
        sum[0] = Math.sin(frequency * phase) * amplitude //populate sum array
        for (let i = 1; i < width; i++) {
            sum[i] = 1
        }

        for (let j = 0; j < reflections; j += 2) {
            //reflected wave (starts on left)
            amplitude *= dampening
            offset += width

            wave = Math.sin(frequency * (offset - phase)) * amplitude
            sum[0] += wave //adding wave contribution to superposition wave
            if (j < totalPaths) d = "M-1 " + (wave + origin.y);;
            for (let x = 0; x < width; x++) {
                wave = Math.sin(frequency * (x + offset - phase)) * amplitude
                sum[x] += wave //adding wave contribution to superposition wave
                if (j < totalPaths) d += " L" + x + " " + (wave + origin.y);
            }
            if (j < totalPaths) document.getElementById("wave-form-path-" + j).setAttribute("d", d);

            //reflected wave (starts on right)
            amplitude *= dampening
            offset += width

            wave = Math.sin(frequency * (offset - phase)) * amplitude
            if (j < totalPaths) d = "M" + width + " " + (wave + origin.y);;
            for (let i = 0, x = width; i < width; i++, x++) {
                wave = Math.sin(frequency * (x + offset - width - phase)) * amplitude
                sum[width - i] += wave; //adding wave contribution to superposition wave
                if (j < totalPaths) d += " L" + (width - i) + " " + (wave + origin.y);;
            }
            if (j < totalPaths) document.getElementById("wave-form-path-" + (j + 1)).setAttribute("d", d);
        }

        //draw interference patter superposition
        const scale = 3.9 / reflections
        d = "M 1 " + origin.y + " L1 " + (sum[1] * scale + origin.y)
        for (let x = 1; x < width; ++x) {
            d += " L" + x + " " + (sum[x] * scale + origin.y);;
        }
        d += "L" + width + " " + origin.y;
        document.getElementById("superposition-wave-form-path").setAttribute("d", d);
    }

    let pause = true;
    const elZone = document.getElementById("standing-wave-zone");
    elZone.addEventListener("mouseleave", () => {
        pause = true;
    });
    elZone.addEventListener("mouseenter", () => {
        if (pause) {
            pause = false;
            requestAnimationFrame(cycle);
        }
    });

    function cycle() {
        if (!pause) requestAnimationFrame(cycle);
        draw();
    }
    requestAnimationFrame(cycle); //starts game loop

};
wave();