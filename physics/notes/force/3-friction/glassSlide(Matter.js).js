glassSlide();
function glassSlide(){
  //set up canvas
  var canvasID = "canvasGlass"
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
      Vertices = Matter.Vertices,
      Composites = Matter.Composites,
      Composite = Matter.Composite;




  // create an engine
  var engine = Engine.create();
  var scale = 1;
var glass = {
  size: 0.3,
  height: 440,
  width: 277,
  scaleBodyH: 0.95,
  scaleBodyW: 0.9
}

  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;;
  engine.world.gravity.y = 9.8*100;


  var mass = [];

  document.getElementById(canvasID).addEventListener("mousedown", function(){
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(-100, 0, Math.round(800+Math.random()*600), 0, glass.width*glass.size*glass.scaleBodyW, glass.height*glass.size*glass.scaleBodyH);
  });

  spawnMass(-100, 0, 600, 0,  glass.width*glass.size*glass.scaleBodyW, glass.height*glass.size*glass.scaleBodyH);
  function spawnMass(xIn, yIn, VxIn, VyIn, width, height, friction) {
    //spawn mass
      var i = mass.length
      mass.push();
      var vector = Vertices.fromPath('0 0   83 0  70 120  55 125  28 125  13 120');
      mass[i] = Matter.Bodies.fromVertices(xIn * scale, canvas.height - (yIn+height*0.5)*scale, vector, {
      //mass[i] = Bodies.rectangle(xIn * scale, canvas.height - (yIn+height*0.5)*scale, width*scale, height * scale, {
        friction: 0.017,
        frictionStatic: 0.5,
        frictionAir: 0.001,
        restitution: 0.5,
      });

      Body.setVelocity(mass[i], {
        x: VxIn / 60 * scale,
        y: -VyIn / 60 * scale
      });
      //Matter.Body.setAngularVelocity(mass[i], 0.4);
      World.add(engine.world, mass[i]);
    }

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



  //setup image
    base_image = new Image();
    //base_image.src = '../../../media/pokal-glass__0212627_PE366708_S4.JPG';
    base_image.src = '../../../media/pokal-glass__cropped_alpha.png';
    base_image.onload = function(){
      renderGlass()
      //ctx.drawImage(base_image, 100, 100);
    }
    function renderGlass() {
      var bodies = Composite.allBodies(engine.world);
      window.requestAnimationFrame(renderGlass);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      //draw image
      ctx.save()
      ctx.translate(mass[0].position.x,mass[0].position.y); //move to center of body
      ctx.rotate(mass[0].angle);  //rotate to same angle of body

      //ctx.drawImage(base_image, -size/2, -size/2,size,size); //draw image on center of body
      ctx.drawImage(base_image, -glass.width/2*glass.size, -glass.height/2*glass.size, glass.width*glass.size,glass.height*glass.size); //draw image on center of body
      ctx.restore();
      //draw vectors
      // ctx.beginPath();
      // for (var i = 0; i < bodies.length; i += 1) {
      //   var vertices = bodies[i].vertices;
      //   ctx.moveTo(vertices[0].x, vertices[0].y);
      //   for (var j = 1; j < vertices.length; j += 1) {
      //     ctx.lineTo(vertices[j].x, vertices[j].y);
      //   }
      //   ctx.lineTo(vertices[0].x, vertices[0].y);
      // }
      // ctx.lineWidth = 1;
      // ctx.strokeStyle = '#000000';
      // ctx.fillStyle = 'rgba(207, 226, 246, 0.2)';
      // ctx.fill();
      // ctx.stroke();
    }
  }
