//arrays that hold all the elements that are drawn by the renderer
const body = []; //non static bodies
const map = []; //all static bodies
const cons = []; //all constaints between a point and a body
const consBB = []; //all constaints between two bodies

function spawn() { //spawns bodies and map elements
    //premade property options
    //Object.assign({}, propsHeavy, propsBouncy, propsNoRotation)      //will combine properties into a new object
	const propsFriction = {
		friction: 0.5,
		frictionAir: 0.02,
		frictionStatic: 1,
	}
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
	const propsLight = {
		density: 0.001
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

    //add to the world******************************************************
    //*****************************************************************************
    //*****************************************************************************
    //*****************************************************************************

    //testing();
    //buildings();
	skyscrapers();

    for (let i = 0; i < body.length; i++) {
        //body[i].collisionFilter.group = 0;
        body[i].collisionFilter.category = 0x0000001;
        body[i].collisionFilter.mask = 0x011101;
        World.add(engine.world, body[i]); //add to world
    }
    for (let i = 0; i < map.length; i++) {
        //map[i].collisionFilter.group = 0;
        map[i].collisionFilter.category = 0x000001;
        map[i].collisionFilter.mask = 0x011111;
        Matter.Body.setStatic(map[i], true); //make static
        World.add(engine.world, map[i]); //add to world
    }
    for (let i = 0; i < cons.length; i++) {
        World.add(engine.world, cons[i]);
    }
    for (let i = 0; i < consBB.length; i++) {
        World.add(engine.world, consBB[i]);
    }

    //map and body functions***********************************************************
    //*********************************************************************************
    //*********************************************************************************
    //*********************************************************************************
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

    function bodyRect(x, y, width, height, properties) { //speeds up adding reactangles to map array
        body[body.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
    }

    function bodyVertex(x, y, vector, properties) { //addes shape to body array
        body[body.length] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
    }

    function mapRect(x, y, width, height, action, properties) { //addes reactangles to map array
        var len = map.length;
        map[len] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
        if (action) {
            map[len].action = action;
        }
    }

    function mapVertex(x, y, vector, action, properties) { //addes shape to map array
        var len = map.length;
        map[len] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
        if (action) map[len].action = action;
    }
    //complex map templates
    function spawnBuilding(x, y, w, h, noDoors,walledSide) {
        mapRect(x, y, w, 25); //roof
        mapRect(x, y + h, w, 20); //ground
		if (walledSide ==='left'){
			mapRect(x, y, 25, h); //wall left
		} else{
        	mapRect(x, y, 25, h - 150); //wall left
			if (!noDoors){
				bodyRect(x + 5, y + h - 150, 15, 150,propsFriction); //door left
			}
		}
		if (walledSide === 'right'){
        	mapRect(x - 25 + w, y, 25, h); //wall right
		}else{
			mapRect(x - 25 + w, y, 25, h - 150); //wall right
			if (!noDoors){
				bodyRect(x + w - 20, y + h - 150, 15, 150,propsFriction); //door right
			}
		}
    }

    //basic mob templates**************************************************************
    //*********************************************************************************
    //*********************************************************************************
    //*********************************************************************************
    function spawnShooter(x, y, radius) { //size 50
        spawnNPC(x, y, 3, radius, 'rgba(215,100,215,', 0, ["seePlayerCheck", 'fireAt']);
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 20; //memory+memory*Math.random()
    }

    function spawnChaser(x, y, radius) {
        spawnNPC(x, y, 4, radius, 'rgba(110,150,200,', 0.0012, ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
    }

    function spawnHopper(x, y, radius) {
        spawnNPC(x, y, 4, radius, 'rgba(0,200,150,', 0.07, ['gravity', "seePlayerCheck", "fallCheck", "hop"]);
        mob[mob.length - 1].g = 0.002; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.04;
        mob[mob.length - 1].memory = 60; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 0;
    }

    function spawnStriker(x, y, radius) {
        spawnNPC(x, y, 5, radius, 'rgba(221,102,119,', 0.0004, ["seePlayerCheck", "attraction", 'gravity', "fallCheck", 'strike']);
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
		Matter.Body.rotate(mob[mob.length - 1], Math.PI*0.1)
    }

    function spawnGhoster(x, y, radius) {
        spawnNPC(x, y, 0, radius, 'rgba(255,255,0,', 0.00007, ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].memory = 720; //memory+memory*Math.random()
        //mob[mob.length - 1].frictionAir = 0.001;
    }

    function spawnBlinker(x, y, radius) {
        spawnNPC(x, y, 0, radius, 'rgba(150,150,255,', 0, ["seePlayerCheck", "fallCheck", 'blink', 'strike']);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
    }

    function spawnSneakAttacker(x, y, radius) {
        spawnNPC(x, y, 6, radius, 'rgba(235,235,235,', 0.001, ['gravity', "fallCheck", 'sneakAttack']);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        //mob[mob.length - 1].memory = 120; //memory+memory*Math.random()
        mob[mob.length - 1].collisionFilter.mask = 0x001001; //can't be hit by bullets
		Matter.Body.rotate(mob[mob.length - 1], Math.PI*0.17)
        //mob[mob.length - 1].frictionAir = 0.001;
    }

    //********Maps*****************************************************************
    //*****************************************************************************
    //*****************************************************************************
	function skyscrapers() {
        mech.setPosToSpawn(-50, -100); //normal spawn
		//mech.setPosToSpawn(1550, -1200); //spawn left high
		//mech.setPosToSpawn(2750, -2100); //spawn near exit

		mapRect(-500, 0, 5600, 100); //***********ground
		mapRect(-300, -350, 50, 400); //far left starting left wall
		mapRect(-300, -10, 500, 20); //far left starting ground
		mapRect(-300, -350, 500, 50); //far left starting ceiling
		mapRect(150, -350, 50, 200); //far left starting right part of wall
		bodyRect(170, -130, 14, 140, propsFriction); //door to starting room
		spawnChaser(0, -390, 50);  //above starting room
		//spawnSneakAttacker(0, -390, 50);  //above starting room


		//mapRect(4700, -300, 150, 400); //far right ground wall
		mapRect(475, -15, 100, 25, 'launch'); //next to first tall building
		spawnHopper(1300, -20, 20); //hiding underplatorm

		mapRect(700, -1100, 400, 990); //far left building
		//bodyRect(900, -1350, 50, 350); //block on far left building
		bodyRect(1025, -1110, 400, 10); //block on far left building
		bodyRect(1550, -1110, 250, 10); //block on far left building

		mapRect(1600, -400, 1500, 500); //long center building
		spawnHopper(1650, -450, 30); //hiding underplatorm
		spawnHopper(1750, -450, 40); //hiding underplatorm
		spawnHopper(1850, -450, 20); //hiding underplatorm
		bodyRect(2557, -450, 35,55); //wall before chasers
		bodyRect(2957, -450, 30,15); //wall before chasers
		bodyRect(2900, -450, 60,45); //wall before chasers


		mapRect(1345, -1100, 250, 25); //left platform
		mapRect(1755, -1100, 250, 25); //right platform
		bodyRect(1915, -1200, 60,100); //block on platform

		mapRect(1300, -1850, 750, 50); //left higher platform
		mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
		mapRect(1300, -2150, 450, 50); //left higher platform roof
		mapRect(1500, -1860, 100, 50, 'exit'); //ground bump wall

		mapRect(2400, -850, 600, 300); //center floating large square
		spawnChaser(2430, -900, 30);
		bodyRect(2500, -1100, 25,250); //wall before chasers
		spawnChaser(2700, -950, 75);
		spawnChaser(2700, -1060, 40);
		spawnChaser(2800, -950, 85);
		bodyRect(2925, -1100, 25,250); //wall next to chasers
		mapRect(2500, -1450, 450, 350); //higher center floating large square
		mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
		mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
		spawnStriker(2650,-1500,50); //on higher center floating large square
		bodyRect(2300, -1720, 400,20); //platform above striker

		bodyRect(2570, -1800, 20,20); //block on platform above striker
		bodyRect(2590, -1800, 20,20); //block on platform above striker
		bodyRect(2550, -1800, 20,20); //block on platform above striker
		bodyRect(2570, -1820, 20,20); //block on platform above striker
		bodyRect(2590, -1820, 20,20); //block on platform above striker

		spawnHopper(3200, -40, 40); //on ground far right
		spawnHopper(4450, -20, 20); //on ground far right
		mapRect(3300, -850, 150, 25); //ledge by far right building
		mapRect(3300, -1350, 150, 25); //higher ledge by far right building
		mapRect(3600, -1100, 400, 990); //far right building
		bodyRect(3850, -1250, 130,170); //block on far right building
		mapRect(4150, -15, 100, 25, 'launch'); //far right

		mapRect(4500, -800, 400, 850); //far right building
    }

    function buildings() {
        mech.setPosToSpawn(0, -100);
        //mech.setPosToSpawn(3000,-900); //spawn near exit for testing
        mapRect(-1000, 0, 5100, 500); //***********ground
        //mapRect(-1000,-1000, 5100, 100); //ceiling
        //mapRect(-1000,-1000, 100, 1100); //main left wall
        //mapRect(4000,-1000, 100, 1100); //main right wall

        spawnBuilding(-300, -250, 600, 240) //first floor  player spawns in side
        spawnBuilding(-200, -500, 400, 240) //second floor
        //mapRect(-1000, -150, 400, 200); //far left block higher ground
		mapVertex(-844, -50, '0 0 0 -150 200 -150 400 0')
		bodyRect(50, -600, 50, 100); //block on top of buildings

        spawnShooter(650, -600, 50) //near entrance high up

		spawnBuilding(700, -400, 1400, 390, true) //long building
		body[body.length] = Bodies.circle(1400, -240, 20);
		constraintPB(1400, -375, body.length - 1, 0.9,propsNoRotation); //hanging ball
		mapRect(700, -185, 85, 25); //ledge for sneak attackers inside building
		mapRect(1250, -80, 300, 100); //table inside long building
		spawnSneakAttacker(750, -230, 30) //inside long center building
		mapRect(2015, -185, 85, 25); //ledge for sneak attackers inside building
		spawnSneakAttacker(2035, -230, 30) //inside long center building
        for (let i = 0; i < 9; i++) {//some random blocks on the roof
            const size = 20 + Math.round(Math.random() * Math.random() * 300);
            bodyRect(900 + 100 * i + Math.random() * 100, -600, size+Math.round(Math.random()*50), size+Math.round(Math.random()*50));
        }

        mapRect(2700, -100, 1400, 150); //far right block higher ground
        mapRect(3100, -200, 1000, 150); //far right block higher ground
		spawnBuilding(3500, -500, 500, 290, true, 'right') //building around exit at the far right
		mapRect(3700, -220, 100, 25, 'exit') //ground bump wall
		spawnChaser(-850, -190, 30) //far left on ground
        spawnHopper(3150, -250, 75) //near exit on ground
        spawnHopper(3000, -150, 100) //near exit on ground
        spawnHopper(3700, -300, 50) //near exit on ground
		spawnGhoster(1000, -1800, 100) //near exit high up
        spawnShooter(3600, -600, 50) //near entrance high up
    }

    function testingsMap() {
        mech.setPosToSpawn(725, 750);
        mapRect(4000, -200, 100, 25, 'exit') //ground bump wall
        for (let i = 0; i < 4; i++) { //spawn blinkers
            spawnHopper(5000 * Math.random() - 1500, -2000 * Math.random(), 20);
        }

        for (let i = 0; i < 5; i++) { //random bouncy circles
            body[body.length] = Bodies.circle(-800 + (0.5 - Math.random()) * 200, 400 + (0.5 - Math.random()) * 200, 7 + Math.ceil(Math.random() * 30), {
                restitution: 0.5,
            })
        }

        for (let i = 0; i < 3; i++) { //stack of medium hexagons
            body[body.length] = Bodies.polygon(-400, 30 - i * 70, 6, 40, {
                angle: Math.PI / 2,
            });
        }

        for (let i = 0; i < 5; i++) { //stairs of boxes taller on left
            for (let j = 0; j < 5 - i; j++) {
                const r = 40;
                body[body.length] = Bodies.rectangle(50 + r / 2 + i * r, 900 - r / 2 - i * r, r, r);
            }
        }
        for (let i = 0; i < 10; i++) { //stairs of boxes taller on right
            for (let j = 0; j < i; j++) {
                const r = 120;
                body[body.length] = Bodies.rectangle(2639 + r / 2 + i * r, 900 + r - i * r, r, r);
            }
        }
        for (let i = 0; i < 12; i++) { //a stack of boxes
            body[body.length] = Bodies.rectangle(1036, 700 + i * 21, 25, 21);
        }
        for (let i = 0; i < 12; i++) { //a stack of boxes
            body[body.length] = Bodies.rectangle(364, 700 + i * 21, 25, 21);
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
        mapRect(-2000, 900, 3200, 100) //ground


        mapRect(2200, 900, 2000, 100) //far right ground
        mapRect(2300, 870, 50, 40) //ground bump
            //mapVertex(-1700, 700, '0 0 0 -500 500 -500 1000 -400 1500 0'); //large ramp
            //mapVertex(1285, 867, '200 0  200 100 0 100'); // ramp
            //mapVertex(1400, 854, '0 100 600 100 600 0 150 0'); // ramp
        mapVertex(-1300, 670, '0 0 -500 0 -500 200'); //angeled ceiling
        //mapVertex(-1650, 700, '0 0 500 0 500 200'); //angeled ceiling
        //mapRect(1350, 800, 300, 100) //ground
        //mapRect(1170, 875, 30, 35) //ground bump wall
        mapRect(700, 890, 50, 20) //ground bump
        mapRect(-600, 0, 400, 200); //left cave roof
        mapRect(-600, 600, 400, 200); //left cave
        //mapRect(-50, 700, 100, 200, 'launch'); //left wall
        mapRect(-50, 700, 100, 200); //left wall
        //mapRect(50, 100, 300, 25); //left high platform
        mapRect(650, 450, 200, 25); //wide platform
        mapRect(750, 250, 100, 25); //high platform
        mapRect(1000, 450, 400, 25); //platform
        mapRect(1200, 250, 200, 25); //platform
        Matter.Body.setAngle(map[map.length - 1], -Math.PI * 0.05)
        mapRect(1300, 50, 100, 25); //platform
        mapRect(1800, 50, 300, 25); //platform
        mapRect(1600, 250, 300, 25); //platform

        mapRect(2200, 150, 300, 400); //platform


        //mapRect(-350, 885, 20, 20); //ground bump
        mapRect(350, 635, 700, 30); //first platform

        mapRect(50, 150, 400, 50); //thick wall above launcher
        mapRect(50, 450, 400, 80); //thick wall above launcher

        //lower level
        mapRect(-600, 2000, 3000, 100) // lower ground
        mapRect(1300, 1990, 100, 25, 'launch') //ground bump wall
        mapRect(-600, 1300, 400, 200); //left cave roof

        mapRect(-600, 1700, 400, 200); //left cave
        //bodyRect(120, -150, 130, 200); //medium block on first platform
        //bodyRect(360, 450, 130, 150); //medium block on second right platform
        bodyRect(1700, 0, 100, 1100); //huge tall vertical box
        Matter.Body.setAngle(body[body.length - 1], -Math.PI * 0.35)
        bodyRect(800, 438, 250, 10); //long skinny box
        bodyRect(250, 250, 130, 200); //block inside the ledge
        //bodyVertex(-1000, 700, '0 200 -500 200  0 0'); //angeled ceiling
    }
}
