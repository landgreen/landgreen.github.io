MotionSimulation();
function MotionSimulation(){
//set up canvas
var canvasID = "canvas"
var canvas = document.getElementById(canvasID);
var ctx = canvas.getContext("2d");
var id = document.getElementById(canvasID).parentNode.id;


//ctx.canvas.width = document.getElementById(id).clientWidth;
//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;

window.onresize = function(event) {
  var id = document.getElementById(canvasID).parentNode.id;
  //ctx.canvas.width = document.getElementById(id).clientWidth;
  //ctx.canvas.width = window.innerWidth;
  //ctx.canvas.height = window.innerHeight;
};

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
engine.world.gravity.scale = 0.000001 * scale;;
engine.world.gravity.y = 9.8*25;


var mass = [];

document.getElementById(canvasID).addEventListener("mousedown", function(){
  World.clear(engine.world, true); //clear matter engine, leave static
  mass = []; //clear mass array
  spawnMass(0, 20, 300, 0,  20, 0.04);
  spawnMass(0, 100, 300, 0, 20, 0.02);
  spawnMass(0, 170, 300, 0, 20, 0.01);
  spawnMass(0, 240, 300, 0, 20, 0.005);
});

spawnMass(0, 20, 300, 0,  20, 0.04);
spawnMass(0, 100, 300, 0, 20, 0.02);
spawnMass(0, 170, 300, 0, 20, 0.01);
spawnMass(0, 240, 300, 0, 20, 0.005);
function spawnMass(xIn, yIn, VxIn, VyIn, radius, friction) {
  //spawn mass
    var i = mass.length
    mass.push();
    mass[i] = Bodies.rectangle(xIn * scale, canvas.height - (yIn - radius)*scale,2*radius * scale ,radius * scale, {
      friction: friction,
      frictionStatic: 0.6,
      frictionAir: 0.000,
      restitution: 0.8,
    });

    Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    //Matter.Body.setAngularVelocity(mass[i], 0.4);
    World.add(engine.world, mass[i]);
  }
//add some ramps
World.add(engine.world, [
    Bodies.rectangle(canvas.width*0.5, 70, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }),
    Bodies.rectangle(canvas.width*0.5, 140, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    }),
    Bodies.rectangle(canvas.width*0.5, 210, canvas.width, 10, {
      isStatic: true,
      friction: 1,
      frictionStatic: 1,
    })
  ]);


//add walls flush with the edges of the canvas
var offset = 25;
World.add(engine.world, [
  /* Bodies.rectangle(canvas.width*0.5, -offset-1, canvas.width * 2 + 2 * offset, 50, { //top
    isStatic: true,
    friction: 1,
    frictionStatic: 1,
  }), */
  Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, { //bottom
    isStatic: true,
    friction: 1,
    frictionStatic: 1,
  }),
  Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //right
    isStatic: true,
    friction: 1,
    frictionStatic: 1,
  }),
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
    var bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = 'rgba(255,255,255,0.4)';  //trails
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (var i = 0; i < bodies.length; i += 1) {
      var vertices = bodies[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#cfe2f6';
    ctx.fill();
    ctx.stroke();
    //draw lines
    // ctx.beginPath();
    // for (var k = 0, length = mass.length; k<length; k++){
    //   ctx.moveTo(mass[k].position.x,mass[k].position.y);
    //   ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
    // }
    // ctx.stroke();

  })();
}
