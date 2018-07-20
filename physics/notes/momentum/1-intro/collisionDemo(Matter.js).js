window.onload = setup;
function setup() {
  //writes a message onload for all canvases
  var canvas;
  var ctx;
  for (var i = 0; i < 4; i++) {
    canvas = document.getElementById("canvas" + i);
    ctx = canvas.getContext("2d");
    ctx.font = "300 30px Arial";
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "center";
    ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
  }
}

//
// window.onload = setup0;
// function setup0() { //writes a message onload
//     var canvas = document.getElementById('canvas0');
//     var ctx = canvas.getContext("2d");
//     ctx.font = "300 30px Roboto";
//     ctx.fillStyle = '#aaa';
//     ctx.textAlign = "center";
//     ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
// }

function collision0(el) {
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
  spawnMass(0, 150, 100, 0);
  spawnMass(700, 150, -100, 0);

  document.getElementById(el.id).addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 150, 150, 0);
    spawnMass(700, 150, -150, 0);
  });

  function spawnMass(xIn, yIn, VxIn, VyIn, length = 40 + Math.round(Math.random() * 30), rest = Math.random()) {
    var i = mass.length;
    mass.push();
    mass[i] = Bodies.polygon(xIn * scale, yIn * scale, 3 + Math.floor(Math.random() * 3), length * scale, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: rest,
      angle: Math.random() * Math.PI,
      length: length,
      color: randomColor({
        luminosity: "light"
      })
    });
    Matter.Body.setAngularVelocity(mass[i], 0.05 * (Math.random() - 0.5));
    Body.setVelocity(mass[i], {
      x: (VxIn / 60) * scale,
      y: (-VyIn / 60) * scale
    });
    World.add(engine.world, mass[i]);
  }

  function edgeBounce() {
    for (var k = 0, length = mass.length; k < length; k++) {
      if (mass[k].position.x - mass[k].length / 2 < 0) {
        Matter.Body.setPosition(mass[k], {
          x: mass[k].length / 2,
          y: mass[k].position.y
        });
        Matter.Body.setVelocity(mass[k], {
          x: Math.abs(mass[k].velocity.x),
          y: 0
        });
      }
      if (mass[k].position.x + mass[k].length / 2 > canvas.width) {
        Matter.Body.setPosition(mass[k], {
          x: canvas.width - mass[k].length / 2,
          y: mass[k].position.y
        });
        Matter.Body.setVelocity(mass[k], {
          x: -Math.abs(mass[k].velocity.x),
          y: 0
        });
      }
    }
  }

  // run the engine
  Engine.run(engine);

  //render
  (function render() {
    var bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      // ctx.stroke();
    }

    //draw lines
    // ctx.beginPath();
    // for (var k = 0, length = mass.length; k<length; k++){
    //   ctx.moveTo(mass[k].position.x,mass[k].position.y);
    //   ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
    // }
    // ctx.stroke();
    //labels
    ctx.textAlign = "center";
    ctx.font = "300 20px Roboto";
    ctx.fillStyle = "#000";
    var p = 0;
    for (var k = 0, length = mass.length; k < length; k++) {
      // ctx.fillText(mass[k].mass.toFixed(2) + "kg", mass[k].position.x, mass[k].position.y - 12);
      // ctx.fillText(mass[k].velocity.x.toFixed(2) + "m/s", mass[k].position.x, mass[k].position.y + 12);
      p += mass[k].mass * mass[k].velocity.x;
    }
    ctx.textAlign = "left";
    ctx.fillText("mv + mv = total momentum", 5, 15);
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
        p.toFixed(2),
      5,
      37
    );
    //color underlines
    ctx.fillStyle = mass[0].color;
    ctx.fillRect(5, 45, 103, 10);
    ctx.fillStyle = mass[1].color;
    ctx.fillRect(135, 45, 103, 10);
  })();
}
