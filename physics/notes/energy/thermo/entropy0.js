// function checkVisible(elm) {
//   var rect = elm.getBoundingClientRect();
//   var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
//   return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
// }

entropy0();

function entropy0() {
  const canvas = document.getElementById("entropy0");
  const ctx = canvas.getContext("2d");
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";


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
    World = Matter.World


  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity
  engine.constraintIterations = 1;
  engine.positionIterations = 1;
  engine.velocityIterations = 1;

  const settings = {
    width: canvas.width,
    height: 150,
    spawnNumber: 150,
    wallWidth: 100,
    edge: 10,
    radius: 4,
    cycle: 0,
    // barSize: 20, //needs to be even multiples of width
    // //adjust scale value after adjusting barSize
    // scaleValue: 1800,
    barSize: 300, //needs to be even multiples of width
    maxBarSize: 10,
    barGap: 300 * 0.05,
    //adjust scale value after adjusting barSize
    scaleValue: 100,
    timeRate: 0,
    lowestSpeed: 0.4,
    // colorA: "#257",
    // colorB: "#d09",
    colorA: "#06a",
    colorB: "#e04",
    count: {
      left: 0,
      right: 0
    }
  };

  // document.getElementById("clear0").addEventListener("click", event => {
  //   function removeAll(array) {
  //     for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
  //   }
  //   removeAll(atom);
  //   atom = [];
  // });

  document.getElementById("bar-number-slider0").addEventListener("input", event => {
    const options = [600, 300, 200, 150, 100, 60, 50, 40, 30, 15]
    settings.barSize = options[document.getElementById("bar-number-slider0").value];
    settings.barGap = settings.barSize * 0.05
    draw();
  });

  document.getElementById("time-rate-slider0").addEventListener("input", event => {
    settings.timeRate = document.getElementById("time-rate-slider0").value;
  });

  document.getElementById("clear0").addEventListener("click", event => {
    function removeAll(array) {
      for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
    }
    removeAll(atom);
    atom = [];
    draw();
  });

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
  for (let i = 0; i < settings.spawnNumber; ++i) {
    addAtom((Math.random() * settings.width) / 2.8 + settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
    addAtom(settings.width - (Math.random() * settings.width) / 2.8 - settings.edge, Math.random() * (settings.height - settings.edge * 2) + settings.edge);
  }

  function addAtom(x, y, speed = 0.1, radius = settings.radius) {
    const len = atom.length;
    atom[len] = Matter.Bodies.polygon(x, y, 0, radius, {
      radius: radius,
      // color: (x > canvas.width / 2) ? "#f08" : "#07c",
      color: (x > canvas.width / 2) ? settings.colorB : settings.colorA,
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


  //stores data for bar chart visualization
  let chartA = new Array(Math.floor(canvas.width / settings.maxBarSize)).fill(0)
  let chartB = new Array(Math.floor(canvas.width / settings.maxBarSize)).fill(0)

  // particles tend to lose speed, but they also sometimes get moving too fast
  function speedControl(factor = 1.1) {
    for (let i = 0, len = atom.length; i < len; ++i) {
      if (atom[i].speed < settings.lowestSpeed) {
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

  const draw = function () {
    ctx.clearRect(0, 0, settings.width, canvas.height);

    //draw ball cavity
    ctx.fillStyle = "#fff";
    ctx.fillRect(settings.edge, settings.edge, settings.width - 2 * settings.edge, settings.height - 2 * settings.edge)

    //draw atoms
    for (let i = 0, len = atom.length; i < len; ++i) {
      ctx.beginPath();
      ctx.fillStyle = atom[i].color;
      ctx.moveTo(atom[i].position.x, atom[i].position.y);
      ctx.arc(atom[i].position.x, atom[i].position.y, atom[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    //atom distribution visualization
    //collect position data
    for (let i = 0; i < chartA.length; ++i) {
      const dropRate = 0.95;
      const threshold = 1;
      if (chartA[i] > threshold) {
        chartA[i] *= dropRate
      } else {
        chartA[i] = threshold;
      };
      if (chartB[i] > threshold) {
        chartB[i] *= dropRate;
      } else {
        chartB[i] = threshold;
      }
    }
    for (let i = 0; i < atom.length; ++i) {
      index = Math.floor(atom[i].position.x / settings.barSize)
      if (atom[i].isGroupA) {
        chartA[index]++
      } else {
        chartB[index]++
      }
    }
    //draw bar graph
    ctx.strokeStyle = settings.colorA
    ctx.fillStyle = settings.colorA;
    ctx.beginPath();
    for (let i = 0; i < chartA.length; ++i) {
      const total = chartA[i] + chartB[i]
      const heightA = chartA[i] / total * settings.scaleValue
      ctx.rect(1 + settings.barGap + i * settings.barSize, canvas.height - heightA - 5, settings.barSize - settings.barGap * 2, heightA)
    }
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.fill();

    ctx.strokeStyle = settings.colorB
    ctx.fillStyle = settings.colorB;
    ctx.beginPath();
    for (let i = 0; i < chartB.length; ++i) {
      const total = chartA[i] + chartB[i]
      const heightA = chartA[i] / total * settings.scaleValue
      const heightB = chartB[i] / total * settings.scaleValue
      ctx.rect(1 + settings.barGap + i * settings.barSize, canvas.height - heightB - heightA - 10, settings.barSize - settings.barGap * 2, heightB)
    }
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;

    // ctx.strokeStyle = settings.colorB
    // ctx.fillStyle = settings.colorB;
    // ctx.beginPath();
    // ctx.moveTo(0, canvas.height);
    // for (let i = 0; i < chartB.length; ++i) {
    //   ctx.lineTo(i * settings.barSize + settings.barSize / 2, canvas.height - chartB[i] * scale);
    // }
    // ctx.lineTo(canvas.width, canvas.height);
    // ctx.globalAlpha = 0.8;
    // ctx.stroke();
    // ctx.globalAlpha = 0.2;
    // ctx.fill();
    // ctx.globalAlpha = 1;

    // const scale = settings.scaleValue / total
    // ctx.strokeStyle = settings.colorA
    // ctx.fillStyle = settings.colorA;
    // ctx.beginPath();
    // ctx.moveTo(0, canvas.height);
    // for (let i = 0; i < chartA.length; ++i) {
    //   ctx.lineTo(i * settings.barSize + settings.barSize / 2, canvas.height - chartA[i] * scale);
    // }
    // ctx.lineTo(canvas.width, canvas.height);
    // ctx.stroke();
    // ctx.globalAlpha = 0.4;
    // ctx.fill();

    // ctx.strokeStyle = settings.colorB
    // ctx.fillStyle = settings.colorB;
    // ctx.beginPath();
    // ctx.moveTo(0, canvas.height);
    // for (let i = 0; i < chartB.length; ++i) {
    //   ctx.lineTo(i * settings.barSize + settings.barSize / 2, canvas.height - chartB[i] * scale);
    // }
    // ctx.lineTo(canvas.width, canvas.height);
    // ctx.globalAlpha = 0.8;
    // ctx.stroke();
    // ctx.globalAlpha = 0.2;
    // ctx.fill();
    // ctx.globalAlpha = 1;


    //draw position data
    // ctx.fillStyle = "rgba(0,0,0,0.5)"
    // for (let i = 0; i < chartA.length; ++i) {
    //   ctx.fillRect(i * settings.barSize, settings.height, settings.barSize, chartA[i] * 0.1);
    // }
    // ctx.fillStyle = "rgba(255,255,255,0.5)"
    // for (let i = 0; i < chartB.length; ++i) {
    //   ctx.fillRect(i * settings.barSize, settings.height, settings.barSize, chartB[i] * 0.1);
    // }

  };

  function cycle() {
    if (checkVisible(canvas)) {
      settings.cycle++;
      if (settings.timeRate) {
        for (let i = 0; i < settings.timeRate; ++i) {
          Engine.update(engine, 16.666);
          speedControl();
        }
        draw();
      }
    }
    requestAnimationFrame(cycle);
  }
  Engine.update(engine, 16.666);
  Engine.update(engine, 16.666);
  draw();
  requestAnimationFrame(cycle);
}