MotionSimulation();

function MotionSimulation() {
  const WIDTH = 580;
  const HEIGHT = 300;
  let friction = 0.0002;
  //set up canvas
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function resizeCanvas() {
    //fit canvas to window and fix issues with canvas blur on zoom
    if (document.body.clientWidth > WIDTH) {
      canvas.style.width = WIDTH + "px";
      canvas.style.height = HEIGHT + "px";

      const scale = window.devicePixelRatio;
      canvas.width = WIDTH * scale;
      canvas.height = HEIGHT * scale;
      ctx.scale(scale, scale);
    }
  }

  window.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);

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
  engine.world.gravity.scale = 0.000002 * scale;
  engine.world.gravity.y = 9.8 * 25;

  let mass = []

  // reset
  // document.getElementById(canvasID).addEventListener("mousedown", function () {
  //   World.clear(engine.world, true); //clear matter engine, leave static
  //   mass = []; //clear mass array
  //   spawnMass(0, 30, 300, 0, 20, 0.04);
  // });
  for (let i = 0; i < 5; ++i) {
    spawnMass(i * 100, 0, 0, 0, 20, friction);
  }
  // spawnMass(100, 0, 0, 0, 20, 0.00006);
  // spawnMass(200, 0, 0, 0, 20, 0.00006);
  // spawnMass(300, 0, 0, 0, 20, 0.00006);
  // spawnMass(400, 0, 0, 0, 20, 0.00006);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius, friction) {
    //spawn mass
    const i = mass.length;
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, (yIn - radius) * scale, 2 * radius * scale, radius * scale, {
      // friction: friction,
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
      y: -100
    }
    const floor = canvas.height + 200
    for (let i = 0, len = mass.length; i < len; ++i) {
      if (mass[i].position.y > floor) {
        Matter.Body.setPosition(mass[i], goto)
        Body.setVelocity(mass[i], {
          x: 0,
          y: 0
        });
      }
    }

  }



  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", event => {
    //gets mouse position, even when canvas is scaled by CSS
    const mouse = {
      x: event.offsetX,
      y: event.offsetY
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


  document.getElementById("friction-0").addEventListener("input", event => {
    friction = document.getElementById("friction-0").value
    document.getElementById("friction-0-slider").value = friction
    updateFriction()
  });

  document.getElementById("friction-0-slider").addEventListener("input", event => {
    friction = document.getElementById("friction-0-slider").value
    document.getElementById("friction-0").value = friction
    updateFriction()
  });

  function updateFriction() {
    for (let i = 0; i < mass.length; i++) {
      mass[i].friction = friction * 0.01
    }
  }

  //render
  (function render() {
    window.requestAnimationFrame(render);
    Engine.update(engine, 16.666);
    teleport();


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw just blocks

    for (let i = 0; i < mass.length; i += 1) {
      ctx.beginPath();
      const vertices = mass[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fillStyle = "#bbb";
      ctx.fill();
    }


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