(function() {
  var canvas = document.getElementById("sound1");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 24px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();
(function() {
  var canvas = document.getElementById("sound2");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 24px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();
(function() {
  var canvas = document.getElementById("sound3");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 24px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

function sound(el, drawMode = 0, waveOut = false, drawOne = false) {
  el.onclick = null; //stops the function from running on button click
  const canvas = el;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth - 20;

  let pause = false;
  el.addEventListener("mouseleave", function() {
    pause = true;
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    if (!pause) requestAnimationFrame(cycle);
  });
  el.addEventListener("click", function() {
    if (!settings.pusherReady) {
      settings.pusherReady = true;
    }
  });

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
    rows: Math.floor(canvas.width / 10),
    columns: 4,
    cycle: 0,
    pusherCycle: 1,
    pusherReady: true,
    frequency: 0.07,
    phaseEnd: Math.floor(2 * Math.PI * (1 / 0.07)),
    pushMag: canvas.width * 0.1,
    drawStep: 25
  };
  if (waveOut) canvas.height += 100;

  // add walls
  function addWall(x, y, width, height) {
    World.add(engine.world, [
      Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
        isStatic: true,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1
      })
    ]);
  }
  const wide = 100;
  const dropDown = 9;
  addWall(-wide, -wide + dropDown, canvas.width + 2 * wide, wide); //top wall
  addWall(-wide, 32 + dropDown, canvas.width + 2 * wide, wide); //bottom wall
  addWall(canvas.width, -wide, wide, 2 * wide); //left wall

  //add atoms
  const atom = [];
  for (let i = 0; i < settings.rows; ++i) {
    for (let j = 0; j < settings.columns; ++j) {
      const len = atom.length;
      atom[len] = Matter.Bodies.polygon(i * settings.radius * 2, j * settings.radius * 2 + 2, 0, settings.radius, {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1,
        inertia: Infinity
      });
      const speed = 4;
      Matter.Body.setVelocity(atom[len], {
        x: speed * (Math.random() - 0.5),
        y: speed * (Math.random() - 0.5)
      });
      World.add(engine.world, atom[len]);
    }
  }

  //pusher plate
  const pusher = Matter.Bodies.rectangle(-1000, settings.height / 2 - 50, settings.pushMag * 2, settings.height + 200, {
    isStatic: true,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 1
  });
  World.add(engine.world, pusher);

  const pusherControl = function() {
    if (!(settings.pusherCycle % settings.phaseEnd)) {
      settings.pusherReady = false;
      settings.pusherCycle = 1;
    }
    if (settings.pusherReady) settings.pusherCycle++;
    Matter.Body.setPosition(pusher, { x: settings.pushMag * -Math.cos(settings.pusherCycle * settings.frequency), y: canvas.height / 2 - 50 });
  };

  //set up array to store wave velocity for graph
  const amp = [];
  for (let i = 0, len = Math.floor(canvas.width / settings.drawStep); i < len; ++i) {
    amp[i] = 0;
  }
  const waveOutput = function() {
    //dampen amp
    for (let i = 0, len = amp.length; i < len; ++i) {
      amp[i] *= 0.85;
    }
    for (let i = 2, len = atom.length; i < len; ++i) {
      const max = canvas.width / settings.drawStep - 1;
      const index = Math.min(Math.max(Math.floor(atom[i].position.x / settings.drawStep), 0), max);
      amp[index] += 1.15;
    }
    //draw graph
    var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0.2, "#06a");
    grd.addColorStop(1, "#fff");
    ctx.fillStyle = grd; //"#9bc"; //"rgba(150,190,200,1)";
    const drop = 40;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - amp[1] + drop);
    for (let i = 1, len = amp.length; i < len; i++) {
      ctx.lineTo(i * settings.drawStep, canvas.height - amp[i] + drop);
    }
    ctx.lineTo(canvas.width, canvas.height - amp[amp.length - 1] + drop);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
  };

  const escapeCheck = function() {
    if (!(settings.cycle % 60)) {
      for (let i = 0, len = atom.length; i < len; ++i) {
        if (atom[i].position.y > 50 || atom[i].position.y < -50) {
          Matter.Body.setPosition(atom[i], { x: canvas.width / 2, y: 2 });
          Matter.Body.setVelocity(atom[i], { x: 0, y: 0 });
        }
      }
    }
  };

  const draw = function() {
    if (waveOut) waveOutput();
    //draw atoms
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#fff";
    if (drawMode === 0) {
      for (let i = 0, len = atom.length; i < len; ++i) {
        let vertices = atom[i].vertices;
        ctx.beginPath();
        ctx.arc(vertices[0].x, vertices[0].y, settings.radius, 0, 2 * Math.PI);
        //colored balls
        const hue = Math.max(Math.min(atom[i].velocity.x * 20, 180), -180);
        ctx.fillStyle = "hsla(" + hue + ", 100%, 50%,1)";
        // const alpha = Math.max(Math.min(atom[i].speed * atom[i].speed * atom[i].speed * 0.01, 1), 0.02);
        // ctx.fillStyle = "hsla(" + hue + ", 100%, 50%," + alpha + ")";
        ctx.fill();
      }
    } else if (drawMode === 1) {
      for (let i = 0, len = atom.length; i < len; ++i) {
        let vertices = atom[i].vertices;
        ctx.beginPath();
        ctx.arc(vertices[0].x, vertices[0].y, settings.radius, 0, 2 * Math.PI);
        //speed opacity balls
        const mag = atom[i].speed; //can't get a value for angular speed not sure why
        const alpha = Math.max(Math.min(atom[i].speed * atom[i].speed * 0.04, 1), 0.05);
        ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "rgba(0,0,0,1)";
      for (let i = 0, len = atom.length; i < len; ++i) {
        //normal black balls
        let vertices = atom[i].vertices;
        ctx.beginPath();
        ctx.arc(vertices[0].x, vertices[0].y, settings.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
    //draw pusher
    let vertices = pusher.vertices;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.fillStyle = "#f24";
    ctx.fill();
  };

  const drawOneAtom = function() {
    where = atom[Math.floor(atom.length / 3)].position;
    ctx.beginPath();
    ctx.arc(where.x, where.y, settings.radius * 1.2, 0, 2 * Math.PI);
    ctx.fillStyle = "#f24";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
  };

  function cycle() {
    Engine.update(engine, 16);
    settings.cycle++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    if (drawOne) drawOneAtom();
    pusherControl();
    escapeCheck();
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
