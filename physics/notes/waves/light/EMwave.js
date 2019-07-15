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
    el.style.cursor = "none";
    el.className += " no-shadow";

    const canvas = el
    const ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight * 2 / 3

    function setupCanvas() {
        canvas.width = window.innerWidth;
        ctx.lineJoin = "miter";
        ctx.miterLimit = 4;
    }
    setupCanvas();

    window.addEventListener("resize", () => {
        setupCanvas();
    });

    canvas.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
    });
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

    canvas.addEventListener("click", () => {
        if (drawField === drawCircles) {
            drawField = drawLines;
            el.style.backgroundColor = "#000"
        } else {
            drawField = drawCircles;
            el.style.backgroundColor = "#fff"
        }
    });


    const physics = {
        cycle: 0, //keeps track of cycle
        pause: false, // pauses the simulation
        speed: 2 + Math.round(window.innerWidth / 300), //speed of waves and max speed of source
        totalNodes: 225, //spawns stars at start
        xOffset: 0.5 * canvas.width,
        yOffset: 0.5 * canvas.height,
        distance: 0,
        drawSpeed: {
            x: 0,
            y: 0
        }
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
        pushNode(i, 0.92, 0.38, node[1]);
        pushNode(i, 0.7, 0.7, node[2]);
        pushNode(i, 0.38, 0.92, node[3]);
        pushNode(i, 0, 1, node[4]);
        pushNode(i, -0.38, 0.92, node[5]);
        pushNode(i, -0.7, 0.7, node[6]);
        pushNode(i, -0.92, 0.38, node[7]);
        pushNode(i, -1, 0, node[8]);
        pushNode(i, -0.92, -0.38, node[9]);
        pushNode(i, -0.7, -0.7, node[10]);
        pushNode(i, -0.38, -0.92, node[11]);
        pushNode(i, 0, -1, node[12]);
        pushNode(i, 0.38, -0.92, node[13]);
        pushNode(i, 0.7, -0.7, node[14]);
        pushNode(i, 0.92, -0.38, node[15]);
    }

    function drawLines() {
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
        //draw 16 legs
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
            fieldLineLoop(node[i]);
        }
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 6;
        ctx.stroke();
    }

    function drawCircles() {
        function fieldLineLoop(node) { //lines
            i = node.length;
            while (i--) {
                node[i].x += node[i].Vx * physics.speed; //move node
                node[i].y += node[i].Vy * physics.speed; //move node
                if (node[i].returnCycle < physics.cycle) { //check for return
                    node.splice(i, 1);
                    pushNode(physics.cycle + physics.totalNodes - 1, node[i].Vx, node[i].Vy, node);
                }
            }
        }
        for (let i = 0; i < 16; i++) {
            fieldLineLoop(node[i]);
        }

        const len = node[0].length - 1
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.beginPath();
        for (let j = 0; j < len; j++) {
            if (!(j % 2)) {
                ctx.moveTo(node[15][j].x, node[15][j].y)
                for (let i = 0; i < 16; i++) {
                    ctx.lineTo(node[i][j].x, node[i][j].y)
                }
            }
        }
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    drawField = drawLines;

    function draw() {

        drawField();
        // const lastIndex = node[0].length - 1
        // const x = node[0][lastIndex].x + physics.drawSpeed.x * 3
        // const y = node[0][lastIndex].y + physics.drawSpeed.y * 3
        // const scale = 1;
        // const radius = 1.2 * scale
        // //mouth
        // ctx.beginPath();
        // ctx.moveTo(x - 5 * scale, y + 3 * scale)
        // ctx.lineTo(x + 5 * scale, y + 3 * scale)
        // ctx.strokeStyle = "#000";
        // ctx.lineWidth = 1 * scale;
        // ctx.stroke();

        // ctx.beginPath();
        // //left eye
        // ctx.arc(x - 2 * scale, y - 2 * scale, radius, 0, 2 * Math.PI);
        // //right eye
        // ctx.arc(x + 2 * scale, y - 2 * scale, radius, 0, 2 * Math.PI);
        // //left fang
        // ctx.moveTo(x - 3 * scale, y + 3 * scale)
        // ctx.lineTo(x - 2 * scale, y + 5.5 * scale)
        // ctx.lineTo(x - 1 * scale, y + 3 * scale)
        // //right fang
        // ctx.moveTo(x + 3 * scale, y + 3 * scale)
        // ctx.lineTo(x + 2 * scale, y + 5.5 * scale)
        // ctx.lineTo(x + 1 * scale, y + 3 * scale)
        // ctx.fillStyle = "#000";
        // ctx.fill();

        //draw mouse
        if (physics.distance > 17) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#f00";
            ctx.fill();
        }
    }

    function smoothMouseWave() {
        //gravitate towards mouse
        physics.distance = Math.sqrt((physics.xOffset - mouse.x) * (physics.xOffset - mouse.x) + (physics.yOffset - mouse.y) * (physics.yOffset - mouse.y));
        if (physics.distance > physics.speed) {
            const range = canvas.width * 0.04
            let speed;
            if ((physics.distance) < range) {
                speed = physics.distance / range * physics.speed * 0.8;
            } else {
                speed = physics.speed * 0.8;
            }
            const dir = Math.atan2(physics.yOffset - mouse.y, physics.xOffset - mouse.x)
            physics.xOffset -= speed * Math.cos(dir);
            physics.yOffset -= speed * Math.sin(dir);
            physics.drawSpeed.x = speed * Math.cos(dir)
            physics.drawSpeed.y = speed * Math.sin(dir)
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