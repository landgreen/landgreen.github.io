function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

entropy1();

function entropy1() {
  const canvas = document.getElementById("entropy1");
  const ctx = canvas.getContext("2d");

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
    wallWidth: 100,
    edge: 10,
    radius: 7,
    cycle: 0,
    timeRate: 1,
    rotorTorque: document.getElementById("rotor-slider").value,
    count: {
      left: 0,
      right: 0
    }
  };

  document.getElementById("rotor-slider").addEventListener("input", event => {
    settings.rotorTorque = -document.getElementById("rotor-slider").value;
  });

  document.getElementById("time-rate-slider").addEventListener("input", event => {
    settings.timeRate = document.getElementById("time-rate-slider").value;
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
    if (!settings.pause) {
      const spread = 10;
      for (let i = 0; i < 10; ++i) {
        addAtom(mouse.x + spread * (Math.random() - 0.5), mouse.y + spread * (Math.random() - 0.5));
      }
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

  //inner walls
  addWall(150, -settings.wallWidth, 300, 230); //top center
  addWall(150, -settings.wallWidth + 270, 300, 285); //bottom center
  //outer walls
  addWall(0, -settings.wallWidth + settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //top wall
  addWall(0, settings.height - settings.edge, settings.width + settings.wallWidth, settings.wallWidth); //bottom wall
  addWall(-settings.wallWidth + settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //left wall
  addWall(settings.width - settings.edge, 0, settings.wallWidth, settings.height + settings.wallWidth); //right wall

  //add rotor
  const r = {
    radius: 190,
    width: 8,
    position: {
      x: 300,
      y: 90
    },
    density: 0.005
  };
  const rotor1 = Matter.Bodies.rectangle(r.position.x, r.position.y, r.width, r.radius, {
    density: r.density
  });
  const rotor2 = Matter.Bodies.rectangle(r.position.x, r.position.y, r.width, r.radius, {
    angle: Math.PI / 2,
    density: r.density
  });

  const rotor = Body.create({
    //combine rotor1 and rotor2
    parts: [rotor1, rotor2],
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 1,
    collisionFilter: {
      group: -2 //don't let rotor collide with walls
    }
  });
  Matter.Body.setPosition(rotor, {
    x: r.position.x,
    y: r.position.y
  });
  World.add(engine.world, [rotor]);
  //fix rotor in place, but allow rotation
  const constraint = Constraint.create({
    pointA: {
      x: r.position.x,
      y: r.position.y
    },
    bodyB: rotor
  });
  World.add(engine.world, constraint);

  //add atoms
  let atom = [];
  for (let i = 0; i < 100; ++i) {
    addAtom((Math.random() * settings.width) / 4.5 + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
    addAtom(settings.width - (Math.random() * settings.width) / 4.5 - settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 1, radius = settings.radius * (1 + 0.4 * (Math.random() - 0.5))) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 0, radius, {
      radius: radius,
      friction: 0,
      frictionAir: 0,
      // density: 1,
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
    ctx.fillStyle = "#8ab";
    ctx.fill();
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "#666";
    // ctx.stroke();

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
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = "#000";
    // ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fill();

    //draw atoms
    ctx.beginPath();
    ctx.fillStyle = "#f04"; //"#055";
    for (let i = 0, len = atom.length; i < len; ++i) {
      ctx.moveTo(atom[i].position.x, atom[i].position.y);
      ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
    }
    ctx.fill();
  };

  // particles tend to lose speed, but they also sometimes get moving too fast
  function speedControl(factor = 1.4) {
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].speed < 1) {
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x * factor,
          y: atom[i].velocity.y * factor
        });
      } else if (atom[i].speed > 10) {
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x / factor,
          y: atom[i].velocity.y / factor
        });
      }
    }
  }

  function counter() {
    let left = 0;
    let right = 0;
    let midpoint = canvas.width / 2;
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].position.x > midpoint) {
        left++;
      } else {
        right++;
      }
    }
    return { left: left, right: right };
  }

  function workDisplay() {
    ctx.fillStyle = "#fff";
    const work = rotor.angularSpeed * 5000;
    ctx.fillRect(175, 190, work, 20);
    // ctx.fillRect(290, canvas.height, 20, -work);
  }

  function cycle() {
    if (checkVisible(canvas)) {
      settings.cycle++;
      for (let i = 0; i < settings.timeRate; ++i) {
        Engine.update(engine, 16.666);
        speedControl();
        if (rotor.angularSpeed < 0.03) rotor.torque = settings.rotorTorque * rotor.inertia * 0.00001;
      }
      draw();
      // workDisplay();
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
