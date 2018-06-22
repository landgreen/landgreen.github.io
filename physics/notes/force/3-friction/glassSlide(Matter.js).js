glassSlide();
function glassSlide() {
  //get id for sliders
  frictionElem = document.getElementById("friction-slider");
  speedElem = document.getElementById("speed-slider");

  //set up canvas
  let canvas = document.getElementById("canvasGlass");
  let ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;

  // module aliases
  let Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Vertices = Matter.Vertices,
    Composites = Matter.Composites,
    Composite = Matter.Composite;

  // create an engine
  let engine = Engine.create();
  let scale = 1;
  let glass = {
    speed: speedElem.value,
    size: 0.3,
    height: 440,
    width: 277,
    scaleBodyH: 0.95,
    scaleBodyW: 0.9,
    friction: frictionElem.value
  };

  //adjust gravity to fit simulation
  engine.world.gravity.scale = 0.000001 * scale;
  engine.world.gravity.y = 9.8 * 100;

  let mass = [];

  canvas.addEventListener("mousedown", function() {
    World.clear(engine.world, true); //clear matter engine, leave static
    mass = []; //clear mass array
    spawnMass(-100, 0, glass.width * glass.size * glass.scaleBodyW, glass.height * glass.size * glass.scaleBodyH);
  });

  spawnMass(-100, 0, glass.width * glass.size * glass.scaleBodyW, glass.height * glass.size * glass.scaleBodyH);
  function spawnMass(xIn, yIn, width, height) {
    //spawn mass
    let i = mass.length;
    mass.push();
    let vector = Vertices.fromPath("0 0   83 0  70 120  55 125  28 125  13 120");
    mass[i] = Matter.Bodies.fromVertices(xIn * scale, canvas.height - (yIn + height * 0.5) * scale, vector, {
      friction: frictionElem.value,
      frictionStatic: 0.5,
      frictionAir: 0.001,
      restitution: 0.5
    });

    Body.setVelocity(mass[i], {
      x: speedElem.value * 5,
      y: 0
    });
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

  //setup image
  base_image = new Image();
  base_image.src = "../../../media/pokal-glass__cropped_alpha.png";
  base_image.onload = function() {
    renderGlass();
  };

  function renderGlass() {
    let bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(renderGlass);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw image
    ctx.save();
    ctx.translate(mass[0].position.x, mass[0].position.y); //move to center of body
    ctx.rotate(mass[0].angle); //rotate to same angle of body
    ctx.drawImage(base_image, (-glass.width / 2) * glass.size, (-glass.height / 2) * glass.size, glass.width * glass.size, glass.height * glass.size); //draw image on center of body
    ctx.restore();
  }
}
