matter();

function matter() {
  const settings = {
    width: 505,
    height: 150,
    spawnNumber: 13,
    wallWidth: 100,
    edge: 5,
    radius: 10,
    lowestSpeed: 0.5,
    highlightIndex: 0,
    smoothAngle: 0,
  };
  const SVGTarget = document.getElementById("matter-SVG");

  let pause = false;
  SVGTarget.addEventListener("mouseleave", () => {
    pause = true;

    //show info
    // const x = atom[settings.highlightIndex].position.x;
    // const y = atom[settings.highlightIndex].position.y;
    // const displayLimit = 40
    // const radius = atom[settings.highlightIndex].radius
    // // document.getElementById("matter-measure").setAttribute("d", `M8 ${y} h${x - 8}  M${x} ${settings.height-8} V${y}`);

    // document.getElementById("matter-x-label").setAttribute("x", (x - radius) / 2);
    // document.getElementById("matter-x-label").setAttribute("y", y);
    // if (x - radius > displayLimit) document.getElementById("matter-x-label").style.display = "inline"

    // document.getElementById("matter-y-label").setAttribute("x", x);
    // document.getElementById("matter-y-label").setAttribute("y", (settings.height + y + radius) / 2);
    // if (settings.height - y - radius > displayLimit) document.getElementById("matter-y-label").style.display = "inline"
  });

  SVGTarget.addEventListener("mouseenter", () => {
    if (pause) {
      pause = false;
      requestAnimationFrame(cycle);
    }

    //hide info
    // document.getElementById("matter-x-label").style.display = "none"
    // document.getElementById("matter-y-label").style.display = "none"

  });

  let mouse = {
    down: false,
    x: 0,
    y: 0
  };
  SVGTarget.addEventListener("mousemove", event => {
    mouse.x = event.offsetX
    mouse.y = event.offsetY
  });



  SVGTarget.addEventListener("mousedown", event => {
    if (!pause) { // && window.innerWidth > 650
      pause = false;
      const cWidth = SVGTarget.clientWidth || SVGTarget.parentNode.clientWidth
      const cHeight = SVGTarget.clientHeight || SVGTarget.parentNode.clientHeight
      mouse.x = event.offsetX * 585 / cWidth
      mouse.y = event.offsetY * 150 / cHeight
      // const mouse = {
      //   x: event.offsetX,
      //   y: event.offsetY
      // };

      switch (event.which) {
        case 1:
          //find which atom the mouse is over
          for (let i = 0, len = atom.length; i < len; ++i) {
            const dx = mouse.x - atom[i].position.x
            const dy = mouse.y - atom[i].position.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < atom[i].radius) {
              document.getElementById("atom-" + settings.highlightIndex).setAttribute("fill", "#8ab");
              document.getElementById("atom-" + i).setAttribute("fill", "#f65");
              document.getElementById("matter-target").setAttribute("r", atom[i].radius);
              settings.highlightIndex = i
            }
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
    } else {
      pause = false;
      requestAnimationFrame(cycle);
    }
  });

  // disable right click menu 
  SVGTarget.oncontextmenu = function () {
    return false;
  }

  // disable middle mouse click scroll
  // SVGTarget.onmousedown = function (event) {
  //   if (event.button === 1) return false;
  // }


  //physics engine
  const Engine = Matter.Engine,
    World = Matter.World
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity
  engine.constraintIterations = 1;
  engine.positionIterations = 1;
  engine.velocityIterations = 1;

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
  document.getElementById("atom-" + settings.highlightIndex).setAttribute("fill", "#f65");
  document.getElementById("matter-target").setAttribute("r", atom[settings.highlightIndex].radius);


  function addAtom(x, y, speed = 1, radius = settings.radius + 1.2 * settings.radius * (Math.random() - 0.5)) {
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

    //add svg circle
    let ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ball.setAttributeNS(null, "id", "atom-" + (atom.length - 1));
    ball.setAttributeNS(null, "cx", x);
    ball.setAttributeNS(null, "cy", y);
    ball.setAttributeNS(null, "r", radius);
    ball.setAttributeNS(null, "fill", "#8ab");
    ball.setAttributeNS(null, "stroke", "none");
    ball.setAttributeNS(null, "stroke-width", "2");
    SVGTarget.appendChild(ball);
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

  function gravity() {
    for (let i = 0, len = atom.length; i < len; ++i) {
      atom[i].force.y += 0.00001;
    }
  }

  function draw() {
    //update SVG balls
    for (let i = 0, len = atom.length; i < len; ++i) {
      document.getElementById("atom-" + i).setAttribute("cx", atom[i].position.x);
      document.getElementById("atom-" + i).setAttribute("cy", atom[i].position.y);
    }
    //update measure
    const x = atom[settings.highlightIndex].position.x;
    const y = atom[settings.highlightIndex].position.y;
    document.getElementById("matter-measure").setAttribute("d", `M8 ${y} h${x - 8}  M${x} ${settings.height-8} V${y}`);
  };


  function report() {
    const scale = 0.05;
    document.getElementById("matter-x").textContent = "x = " + (atom[settings.highlightIndex].position.x * scale).toFixed(1)
    document.getElementById("matter-y").textContent = "y = " + ((settings.height - atom[settings.highlightIndex].position.y) * scale).toFixed(1)
    document.getElementById("matter-Vx").textContent = "Vx = " + (atom[settings.highlightIndex].velocity.x * 60 * scale).toFixed(1)
    document.getElementById("matter-Vy").textContent = "Vy = " + (-atom[settings.highlightIndex].velocity.y * 60 * scale).toFixed(1)

    let angle = Math.atan2(atom[settings.highlightIndex].velocity.y, atom[settings.highlightIndex].velocity.x);
    angle = (angle * 180 / Math.PI - 90) + 720
    // if (angle < 0) angle += 360
    // if (angle > 360) angle -= 360
    // console.log(angle, settings.smoothAngle)
    // if (angle - 360 > settings.smoothAngle) settings.smoothAngle += 360

    // const dot = Matter.Vector.dot(atom[settings.highlightIndex].velocity, diff);
    // // console.log(Math.cos(dot)*180/Math.PI)
    // if (dot > threshold) {
    //   return true;
    // } else {
    //   return false;
    // }

    settings.smoothAngle = settings.smoothAngle * 0.9 + angle * 0.1
    document.getElementById("matter-vector").setAttribute("transform", "translate(550 75) rotate(" + settings.smoothAngle + ")");
  }

  function cycle() {
    Engine.update(engine, 16.666);
    speedControl();
    // gravity();
    draw();
    report();
    if (!pause) requestAnimationFrame(cycle);
  }
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  requestAnimationFrame(cycle);
}