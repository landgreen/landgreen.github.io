(() => {
  const canvas = document.getElementById("matter-canvas-1");
  const ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = 1;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let scale
  if (canvas.width > canvas.height) {
    scale = canvas.height / 10 + 7
  } else {
    scale = canvas.width / 10 + 7
  }
  ctx.strokeStyle = "#000";
  ctx.beginPath()
  ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
  ctx.moveTo(cx - scale * 0.8, cy - scale);
  ctx.lineTo(cx + scale * 1.2, cy);
  ctx.lineTo(cx - scale * 0.8, cy + scale);
  ctx.lineTo(cx - scale * 0.8, cy - scale);
  ctx.stroke();
  ctx.lineJoin = "miter"
  ctx.lineCap = "butt"
  ctx.lineWidth = 1;
})()

// challenge1(document.getElementById("matter-canvas-1")) //autorun for development only

function challenge1(el) {
  el.onclick = null; //stops the function from running on button click
  const canvas = el
  const ctx = canvas.getContext("2d");
  const WIDTH = 600;
  const HEIGHT = 400;
  canvas.height = HEIGHT;

  ctx.font = "20px Arial";
  canvas.style.cursor = "crosshair";
  document.getElementById("matter-mouse-1").style.display = "block"
  document.getElementById("matter-text-1-1").style.display = "block"
  canvas.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center"
  });


  // module aliases
  const Engine = Matter.Engine,
    World = Matter.World,
    // Composites = Matter.Composites,
    // Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  // create an engine
  const engine = Engine.create();
  let mass = []; // array of balls
  let wall1, wall2

  const SCALE = 10;
  const COLOR_ARRAY = ["#fc0", "#f92", "#f66", "#e0a"]
  const s = {
    ballRadius: 1,
    x: 0,
    y: 0,
    Vx: 0,
    Vy: 0,
    gapY: document.getElementById("num-1").value * SCALE,
    gapX: 0,
    gapWidth: 20,
    gapHeight: 50
  };

  const mouse = {
    down: false,
    x: null,
    y: null
  }
  canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.offsetX * WIDTH / canvas.clientWidth;
    mouse.y = event.offsetY * HEIGHT / canvas.clientHeight;
    document.getElementById("matter-mouse-1").innerHTML = `mouse position = (${(mouse.x / SCALE).toFixed(1)} m, ${(-(mouse.y - canvas.height) / SCALE).toFixed(1)} m)`
  });

  document.getElementById("num-1").addEventListener("change", () => {
    s.gapY = document.getElementById("num-1").value * SCALE;
    s.gapY = Math.max(Math.min(s.gapY, 375), 0)

    // lower
    Matter.Body.setPosition(wall1, {
      x: wall1.position.x,
      y: 1.5 * canvas.height - s.gapHeight + s.ballRadius * 2 + 73 - s.gapY
    });
    // upper 
    Matter.Body.setPosition(wall2, {
      x: wall2.position.x,
      y: 0.5 * canvas.height - s.gapHeight - s.ballRadius * 2 + 27 - s.gapY
    });
    fire()
  });

  document.getElementById("clear-1").addEventListener("click", () => {
    World.clear(engine.world, true);
    mass = [];
  });

  function randomize() {
    //randomize values
    s.Vx = 15 + Math.round(Math.random() * 10)
    s.Vy = 15 + Math.round(Math.random() * 15)
    s.gapX = (0.5 + Math.random() * 0.4) * canvas.width

    const X = (s.gapX + s.gapWidth * 0.2) / SCALE
    const T = X / s.Vx
    const Y = (s.Vy * T - 4.9 * T * T)
    //write the random values to html
    document.getElementById("xpos-1").style.opacity = 0;
    document.getElementById("Vx-1").style.opacity = 0;
    document.getElementById("Vy-1").style.opacity = 0;

    setTimeout(function () {
      document.getElementById("xpos-1").innerHTML = (X).toFixed(1);
      document.getElementById("Vx-1").innerHTML = s.Vx.toFixed(1)
      document.getElementById("Vy-1").innerHTML = s.Vy.toFixed(1)

      document.getElementById("xpos-1").style.opacity = 1;
      document.getElementById("Vx-1").style.opacity = 1;
      document.getElementById("Vy-1").style.opacity = 1;
    }, 500);



    document.getElementById("table-1").innerHTML = `<table class='table-2d'>
    <tr><td colspan='2' style='text-align: center;'>Δt = ?</td></tr>
    <tr><td>Δx = ${X.toFixed(1)}</td><td>Δy = ?</td></tr>
    <tr><td>u = ${s.Vx.toFixed(1)}</td><td>u = ${s.Vy.toFixed(1)}</td></tr>
    <tr><td>v = </td><td>v = </td></tr>
    <tr><td>a = 0</td><td>a = -9.8 m/s²</td></tr></table>`

    //output LaTex
    katex.render(
      String.raw `\begin{gathered} 
      \Delta x = u \Delta t + \tfrac{1}{2}a  \Delta t^2
      \\ (${X.toFixed(1)}) = (${s.Vx.toFixed(1)}) \Delta t + \tfrac{1}{2}(0)  \Delta t^2
      \\ ${X.toFixed(1)} = (${s.Vx.toFixed(1)}) \Delta t
      \\ \Delta t = \frac{${X.toFixed(1)} \, \mathrm{m}}{${s.Vx.toFixed(1)} \, \mathrm{\tfrac{m}{s}}} 
      \\ \Delta t = ${(T).toFixed(1)} \, \mathrm{s}
      \\
      \\ \Delta y = u \Delta t + \tfrac{1}{2}a\Delta t^2
      \\ \Delta y = (${s.Vy.toFixed(1)}) (${(T).toFixed(1)}) + \tfrac{1}{2}(-9.8)(${(T).toFixed(1)})^2
      \\ \Delta y = ${(Y).toFixed(1)} \, \mathrm{m}
      \end{gathered}`,
      document.getElementById("katex-render-1")
    );
  }
  randomize();

  function fire() {
    spawnMass(s.x, s.y, s.Vx, s.Vy, s.ballRadius);
  }
  fire();

  canvas.addEventListener("click", () => {
    fire();
  });

  document.getElementById("fire-1").addEventListener("click", () => {
    fire();
  });

  document.getElementById("randomize-1").addEventListener("click", () => {
    randomize();
    World.clear(engine.world, false); //remove everything even static walls
    mass = [];
    addWalls();
  });
  addWalls();


  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    var i = mass.length;
    mass.push();
    const SIDES = 3 + Math.ceil(3 * Math.random())
    // mass[i] = Bodies.circle(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, radius * SCALE, {
    mass[i] = Bodies.polygon(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, SIDES, radius * SCALE, {
      // friction: 0.001,
      // frictionStatic: 0,
      frictionAir: 0,
      // color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)],
      color: randomColor({
        // luminosity: 'light',
        hue: 'blue'
      }),
      // restitution: 0.8
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * SCALE,
      y: (-VyIn / 60) * SCALE
    });
    Matter.Body.setAngularVelocity(mass[i], (Math.random() - 0.5) * 0.2);
    World.add(engine.world, mass[i]);
  }



  function addWalls() {
    //lower wall
    wall1 = Bodies.rectangle(s.gapX + s.gapWidth / 2 + s.ballRadius,
      1.5 * canvas.height - s.gapHeight + s.ballRadius * 2 - s.gapY + 73,
      s.gapWidth,
      canvas.height, {
        isStatic: true
      });

    //upper wall
    wall2 = Bodies.rectangle(s.gapX + s.gapWidth / 2 + s.ballRadius,
      0.5 * canvas.height - s.gapHeight - s.ballRadius * 2 - s.gapY + 27,
      s.gapWidth,
      canvas.height, {
        isStatic: true
      });

    World.add(engine.world, [wall1, wall2]);

    //add walls flush with the edges of the canvas
    const OFFSET = 25;
    World.add(engine.world, [
      Bodies.rectangle(canvas.width * 0.5, canvas.height + OFFSET, canvas.width * 2 + 2 * OFFSET, 50, { //bottom
        isStatic: true,
      }),
      Bodies.rectangle(canvas.width + OFFSET + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * OFFSET, { //right
        isStatic: true,
      })
    ]);
  }

  // run the engine
  Engine.run(engine);

  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * SCALE;
  engine.world.gravity.y = 9.8;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw balls
    // ctx.fillStyle = "#f60";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    for (var i = 0; i < mass.length; i += 1) {
      ctx.beginPath();
      var vertices = mass[i].vertices;
      // ctx.moveTo(mass[i].position.x, mass[i].position.y);
      for (var j = 0; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fillStyle = mass[i].color;
      ctx.fill();
      ctx.stroke();
    }

    //draw walls
    ctx.beginPath();
    vertices = wall1.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);

    vertices = wall2.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);

    ctx.fillStyle = "#9ab";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  //cycle
  cycle();

  function cycle() {
    draw();
    window.requestAnimationFrame(cycle);
  }
}





