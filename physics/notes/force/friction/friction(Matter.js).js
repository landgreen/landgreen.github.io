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
    Constraint = Matter.Constraint,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

  // create an engine
  const engine = Engine.create();
  const scale = 1;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8 * 25;

  let mass = []

  // reset
  // document.getElementById(canvasID).addEventListener("mousedown", function () {
  //   World.clear(engine.world, true); //clear matter engine, leave static
  //   mass = []; //clear mass array
  //   spawnMass(0, 30, 300, 0, 20, 0.04);
  // });

  spawnMass(0, 0, 0, 0, 20, 0.00003);
  spawnMass(100, 0, 0, 0, 20, 0.00003);
  spawnMass(200, 0, 0, 0, 20, 0.00003);
  spawnMass(300, 0, 0, 0, 20, 0.00003);
  spawnMass(400, 0, 0, 0, 20, 0.00003);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius, friction) {
    //spawn mass
    const i = mass.length;
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, (yIn - radius) * scale, 2 * radius * scale, radius * scale, {
      friction: friction,
      // frictionStatic: 1,
      // frictionAir: 0,
      restitution: 0
    });

    Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.4);
    World.add(engine.world, mass[i]);
  }
  World.add(engine.world, [
    Bodies.rectangle(200, 150, 600, 10, {
      isStatic: true,
      friction: 0.00001,
      // frictionStatic: 0.5,
      angle: Math.PI / 8
    })
  ]);


  function teleport() {
    const goto = {
      x: 0,
      y: 0
    }
    const floor = canvas.height + 100
    for (let i = 0, len = mass.length; i < len; ++i) {
      if (mass[i].position.y > floor) {
        Matter.Body.setPosition(mass[i], goto)
      }
    }

  }



  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", event => {
    //gets mouse position, even when canvas is scaled by CSS
    const mouse = {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    };
    for (let i = 0; i < mass.length; ++i) {
      const dx = mass[i].position.x - mouse.x;
      const dy = mass[i].position.y - mouse.y;
      const d2 = Math.max(dx * dx + dy * dy, 500);
      const mag = 200 / d2;
      Matter.Body.setVelocity(mass[i], {
        x: mass[i].velocity.x + mag * dx,
        y: mass[i].velocity.y + mag * dy
      })
    }
  });


  //render
  (function render() {
    window.requestAnimationFrame(render);
    Engine.update(engine, 16.666);
    teleport();


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw just blocks
    ctx.beginPath();
    for (let i = 0; i < mass.length; i += 1) {
      const vertices = mass[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = "#bcd";
    ctx.fill();

    //draw all
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
    ctx.stroke();
  })();
}