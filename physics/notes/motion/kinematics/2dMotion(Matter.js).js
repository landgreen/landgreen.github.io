MotionSimulation();

function MotionSimulation() {
  const canvas = document.getElementById("matter-1");
  const ctx = canvas.getContext("2d");
  const width = 600;
  const height = 200;

  function resizeCanvas() {
    //fit canvas to window and fix issues with canvas blur on zoom
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const scale = window.devicePixelRatio;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#556";
  }
  window.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);


  // module aliases
  let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

  // create an engine
  let engine = Engine.create();
  let scale = 100;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8;

  let mass = [];

  canvas.addEventListener("mousedown", function () {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 1.8, 2, 0, 0.2);
  });

  spawnMass(0, 1.8, 2, 0, 0.2);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    let i = mass.length;
    mass.push();
    mass[i] = Bodies.circle(xIn * scale, height - (yIn - radius) * scale, radius * scale, {
      friction: 0.3,
      frictionStatic: 0.6,
      frictionAir: 0,
      restitution: 0.7
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * scale,
      y: (-VyIn / 60) * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.3);
    Matter.Body.setAngularVelocity(mass[i], 0.25);
    World.add(engine.world, mass[i]);
  }
  let table = Bodies.rectangle(40, height - 1.5 * scale + 15, 300, 20, {
    isStatic: true,
    friction: 0,
    frictionStatic: 0
  });
  let leg = Bodies.rectangle(160, height - 25, 10, 200, {
    isStatic: true,
    friction: 0,
    frictionStatic: 0
  });
  World.add(engine.world, [table, leg]);

  //add walls flush with the edges of the canvas
  let offset = 25;
  World.add(engine.world, [
    Bodies.rectangle(width * 0.5, height + offset - 1, width * 2 + 2 * offset, 50, {
      //bottom
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(width + offset - 1, height * 0.5, 50, height * 2 + 2 * offset, {
      //right
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    })
  ]);

  // run the engine
  Engine.run(engine);

  function renderBody(who, fill = "#000") {
    ctx.beginPath();
    let vertices = who.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  }

  (function render() {
    ctx.clearRect(0, 0, width, height);
    renderBody(leg, "#999");
    renderBody(table, "999");
    // renderBody(mass[0], "#f65");
    //draw ball
    ctx.beginPath();
    ctx.arc(mass[0].position.x, mass[0].position.y, 20, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#f65"
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mass[0].position.x, mass[0].position.y)
    ctx.lineTo(mass[0].vertices[0].x, mass[0].vertices[0].y)
    ctx.stroke();

    window.requestAnimationFrame(render);
  })();
}