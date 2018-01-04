window.onload = setup;
function setup() {
  //writes a message onload
  var canvas;
  var ctx;
  for (var i = 0; i < 4; i++) {
    canvas = document.getElementById("canvas" + i);
    ctx = canvas.getContext("2d");
    ctx.font = "300 30px Roboto";
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

  document.getElementById(el.id).addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(0, 110, 120, 0, 20 + Math.round(Math.random() * 70), Math.random());
    spawnMass(700, 110, -120, 0, 20 + Math.round(Math.random() * 70), Math.random());
  });
  spawnMass(0, 110, 200, 0, 20 + Math.round(Math.random() * 70), Math.random());
  spawnMass(700, 110, -200, 0, 20 + Math.round(Math.random() * 70), Math.random());

  function spawnMass(xIn, yIn, VxIn, VyIn, length, rest) {
    var i = mass.length;
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, yIn * scale, length * scale, length * scale, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: rest,
      length: length,
      color: randomColor({
        luminosity: "light"
      })
    });
    Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.4);
    World.add(engine.world, mass[i]);
  }

  //add walls flush with the edges of the canvas
  // var offset = 25;
  // World.add(engine.world, [
  //   Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
  //     isStatic: true,
  //     friction: 1,
  //     frictionStatic: 1,
  //   }),
  //   Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, { //bottom
  //     isStatic: true,
  //     friction: 1,
  //     frictionStatic: 1,
  //   }),
  //   Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //right
  //     isStatic: true,
  //     friction: 1,
  //     frictionStatic: 1,
  //   }),
  //   Bodies.rectangle(-offset-1, canvas.height*0.5, 50, canvas.height * 2 + 2 * offset, {  //left
  //     isStatic: true,
  //     friction: 1,
  //     frictionStatic: 1,
  //   })
  // ]);

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
      ctx.fillText(mass[k].mass.toFixed(2) + "kg", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 22);
      ctx.fillText(mass[k].velocity.x.toFixed(2) + "m/s", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 2);
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
    //edgeBounce();
  })();
}
