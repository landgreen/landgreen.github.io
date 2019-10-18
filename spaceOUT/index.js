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
    // console.log(event.keyCode);
});
document.addEventListener("keyup", event => {
    keys[event.keyCode] = false;
});

const p1 = {
    score: 0,
    emoji: "🍊",
    color: [255, 150, 60], // [R,G,B]
    position: {
        x: canvas.width / 2,
        y: canvas.height / 2
    },
    velocity: {
        x: -0.5,
        y: 0
    }
}

const p2 = {
    score: 0,
    emoji: "🐳",
    color: [0, 235, 255], // [R,G,B]
    position: {
        x: canvas.width / 2,
        y: canvas.height / 2
    },
    velocity: {
        x: 0.5,
        y: 0
    }
}


var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;

function setBaseColor(color = 0) {
    for (var i = 0; i < data.length; i += 4) {
        //Math.random() > 0.5 ? 255 : 0;
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
    const turnRate = 0.025

    if (keys[37]) {
        const turn = rotate(p1.velocity, -turnRate)
        p1.velocity.x = turn.x
        p1.velocity.y = turn.y
    }
    // else if (keys[39]) {
    //     const turn = rotate(p1.velocity, turnRate)
    //     p1.velocity.x = turn.x
    //     p1.velocity.y = turn.y
    // }

    if (keys[65]) {
        const turn = rotate(p2.velocity, -turnRate)
        p2.velocity.x = turn.x
        p2.velocity.y = turn.y
    }
    // else if (keys[68]) {
    //     const turn = rotate(p2.velocity, turnRate)
    //     p2.velocity.x = turn.x
    //     p2.velocity.y = turn.y
    // }
}

function move() {
    p1.position.x += p1.velocity.x
    p1.position.y += p1.velocity.y

    p2.position.x += p2.velocity.x
    p2.position.y += p2.velocity.y
}



function edgeWrap() {
    if (p1.position.x < 0) {
        p1.position.x = canvas.width
    } else if (p1.position.x > canvas.width) {
        p1.position.x = 0
    }
    if (p1.position.y < 0) {
        p1.position.y = canvas.height
    } else if (p1.position.y > canvas.height) {
        p1.position.y = 0
    }

    if (p2.position.x < 0) {
        p2.position.x = canvas.width
    } else if (p2.position.x > canvas.width) {
        p2.position.x = 0
    }
    if (p2.position.y < 0) {
        p2.position.y = canvas.height
    } else if (p2.position.y > canvas.height) {
        p2.position.y = 0
    }
}

function score(who) {
    who.score++
    document.title = `​​\u205f ​​\u205f ​​\u205f ​​${p1.emoji}${p1.score} ​​​​\u205f ​​\u205f ​​\u205f ${p2.emoji}${p2.score}`
}


function collision() { //get color of tile player in about to hit
    let index

    //player 1 crash
    index = 4 * (Math.floor(p1.position.x + 2 * p1.velocity.x) + Math.floor(p1.position.y + 2 * p1.velocity.y) * canvas.width)
    if (data[index] === p2.color[0] && data[index + 1] === p2.color[1] && data[index + 2] === p2.color[2]) {
        score(p2);
        setBaseColor();
    }
    if (data[index] === p1.color[0] && data[index + 1] === p1.color[1] && data[index + 2] === p1.color[2]) {
        score(p2);
        setBaseColor();
    }

    //player 2 crash
    index = 4 * (Math.floor(p2.position.x + 2 * p2.velocity.x) + Math.floor(p2.position.y + 2 * p2.velocity.y) * canvas.width)
    if (data[index] === p1.color[0] && data[index + 1] === p1.color[1] && data[index + 2] === p1.color[2]) {
        score(p1);
        setBaseColor();
    }
    if (data[index] === p2.color[0] && data[index + 1] === p2.color[1] && data[index + 2] === p2.color[2]) {
        score(p1);
        setBaseColor();
    }
}

function addPixel(p, index) {
    data[index] = p.color[0]; // red
    data[index + 1] = p.color[1]; // green
    data[index + 2] = p.color[2]; // blue
}

function drawPlayers() {
    let perpendicular = {
        x: -p1.velocity.y,
        y: p1.velocity.x
    }
    addPixel(p1, 4 * (Math.floor(p1.position.x) + Math.floor(p1.position.y) * canvas.width))
    addPixel(p1, 4 * (Math.floor(p1.position.x + perpendicular.x) + Math.floor(p1.position.y + perpendicular.y) * canvas.width))
    addPixel(p1, 4 * (Math.floor(p1.position.x - perpendicular.x) + Math.floor(p1.position.y - perpendicular.y) * canvas.width))
    addPixel(p1, 4 * (Math.floor(p1.position.x + 2 * perpendicular.x) + Math.floor(p1.position.y + 2 * perpendicular.y) * canvas.width))
    addPixel(p1, 4 * (Math.floor(p1.position.x - 2 * perpendicular.x) + Math.floor(p1.position.y - 2 * perpendicular.y) * canvas.width))

    perpendicular = {
        x: -p2.velocity.y,
        y: p2.velocity.x
    }
    addPixel(p2, 4 * (Math.floor(p2.position.x) + Math.floor(p2.position.y) * canvas.width))
    addPixel(p2, 4 * (Math.floor(p2.position.x + perpendicular.x) + Math.floor(p2.position.y + perpendicular.y) * canvas.width))
    addPixel(p2, 4 * (Math.floor(p2.position.x - perpendicular.x) + Math.floor(p2.position.y - perpendicular.y) * canvas.width))
    addPixel(p2, 4 * (Math.floor(p2.position.x + 2 * perpendicular.x) + Math.floor(p2.position.y + 2 * perpendicular.y) * canvas.width))
    addPixel(p2, 4 * (Math.floor(p2.position.x - 2 * perpendicular.x) + Math.floor(p2.position.y - 2 * perpendicular.y) * canvas.width))
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


//___________________animation loop ___________________
setBaseColor();

function cycle() {
    for (let i = 0; i < 2; i++) {
        // fadeAway()
        turn()
        move()
        edgeWrap()
        collision();
        drawPlayers();
        ctx.putImageData(imageData, 0, 0);
    }
    requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);







// function edgeDie() {
//     if (p1.position.x < 0 || p1.position.x > canvas.width || p1.position.y < 0 || p1.position.y > canvas.height) {
//         console.log("p1 crash wall")
//     }
//     if (p2.position.x < 0 || p2.position.x > canvas.width || p2.position.y < 0 || p2.position.y > canvas.height) {
//         console.log("p2 crash wall")
//     }
// }


// function nightDay() { // B3678/S34678
//     for (var i = 0; i < data.length; i += 4) {
//         const index = i / 4
//         const x = (index % canvas.width)
//         const y = Math.floor(index / canvas.width)
//         let neighbors = 0; //count neighbors
//         if (x !== 0 && x !== canvas.width && y !== 0 && y !== canvas.height) { //skip edges
//             if (isPixelOn(x + 1, y + 1)) neighbors++
//             if (isPixelOn(x - 1, y + 1)) neighbors++
//             if (isPixelOn(x, y + 1)) neighbors++
//             if (isPixelOn(x + 1, y)) neighbors++
//             if (isPixelOn(x - 1, y)) neighbors++
//             if (isPixelOn(x + 1, y - 1)) neighbors++
//             if (isPixelOn(x - 1, y - 1)) neighbors++
//             if (isPixelOn(x, y - 1)) neighbors++
//             // if (x === 10 && y === 10) console.log(neighbors)

//             if (data[i] === 0) { //births if dead
//                 if (neighbors === 3 || neighbors === 6 || neighbors === 7 || neighbors === 8) {
//                     data[i] = 255; // red
//                     data[i + 1] = 255; // green
//                     data[i + 2] = 255; // blue
//                 }
//             }
//             if (data[i] === 255) { //death if alive
//                 if (neighbors !== 3 && neighbors !== 4 && neighbors !== 6 && neighbors !== 7 && neighbors !== 8) {
//                     data[i] = 0; // red
//                     data[i + 1] = 0; // green
//                     data[i + 2] = 0; // blue
//                 }
//             }
//         }
//     }
// }