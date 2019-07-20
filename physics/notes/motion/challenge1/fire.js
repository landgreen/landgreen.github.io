//set up canvas
var canvasID = "canvas";
var canvas = document.getElementById(canvasID);
var ctx = canvas.getContext("2d");
ctx.font = "20px Arial";
// ctx.textAlign="center";

var mouse = {
  down: false,
  x: null,
  y: null
};
canvas.onmousemove = function (e) {
  var rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
};

// module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

var scale = 10;

var settings = {
  ballRadius: 1,
  x: 0,
  y: 0,
  Vx: 10 + Math.round(Math.random() * 10),
  Vy: 15,
  gapY: 150 + Math.round(Math.random() * 300),
  gapX: 250 + Math.round(Math.random() * 250),
  fire: function () {
    settings.Vy = document.getElementById("num1").value;
    spawnMass(settings.x, settings.y, settings.Vx, settings.Vy, settings.ballRadius);
  },
  clear: function () {
    World.clear(engine.world, true);
    mass = [];
  }
};

//write the random values to html
document.getElementById("xpos").innerHTML = (settings.gapX / scale).toFixed(1);
document.getElementById("ypos").innerHTML = (settings.gapY / scale).toFixed(1);
document.getElementById("Vx").innerHTML = settings.Vx.toFixed(1);

//setup ball
var mass = [];
//fire at the start
settings.fire();

function spawnMass(xIn, yIn, VxIn, VyIn, radius) {
  //spawn mass
  var i = mass.length;
  mass.push();
  mass[i] = Bodies.circle(xIn * scale, canvas.height - (yIn + radius) * scale, radius * scale, {
    friction: 0.6,
    frictionStatic: 0.1,
    frictionAir: 0,
    restitution: 0.5
  });

  Matter.Body.setVelocity(mass[i], {
    x: (VxIn / 60) * scale,
    y: (-VyIn / 60) * scale
  });
  Matter.Body.setAngularVelocity(mass[i], (Math.random() - 0.5) * 0.2);
  World.add(engine.world, mass[i]);
}

//build walls
var n = 20;
var wall1 = Bodies.rectangle(settings.gapX + n / 2 + settings.ballRadius, canvas.height, n, settings.gapY * 2 + settings.ballRadius, {
  isStatic: true
});
var wall2 = Bodies.rectangle(settings.gapX + n / 2 + settings.ballRadius, 0, n, (canvas.height - settings.gapY - 50) * 2, {
  isStatic: true
});
World.add(engine.world, [wall1, wall2]);

//add walls flush with the edges of the canvas
var offset = 25;
World.add(engine.world, [
  // Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // }),
  Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, {
    //bottom
    isStatic: true,
    friction: 1,
    frictionStatic: 1
  })
  // Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //right
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // }),
  //  Bodies.rectangle(-offset-1, canvas.height*0.5, 50, canvas.height * 2 + 2 * offset, {  //left
  //   isStatic: true,
  //   friction: 1,
  //   frictionStatic: 1,
  // })
]);

// run the engine
Engine.run(engine);

//adjust gravity to fit simulation
engine.world.gravity.scale = 0.000001 * scale;
engine.world.gravity.y = 9.8;

//render
render();

function render() {
  var bodies = Composite.allBodies(engine.world);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //draw mouse position
  ctx.fillStyle = "#333";
  // ctx.fillText(`(${(mouse.x/scale).toFixed(0)}m, ${(-(mouse.y-canvas.height)/scale).toFixed(0)}m)`,mouse.x,mouse.y+40);
  if (mouse.x) ctx.fillText(`(${(mouse.x / scale).toFixed(1)}m, ${(-(mouse.y - canvas.height) / scale).toFixed(1)}m)`, 0, 20);

  ctx.beginPath();
  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
  }
  ctx.fillStyle = "#cdf";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  //draw lines
  ctx.beginPath();
  for (var k = 0, length = mass.length; k < length; k++) {
    ctx.moveTo(mass[k].position.x, mass[k].position.y);
    ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#555";
  ctx.stroke();

  window.requestAnimationFrame(render);
}