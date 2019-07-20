//  TODO
//  add vector arrow for initial velocity
//  add randomize button 
//  katex solution with randomization


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



function challenge1(el) {
  el.onclick = null; //stops the function from running on button click
  const canvas = el
  const ctx = canvas.getContext("2d");
  canvas.height = 400;

  ctx.font = "20px Arial";
  canvas.style.cursor = "none";
  document.getElementById("matter-text-0").style.display = "block"
  canvas.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center"
  });

  const WIDTH = 600;
  const HEIGHT = 400;
  const mouse = {
    down: false,
    x: null,
    y: null
  }
  canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.offsetX * WIDTH / canvas.clientWidth;
    mouse.y = event.offsetY * HEIGHT / canvas.clientHeight;
    document.getElementById("matter-mouse").innerHTML = `position = (${(mouse.x / SCALE).toFixed(1)} m, ${(-(mouse.y - canvas.height) / SCALE).toFixed(1)} m)`
  });

  // module aliases
  const Engine = Matter.Engine,
    World = Matter.World,
    // Composites = Matter.Composites,
    // Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  // create an engine
  const engine = Engine.create();

  const SCALE = 10;

  const settings = {
    ballRadius: 1,
    x: 0,
    y: 0,
    Vx: 10 + Math.round(Math.random() * 10),
    Vy: 15,
    gapY: 50 + Math.round(Math.random() * 275),
    // gapX: 300 + Math.round(Math.random() * 200)
    gapX: (0.5 + Math.random() * 0.4) * canvas.width
  };

  let mass = []; // array of balls

  //write the random values to html
  document.getElementById("xpos-0").innerHTML = (settings.gapX / SCALE).toFixed(1) + " m";
  document.getElementById("ypos-0").innerHTML = (settings.gapY / SCALE).toFixed(1) + " m";
  document.getElementById("Vx-0").innerHTML = settings.Vx.toFixed(1) + " m/s";

  canvas.addEventListener("click", () => {
    fire();
  });
  document.getElementById("fire-0").addEventListener("click", () => {
    fire();
  });

  fire();

  function fire() {
    settings.Vy = document.getElementById("num-0").value;
    spawnMass(settings.x, settings.y, settings.Vx, settings.Vy, settings.ballRadius);
  }

  document.getElementById("clear-0").addEventListener("click", () => {
    World.clear(engine.world, true);
    mass = [];
  });



  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    var i = mass.length;
    mass.push();
    // mass[i] = Bodies.circle(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, radius * SCALE, {
    mass[i] = Bodies.polygon(xIn * SCALE, canvas.height - (yIn + radius) * SCALE, 4, radius * SCALE, {
      friction: 0.6,
      frictionStatic: 0.1,
      frictionAir: 0,
      restitution: 0.5
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * SCALE,
      y: (-VyIn / 60) * SCALE
    });
    Matter.Body.setAngularVelocity(mass[i], (Math.random() - 0.5) * 0.2);
    World.add(engine.world, mass[i]);
  }

  //build walls
  const WALL_WIDTH = 20;
  var wall1 = Bodies.rectangle(settings.gapX + WALL_WIDTH / 2 + settings.ballRadius, canvas.height, WALL_WIDTH, settings.gapY * 2 + settings.ballRadius, {
    isStatic: true
  });
  var wall2 = Bodies.rectangle(settings.gapX + WALL_WIDTH / 2 + settings.ballRadius, 0, WALL_WIDTH, (canvas.height - settings.gapY - 50) * 2, {
    isStatic: true
  });
  World.add(engine.world, [wall1, wall2]);

  //add walls flush with the edges of the canvas
  const OFFSET = 25;
  World.add(engine.world, [
    Bodies.rectangle(canvas.width * 0.5, canvas.height + OFFSET, canvas.width * 2 + 2 * OFFSET, 50, { //bottom
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width + OFFSET + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * OFFSET, { //right
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    })
  ]);

  // run the engine
  Engine.run(engine);

  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * SCALE;
  engine.world.gravity.y = 9.8;

  //cycle
  cycle();

  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "#000";
    // if (mouse.x) ctx.fillText(`(${(mouse.x / SCALE).toFixed(1)} m, ${(-(mouse.y - canvas.height) / SCALE).toFixed(1)} m)`, 0, 20);
    // ctx.fillText(`(${(mouse.x/SCALE).toFixed(0)}m, ${(-(mouse.y-canvas.height)/SCALE).toFixed(0)}m)`, mouse.x, mouse.y + 40);
    //draw balls
    ctx.fillStyle = "#e60";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    for (var i = 0; i < mass.length; i += 1) {
      ctx.beginPath();
      var vertices = mass[i].vertices;
      // ctx.moveTo(mass[i].position.x, mass[i].position.y);
      for (var j = 0; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      ctx.fill();
      ctx.stroke();
    }

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
    ctx.beginPath();
    ctx.arc(3, HEIGHT - 3, 4, 0, 2 * Math.PI)
    ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI)
    ctx.fillStyle = "#000"
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(mouse.x, canvas.height)
    ctx.lineTo(mouse.x, mouse.y)
    ctx.moveTo(0, mouse.y)
    ctx.lineTo(mouse.x, mouse.y)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#666";
    ctx.setLineDash([7, 7]);
    ctx.stroke();
    ctx.setLineDash([]);


    window.requestAnimationFrame(cycle);
  }
}