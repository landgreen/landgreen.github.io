(() => {
    const canvas = document.getElementById("standing-wave-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = document.getElementsByTagName("article")[0].clientWidth;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let scale
    if (canvas.width > canvas.height) {
        scale = canvas.height / 10 + 7
    } else {
        scale = canvas.width / 10 + 7
    }
    ctx.strokeStyle = "#000";
    ctx.beginPath()
    ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
    ctx.moveTo(cx - scale * 0.8, cy - scale);
    ctx.lineTo(cx + scale * 1.2, cy);
    ctx.lineTo(cx - scale * 0.8, cy + scale);
    ctx.lineTo(cx - scale * 0.8, cy - scale);
    ctx.stroke();
    ctx.lineJoin = "miter"
    ctx.lineCap = "butt"
    ctx.lineWidth = 1;
})()

function standing(el) {
    el.onclick = null; //stops the function from running on button click
    const canvas = el
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2
    const width = 600;
    canvas.width = width
    const height = 400;
    canvas.height = height
    const origin = {
        x: 0,
        y: height / 2
    }
    let wavelength = 0.5;
    document.getElementById("wavelength").value = wavelength;
    document.getElementById("wavelength-slider").value = wavelength;
    let phase = 0

    function drawWave() {
        phase += 0.05
        const distance = 100
        const amplitude = 150
        const horizontalCenter = width / 2
        const verticalCenter = height / 2
        let sum = []; //array that stores the superposition data from reflected and incident waves
        for (let i = 0; i < 628; i++) {
            sum[i] = {
                x: 0,
                y: 0
            }
        }


        ctx.globalAlpha = 0.1
        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength + phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + horizontalCenter, y + verticalCenter)
            const index = Math.floor((i * 100) % 628)
            sum[index].x += x
            sum[index].y += y

        }
        ctx.strokeStyle = "#f05"
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength - phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + horizontalCenter, y + verticalCenter)
            const index = Math.floor((i * 100) % 628)
            sum[index].x += x
            sum[index].y += y
        }
        ctx.strokeStyle = "#0ac"
        ctx.stroke();

        ctx.beginPath();
        const scale = 25
        for (let i = 0, len = sum.length; i < len; i++) {
            ctx.lineTo(horizontalCenter + sum[i].x / distance * scale, verticalCenter + sum[i].y / distance * scale)
        }
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = "#000"
        ctx.stroke();
        // console.log(sum)
    }


    document.getElementById("wavelength").addEventListener("input", () => {
        wavelength = Number(document.getElementById("wavelength").value)
        document.getElementById("wavelength-slider").value = wavelength
    }, false);

    document.getElementById("wavelength-slider").addEventListener("input", () => {
        wavelength = Number(document.getElementById("wavelength-slider").value)
        document.getElementById("wavelength").value = wavelength
    }, false);

    let pause = false;
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
    time = 0

    function cycle() {
        time++
        if (!pause) requestAnimationFrame(cycle);
        ctx.clearRect(0, 0, width, height)
        drawWave();
    }
    requestAnimationFrame(cycle); //starts game loop
}




// function standing(el) {
//     el.onclick = null; //stops the function from running on button click
//     const canvas = el
//     const ctx = canvas.getContext("2d");
//     ctx.lineWidth = 2
//     const width = 600;
//     canvas.width = width
//     const height = 400;
//     canvas.height = height
//     const origin = {
//         x: 0,
//         y: height / 2
//     }
//     let search = false; //how much the wavelength changes each cycle
//     let target = 600;
//     let searchStep = 1;
//     const velocity = 100;
//     let reflections = 64;
//     const totalPaths = 18; //how many paths are drawn in the SVG, the rest are just calculated for the superposition path
//     let dampening = -1; //lower values simulate energy loss, but don't make the standing waves as distinct
//     let wavelength = 6 * 100;
//     document.getElementById("wavelength").value = wavelength / 100;
//     let phase = 100;
//     phase = phase % wavelength; //makes the switch smoother



//     function drawGrid() {
//         const gridSize = 100
//         ctx.beginPath();
//         for (let i = 0; i < width; i += gridSize) {
//             ctx.moveTo(i, 0);
//             ctx.lineTo(i, height);
//         }
//         for (let i = 0; i < height; i += gridSize) {
//             ctx.moveTo(0, i);
//             ctx.lineTo(width, i);
//         }
//         ctx.strokeStyle = "#ccc"
//         ctx.stroke()
//         //center line
//         ctx.beginPath();
//         ctx.moveTo(0, height / 2);
//         ctx.lineTo(width, height / 2);
//         ctx.strokeStyle = "#333"
//         ctx.stroke();
//     }

//     function drawWave() {
//         phase += velocity / 60; //move the waves forward in time
//         const frequency = 2 * Math.PI / wavelength
//         let wave = 0
//         let amplitude = 50
//         let offset = 0
//         let sum = []; //array that stores the superposition data from reflected and incident waves
//         sum[0] = Math.sin(frequency * phase) * amplitude //populate sum array
//         for (let i = 1; i < width; i++) {
//             sum[i] = 1
//         }

