(() => {
    const canvas = document.getElementById("newtons-cradle");
    const ctx = canvas.getContext("2d");
    const WIDTH = 590;
    let HEIGHT = 100;

    function intro() {
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.lineWidth = 1;
        const cx = WIDTH / 2;
        const cy = HEIGHT / 2;
        let scale
        if (WIDTH > HEIGHT) {
            scale = HEIGHT / 10 + 7
        } else {
            scale = WIDTH / 10 + 7
        }
        ctx.strokeStyle = "#012";
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
    }
    window.addEventListener("load", intro);
    canvas.addEventListener("click", runSim);

    function runSim() {
        canvas.removeEventListener("click", runSim);
        HEIGHT = 320;

        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Body = Matter.Body,
            Composites = Matter.Composites,
            MouseConstraint = Matter.MouseConstraint,
            Mouse = Matter.Mouse,
            World = Matter.World;

        // create engine
        var engine = Engine.create(),
            world = engine.world;

        // create renderer
        var render = Render.create({
            canvas: document.getElementById("newtons-cradle"),
            engine: engine,
            options: {
                wireframes: false,
                width: WIDTH,
                height: HEIGHT,
                showVelocity: false,
                background: '#fff'
            }
        });

        Render.run(render);

        // create runner
        var runner = Runner.create();
        Runner.run(runner, engine);

        // add bodies
        var cradle = Composites.newtonsCradle(180, 70, 5, 30, 200);
        World.add(world, cradle);
        Body.translate(cradle.bodies[0], {
            x: -180,
            y: -100
        });
        cradle.bodies[0].render.fillStyle = "#49f"
        cradle.bodies[1].render.fillStyle = "#f46"
        cradle.bodies[2].render.fillStyle = "#fa0"
        cradle.bodies[3].render.fillStyle = "#3bb"
        cradle.bodies[4].render.fillStyle = "#a8f"

        for (let i = 0; i < 5; i++) {
            cradle.constraints[i].render.strokeStyle = "#222"
            // cradle.bodies[i].render.fillStyle = randomColor({
            //     luminosity: "light",
            //     hue: "blue"
            // })
            // cradle.bodies[i].render.fillStyle = "#39f"
            // cradle.bodies[i].render.strokeStyle = "#fff"
            // cradle.bodies[i].render.lineWidth = 2
            // cradle.bodies[i].frictionAir = 0
        }
        // console.log(cradle.constraints[0].render.strokeStyle)
        // console.log(cradle.bodies)


        // cradle = Composites.newtonsCradle(280, 380, 7, 20, 140);
        // World.add(world, cradle);
        // Body.translate(cradle.bodies[0], {
        //     x: -140,
        //     y: -100
        // });

        // add mouse control
        var mouse = Mouse.create(render.canvas),
            mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false
                    }
                }
            });

        World.add(world, mouseConstraint);
        render.mouse = mouse; // keep the mouse in sync with rendering

        // fit the render viewport to the scene
        Render.lookAt(render, {
            min: {
                x: 0,
                y: 0
            },
            max: {
                x: WIDTH,
                y: HEIGHT
            }
        });
    };
})();