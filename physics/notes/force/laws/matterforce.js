(() => {
    const canvas = document.getElementById("matter-canvas-1");
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

// challenge1(document.getElementById("matter-canvas-1")) //autorun for development only

function matterForce(el) {
    el.onclick = null; //stops the function from running on button click
    const canvas = el
    const ctx = canvas.getContext("2d");
    const WIDTH = 600;
    const HEIGHT = 400;
    canvas.height = HEIGHT;

    // ctx.font = "20px Arial";
    // canvas.style.cursor = "crosshair";
    // canvas.scrollIntoView({
    //     behavior: "smooth",
    //     block: "center",
    //     inline: "center"
    // });


    // module aliases
    const Engine = Matter.Engine,
        Events = Matter.Events,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create an engine
    const engine = Engine.create();
    let mass = []; // array of balls

    // document.getElementById("clear-1").addEventListener("click", () => {
    //     World.clear(engine.world, true);
    //     mass = [];
    // });

    function fire() {
        spawnMass(WIDTH / 2, HEIGHT, 30);
    }
    fire();

    canvas.addEventListener("click", () => {
        fire();
    });


    function spawnMass(xIn, yIn, radius) {
        let i = mass.length;
        mass.push();
        // mass[i] = Bodies.circle(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, radius * SCALE, {
        mass[i] = Bodies.polygon(xIn, canvas.height - (yIn + radius), 4, radius, {
            // friction: 0.001,
            // frictionStatic: 0,
            frictionAir: 0,
            color: "#f59",
            // restitution: 0.8
        });

        // Matter.Body.setVelocity(mass[i], {
        //     x: (VxIn / 60) * SCALE,
        //     y: (-VyIn / 60) * SCALE
        // });
        Matter.Body.setAngularVelocity(mass[i], (Math.random() - 0.5) * 0.2);
        World.add(engine.world, mass[i]);
    }

    const wallBottom = Bodies.rectangle(WIDTH / 2, HEIGHT - 25, WIDTH * 2, 100, {
        isStatic: true
    });
    World.add(engine.world, [wallBottom]);

    // run the engine
    // Engine.run(engine);

    //adjust gravity to fit simulation
    // engine.world.gravity.scale = 0.000001 * SCALE;
    // engine.world.gravity.y = 9.8;


    let force = []
    Events.on(engine, "collisionActive", function (event) {

        function getForce(who) {
            if (who) {
                // const mag = who.normalImpulse;
                force.push({
                    impulse: {
                        x: who.normalImpulse,
                        y: who.tangentImpulse
                    },
                    position: {
                        x: who.vertex.x,
                        y: who.vertex.y
                    }
                })
            }
        }

        for (let i = 0; i < event.pairs.length; i++) {
            for (let j = 0; j < event.pairs[i].activeContacts.length; j++) {
                getForce(event.pairs[i].activeContacts[i])
            }
        }
        // console.log(event)
        console.log(force)
    });


    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //draw walls
        ctx.beginPath();
        vertices = wallBottom.vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);

        ctx.fillStyle = "#9ab";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        // ctx.stroke();

        //draw balls
        // ctx.fillStyle = "#f60";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        for (let i = 0; i < mass.length; i += 1) {
            ctx.beginPath();
            let vertices = mass[i].vertices;
            // ctx.moveTo(mass[i].position.x, mass[i].position.y);
            for (var j = 0; j < vertices.length; j += 1) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fillStyle = mass[i].color;
            ctx.fill();
            ctx.stroke();
        }

        //draw force
        const SCALE = 300
        for (let i = 0; i < force.length; i++) {
            ctx.beginPath();
            ctx.moveTo(force[i].position.x, force[i].position.y);
            ctx.lineTo(force[i].position.x + force[i].impulse.x * SCALE, force[i].position.y + force[i].impulse.y * SCALE);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        force = []
        // if (position[0]) {
        //     ctx.beginPath();
        //     ctx.moveTo(position[0].x, position[0].y);
        //     ctx.lineTo(position[0].x, position[0].y - impulse[0] * 100);
        //     ctx.lineWidth = 3;
        //     ctx.strokeStyle = "#000";
        //     ctx.stroke();
        // }
    }

    cycle();

    function cycle() {
        Engine.update(engine, 16);
        draw();
        window.requestAnimationFrame(cycle);
    }
}