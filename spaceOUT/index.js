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
document.onkeydown = event => {
    keys[event.keyCode] = true;
    console.log(event.keyCode);
}
document.onkeyup = event => {
    keys[event.keyCode] = false;
}

const p1 = {
    color: [255, 255, 255],
    position: {
        x: 100,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    }
}

const p2 = {
    color: [0, 0, 0],
    position: {
        x: 300,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    }
}



function draw() {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 0; // red
        data[i + 1] = 0; // green
        data[i + 2] = 0; // blue
        data[i + 3] = 255; // alpha
    }
    //add player 1 position
    const imgIndex = 4 * (Math.floor(who[i].position.x) + Math.floor(who[i].position.y) * canvasWidth);
    data[imgIndex] = 0; // red
    data[imgIndex + 1] = 0; // green
    data[imgIndex + 2] = 0; // blue
    data[imgIndex + 3] = 255; // alpha

    ctx.putImageData(imageData, 0, 0);
}


//___________________animation loop ___________________
function cycle() {
    draw();

    requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);