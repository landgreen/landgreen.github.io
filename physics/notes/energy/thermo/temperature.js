function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

entropy1();

function entropy1() {
  const canvas = document.getElementById("temperature");
  const ctx = canvas.getContext("2d");
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
    temp: document.getElementById("time-rate-slider-temp").value,
    calculatedTemp: 0
  };

  document.getElementById("time-rate-slider-temp").addEventListener("input", event => {
    settings.temp = document.getElementById("time-rate-slider-temp").value;
  });

  document.getElementById("clear-temp").addEventListener("click", event => {
    function removeAll(array) {
      for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
    }
    removeAll(atom);
    removeAll(cons);
    atom = [];
    cons = [];
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
  let atom = []; //stores particles
  let cons = []; //stores constraints
  for (let i = 0; i < 20; ++i) {
    addAtom(Math.random() * (settings.width - settings.edge * 2) + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
    addMolecule(Math.random() * (settings.width - settings.edge * 2) + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 1, radius = settings.radius * (1 + 0.4 * (Math.random() - 0.5))) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 4 + Math.floor(Math.random() * 3), radius, {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      restitution: 1, //no energy loss on collision
      angle: Math.random() * 10
      // inertia: Infinity //no rotation
    });
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);
  }

  function addMolecule(x, y, speed = 1, radius = settings.radius * (1 + 0.4 * (Math.random() - 0.5))) {
    let len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 4 + Math.floor(Math.random() * 3), radius, {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      restitution: 1, //no energy loss on collision
      angle: Math.random() * 10
      // inertia: Infinity //no rotation
    });
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);

    len = atom.length;
    atom[len] = Matter.Bodies.polygon(x + radius * 2 + 2 + Math.random() * 5, y, 3 + Math.floor(Math.random() * 4), radius, {
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      restitution: 1, //no energy loss on collision
      angle: Math.random() * 10
      // inertia: Infinity //no rotation
    });
    Matter.Body.setVelocity(atom[len], {
      x: speed * (Math.random() - 0.5),
      y: speed * (Math.random() - 0.5)
    });
    World.add(engine.world, atom[len]);

    // keep particles attached to each other
    cons[cons.length] = Constraint.create({
      bodyA: atom[len - 1],
      bodyB: atom[len],
      damping: -0.01,
      stiffness: 0.03
    });
    World.add(engine.world, cons[cons.length - 1]);
  }

  function speedControl() {
    //find total kinetic energy
    let totalKE = 0;
    for (let i = 0, len = atom.length; i < len; ++i) {
      totalKE += (atom[i].mass * atom[i].speed * atom[i].speed + atom[i].inertia * atom[i].angularSpeed * atom[i].angularSpeed) / 2;
    }
    const avgKE = totalKE / atom.length;
    // if (avgKE > settings.temp * 5) {
    //   // console.log("removing energy");
    //   for (let i = 0, len = atom.length; i < len; ++i) {
    //     const slowFactor = 1.005
    //     Matter.Body.setVelocity(atom[i], {
    //       x: atom[i].velocity.x / slowFactor,
    //       y: atom[i].velocity.y / slowFactor
    //     });
    //     atom[i].torque -= atom[i].angularVelocity * 0.02;
    //   }
    // }

    if (avgKE < settings.temp) {
      // console.log("adding energy");
      for (let i = 0, len = atom.length; i < len; ++i) {
        const speedUpFactor = 1.007;
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x * speedUpFactor,
          y: atom[i].velocity.y * speedUpFactor
        });
      }
    }
  }

  // function speedControl(factor = 1.3) {
  //   for (let i = 0, len = atom.length; i < len; ++i) {
  //     if (atom[i].speed + atom[i].angularSpeed < settings.temp) {
  //       Matter.Body.setVelocity(atom[i], {
  //         x: atom[i].velocity.x * factor,
  //         y: atom[i].velocity.y * factor
  //       });
  //     } else if (atom[i].speed > settings.temp * 8) {
  //       Matter.Body.setVelocity(atom[i], {
  //         x: atom[i].velocity.x / factor,
  //         y: atom[i].velocity.y / factor
  //       });

  //       atom[i].torque += -atom[i].angularVelocity * 0.01;
  //     }
  //   }
  // }

  // const outputKineticEnergy = function() {
  //   const where = document.getElementById("kinetic-energy");
  //   let out = "";
  //   let totalKE = 0;
  //   let totalKERotation = 0;
  //   for (let i = 0, len = atom.length; i < len; ++i) {
  //     const KE = 0.5 * atom[i].speed * atom[i].speed;
  //     // out += " + " + KE.toFixed(1);
  //     totalKE += KE;
  //     const rotation = 0.5 * atom[i].inertia * atom[i].angularSpeed * atom[i].angularSpeed;
  //     totalKERotation += rotation;
  //   }
  //   out += "<br> total translational KE = " + totalKE.toFixed(2);
  //   out += "<br> total rotational KE = " + totalKERotation.toFixed(2);
  //   out += "<br> total KE = " + (totalKE + totalKERotation).toFixed(2);
  //   where.innerHTML = out;
  // };

  //output to separate canvas chart of KE
  let KEBarChart = [];
  const barWidth = 8;
  for (let i = 0, len = Math.floor(canvas.width / barWidth); i < len; ++i) {
    KEBarChart[i] = 0;
  }
  const outputKE = function() {
    let KEOut = [];
    for (let i = 0, len = Math.floor(canvas.width / barWidth); i < len; ++i) {
      KEOut[i] = 0;
    }
    //produce chart data
    let totalKE = 0;
    let totalKERotation = 0;
    for (let i = 0, len = atom.length; i < len; ++i) {
      const KE = 0.5 * atom[i].speed * atom[i].speed;
      totalKE += KE;
      const rotation = 0.5 * atom[i].inertia * atom[i].angularSpeed * atom[i].angularSpeed;
      totalKERotation += rotation;
      //add to array
      // const index = Math.floor(Math.sqrt(Math.sqrt(KE + rotation)) * 10);
      const index = Math.floor(Math.sqrt(KE + rotation) * 20);
      KEOut[index]++;
    }
    //draw chart
    const canvasOut = document.getElementById("temperature-out");
    const ctxOut = canvasOut.getContext("2d");
    ctxOut.clearRect(0, 0, canvasOut.width, canvasOut.height);
    let barHeightScale = 1600 / atom.length;
    for (let i = 0, len = KEOut.length; i < len; ++i) {
      KEBarChart[i] = KEBarChart[i] * 0.99 + KEOut[i] * 0.01;
      const h = barHeightScale * KEBarChart[i];
      ctxOut.fillRect(i * barWidth, canvasOut.height - h, barWidth, h);
    }
    // console.log(KEOut);
  };

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

    //draw atoms
    ctx.beginPath();
    for (let i = 0, len = atom.length; i < len; i += 1) {
      const vertices = atom[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = "#f04"; //"#055";
    ctx.fill();

    //draw constraints
    ctx.beginPath();
    for (let i = 0, len = cons.length; i < len; ++i) {
      ctx.moveTo(cons[i].bodyA.position.x, cons[i].bodyA.position.y);
      ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.stroke();
  };

  function cycle() {
    if (checkVisible(canvas)) {
      settings.cycle++;
      Engine.update(engine, 16.666);
      speedControl();
      draw();
      outputKE();
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
