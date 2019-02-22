const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

function resizeCanvas() {
    //fit canvas to window and fix issues with canvas blur on zoom
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const scale = window.devicePixelRatio;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    ctx.scale(scale, scale);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


//___________________get keyboard input___________________
// const keys = [];
// document.addEventListener("keydown", event => {
//     keys[event.keyCode] = true;
//     // console.log(event.keyCode);
// });
// document.addEventListener("keyup", event => {
//     keys[event.keyCode] = false;
// });


// const p1 = {
//     color: [255, 255, 255],
//     position: {
//         x: 100,
//         y: 100
//     },
//     velocity: {
//         x: 0,
//         y: 0
//     }
// }

// const p2 = {
//     color: [0, 0, 0],
//     position: {
//         x: 300,
//         y: 100
//     },
//     velocity: {
//         x: 0,
//         y: 0
//     }
// }


var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;


function setColor() {
    for (var i = 0; i < data.length; i += 4) {
        const color = Math.random() > 0.5 ? 255 : 0;
        data[i] = color; // red
        data[i + 1] = color; // green
        data[i + 2] = color; // blue
        data[i + 3] = 255; // alpha
    }
}

function drawPlayers() {
    //add player 1 position
    const imgIndex1 = 4 * (Math.floor(p1.position.x) + Math.floor(p1.position.y) * canvas.width);
    data[imgIndex1] = 0; // red
    data[imgIndex1 + 1] = 0; // green
    data[imgIndex1 + 2] = 0; // blue

    //add player 2 position
    const imgIndex2 = 4 * (Math.floor(p2.position.x) + Math.floor(p2.position.y) * canvas.width);
    data[imgIndex2] = 255; // red
    data[imgIndex2 + 1] = 255; // green
    data[imgIndex2 + 2] = 255; // blue
}

function isPixelOn(x, y) {
    return data[4 * (x + y * canvas.width)]
}

function nightDay() { // B3678/S34678
    for (var i = 0; i < data.length; i += 4) {
        const index = i / 4
        const x = (index % canvas.width)
        const y = Math.floor(index / canvas.width)
        let neighbors = 0; //count neighbors
        if (x !== 0 && x !== canvas.width && y !== 0 && y !== canvas.height) { //skip edges
            if (isPixelOn(x + 1, y + 1)) neighbors++
            if (isPixelOn(x - 1, y + 1)) neighbors++
            if (isPixelOn(x, y + 1)) neighbors++
            if (isPixelOn(x + 1, y)) neighbors++
            if (isPixelOn(x - 1, y)) neighbors++
            if (isPixelOn(x + 1, y - 1)) neighbors++
            if (isPixelOn(x - 1, y - 1)) neighbors++
            if (isPixelOn(x, y - 1)) neighbors++
            // if (x === 10 && y === 10) console.log(neighbors)

            if (data[i] === 0) { //births if dead
                if (neighbors === 3 || neighbors === 6 || neighbors === 7 || neighbors === 8) {
                    data[i] = 255; // red
                    data[i + 1] = 255; // green
                    data[i + 2] = 255; // blue
                }
            }

            if (data[i] === 255) { //death if alive
                if (neighbors !== 3 && neighbors !== 4 && neighbors !== 6 && neighbors !== 7 && neighbors !== 8) {
                    data[i] = 0; // red
                    data[i + 1] = 0; // green
                    data[i + 2] = 0; // blue
                }
            }

        }
    }
}


//___________________animation loop ___________________
setColor();


function cycle() {
    // drawPlayers();
    nightDay();
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);