//         for (let j = 0; j < reflections; j += 2) {
//             //reflected wave (starts on left)
//             amplitude *= dampening
//             offset += width

//             ctx.lineDashOffset = j * 7
//             ctx.setLineDash([5, 5]);
//             ctx.globalAlpha = 0.6

//             wave = amplitude * Math.sin(frequency * (offset - phase))
//             sum[0] += wave //adding wave contribution to superposition wave
//             ctx.beginPath();
//             for (let x = 0; x < width; x++) {
//                 wave = Math.sin(frequency * (x + offset - phase)) * amplitude
//                 sum[x] += wave //adding wave contribution to superposition wave
//                 ctx.lineTo(x, wave + origin.y)
//             }
//             ctx.strokeStyle = "#f05"
//             ctx.stroke();

//             //reflected wave (starts on right)
//             amplitude *= dampening
//             offset += width
//             wave = amplitude * Math.sin(frequency * (offset - phase))
//             ctx.beginPath();
//             for (let i = 0, x = width; i < width; i++, x++) {
//                 wave = Math.sin(frequency * (x + offset - width - phase)) * amplitude
//                 sum[width - i] += wave; //adding wave contribution to superposition wave
//                 ctx.lineTo(width - i, wave + origin.y)
//             }
//             ctx.strokeStyle = "#0ac"
//             ctx.stroke();
//         }

//         //draw interference patter superposition
//         const scale = 3.5 / reflections
//         ctx.beginPath()
//         ctx.moveTo(1, origin.y)
//         for (let x = 1; x < width; ++x) {
//             ctx.lineTo(x, sum[x] * scale + origin.y)
//         }
//         ctx.strokeStyle = "#000"
//         ctx.setLineDash([0, 0]);
//         ctx.globalAlpha = 1
//         ctx.stroke()
//     }


//     document.getElementById("wavelength").addEventListener("input", () => {
//         wavelength = Math.max(Number(document.getElementById("wavelength").value) * 100, 1);
//         document.getElementById("wavelength-slider").value = wavelength / 100
//         phase = phase % wavelength; //makes the switch smoother
//     }, false);

//     document.getElementById("wavelength-slider").addEventListener("input", () => {
//         wavelength = Math.max(Number(document.getElementById("wavelength-slider").value) * 100, 1);
//         document.getElementById("wavelength").value = wavelength / 100
//         phase = phase % wavelength; //makes the switch smoother
//     }, false);

//     let pause = false;
//     const elZone = document.getElementById("standing-wave-zone");
//     elZone.addEventListener("mouseleave", () => {
//         pause = true;
//     });
//     elZone.addEventListener("mouseenter", () => {
//         if (pause) {
//             pause = false;
//             requestAnimationFrame(cycle);
//         }
//     });
//     time = 0

//     function cycle() {
//         time++
//         if (!pause) requestAnimationFrame(cycle);
//         ctx.clearRect(0, 0, width, height)
//         drawGrid();
//         drawWave();
//     }
//     requestAnimationFrame(cycle); //starts game loop
// }






// const wave = function () {
//     const origin = { //origin of x,y axes
//         x: 0,
//         y: 200
//     };
//     let search = false; //how much the wavelength changes each cycle
//     let target = 600;
//     let searchStep = 1;
//     const velocity = 400;
//     let reflections = 64;
//     const totalPaths = 18; //how many paths are drawn in the SVG, the rest are just calculated for the superposition path
//     let dampening = -1; //lower values simulate energy loss, but don't make the standing waves as distinct
//     let wavelength = 6 * 100;
//     document.getElementById("wavelength").value = wavelength / 100;


//     let phase = 100;
//     phase = phase % wavelength; //makes the switch smoother

//     const width = Math.floor((document.body.clientWidth - 20) / 100) * 100 //scale width to even multiples of 100 pixels plus ten for borders
//     document.getElementById("standing-wave").setAttribute("width", width);
//     document.getElementById("standing-wave-border").setAttribute("d", "M0 0 v400 M" + width + " 0 v400");
//     //update answer to question based on width
//     let out = "λ = "
//     let standingWavelengths = []
//     for (let i = 1; i < 50; i++) {
//         standingWavelengths.push(Math.round(20 * width / i) / 10)
//         out += Math.round(2 * width / 100 / i * 1000) / 1000 + ", &nbsp;"
//         if (standingWavelengths[standingWavelengths.length - 1] < 80) break
//     }
//     document.getElementById("list-standing").innerHTML = out + "..."

//     document.getElementById("wave-search").addEventListener("click", () => {
//         if (search) {
//             search = false;
//         } else {
//             search = true;

//             // identify the next target
//             const totalSteps = 120
//             for (let i = standingWavelengths.length; i > -1; i--) {
//                 if (standingWavelengths[i] > wavelength) {
//                     target = standingWavelengths[i]
//                     searchStep = (target - wavelength) / totalSteps
//                     return;
//                 }
//             }
//             //in case it doesn't find anything
//             wavelength = standingWavelengths[standingWavelengths.length - 1]
//             target = standingWavelengths[standingWavelengths.length - 2];
//             searchStep = (target - wavelength) / totalSteps;
//         }
//     }, false);


