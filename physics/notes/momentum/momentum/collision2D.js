function collision2d(el) {
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

  document.getElementById(el.id).addEventListener("mousedown", function () {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnList();
  });
  spawnList();

  function spawnList() {
    var Ypos = canvas.height / 2;
    spawnMass(-100, Ypos, 120, 0, 44.72135955, "pink", 6, 0.1);
    spawnMass(500, Ypos - 50, -60, -20, 30, "cyan", 3, 1.5);
  }

  function spawnMass(xIn, yIn, VxIn, VyIn, length, color, sides, angle) {
    //spawn mass
    var i = mass.length;
    mass.push();
    mass[i] = Bodies.polygon(xIn * scale, yIn * scale, sides, length * scale, {
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
    Matter.Body.setAngle(mass[i], angle);
    Matter.Body.setAngularVelocity(mass[i], -0.004);
    World.add(engine.world, mass[i]);
  }

  // run the engine
  Engine.run(engine);

  //render
  (function render() {
    var bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#000";
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
      // ctx.stroke();
    }

    //labels
    ctx.textAlign = "center";
    // ctx.font = "300 20px Roboto";
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    var px = 0;
    var py = 0;
    for (var k = 0, length = mass.length; k < length; k++) {
      // ctx.fillText(mass[k].mass.toFixed(2) + "kg", mass[k].position.x, mass[k].position.y);
      //ctx.fillText(mass[k].velocity.x.toFixed(2)+'m/s',mass[k].position.x,mass[k].position.y+9);
      px += mass[k].mass * mass[k].velocity.x;
      py += mass[k].mass * -mass[k].velocity.y;
    }
    ctx.textAlign = "left";
    ctx.fillText("mv + mv = total horizontal momentum ", 5, 15);
    ctx.fillText(
      "(" +
      mass[0].mass.toFixed(2) +
      ")(" +
      mass[0].velocity.x.toFixed(2) +
      ") + (" +
      mass[1].mass.toFixed(2) +
      ") (" +
      mass[1].velocity.x.toFixed(2) +
      ") = " +
      px.toFixed(2),
      // Math.floor(px).toFixed(5),
      5,
      37
    );

    ctx.fillText("mv + mv = total vertical momentum", 5, canvas.height - 33);
    ctx.fillText(
      "(" +
      mass[0].mass.toFixed(2) +
      ")(" +
      -mass[0].velocity.y.toFixed(2) +
      ") + (" +
      mass[1].mass.toFixed(2) +
      ") (" +
      -mass[1].velocity.y.toFixed(2) +
      ") = " +
      py.toFixed(2),
      5,
      canvas.height - 10
    );
  })();
}