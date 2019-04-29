entropy1();

function entropy1() {
  const canvas = document.getElementById("entropy1");
  const ctx = canvas.getContext("2d");
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const Engine = Matter.Engine,
    World = Matter.World,
    Constraint = Matter.Constraint,
    Body = Matter.Body

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
    timeRate: 0,
    rotorTorque: document.getElementById("rotor-slider").value,
    workDoneBySystem: 0,
    workDoneBySystemSmoothed: 0,
    count: {
      left: 0,
      right: 0
    }
  };

  document.getElementById("rotor-slider").addEventListener("input", () => {
    settings.rotorTorque = -document.getElementById("rotor-slider").value;
  });

  document.getElementById("time-rate-slider").addEventListener("input", () => {
    settings.timeRate = document.getElementById("time-rate-slider").value;
  });

  document.getElementById("clear1").addEventListener("click", () => {
    function removeAll(array) {
      for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
    }
    removeAll(atom);
    atom = [];
  });

  canvas.addEventListener("mousedown", event => {
    if (settings.timeRate < 1) {
      settings.timeRate = 1
      document.getElementById("time-rate-slider").value = settings.timeRate
    }
    //gets mouse position, even when canvas is scaled by CSS
    const mouse = {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    };
    const spread = 10;
    for (let i = 0; i < 10; ++i) {
      addAtom(mouse.x + spread * (Math.random() - 0.5), mouse.y + spread * (Math.random() - 0.5));
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
    radius: 180,
    width: 8,
    position: {
      x: 300,
      y: 96
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
  for (let i = 0; i < 40; ++i) {
    addAtom((Math.random() * settings.width) / 4.5 + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
    addAtom(settings.width - (Math.random() * settings.width) / 4.5 - settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 1, radius = settings.radius * (1 + 0.4 * (Math.random() - 0.5))) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 0, radius, {
      radius: radius,
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
  function speedControl(factor = 1.3) {
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].speed < 0.5) {
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

  function rotorControl() {
    //external added energy
    if (rotor.angularSpeed < 0.03) rotor.torque = settings.rotorTorque * rotor.inertia * 0.00001;

    //energy leaves the system when the rotor turns.
    const energyLossRate = 0.999;
    // settings.workDoneBySystem = rotor.angularVelocity * (1 - energyLossRate);
    energyInRotor = rotor.angularVelocity * rotor.angularVelocity * rotor.inertia;
    Matter.Body.setAngularVelocity(rotor, rotor.angularVelocity * energyLossRate);
    settings.workDoneBySystem = energyInRotor - rotor.angularVelocity * rotor.angularVelocity * rotor.inertia;
  }

  const draw = function () {
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

    ctx.beginPath();
    ctx.arc(rotor.position.x, rotor.position.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#444";
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

  function dataDisplay() {
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

      const entropy = (left - right) / 200;
      return {
        left: left,
        right: right,
        entropy: entropy
      };
    }

    settings.workDoneBySystemSmoothed = settings.workDoneBySystemSmoothed * 0.98 + settings.workDoneBySystem * 0.02;
    const workDisplay = settings.workDoneBySystemSmoothed * 3000;
    ctx.fillStyle = "#eee";
    const tall = 35;
    ctx.fillRect(170, 190, 260, tall);
    // ctx.fillStyle = "#e57";
    ctx.fillRect(170, 245, 260, tall);

    //display work done by rotor if it isn't powered
    if (settings.rotorTorque == 0) {
      ctx.fillStyle = "#3ff";
      ctx.fillRect(170, 190, Math.min(workDisplay, 260), tall);
    } else {
      ctx.fillStyle = "#acc";
      ctx.fillRect(170, 190, 260, tall);
    }
    //display entropy
    ctx.fillStyle = "#f8a";
    ctx.fillRect(170, 245, 260 - Math.min(Math.abs(counter().entropy) * 260, 260), tall);

    //text
    ctx.fillStyle = "#000";
    ctx.fillText("work done", 300, 210);
    ctx.fillText("entropy", 300, 262.5);
    // ctx.fillText("entropy = " + (100 - 100 * Math.abs(counter().entropy)).toFixed(0), 300, 262.5);
  }

  function cycle() {
    // if (checkVisible(canvas)) {
    if (settings.timeRate > 0) {
      for (let i = 0; i < settings.timeRate; ++i) {
        Engine.update(engine, 16.666);
        speedControl();
        rotorControl();
      }
      draw();
    }
    // dataDisplay();
    // }
    requestAnimationFrame(cycle);
  }
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  draw();
  requestAnimationFrame(cycle);
}