// *********************************************************************************************************************************************






(() => {
  const canvas = document.getElementById("matter-canvas-0");
  const ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = 1;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let scale
  if (canvas.width > canvas.height) {
    scale = canvas.height / 10 + 7
  } else {
    scale = canvas.width / 10 + 7
  }
  ctx.strokeStyle = "#000";
  ctx.beginPath()
  ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
  ctx.moveTo(cx - scale * 0.8, cy - scale);
  ctx.lineTo(cx + scale * 1.2, cy);
  ctx.lineTo(cx - scale * 0.8, cy + scale);
  ctx.lineTo(cx - scale * 0.8, cy - scale);
  ctx.stroke();
  ctx.lineJoin = "miter"
  ctx.lineCap = "butt"
  ctx.lineWidth = 1;
})()

function challenge0(el) {
  el.onclick = null; //stops the function from running on button click
  const canvas = el
  const ctx = canvas.getContext("2d");
  const WIDTH = 600;
  const HEIGHT = 400;
  canvas.height = HEIGHT;

  ctx.font = "20px Arial";
  canvas.style.cursor = "crosshair";
  document.getElementById("matter-mouse-0").style.display = "block"
  document.getElementById("matter-text-1").style.display = "block"
  // document.getElementById("matter-text-2").style.display = "none"
  canvas.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center"
  });


  // module aliases
  const Engine = Matter.Engine,
    World = Matter.World,
    // Composites = Matter.Composites,
    // Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  // create an engine
  const engine = Engine.create();
  let mass = []; // array of balls
  let wall1, wall2

  const SCALE = 10;
  const COLOR_ARRAY = ["#fc0", "#f92", "#f66", "#e0a"]
  const s = {
    ballRadius: 1,
    x: 0,
    y: 0,
    Vx: 0,
    Vy: document.getElementById("num-0").value,
    gapY: 0,
    gapX: 0,
    gapWidth: 20,
    gapHeight: 50
  };

  const mouse = {
    down: false,
    x: null,
    y: null
  }
  canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.offsetX * WIDTH / canvas.clientWidth;
    mouse.y = event.offsetY * HEIGHT / canvas.clientHeight;
    document.getElementById("matter-mouse-0").innerHTML = `mouse position = (${(mouse.x / SCALE).toFixed(1)} m, ${(-(mouse.y - canvas.height) / SCALE).toFixed(1)} m)`
  });

  document.getElementById("num-0").addEventListener("change", () => {
    s.Vy = document.getElementById("num-0").value;
    fire()
  });

  document.getElementById("clear-0").addEventListener("click", () => {
    World.clear(engine.world, true);
    mass = [];
  });

  function randomize() {
    //randomize values
    s.Vx = 10 + Math.round(Math.random() * 10)
    s.gapY = 50 + Math.round(Math.random() * 275)
    s.gapX = (0.5 + Math.random() * 0.4) * canvas.width

    const X = (s.gapX + s.gapWidth * 0.2) / SCALE
    const Y = (s.gapY + s.gapHeight * 0.3) / SCALE
    const T = X / s.Vx
    const Uy = Y / T + 4.9 * T

    document.getElementById("xpos-0").style.opacity = 0;
    document.getElementById("ypos-0").style.opacity = 0;
    document.getElementById("Vx-0").style.opacity = 0;

    setTimeout(function () {
      document.getElementById("xpos-0").innerHTML = (X).toFixed(1);
      document.getElementById("ypos-0").innerHTML = (Y).toFixed(1);
      document.getElementById("Vx-0").innerHTML = s.Vx.toFixed(1);

      document.getElementById("xpos-0").style.opacity = 1;
      document.getElementById("ypos-0").style.opacity = 1;
      document.getElementById("Vx-0").style.opacity = 1;
    }, 500);






    document.getElementById("table-0").innerHTML = `<table class='table-2d'>
    <tr><td colspan='2' style='text-align: center;'>Δt = ?</td></tr>
    <tr><td>Δx = ${X.toFixed(1)}</td><td>Δy = ${Y.toFixed(1)}</td></tr>
    <tr><td>u = ${s.Vx.toFixed(1)}</td><td>u = ?</td></tr>
    <tr><td>v = </td><td>v = </td></tr>
    <tr><td>a = 0</td><td>a = -9.8 m/s²</td></tr></table>`

    //output LaTex
    katex.render(
      String.raw `\begin{gathered} 
      \Delta x = u \Delta t + \tfrac{1}{2}a  \Delta t^2
      \\ (${X.toFixed(1)}) = (${s.Vx.toFixed(1)}) \Delta t + \tfrac{1}{2}(0)  \Delta t^2
      \\ ${X.toFixed(1)} = (${s.Vx.toFixed(1)}) \Delta t
      \\ \Delta t = \frac{${X.toFixed(1)} \, \mathrm{m}}{${s.Vx.toFixed(1)} \, \mathrm{\tfrac{m}{s}}} 
      \\ \Delta t = ${(T).toFixed(1)} \, \mathrm{s}
      \\
      \\ \Delta y = u \Delta t + \tfrac{1}{2}a\Delta t^2
      \\ u \Delta t = \Delta y - \tfrac{1}{2}a\Delta t^2 
      \\ u = \frac{\Delta y}{\Delta t} - \tfrac{1}{2}a\Delta t 
      \\ u = \frac{(${Y.toFixed(1)})}{(${T.toFixed(1)})} - \tfrac{1}{2}(-9.8)(${T.toFixed(1)})
      \\ u = ${(Uy).toFixed(1)} \, \mathrm{\tfrac{m}{s}} 
      \end{gathered}`,
      document.getElementById("katex-render-0")
    );
  }
  randomize();

  function fire() {
    spawnMass(s.x, s.y, s.Vx, s.Vy, s.ballRadius);
  }
  fire();

  canvas.addEventListener("click", () => {
    fire();
  });

  document.getElementById("fire-0").addEventListener("click", () => {
    fire();
  });

  document.getElementById("randomize-0").addEventListener("click", () => {
    randomize();
    World.clear(engine.world, false); //remove everything even static walls
    mass = [];
    addWalls();
  });
  addWalls();


  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    var i = mass.length;
    mass.push();
    const SIDES = 3 + Math.ceil(3 * Math.random())
    // mass[i] = Bodies.circle(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, radius * SCALE, {
    mass[i] = Bodies.polygon(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, SIDES, radius * SCALE, {
      // friction: 0.001,
      // frictionStatic: 0,
      frictionAir: 0,
      color: COLOR_ARRAY[Math.floor(Math.random() * COLOR_ARRAY.length)],
      // color: randomColor({
      //   luminosity: 'light',
      //   hue: 'pink'
      // }),
      // restitution: 0.8
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * SCALE,
      y: (-VyIn / 60) * SCALE
    });
    Matter.Body.setAngularVelocity(mass[i], (Math.random() - 0.5) * 0.2);
    World.add(engine.world, mass[i]);
  }

  function addWalls() {
    wall1 = Bodies.rectangle(s.gapX + s.gapWidth / 2 + s.ballRadius, canvas.height,
      s.gapWidth, s.gapY * 2 + s.ballRadius, {
        isStatic: true
      });
    wall2 = Bodies.rectangle(s.gapX + s.gapWidth / 2 + s.ballRadius, 0,
      s.gapWidth, (canvas.height - s.gapY - s.gapHeight) * 2, {
        isStatic: true
      });
    World.add(engine.world, [wall1, wall2]);
    //add walls flush with the edges of the canvas

    const OFFSET = 25;
    World.add(engine.world, [
      Bodies.rectangle(canvas.width * 0.5, canvas.height + OFFSET, canvas.width * 2 + 2 * OFFSET, 50, { //bottom
        isStatic: true,
      }),
      Bodies.rectangle(canvas.width + OFFSET + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * OFFSET, { //right
        isStatic: true,
      })
    ]);
  }

  // run the engine
  Engine.run(engine);

  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * SCALE;
  engine.world.gravity.y = 9.8;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "#000";
    // if (mouse.x) ctx.fillText(`(${(mouse.x / SCALE).toFixed(1)} m, ${(-(mouse.y - canvas.height) / SCALE).toFixed(1)} m)`, 0, 20);
    // ctx.fillText(`(${(mouse.x/SCALE).toFixed(0)}m, ${(-(mouse.y-canvas.height)/SCALE).toFixed(0)}m)`, mouse.x, mouse.y + 40);

    //draw balls
    // ctx.fillStyle = "#f60";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    for (var i = 0; i < mass.length; i += 1) {
      ctx.beginPath();
      var vertices = mass[i].vertices;
      // ctx.moveTo(mass[i].position.x, mass[i].position.y);
      for (var j = 0; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fillStyle = mass[i].color;
      ctx.fill();
      ctx.stroke();
    }

    //draw walls
    ctx.beginPath();
    vertices = wall1.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);

    vertices = wall2.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);

    ctx.fillStyle = "#9ab";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    //draw mouse position
    // ctx.beginPath();
    // ctx.arc(3, HEIGHT - 3, 4, 0, 2 * Math.PI)
    // ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI)
    // ctx.fillStyle = "#000"
    // ctx.fill();

    // ctx.beginPath();
    // ctx.moveTo(mouse.x, canvas.height)
    // ctx.lineTo(mouse.x, mouse.y)
    // ctx.moveTo(0, mouse.y)
    // ctx.lineTo(mouse.x, mouse.y)
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "#666";
    // ctx.setLineDash([7, 7]);
    // ctx.stroke();
    // ctx.setLineDash([]);

    //draw initial velocity vector
    // const SCALE = 2;
    // const X = SCALE * s.Vx;
    // const Y = canvas.height - SCALE * s.Vy;
    // const MAG = Math.sqrt(X * X + Y * Y);
    // const ANGLE = Math.PI - Math.atan2(s.Vy, s.Vx);

    // ctx.save();
    // ctx.translate(X, Y);
    // ctx.rotate(ANGLE);

    // // ctx.beginPath();
    // // ctx.moveTo(0, 0);
    // // ctx.lineTo(MAG * SCALE, 0);
    // // ctx.lineWidth = 2;
    // // ctx.strokeStyle = "#000";
    // // ctx.stroke();

    // ctx.beginPath();
    // ctx.moveTo(MAG * SCALE, 0);
    // ctx.lineTo(MAG * SCALE + 0, -20);

    // ctx.lineWidth = 2;
    // ctx.strokeStyle = "#f00";
    // ctx.stroke();

    // ctx.restore();
  }

  //cycle
  cycle();

  function cycle() {
    draw();
    window.requestAnimationFrame(cycle);
  }
}