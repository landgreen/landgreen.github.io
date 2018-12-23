matter();

function matter() {

  const settings = {
    width: 495,
    height: 159,
    spawnNumber: 15,
    wallWidth: 100,
    edge: 5,
    radius: 8,
    maxBarSize: 10,
    barGap: 300 * 0.02,
    scaleValue: 100,
    timeRate: 0,
    lowestSpeed: 0.5,
    highlightIndex: 0,
    smoothAngle: 0,
  };

  const canvas = document.getElementById("matter");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    //fit canvas to window and fix issues with canvas blur on zoom
    canvas.style.width = settings.width + "px";
    canvas.style.height = settings.height + "px";
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = settings.width * scale;
    canvas.height = settings.height * scale;
    ctx.scale(scale, scale);

    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#556";
    draw();
  }
  window.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);

  let pause = true;
  canvas.addEventListener("mouseleave", () => {
    pause = true;
  });
  canvas.addEventListener("mouseenter", () => {
    pause = false;
    if (!pause) requestAnimationFrame(cycle);
  });
  // canvas.addEventListener("click", () => {});

  const Engine = Matter.Engine,
    World = Matter.World


  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity
  engine.constraintIterations = 1;
  engine.positionIterations = 1;
  engine.velocityIterations = 1;

  let mouse = {
    down: false,
    x: 0,
    y: 0
  };
  canvas.addEventListener("mousemove", event => {
    mouse.x = event.offsetX
    mouse.y = event.offsetY
  });

  canvas.addEventListener("mousedown", event => {
    if (!settings.pause) {

      //gets mouse position, even when canvas is scaled by CSS
      const mouse = {
        x: event.offsetX,
        y: event.offsetY
      };

      switch (event.which) {
        case 1:
          //find which atom the mouse is over
          for (let i = 0, len = atom.length; i < len; ++i) {
            const dx = mouse.x - atom[i].position.x
            const dy = mouse.y - atom[i].position.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < atom[i].radius) settings.highlightIndex = i
          }
          break;
        case 2:
          addAtom(mouse.x, mouse.y);
          break;
        case 3:
          //repel
          for (let i = 0, len = atom.length; i < len; ++i) {
            const dx = mouse.x - atom[i].position.x
            const dy = mouse.y - atom[i].position.y
            // const distance = Math.sqrt(dx * dx + dy * dy)
            const a = Math.atan2(dy, dx);
            const r = dx * dx + dy * dy + 4000; //the +4000 keeps r from being zero
            const mag = -10000 / r;
            Matter.Body.setVelocity(atom[i], {
              x: atom[i].velocity.x + mag * Math.cos(a),
              y: atom[i].velocity.y + mag * Math.sin(a)
            });
          }
          break;
      }
    }
  });

  // disable right click menu 
  canvas.oncontextmenu = function () {
    return false;
  }

  // disable middle mouse click scroll
  canvas.onmousedown = function (event) {
    if (event.button === 1) return false;
  }


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
    addAtom(settings.edge + Math.random() * (settings.width - settings.edge * 2), settings.edge + Math.random() * (settings.height - settings.edge * 2));
    // addAtom(settings.width - (Math.random() * settings.width) / 2.1 - settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 1, radius = settings.radius + 0.6 * settings.radius * (Math.random() - 0.5)) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 0, radius, {
      radius: radius,
      // color: (x > canvas.width / 2) ? "#f08" : "#07c",
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
  function speedControl() {
    let speedTotal = 0
    for (let i = 0, len = atom.length; i < len; ++i) {
      speedTotal += atom[i].speed
    }
    if (speedTotal / atom.length < settings.lowestSpeed) {
      for (let i = 0, len = atom.length; i < len; ++i) {
        Matter.Body.setVelocity(atom[i], {
          x: atom[i].velocity.x * 1.01,
          y: atom[i].velocity.y * 1.01
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, settings.width, settings.height);

    //draw lines to highlighted atom
    ctx.beginPath();
    ctx.moveTo(0, atom[settings.highlightIndex].position.y);
    ctx.lineTo(atom[settings.highlightIndex].position.x, atom[settings.highlightIndex].position.y);
    ctx.moveTo(atom[settings.highlightIndex].position.x, settings.height);
    ctx.lineTo(atom[settings.highlightIndex].position.x, atom[settings.highlightIndex].position.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#daa";
    ctx.setLineDash([2, 7]);
    ctx.stroke();
    ctx.setLineDash([]);


    // ctx.strokeStyle = "#555";
    // ctx.lineWidth = 5;


    //draw atoms
    ctx.fillStyle = "#8ab"
    ctx.beginPath();
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (i !== settings.highlightIndex) {
        ctx.moveTo(atom[i].position.x, atom[i].position.y);
        ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
      }
    }
    ctx.fill();

    //highlight one
    // ctx.strokeStyle = "#000";
    // ctx.lineWidth = 1;
    ctx.fillStyle = "#f65"
    ctx.beginPath();
    // ctx.moveTo(atom[settings.highlightIndex].position.x, atom[settings.highlightIndex].position.y);
    ctx.arc(atom[settings.highlightIndex].position.x, atom[settings.highlightIndex].position.y, atom[settings.highlightIndex].radius, 0, 2 * Math.PI);
    ctx.fill();
    // ctx.stroke();

    //draw walls
    ctx.beginPath();
    for (var i = 0; i < wall.length; i += 1) {
      var vertices = wall[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = '#556';
    ctx.fill();
  };

  function report() {
    const scale = 0.05;
    // document.getElementById("t").innerHTML = "t &nbsp;&nbsp;&nbsp;=&nbsp;&nbsp; " + (time / 60).toFixed(1);
    document.getElementById("x").innerHTML = "x &nbsp;&nbsp;=&nbsp;&nbsp; " + (atom[settings.highlightIndex].position.x * scale).toFixed(1)
    document.getElementById("y").innerHTML = "y &nbsp;&nbsp;=&nbsp;&nbsp; " + ((canvas.height - atom[settings.highlightIndex].position.y) * scale).toFixed(1)
    document.getElementById("Vx").innerHTML = "Vx =&nbsp; " + (atom[settings.highlightIndex].velocity.x * 60 * scale).toFixed(1)
    document.getElementById("Vy").innerHTML = "Vy =&nbsp; " + (-atom[settings.highlightIndex].velocity.y * 60 * scale).toFixed(1)
    // document.getElementById("a").innerHTML = "a &nbsp;&nbsp;=&nbsp; " + "---";
    // document.getElementById("m").innerHTML = "m &nbsp;=&nbsp;&nbsp; " + atom[settings.highlightIndex].mass.toFixed(2)

    let angle = Math.atan2(atom[settings.highlightIndex].velocity.y, atom[settings.highlightIndex].velocity.x);
    angle = (angle * 180 / Math.PI - 90)
    settings.smoothAngle = settings.smoothAngle * 0.85 + angle * 0.15
    document.getElementById("vector").setAttribute("transform", "translate(30 28) rotate(" + settings.smoothAngle + ")");
  }


  function mouseOver() {
    for (let i = 0, len = atom.length; i < len; ++i) {
      const dx = atom[i].position.x - mouse.x
      const dy = atom[i].position.y - mouse.y
      const dist2 = dx * dx + dy * dy
      if (atom[i].radius * atom[i].radius > dist2 && i !== settings.highlightIndex) {
        ctx.fillStyle = "#689"
        ctx.beginPath();
        ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  function cycle() {
    Engine.update(engine, 16.666);
    speedControl();
    draw();
    mouseOver()
    report();
    if (!pause) requestAnimationFrame(cycle);
  }
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  requestAnimationFrame(cycle);
}