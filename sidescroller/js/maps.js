//arrays that hold all the elements that are drawn by the renderer
const body = []; //non static bodies
const map = []; //all static bodies
const cons = []; //all constaints between a point and a body
const consBB = []; //all constaints between two bodies

function spawn() { //spawns bodies and map elements
  function bodyRect(x, y, width, height, properties) { //speeds up adding reactangles to map array
    body[body.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
  }
  //premade property options
  //Object.assign({}, propsHeavy, propsBouncy, propsNoRotation)      //will combine properties into a new object
  const propsBouncy = {
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 1,
  }
  const propsSlide = {
    friction: 0.01,
    frictionAir: 0.01,
    frictionStatic: 0.1,
    restitution: 0.1,
  }
  const propsOverBouncy = {
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    restitution: 1.05,
  }
  const propsHeavy = {
    density: 0.01 //default density 0.001
  }
  const propsNoRotation = {
    inertia: Infinity, //prevents player rotation
  }

  function constraintPB(x, y, bodyIndex, stiffness) {
    cons[cons.length] = Constraint.create({
      pointA: {
        x: x,
        y: y
      },
      bodyB: body[bodyIndex],
      stiffness: stiffness,
    })
  }

  function constraintBB(bodyIndexA, bodyIndexB, stiffness) {
    consBB[consBB.length] = Constraint.create({
      bodyA: body[bodyIndexA],
      bodyB: body[bodyIndexB],
      stiffness: stiffness,
    })
  }
  function mapRect(x, y, width, height, action, properties) { //addes reactangles to map array
    var len = map.length;
    map[len] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
    if (action) {
      map[len].action = action;
    }
  }

  function mapVertex(x, y, vector, action, properties) { //addes reactangles to map array
    var len = map.length;
    map[len] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
    if (action) map[len].action = action;
  }


  //testingsMap******************************************************************
  //*****************************************************************************
  //*****************************************************************************

  function mapPuzzler1(){
    mech.spawnPos = {
      x: 0,
      y: 600
    };

    //mech.spawnPos = { x: 2205,  y: 803  };
    mech.setPosToSpawn();
    mech.canFire = false;
    mapRect(-1000,900,2200,100)//ground1
    mapRect(-1000,670,500,230)//left ledge
    bodyRect(-800,400,70,70,propsSlide)//cube on left ledge
    bodyRect(200,800,70,70,propsSlide)//cube on ground
    mapRect(400,550,500,350)//right ledge
    bodyRect(790, -300, 100, 900); //huge tall vertical box
    mapRect(1800,900,2000,100)//ground2
    mapRect(2310,890,70,10, 'launch')//launchpad
    mapRect(2400,-300,500,1200)//launch adjacent ledge
    for (let i = 0; i < 10; i++) { //stack of medium hexagons
      body[body.length] = Bodies.polygon(2650, -330 - i * 70, 6, 40, {
        angle: Math.PI / 2,
      });
    }
  }


  //testingsMap******************************************************************
  //*****************************************************************************
  //*****************************************************************************
  function testingsMap(){
    mech.spawnPos = {
      x: 675,
      y: 750
    };
    mech.canFire = true;
    //mech.spawnPos = { x: 0,  y: 0  };
    mech.setPosToSpawn();


  bodyRect(1475, 0, 100, 800); //huge tall vertical box
  bodyRect(800, 438, 250, 10); //long skinny box

  for (let i = 0; i < 10; i++) { //random bouncy circles
    body[body.length] = Bodies.circle(-800 + (0.5 - Math.random()) * 200, 600 + (0.5 - Math.random()) * 200, 7 + Math.ceil(Math.random() * 30), {
      restitution: 0.8,
    })
  }

  for (let i = 0; i < 10; i++) { //stack of medium hexagons
    body[body.length] = Bodies.polygon(-400, 30 - i * 70, 6, 40, {
      angle: Math.PI / 2,
    });
  }

  for (let i = 0; i < 5; i++) { //stairs of boxes taller on left
    for (let j = 0; j < 5 - i; j++) {
      const r = 40;
      body[body.length] = Bodies.rectangle(50 + r / 2 + i * r, 900 - r / 2 - i * r, r, r, {
        restitution: 0.8,
      });
    }
  }
  for (let i = 0; i < 10; i++) { //stairs of boxes taller on right
    for (let j = 0; j < i; j++) {
      const r = 120;
      body[body.length] = Bodies.rectangle(2639 + r / 2 + i * r, 900 + r - i * r, r, r, {
        restitution: 0.6,
        friction: 0.3,
        frictionStatic: 0.9,
      });
    }
  }
  for (let i = 0; i < 12; i++) { //a stack of boxes
    body[body.length] = Bodies.rectangle(936, 700 + i * 21, 25, 21);
  }
  for (let i = 0; i < 12; i++) { //a stack of boxes
    body[body.length] = Bodies.rectangle(464, 700 + i * 21, 25, 21);
  }

  (function newtonsCradle() { //build a newton's cradle
    const x = -600;
    const r = 20;
    const y = 200;
    for (let i = 0; i < 5; i++) {
      body[body.length] = Bodies.circle(x + i * r * 2, 490, r, Object.assign({}, propsHeavy, propsOverBouncy, propsNoRotation));
      constraintPB(x + i * r * 2, 200, body.length - 1, 0.9);
    }
    body[body.length - 1].force.x = 0.02 * body[body.length - 1].mass; //give the last one a kick
  })()
  // body[body.length] = Bodies.circle(0, 570, 20)
  // body[body.length] = Bodies.circle(30, 570, 20)
  // body[body.length] = Bodies.circle(0, 600, 20)
  // constraintBB(body.length - 2, body.length - 3, 0.2)
  // constraintBB(body.length - 2, body.length - 1, 0.2)

  //map statics  **************************************************************
  //***************************************************************************
  mapRect(-2000,900,4000,200)//ground
  mapRect(2600,900,2000,200) //far right ground
  //mapVertex(-1700, 700, '0 0 0 -500 500 -500 1000 -400 1500 0'); //large ramp
  //mapVertex(1285, 867, '200 0  200 100 0 100'); // ramp
  mapVertex(1400, 854, '0 100 600 100 600 0 150 0'); // ramp
  mapVertex(-1300, 670, '0 0 -500 0 -500 200'); //angeled ceiling
  //mapVertex(-1650, 700, '0 0 500 0 500 200'); //angeled ceiling
  //mapRect(1350, 800, 300, 100) //ground
  mapRect(650, 890, 50, 10) //ground bump
  mapRect(-600, 0, 400, 200); //left cave roof
  mapRect(-600, 600, 400, 194); //left cave
  mapRect(-50, 700, 100, 200, 'launch'); //left wall
  mapRect(0, 100, 300, 25); //left high platform
  mapRect(550, 450, 300, 25); //wide platform
  mapRect(650, 250, 100, 25); //wide platform
  mapRect(1000, 450, 400, 25); //platform
  mapRect(1200, 250, 200, 25); //platform
  mapRect(1300, 50, 100, 25); //platform
  mapRect(-350, 885, 20, 20); //ground bump
  mapRect(450,635,500,30); //first platform
}


  //add to the world******************************************************
  //*****************************************************************************
  //*****************************************************************************
  //*****************************************************************************

    testingsMap();
    //mapPuzzler1();


  for (let i = 0; i < body.length; i++) {
    body[i].collisionFilter.group = 1;
    World.add(engine.world, body[i]); //add to world
  }
  for (let i = 0; i < map.length; i++) {
    map[i].collisionFilter.group = -1;
    Matter.Body.setStatic(map[i], true); //make static
    World.add(engine.world, map[i]); //add to world
  }
  for (let i = 0; i < cons.length; i++) {
    World.add(engine.world, cons[i]);
  }
  for (let i = 0; i < consBB.length; i++) {
    World.add(engine.world, consBB[i]);
  }
}