//     document.getElementById("wavelength").addEventListener("input", () => {
//         wavelength = Math.max(Number(document.getElementById("wavelength").value) * 100, 1);
//         document.getElementById("wavelength-slider").value = wavelength / 100
//         phase = phase % wavelength; //makes the switch smoother
//     }, false);

//     document.getElementById("wavelength-slider").addEventListener("input", () => {
//         wavelength = Math.max(Number(document.getElementById("wavelength-slider").value) * 100, 1);
//         document.getElementById("wavelength").value = wavelength / 100
//         phase = phase % wavelength; //makes the switch smoother
//     }, false);

//     // document.getElementById("reflections").addEventListener("input", () => {
//     //     reflections = Math.max(16, Math.floor(Number(document.getElementById("reflections").value)))
//     //     document.getElementById("reflections-slider").value = reflections
//     // }, false);

//     // document.getElementById("reflections-slider").addEventListener("input", () => {
//     //     reflections = Math.max(16, Math.floor(Number(document.getElementById("reflections-slider").value)))
//     //     document.getElementById("reflections").value = reflections
//     // }, false);

//     // document.getElementById("dampening").addEventListener("input", () => {
//     //     const value = Number(document.getElementById("dampening").value)
//     //     dampening = -Math.min(1, Math.max(0, value))
//     //     document.getElementById("dampening-slider").value = -dampening
//     // }, false);

//     // document.getElementById("dampening-slider").addEventListener("input", () => {
//     //     const value = Number(document.getElementById("dampening-slider").value)
//     //     dampening = -Math.min(1, Math.max(0, value))
//     //     document.getElementById("dampening").value = -dampening
//     // }, false);

//     function draw() {
//         // document.getElementById("incident-wave-form-path").setAttribute("stroke-dashoffset", -phase * 2);  
//         phase += velocity / 60; //move the waves forward in time
//         const frequency = 2 * Math.PI / wavelength
//         let wave, d
//         let amplitude = 50
//         let offset = 0
//         let sum = []; //array that stores the superposition data from reflected and incident waves
//         sum[0] = Math.sin(frequency * phase) * amplitude //populate sum array
//         for (let i = 1; i < width; i++) {
//             sum[i] = 1
//         }

//         for (let j = 0; j < reflections; j += 2) {
//             //reflected wave (starts on left)
//             const draw = (j < totalPaths) ? true : false;
//             amplitude *= dampening
//             offset += width

//             wave = amplitude * Math.sin(frequency * (offset - phase))
//             sum[0] += wave //adding wave contribution to superposition wave
//             if (draw) d = "M-1 " + (wave + origin.y);;
//             for (let x = 0; x < width; x++) {
//                 wave = Math.sin(frequency * (x + offset - phase)) * amplitude
//                 sum[x] += wave //adding wave contribution to superposition wave
//                 if (draw) d += " L" + x + " " + (wave + origin.y);
//             }
//             if (draw) document.getElementById("wave-form-path-" + j).setAttribute("d", d);

//             //reflected wave (starts on right)
//             amplitude *= dampening
//             offset += width

//             wave = amplitude * Math.sin(frequency * (offset - phase))
//             if (draw) d = "M" + width + " " + (wave + origin.y);;
//             for (let i = 0, x = width; i < width; i++, x++) {
//                 wave = Math.sin(frequency * (x + offset - width - phase)) * amplitude
//                 sum[width - i] += wave; //adding wave contribution to superposition wave
//                 if (draw) d += " L" + (width - i) + " " + (wave + origin.y);;
//             }
//             if (draw) document.getElementById("wave-form-path-" + (j + 1)).setAttribute("d", d);
//         }

//         //draw interference patter superposition
//         const scale = 3.9 / reflections
//         d = "M 1 " + origin.y + " L1 " + (sum[1] * scale + origin.y)
//         for (let x = 1; x < width; ++x) {
//             d += " L" + x + " " + (sum[x] * scale + origin.y);;
//         }
//         d += "L" + width + " " + origin.y;
//         document.getElementById("superposition-wave-form-path").setAttribute("d", d);
//     }

//     function waveSearch() {
//         if (search) {
//             wavelength += searchStep
//             if (wavelength > target) {
//                 wavelength = target
//                 search = false;
//             }
//             document.getElementById("wavelength-slider").value = wavelength / 100
//             document.getElementById("wavelength").value = wavelength / 100
//             phase = phase % wavelength; //makes the switch smoother
//         }
//     }


//     let pause = true;
//     const elZone = document.getElementById("standing-wave-zone");
//     elZone.addEventListener("mouseleave", () => {
//         pause = true;
//     });
//     elZone.addEventListener("mouseenter", () => {
//         if (pause) {
//             pause = false;
//             requestAnimationFrame(cycle);
//         }
//     });
//     time = 0

//     function cycle() {
//         time++
//         if (!pause) requestAnimationFrame(cycle);
//         draw();
//         waveSearch();
//     }
//     requestAnimationFrame(cycle); //starts game loop

// };
// wave();