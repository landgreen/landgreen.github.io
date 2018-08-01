MotionSimulation();

function MotionSimulation() {
  let canvas = document.getElementById("myCanvas");
  let ctx = canvas.getContext("2d");

  // module aliases
  let Engine = Matter.Engine,
    World = Matter.World,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  // create an engine
  let engine = Engine.create();
  let scale = 100;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8;

  let mass = [];

  canvas.addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 1.8, 2, 0, 0.2);
  });

  spawnMass(0, 1.8, 2, 0, 0.2);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    let i = mass.length;
    mass.push();
    mass[i] = Bodies.circle(xIn * scale, canvas.height - (yIn - radius) * scale, radius * scale, {
      friction: 0.3,
      frictionStatic: 0.6,
      frictionAir: 0,
      restitution: 0.7
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * scale,
      y: (-VyIn / 60) * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.3);
    Matter.Body.setAngularVelocity(mass[i], 0.25);
    World.add(engine.world, mass[i]);
  }
  let table = Bodies.rectangle(40, canvas.height - 1.5 * scale + 15, 300, 20, {
    isStatic: true,
    friction: 0,
    frictionStatic: 0
  });
  let leg = Bodies.rectangle(160, canvas.height - 25, 10, 200, {
    isStatic: true,
    friction: 0,
    frictionStatic: 0
  });
  World.add(engine.world, [table, leg]);

  //add walls flush with the edges of the canvas
  let offset = 25;
  World.add(engine.world, [
    /* Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }), */
    Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, {
      //bottom
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, {
      //right
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    })
    /* Bodies.rectangle(-offset-1, canvas.height*0.5, 50, canvas.height * 2 + 2 * offset, {  //left
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }) */
  ]);

  // run the engine
  Engine.run(engine);

  function renderBody(who, fill = "#000") {
    ctx.beginPath();
    let vertices = who.vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  }

  (function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBody(leg, "#999");
    renderBody(table, "999");
    renderBody(mass[0], "#f65");
    //draw lines for ball
    ctx.beginPath();
    ctx.moveTo(mass[0].position.x, mass[0].position.y);
    ctx.lineTo(mass[0].vertices[0].x, mass[0].vertices[0].y);
    ctx.stroke();

    window.requestAnimationFrame(render);
  })();
}

//***************************************
//***************************************
//***************************************
//***************************************
//***************************************
//***************************************
//***************************************
//***************************************

MotionSimulationTwo();

