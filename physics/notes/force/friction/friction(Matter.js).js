MotionSimulation();
function MotionSimulation() {
  //set up canvas
  const canvasID = "canvas";
  const canvas = document.getElementById(canvasID);
  const ctx = canvas.getContext("2d");
  const id = document.getElementById(canvasID).parentNode.id;
  ctx.lineWidth = 1;

  // module aliases
  const Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Composite = Matter.Composite;

  // create an engine
  const engine = Engine.create();
  const scale = 1;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8 * 25;

  let mass = [];
  const massColors = [randomColor(), randomColor(), randomColor(), randomColor()];

  document.getElementById(canvasID).addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 30, 300, 0, 20, 0.04);
    spawnMass(0, 110, 300, 0, 20, 0.02);
    spawnMass(0, 180, 300, 0, 20, 0.01);
    spawnMass(0, 250, 300, 0, 20, 0.005);
  });

  spawnMass(0, 30, 300, 0, 20, 0.04);
  spawnMass(0, 110, 300, 0, 20, 0.02);
  spawnMass(0, 180, 300, 0, 20, 0.01);
  spawnMass(0, 250, 300, 0, 20, 0.005);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius, friction) {
    //spawn mass
    const i = mass.length;
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, canvas.height - (yIn - radius) * scale, 2 * radius * scale, radius * scale, {
      friction: friction,
      frictionStatic: 0.6,
      frictionAir: 0.0,
      restitution: 0.8
    });

    Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.4);
    World.add(engine.world, mass[i]);
  }

  //add some ramps
  World.add(engine.world, [
    Bodies.rectangle(canvas.width * 0.5, 70, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width * 0.5, 140, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width * 0.5, 210, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width * 0.5, 280, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    })
  ]);

  //add walls flush with the edges of the canvas
  const offset = 25;
  World.add(engine.world, [
    Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, {
      //right
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    })
  ]);

  // run the engine
  Engine.run(engine);

  //render
  (function render() {
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    const bodies = Composite.allBodies(engine.world);
    for (let i = 0; i < bodies.length; i += 1) {
      const vertices = bodies[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = "#bbb";
    ctx.fill();
    // ctx.stroke();

    for (let i = 0; i < mass.length; i += 1) {
      ctx.beginPath();
      const vertices = mass[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fillStyle = massColors[i];
      ctx.fill();
      ctx.stroke();
    }
  })();
}
