function stickyCollision(){
//set up canvas
var canvasID = "canvas"
var canvas = document.getElementById(canvasID);
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
engine.world.gravity.scale = 0.000001 * scale;;
engine.world.gravity.y = 0;


var mass = [];

document.getElementById(canvasID).addEventListener("mousedown", function(){
  World.clear(engine.world, true); //clear matter engine, leave static
  mass = []; //clear mass array
  spawnList();
});
spawnList();
function spawnList(){
  var Ypos = canvas.height/2;
  spawnMass(100, Ypos, Math.ceil(Math.random()*10)*15, 0, 25+Math.ceil(Math.random()*60),8,0.1);
  spawnMass(600, Ypos, -Math.ceil(Math.random()*10)*15, 0, 30+Math.ceil(Math.random()*50),4,1.5);
  var vel = (mass[0].mass*mass[0].velocity.x+mass[1].mass*mass[1].velocity.x)/(mass[0].mass+mass[1].mass);
  //write a problem based on the values in the spawn
  document.getElementById("ex").innerHTML = "<p><b>Randomized Problem:</b> A "
  +mass[0].mass.toFixed(2)+"kg <a style='color: "+mass[0].color+"'>octogon</a> moving at "+ mass[0].velocity.x.toFixed(2)+"m/s collides and sticks to a "+mass[1].mass.toFixed(2)+"kg <a style='color: "+mass[1].color+"'>square</a> moving at "+ mass[1].velocity.x.toFixed(2)+"m/s. What is the velocity of the objects after they collide?</p><details> <summary>solution</summary><p style='text-align: center;'>octogon + square = octogon + square</p>$$m_{1}u_{1}+m_{2}u_{2}=(m_{1}+m_{2})v$$ $$("+mass[0].mass.toFixed(2)+")("+mass[0].velocity.x.toFixed(2)+")+("+mass[1].mass.toFixed(2)+")("+mass[1].velocity.x.toFixed(2)+")=("+mass[0].mass.toFixed(2)+"+"+mass[1].mass.toFixed(2)+")v$$ $$"+vel.toFixed(2)+" \\small\\frac{m}{s}=\\normalsize v$$</details>"
  //reencodes the mathjax into math, makes the $$ $$ work
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}
function spawnMass(xIn, yIn, VxIn, VyIn, length,sides,angle) {
  //spawn mass
    var i = mass.length
    mass.push();
    mass[i] = Bodies.polygon(xIn * scale, yIn*scale,sides,length * scale, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
      length: length,
      color: randomColor({
          luminosity: 'light',
      }),
    });

    Body.setVelocity(mass[i], {
      x: VxIn / 60 * scale,
      y: -VyIn / 60 * scale
    });
    //Matter.Body.setAngle(mass[i], angle)
    //Matter.Body.setAngularVelocity(mass[i], -0.004   );
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
    ctx.strokeStyle = '#000000';
    for (var i = 0; i < bodies.length; i += 1) {
      var vertices = bodies[i].vertices;
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
      if (bodies[i].color){
      ctx.fillStyle = bodies[i].color;
    } else {
      ctx.fillStyle = '#ccc'
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
    ctx.textAlign="center";
    ctx.font = "300 20px Roboto";
    ctx.fillStyle="#000";
    var px = 0;
    var py = 0;
    for (var k = 0, length = mass.length; k<length; k++){
      ctx.fillText(mass[k].mass.toFixed(2)+'kg',mass[k].position.x,mass[k].position.y);
      //ctx.fillText(mass[k].velocity.x.toFixed(2)+'m/s',mass[k].position.x,mass[k].position.y+9);
      px += mass[k].mass*mass[k].velocity.x;
      py += mass[k].mass*(-mass[k].velocity.y);
    }
    // ctx.textAlign="left";
    // ctx.fillText('mv + mv = total horizontal momentum ',5,13);
    // ctx.fillText('(' + mass[0].mass.toFixed(2)+')('+mass[0].velocity.x.toFixed(2) +') + ('
    // +mass[1].mass.toFixed(2)+') ('+mass[1].velocity.x.toFixed(2)+') = '      +px.toFixed(2),5,30);
    // ctx.textAlign="right";
    // ctx.fillText('mv + mv = total vertical momentum',canvas.width-5,13);
    // ctx.fillText('(' + mass[0].mass.toFixed(2)+')('+-mass[0].velocity.y.toFixed(2) +') + ('
    // +mass[1].mass.toFixed(2)+') ('+-mass[1].velocity.y.toFixed(2)+') = '      +py.toFixed(2),canvas.width-5,30);
  })();
}