function MotionSimulationTwo() {
  //set up canvas
  let canvasID = "myCanvas2";
  let canvas = document.getElementById(canvasID);
  let ctx = canvas.getContext("2d");

  // module aliases
  let Engine = Matter.Engine,
    World = Matter.World,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  // create an engine
  let engine = Engine.create();
  let scale = 60;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8;

  let mass = [];

  document.getElementById(canvasID).addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 2, 5, 8.66, 0.4);
  });

  spawnMass(0, 2, 5, 8.66, 0.4);

  function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
    //spawn mass
    let i = mass.length;
    mass.push();
    mass[i] = Bodies.circle(xIn * scale, canvas.height - (yIn - radius) * scale, radius * scale, {
      friction: 0.3,
      frictionStatic: 0.6,
      frictionAir: 0,
      restitution: 0.4
    });

    Matter.Body.setVelocity(mass[i], {
      x: (VxIn / 60) * scale,
      y: (-VyIn / 60) * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.3);
    Matter.Body.setAngularVelocity(mass[i], -0.1);
    World.add(engine.world, mass[i]);
  }

  //add walls flush with the edges of the canvas
  let offset = 25;
  World.add(engine.world, [
    /* Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }), */
    Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, {
      //bottom
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    }),
    Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, {
      //right
      isStatic: true,
      friction: 1,
      frictionStatic: 1
    })
    /* Bodies.rectangle(-offset-1, canvas.height*0.5, 50, canvas.height * 2 + 2 * offset, {  //left
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }) */
  ]);

  // run the engine
  Engine.run(engine);

  //render
  (function render() {
    let bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (let i = 0; i < bodies.length; i += 1) {
      ctx.moveTo(bodies[i].position.x, bodies[i].position.y);
      let vertices = bodies[i].vertices;
      ctx.lineTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#fdd";
    ctx.fill();
    ctx.stroke();
  })();

  // function graph() {
  //   let canvasID = "graph2"
  //   let canvas = document.getElementById(canvasID);
  //   let ctx = canvas.getContext("2d");
  //   let scale = 4;
  //   let box = {
  //     x: 30,
  //     c3: '#3a3', // green
  //     c2: '#47a', // blue
  //     c1: '#f02', //cherry red
  //   }
  //   ctx.fillStyle = "#ffffff";
  //   ctx.textAlign = "right";
  //   ctx.textBaseline = "middle";
  //   ctx.font = "15px Arial";
  //   ctx.lineJoin = 'round';
  //   ctx.setTransform(1, 0, 0, 1, 0.5, 0.5); //hack to stop antialiasing

  //   ctx.fillStyle = "#222";
  //   ctx.fillText("20", box.x - 5, canvas.height / 2 - 20 * scale);
  //   ctx.fillText("10", box.x - 5, canvas.height / 2 - 10 * scale);
  //   ctx.fillText("0", box.x - 5, canvas.height / 2);
  //   ctx.fillText("-10", box.x - 5, canvas.height / 2 + 10 * scale);
  //   ctx.fillText("-20", box.x - 5, canvas.height / 2 + 20 * scale);

  //   let data = [];
  //   for (let i = 0; i < canvas.width - box.x - 10; i++) {
  //     data.push({
  //       x: 0,
  //       y: 0,
  //       Vx: 0,
  //       Vy: 0,
  //     });
  //   }
  //   cycle();

  //   function cycle() {
  //     data.shift();
  //     data.push({
  //       x: mass[0].position.x,
  //       y: -mass[0].position.y,
  //       Vx: mass[0].velocity.x,
  //       Vy: -mass[0].velocity.y,
  //     });
  //     let len = data.length - 1

  //     window.requestAnimationFrame(cycle);
  //     ctx.clearRect(box.x - 1, -1, canvas.width, canvas.height);
  //     ctx.lineWidth = 1;

  //     //graph Vx
  //     ctx.fillStyle = box.c3;
  //     ctx.beginPath();
  //     ctx.arc(len + box.x, canvas.height / 2 - data[len].Vx * scale, 3, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.strokeStyle = box.c3;
  //     ctx.beginPath();
  //     for (let i = 0; i < len; i++) {
  //       ctx.lineTo(i + box.x, canvas.height / 2 - data[i].Vx * scale);
  //     }
  //     ctx.stroke();
  //     ctx.fillText("Vx", canvas.width - 5, 30);

  //     //graph Vy
  //     ctx.fillStyle = box.c1;
  //     ctx.beginPath();
  //     ctx.arc(len + box.x, canvas.height / 2 - data[len].Vy * scale, 3, 0, 2 * Math.PI);
  //     ctx.fill();
  //     ctx.strokeStyle = box.c1;
  //     ctx.beginPath();
  //     for (let i = 0; i < len; i++) {
  //       ctx.lineTo(i + box.x, canvas.height / 2 - data[i].Vy * scale);
  //     }
  //     ctx.stroke();
  //     ctx.fillText("Vy", canvas.width - 5, 10);

  //     //line markers
  //     ctx.lineWidth = 0.5;
  //     ctx.strokeStyle = "#bbb";
  //     ctx.beginPath();
  //     ctx.moveTo(box.x, canvas.height / 2);
  //     ctx.lineTo(canvas.width, canvas.height / 2);
  //     ctx.moveTo(canvas.width, canvas.height / 2 + 10 * scale);
  //     ctx.lineTo(box.x, canvas.height / 2 + 10 * scale);
  //     ctx.moveTo(canvas.width, canvas.height / 2 + 20 * scale);
  //     ctx.lineTo(box.x, canvas.height / 2 + 20 * scale);
  //     ctx.moveTo(canvas.width, canvas.height / 2 - 10 * scale);
  //     ctx.lineTo(box.x, canvas.height / 2 - 10 * scale);
  //     ctx.moveTo(canvas.width, canvas.height / 2 - 20 * scale);
  //     ctx.lineTo(box.x, canvas.height / 2 - 20 * scale);
  //     ctx.stroke();
  //   }

  // }
  // graph();
}
