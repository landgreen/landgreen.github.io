(function() {
  var canvas = document.getElementById("entropy1");
  var ctx = canvas.getContext("2d");
  ctx.font = "24px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

function entropy(el) {
  el.onclick = null; //stops the function from running on button click
  const canvas = el;
  const ctx = canvas.getContext("2d");

  // let pause = false;
  // el.addEventListener("mouseleave", function() {
  //   pause = true;
  // });
  // el.addEventListener("mouseenter", function() {
  //   pause = false;
  //   if (!pause) requestAnimationFrame(cycle);
  // });
  // el.addEventListener("click", function() {

  // });

  const Engine = Matter.Engine,
    World = Matter.World,
    Events = Matter.Events,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Vertices = Matter.Vertices,
    Query = Matter.Query,
    Body = Matter.Body,
    Bodies = Matter.Bodies;

  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity
  engine.constraintIterations = 1;
  engine.positionIterations = 1;
  engine.velocityIterations = 1;

  const settings = {
    width: canvas.width,
    height: canvas.height,
    radius: 5,
    spawn: 100,
    cycle: 0,
    pusherCycle: 1,
    pusherReady: true,
    frequency: 0.07,
    phaseEnd: Math.floor(2 * Math.PI * (1 / 0.07)),
    pushMag: canvas.width * 0.1,
    drawStep: 25
  };

  // add walls

  const wall = [];
  function addWall(x, y, width, height) {
    let i = wall.length;
    wall[i] = Matter.Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
      isStatic: true,
      inertia: Infinity, //no rotation
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      restitution: 1,
      collisionFilter: {
        group: -2
      }
    });
    World.add(engine.world, wall[i]); //add to world
  }
  const wide = 100;
  //outer walls
  addWall(0, -wide, settings.width + wide, wide); //top wall
  addWall(0, settings.height, settings.width + wide, wide); //bottom wall
  addWall(-wide, 0, wide, settings.height + wide); //left wall
  addWall(settings.width, 0, wide, settings.height + wide); //right wall
  //inner walls
  addWall(200, -wide, 200, 215); //top center
  addWall(200, -wide + 285, 200, 275); //bottom center

  //add rotor
  const rotor1 = Matter.Bodies.rectangle(300, 300, 10, 200, { density: 0.01 });
  const rotor2 = Matter.Bodies.rectangle(300, 300, 10, 200, {
    angle: Math.PI / 2,
    density: 0.01
  });

  const rotor = Body.create({
    //combine rotor1 and rotor2
    parts: [rotor1, rotor2],
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 1,

    collisionFilter: {
      group: -2
    }
  });
  Matter.Body.setPosition(rotor, { x: 300, y: 100 });

  World.add(engine.world, [rotor]);

  const constraint = Constraint.create({
    pointA: { x: rotor.position.x, y: rotor.position.y },
    bodyB: rotor
    // length: 0
  });
  World.add(engine.world, constraint);

  //add atoms
  const atom = [];
  for (let i = 0; i < 400; ++i) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon((Math.random() * settings.width) / 3, Math.random() * settings.height, 0, settings.radius, {
      friction: 0,
      frictionAir: 0,
      // density: 1,
      frictionStatic: 0,
      restitution: 1, //no energy loss on collision
      inertia: Infinity //no rotation
    });
    const speed = 1;
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);
  }

  const draw = function() {
    ctx.clearRect(0, 0, settings.width, settings.height);

    //draw walls
    if (wall.length) {
      ctx.beginPath();
      for (let i = 0; i < wall.length; i += 1) {
        const vertices = wall[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (var j = 1; j < vertices.length; j += 1) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
      }
      ctx.fillStyle = "#ddd";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#333";
      ctx.stroke();
    }

    //draw rotors
    ctx.beginPath();
    let vertices = rotor1.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    vertices = rotor2.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.fillStyle = "#779";
    ctx.fill();

    //draw atoms
    ctx.beginPath();
    ctx.fillStyle = "#f20";
    for (let i = 0, len = atom.length; i < len; ++i) {
      ctx.moveTo(atom[i].position.x, atom[i].position.y);
      ctx.arc(atom[i].position.x, atom[i].position.y, settings.radius, 0, 2 * Math.PI);
      //colored balls
      // const sat = Math.max(Math.min(atom[i].speed * 20, 100), 0);
      // ctx.fillStyle = "hsla(0, " + sat + "%, 50%,1)";
    }
    ctx.fill();
  };

  function speedBoost(factor = 1.5) {
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].speed < 1) {
        Matter.Body.setVelocity(atom[i], { x: atom[i].velocity.x * factor, y: atom[i].velocity.y * factor });
      }
    }
  }

  function cycle() {
    settings.cycle++;
    Engine.update(engine, 16.666);
    speedBoost();
    draw();
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
