function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

matterGravity();

function matterGravity() {
  const canvas = document.getElementById("matter-gravity");
  const ctx = canvas.getContext("2d");
  canvas.width = document.body.clientWidth;
  // document.getElementsByTagName("article")[0].clientWidth;
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // let pause = false;
  // el.addEventListener("mouseleave", function() {
  //   pause = true;
  // });
  // el.addEventListener("mouseenter", function() {
  //   pause = false;
  //   if (!pause) requestAnimationFrame(cycle);
  // });
  // el.addEventListener("click", function() {});

  const Engine = Matter.Engine,
    World = Matter.World,
    // Events = Matter.Events,
    // Composites = Matter.Composites,
    // Composite = Matter.Composite,
    // Constraint = Matter.Constraint,
    // Vertices = Matter.Vertices,
    // Query = Matter.Query,
    // Body = Matter.Body,
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
    gravityConst: document.getElementById("gravity-constant").value,
    wallWidth: 100,
    edge: 10,
    radius: 7,
    cycle: 0
  };

  document.getElementById("gravity-constant").addEventListener("input", event => {
    settings.gravityConst = document.getElementById("gravity-constant").value;
  });

  document.getElementById("clear1").addEventListener("click", event => {
    function removeAll(array) {
      for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
    }
    removeAll(atom);
    atom = [];
  });

  let mouse = {
    down: false,
    x: 0,
    y: 0
  };

  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  canvas.addEventListener("mousedown", event => {
    addAtom(mouse.x, mouse.y);
  });

  // add walls
  const wall = [];

  function addWall(x, y, width, height) {
    let i = wall.length;
    wall[i] = Matter.Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
      isStatic: true,
      restitution: 1
    });
    World.add(engine.world, wall[i]); //add to world
  }

  //inner walls
  // addWall(150, -settings.wallWidth, 300, 230); //top center
  // addWall(150, -settings.wallWidth + 270, 300, 285); //bottom center
  //outer walls
  addWall(0, -settings.wallWidth + settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //top wall
  addWall(0, settings.height - settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //bottom wall
  addWall(-settings.wallWidth + settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //left wall
  addWall(settings.width - settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //right wall

  //add atoms
  let atom = [];
  for (let i = 0; i < 25; ++i) {
    addAtom(Math.random() * settings.width - 60 + 30, Math.random() * (settings.height - 60) + 30, 3 + Math.ceil(Math.random() * 4));
  }

  function addAtom(x, y, sides = 4, speed = 1, radius = settings.radius * (1 + 3 * Math.random() * Math.random() * Math.random())) {
    const len = atom.length;
    atom[len] = Matter.Bodies.circle(x, y, radius, {
      // atom[len] = Matter.Bodies.polygon(x, y, sides, radius, {
      radius: radius,
      color: randomColor({
        luminosity: "bright",
        hue: "red"
      }),
      // friction: 0,
      frictionAir: 0,
      // inertia: Infinity, //no rotation
      // frictionStatic: 0,
      restitution: 0.7 //no energy loss on collision
    });
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);
  }

  // gravity integration
  function gravity(who = atom) {
    const minDistance2 = 10;
    //accelerate velocity from gravity
    for (let i = 0, len = who.length; i < len; ++i) {
      for (let j = i + 1; j < len; ++j) {
        const dx = who[i].position.x - who[j].position.x;
        const dy = who[i].position.y - who[j].position.y;
        const d2 = Math.max(dx * dx + dy * dy, minDistance2);
        const mag = (1000 * settings.gravityConst) / d2 / Math.sqrt(d2);

        // who[i].force.x -= mag * who[j].mass * dx;
        // who[i].force.y -= mag * who[j].mass * dy;

        // who[j].force.x += mag * who[i].mass * dx;
        // who[j].force.y += mag * who[i].mass * dy;

        Matter.Body.setVelocity(who[i], {
          x: who[i].velocity.x - mag * who[j].mass * dx,
          y: who[i].velocity.y - mag * who[j].mass * dy
        });
        Matter.Body.setVelocity(who[j], {
          x: who[j].velocity.x + mag * who[i].mass * dx,
          y: who[j].velocity.y + mag * who[i].mass * dy
        });
      }
    }
  }

  const draw = function() {
    ctx.clearRect(0, 0, settings.width, settings.height);

    //draw walls
    ctx.beginPath();
    for (let i = 0, len = wall.length; i < len; i += 1) {
      const vertices = wall[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = "#ccc";
    ctx.fill();
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "#666";
    // ctx.stroke();

    //draw atoms, all shapes
    // for (let i = 0, len = atom.length; i < len; ++i) {
    //   ctx.beginPath();
    //   var vertices = atom[i].vertices;
    //   ctx.moveTo(vertices[0].x, vertices[0].y);
    //   for (var j = 1; j < vertices.length; j += 1) {
    //     ctx.lineTo(vertices[j].x, vertices[j].y);
    //   }
    //   ctx.lineTo(vertices[0].x, vertices[0].y);
    //   ctx.fillStyle = atom[i].color; //"#ddd"; //"#055";
    //   ctx.fill();
    // }

    // draw atom, circles only
    for (let i = 0, len = atom.length; i < len; ++i) {
      ctx.beginPath();
      ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
      ctx.fillStyle = atom[i].color; //"#ddd"; //"#055";
      ctx.fill();
    }
  };

  function cycle() {
    if (checkVisible(canvas)) {
      settings.cycle++;
      Engine.update(engine, 16.666);
      gravity();
      draw();
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
