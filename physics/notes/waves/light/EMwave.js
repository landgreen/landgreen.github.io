(() => {
    const canvas = document.getElementById("EMwave");
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


function EMwave(el) {
    el.onclick = null; //stops the function from running on button click
    el.style.backgroundColor = "#000"
    el.className += " no-shadow";

    const canvas = el
    const ctx = canvas.getContext("2d");
    canvas.height = 400;

    function setupCanvas() {
        canvas.width = window.innerWidth;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 6;
    }
    setupCanvas();
    window.onresize = function () {
        setupCanvas();
    };

    const mouse = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    canvas.addEventListener("mousemove", event => {
        mouse.x = event.offsetX
        mouse.y = event.offsetY
    });
    canvas.addEventListener("mouseleave", () => {
        physics.pause = true;
    });
    canvas.addEventListener("mouseenter", () => {
        physics.pause = false;
        if (!physics.pause) requestAnimationFrame(cycle);
    });


    const physics = {
        cycle: 0, //keeps track of cycle
        pause: false, // pauses the simulation
        speed: Math.round(window.innerWidth / 250), //speed of waves and max speed of source
        totalNodes: 275, //spawns stars at start
        xOffset: 0.5 * canvas.width,
        yOffset: 0.5 * canvas.height,
    };
    const node = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
    ]

    function pushNode(i, dirX, dirY, array) {
        array.push({
            x: physics.xOffset,
            y: physics.yOffset,
            Vx: dirX,
            Vy: dirY,
            returnCycle: i,
        });
    }

    //initialize data in node
    for (let i = 0; i < physics.totalNodes; i++) {
        pushNode(i, 1, 0, node[0]);
        pushNode(i, -1, 0, node[1]);
        pushNode(i, 0, 1, node[2]);
        pushNode(i, 0, -1, node[3]);
        pushNode(i, 0.7, 0.7, node[4]);
        pushNode(i, -0.7, -0.7, node[5]);
        pushNode(i, 0.7, -0.7, node[6]);
        pushNode(i, -0.7, 0.7, node[7]);
        pushNode(i, 0.92, 0.38, node[8]);
        pushNode(i, -0.92, 0.38, node[9]);
        pushNode(i, 0.92, -0.38, node[10]);
        pushNode(i, -0.92, -0.38, node[11]);
        pushNode(i, 0.38, 0.92, node[12]);
        pushNode(i, -0.38, 0.92, node[13]);
        pushNode(i, 0.38, -0.92, node[14]);
        pushNode(i, -0.38, -0.92, node[15]);
    }


    function draw() {
        function fieldLineLoop(node) { //lines
            i = node.length;
            ctx.moveTo(node[i - 1].x, node[i - 1].y);
            while (i--) {
                ctx.lineTo(node[i].x, node[i].y);
                node[i].x += node[i].Vx * physics.speed; //move node
                node[i].y += node[i].Vy * physics.speed; //move node
                if (node[i].returnCycle < physics.cycle) { //check for return
                    node.splice(i, 1);
                    pushNode(physics.cycle + physics.totalNodes - 1, node[i].Vx, node[i].Vy, node);
                }
            }
        }

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
            fieldLineLoop(node[i]);
        }
        ctx.stroke();
    }



    function smoothMouseWave() {
        //gravitate towards mouse
        const dir = Math.atan2(physics.yOffset - mouse.y, physics.xOffset - mouse.x)
        const dist = Math.sqrt((physics.xOffset - mouse.x) * (physics.xOffset - mouse.x) + (physics.yOffset - mouse.y) * (physics.yOffset - mouse.y));
        if (dist > physics.speed) {
            let speed;
            if ((dist) < 100) {
                speed = dist / 100 * physics.speed;
            } else {
                speed = physics.speed;
            }
            physics.xOffset -= speed * Math.cos(dir);
            physics.yOffset -= speed * Math.sin(dir);
        }
    }

    function cycle() {
        if (!physics.pause) window.requestAnimationFrame(cycle);
        physics.cycle++;
        smoothMouseWave();
        draw();
    };
    window.requestAnimationFrame(cycle);
}