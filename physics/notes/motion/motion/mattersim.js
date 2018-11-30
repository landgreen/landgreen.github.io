// function checkVisible(elm) {
//   var rect = elm.getBoundingClientRect();
//   var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
//   return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
// }

matter();

function matter() {
  const canvas = document.getElementById("matter");
  const ctx = canvas.getContext("2d");
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";


  let pause = true;
  canvas.addEventListener("mouseleave", function () {
    pause = true;
  });
  canvas.addEventListener("mouseenter", function () {
    pause = false;
    if (!pause) requestAnimationFrame(cycle);
  });
  canvas.addEventListener("click", function () {});

  const Engine = Matter.Engine,
    World = Matter.World


  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity
  engine.constraintIterations = 1;
  engine.positionIterations = 1;
  engine.velocityIterations = 1;

  const settings = {
    width: canvas.width,
    height: canvas.height,
    spawnNumber: 50,
    wallWidth: 100,
    edge: 5,
    radius: 4,
    barSize: 300, //needs to be even multiples of width
    maxBarSize: 10,
    barGap: 300 * 0.02,
    scaleValue: 100,
    timeRate: 0,
    lowestSpeed: 0.4,
    colorA: "#8ab",
    colorB: "#f04",
    count: {
      left: 0,
      right: 0
    }
  };

  canvas.addEventListener("mousedown", event => {
    if (!settings.pause) {
      //gets mouse position, even when canvas is scaled by CSS
      const mouse = {
        x: (event.offsetX * canvas.width) / canvas.clientWidth,
        y: (event.offsetY * canvas.height) / canvas.clientHeight
      };
      const spread = 10;
      for (let i = 0; i < 1; ++i) {
        addAtom(mouse.x + spread * (Math.random() - 0.5), mouse.y + spread * (Math.random() - 0.5));
      }
      Engine.update(engine, 16.666);
      draw();
    }
  });

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

  //outer walls
  addWall(0, -settings.wallWidth + settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //top wall
  addWall(0, settings.height - settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //bottom wall
  addWall(-settings.wallWidth + settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //left wall
  addWall(settings.width - settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //right wall

  //add atoms
  let atom = [];
  for (let i = 0; i < settings.spawnNumber; ++i) {
    addAtom((Math.random() * settings.width) / 2.1 + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
    addAtom(settings.width - (Math.random() * settings.width) / 2.1 - settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 0.1, radius = settings.radius + 0.8 * settings.radius * (Math.random() - 0.5)) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 0, radius, {
      radius: radius,
      // color: (x > canvas.width / 2) ? "#f08" : "#07c",
      color: "#f65",
      isGroupA: (x > canvas.width / 2) ? false : true,
      friction: 0,
      frictionAir: 0,
      density: 0.002,
      frictionStatic: 0,
      restitution: 1, //no energy loss on collision
      inertia: Infinity //no rotation
    });
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);
  }

  // particles tend to lose speed, but they also sometimes get moving too fast
  function speedControl(factor = 1.1) {
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].speed < settings.lowestSpeed) {
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x * factor,
          y: atom[i].velocity.y * factor
        });
      } else if (atom[i].speed > 20) {
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x / factor,
          y: atom[i].velocity.y / factor
        });
      }
    }
  }

  const draw = function () {
    ctx.clearRect(0, 0, settings.width, canvas.height);

    ctx.strokeStyle = "#556";
    ctx.beginPath();
    const edge = settings.edge / 2
    ctx.moveTo(edge, settings.height - edge);
    ctx.lineTo(canvas.width - edge, settings.height - edge);
    ctx.lineTo(canvas.width - edge, edge);
    ctx.lineTo(edge, edge);
    ctx.lineTo(edge, settings.height - edge);
    ctx.stroke();

    //draw atoms
    for (let i = 0, len = atom.length; i < len; ++i) {
      ctx.beginPath();
      ctx.fillStyle = atom[i].color;
      ctx.moveTo(atom[i].position.x, atom[i].position.y);
      ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  function cycle() {
    Engine.update(engine, 16.666);
    speedControl();
    draw();
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}