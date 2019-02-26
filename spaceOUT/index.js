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
const keys = [];
document.addEventListener("keydown", event => {
    keys[event.keyCode] = true;
    console.log(event.keyCode);
});
document.addEventListener("keyup", event => {
    keys[event.keyCode] = false;
});

const p1 = {
    color: [255, 150, 60], // [R,G,B]
    position: {
        x: canvas.width * 0.8,
        y: canvas.height / 2
    },
    velocity: {
        x: -1,
        y: 0
    }
}

const p2 = {
    color: [0, 255, 255], // [R,G,B]
    position: {
        x: canvas.width * 0.2,
        y: canvas.height / 2
    },
    velocity: {
        x: 1,
        y: 0
    }
}


var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;

function setColor() {
    for (var i = 0; i < data.length; i += 4) {
        // const color = Math.random() > 0.5 ? 255 : 0;
        const color = 0
        data[i] = color; // red
        data[i + 1] = color; // green
        data[i + 2] = color; // blue
        data[i + 3] = 255; // alpha
    }
}

function turn() {
    function rotate(v, angle) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        }
    }
    const turnRate = 0.05

    if (keys[37]) {
        const turn = rotate(p1.velocity, -turnRate)
        p1.velocity.x = turn.x
        p1.velocity.y = turn.y
    } else if (keys[39]) {
        const turn = rotate(p1.velocity, turnRate)
        p1.velocity.x = turn.x
        p1.velocity.y = turn.y
    }

    if (keys[65]) {
        const turn = rotate(p2.velocity, -turnRate)
        p2.velocity.x = turn.x
        p2.velocity.y = turn.y
    } else if (keys[68]) {
        const turn = rotate(p2.velocity, turnRate)
        p2.velocity.x = turn.x
        p2.velocity.y = turn.y
    }
}

function move() {
    p1.position.x += p1.velocity.x
    p1.position.y += p1.velocity.y

    p2.position.x += p2.velocity.x
    p2.position.y += p2.velocity.y
}

function edgeDie() {
    if (p1.position.x < 0 || p1.position.x > canvas.width || p1.position.y < 0 || p1.position.y > canvas.height) {
        console.log("p1 crash wall")
    }
    if (p2.position.x < 0 || p2.position.x > canvas.width || p2.position.y < 0 || p2.position.y > canvas.height) {
        console.log("p2 crash wall")
    }
}
// function edgeWrap() {
//     if (p1.position.x < 0) {
//         p1.position.x = canvas.width
//     } else if (p1.position.x > canvas.width) {
//         p1.position.x = 0
//     }
//     if (p1.position.y < 0) {
//         p1.position.y = canvas.height
//     } else if (p1.position.y > canvas.height) {
//         p1.position.y = 0
//     }

//     if (p2.position.x < 0) {
//         p2.position.x = canvas.width
//     } else if (p2.position.x > canvas.width) {
//         p2.position.x = 0
//     }
//     if (p2.position.y < 0) {
//         p2.position.y = canvas.height
//     } else if (p2.position.y > canvas.height) {
//         p2.position.y = 0
//     }
// }

function collision() { //get color of tile player in about to hit
    let index

    index = 4 * (Math.floor(p1.position.x) + Math.floor(p1.position.y) * canvas.width)
    if (data[index] === p2.color[0] && data[index + 1] === p2.color[1] && data[index + 2] === p2.color[2]) {
        console.log("p1 crash")
    }

    index = 4 * (Math.floor(p2.position.x) + Math.floor(p2.position.y) * canvas.width)
    if (data[index] === p1.color[0] && data[index + 1] === p1.color[1] && data[index + 2] === p1.color[2]) {
        console.log("p2 crash")
    }
}

function drawPlayers() {
    //add player 1 position
    const imgIndex1 = 4 * (Math.floor(p1.position.x) + Math.floor(p1.position.y) * canvas.width);
    data[imgIndex1] = p1.color[0]; // red
    data[imgIndex1 + 1] = p1.color[1]; // green
    data[imgIndex1 + 2] = p1.color[2]; // blue

    //add player 2 position
    const imgIndex2 = 4 * (Math.floor(p2.position.x) + Math.floor(p2.position.y) * canvas.width);
    data[imgIndex2] = p2.color[0]; // red
    data[imgIndex2 + 1] = p2.color[1]; // green
    data[imgIndex2 + 2] = p2.color[2]; // blue
}

function isPixelOn(x, y) {
    return data[4 * (x + y * canvas.width)]
}

function fadeAway() {
    for (var i = 0; i < data.length; i += 4) {
        const index = i
        if (data[index] > 0) data[index]--
        if (data[index + 1] > 0) data[index + 1]--
        if (data[index + 2] > 0) data[index + 2]--
    }
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
    turn()
    move()
    edgeDie()
    collision();
    drawPlayers();
    // nightDay();
    // if (keys[32]) fadeAway()
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);