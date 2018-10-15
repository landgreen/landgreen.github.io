function collision3(el) {
  //set up canvas
  //set up canvas
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");

  // module aliases
  var Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Composite = Matter.Composite;

  // create an engine
  var engine = Engine.create();
  var scale = 1;
  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 0;

  var mass = [];

  document.getElementById("pause").addEventListener("click", function () {
    //slow timeScale changes the value of velocity while in slow timeScale so divide by engine.timing.timeScale to set velocity normal
    if (engine.timing.timeScale === 1) {
      engine.timing.timeScale = 0.00001;
      document.getElementById("pause").innerHTML = "unpause";
    } else {
      engine.timing.timeScale = 1;
      document.getElementById("pause").innerHTML = "pause";
    }
  });

  document.getElementById(el.id).addEventListener("mousedown", function () {
    if (engine.timing.timeScale === 1) {
      World.clear(engine.world, true); //clear matter engine, leave static
      mass = []; //clear mass array
      spawn();
    }
  });

  spawn();

  function spawn() {
    spawnMass(100, 125, 180, 0, 40, "lightgreen");
    spawnMass(300, 125, 120, 0, 70, "#419eff");
    spawnMass(600, 125, -60, 0, 60, "orange");
  }

  function spawnMass(xIn, yIn, VxIn, VyIn, length, color) {
    //spawn mass
    var i = mass.length;
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, yIn * scale, length * scale, length * scale, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0.988,
      length: length,
      color: color
    });

    Body.setVelocity(mass[i], {
      x: (VxIn / 60) * scale,
      y: (-VyIn / 60) * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.4);
    World.add(engine.world, mass[i]);
  }

  // run the engine
  Engine.run(engine);

  //render
  (function render() {
    var bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = 'rgba(255,255,255,0.4)';  //trails
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    for (var i = 0; i < bodies.length; i += 1) {
      var vertices = bodies[i].vertices;
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      if (bodies[i].color) {
        ctx.fillStyle = bodies[i].color;
      } else {
        ctx.fillStyle = "#ccc";
      }
      ctx.fill();
      ctx.stroke();
    }


    ctx.textAlign = "center";
    ctx.font = "18px Arial";
    ctx.fillStyle = "#000";
    var p = 0;
    for (var k = 0, length = mass.length; k < length; k++) {
      ctx.fillText(mass[k].mass.toFixed(2) + " kg", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 22);
      ctx.fillText(mass[k].velocity.x.toFixed(2) + " m/s", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 2);
      p += mass[k].mass * mass[k].velocity.x;
    }
    ctx.textAlign = "left";
    ctx.fillText("mv  +  mv  + mv  =  total momentum", 5, canvas.height - 5);
    ctx.fillText("(" + mass[0].mass.toFixed(2) + ")(" + mass[0].velocity.x.toFixed(2) + ") + (" + mass[1].mass.toFixed(2) + ") (" + mass[1].velocity.x.toFixed(2) + ") + (" + mass[0].mass.toFixed(2) + ")(" + mass[0].velocity.x.toFixed(2) + ") = " + p.toFixed(2), 5, 22);
  })();
}