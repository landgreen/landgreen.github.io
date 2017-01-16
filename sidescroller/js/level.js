//global game variables
const body = []; //non static bodies
const map = []; //all static bodies
const cons = []; //all constaints between a point and a body
const consBB = []; //all constaints between two bodies

//main object for spawning levels**************************************************
//*********************************************************************************
const level = {
    //map body templates**************************************************************
    //*********************************************************************************
    constraintPB: function(x, y, bodyIndex, stiffness) {
        cons[cons.length] = Constraint.create({
            pointA: {
                x: x,
                y: y
            },
            bodyB: body[bodyIndex],
            stiffness: stiffness,
        })
    },
    constraintBB: function(bodyIndexA, bodyIndexB, stiffness) {
        consBB[consBB.length] = Constraint.create({
            bodyA: body[bodyIndexA],
            bodyB: body[bodyIndexB],
            stiffness: stiffness,
        })
    },
    bodyRect: function(x, y, width, height, properties) { //speeds up adding reactangles to map array
        body[body.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
    },
    bodyVertex: function(x, y, vector, properties) { //addes shape to body array
        body[body.length] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
    },
    mapRect: function(x, y, width, height, action, properties) { //addes reactangles to map array
        var len = map.length;
        map[len] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
        if (action) {
            map[len].action = action;
        }
    },
    mapVertex: function(x, y, vector, action, properties) { //addes shape to map array
        var len = map.length;
        map[len] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
        if (action) map[len].action = action;
    },
    //complex map templates
    spawnBuilding: function(x, y, w, h, noDoors, walledSide) {
        this.mapRect(x, y, w, 25); //roof
        this.mapRect(x, y + h, w, 20); //ground
        if (walledSide === 'left') {
            this.mapRect(x, y, 25, h); //wall left
        } else {
            this.mapRect(x, y, 25, h - 150); //wall left
            if (!noDoors) {
                this.bodyRect(x + 5, y + h - 150, 15, 150, this.propsFriction); //door left
            }
        }
        if (walledSide === 'right') {
            this.mapRect(x - 25 + w, y, 25, h); //wall right
        } else {
            this.mapRect(x - 25 + w, y, 25, h - 150); //wall right
            if (!noDoors) {
                this.bodyRect(x + w - 20, y + h - 150, 15, 150, this.propsFriction); //door right
            }
        }
    },
    //basic mob templates**************************************************************
    //*********************************************************************************
    //*********************************************************************************
    //*********************************************************************************
    spawnShooter: function(x, y, radius) { //size 50
        mobs.spawn(x, y, 3, radius, 'rgba(215,100,215,', 0, ["seePlayerCheck", 'fireAt']);
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 20; //memory+memory*Math.random()
    },
    spawnChaser: function(x, y, radius) {
        mobs.spawn(x, y, 4, radius, 'rgba(110,150,200,', 0.0012, ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
    },
    spawnHopper: function(x, y, radius) {
        mobs.spawn(x, y, 4, radius, 'rgba(0,200,150,', 0.07, ['gravity', "seePlayerCheck", "fallCheck", "hop"]);
        mob[mob.length - 1].g = 0.002; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.04;
        mob[mob.length - 1].memory = 60; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 0;
    },
    spawnStriker: function(x, y, radius) {
        mobs.spawn(x, y, 5, radius, 'rgba(221,102,119,', 0.0004, ["seePlayerCheck", "attraction", 'gravity', "fallCheck", 'strike']);
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.1)
    },
    spawnGhoster: function(x, y, radius) {
        mobs.spawn(x, y, 0, radius, 'rgba(255,255,0,', 0.00007, ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].memory = 720; //memory+memory*Math.random()
        //mob[mob.length - 1].frictionAir = 0.001;
    },
    spawnBlinker: function(x, y, radius) {
        mobs.spawn(x, y, 0, radius, 'rgba(150,150,255,', 0, ["seePlayerCheck", "fallCheck", 'blink', 'strike']);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
    },
    spawnSneakAttacker: function(x, y, radius) {
        mobs.spawn(x, y, 6, radius, 'rgba(235,235,235,', 0.001, ['gravity', "fallCheck", 'sneakAttack']);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        //mob[mob.length - 1].memory = 120; //memory+memory*Math.random()
        mob[mob.length - 1].collisionFilter.mask = 0x001001; //can't be hit by bullets
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.17)
            //mob[mob.length - 1].frictionAir = 0.001;
    },
    //premade property options
    //Object.assign({}, propsHeavy, propsBouncy, propsNoRotation)      //will combine properties into a new object
    propsFriction: {
        friction: 0.5,
        frictionAir: 0.02,
        frictionStatic: 1,
    },
    propsBouncy: {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1,
    },
    propsSlide: {
        friction: 0.01,
        frictionAir: 0.01,
        frictionStatic: 0.1,
        restitution: 0.1,
    },
    propsLight: {
        density: 0.001
    },
    propsOverBouncy: {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1.05,
    },
    propsHeavy: {
        density: 0.01 //default density is 0.001
    },
    propsNoRotation: {
        inertia: Infinity, //prevents player rotation
    },
	clearLevel: function(){
		//World.clear(engine.world, );
		//body = [];
		let len = map.length
		for(let i =0; i<len;i++){
			Matter.World.remove(engine.world, map[i]);
			map.splice(i, 1);
		}
		len = body.length;
		for(let i =0; i<len;i++){
			Matter.World.remove(engine.world, body[i]);
			body.splice(i, 1);
		}
		len = mob.length;
		for(let i =0; i<len;i++){
			Matter.World.remove(engine.world, mob[i]);
			mob.splice(i, 1);
		}
	},
    addToWorld: function(mapName) { //needs to be run to put bodies into the world
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
    },
	//maps*****************************************************************
	//**********************************************************************
	//**********************************************************************
	//**********************************************************************
    skyscrapers: function() {
        //mech.setPosToSpawn(-50, -100); //normal spawn
        //mech.setPosToSpawn(1550, -1200); //spawn left high
        mech.setPosToSpawn(1800, -2000); //spawn near exit

        this.mapRect(-500, 0, 5600, 100); //***********ground
        this.mapRect(-300, -350, 50, 400); //far left starting left wall
        this.mapRect(-300, -10, 500, 50); //far left starting ground
        this.mapRect(-300, -350, 500, 50); //far left starting ceiling
        this.mapRect(150, -350, 50, 200); //far left starting right part of wall
        this.bodyRect(170, -130, 14, 140, this.propsFriction); //door to starting room
        this.spawnChaser(0, -390, 50); //above starting room
        //spawnSneakAttacker(0, -390, 50);  //above starting room


        //mapRect(4700, -300, 150, 400); //far right ground wall
        this.mapVertex(525, 29.5, '-50 -40 50 -40 120 40 -120 40', 'launch');
        //mapRect(475, -15, 100, 25, 'launch'); //next to first tall building
        this.spawnHopper(1300, -20, 20); //hiding underplatorm

        this.mapRect(700, -1100, 400, 990); //far left building
        //bodyRect(900, -1350, 50, 350); //block on far left building
        this.bodyRect(1025, -1110, 400, 10); //block on far left building
        this.bodyRect(1550, -1110, 250, 10); //block on far left building

        this.mapRect(1600, -400, 1500, 500); //long center building
        this.spawnHopper(1650, -450, 30); //hiding underplatorm
        this.spawnHopper(1750, -450, 40); //hiding underplatorm
        this.spawnHopper(1850, -450, 20); //hiding underplatorm
        this.bodyRect(2557, -450, 35, 55); //wall before chasers
        this.bodyRect(2957, -450, 30, 15); //wall before chasers
        this.bodyRect(2900, -450, 60, 45); //wall before chasers


        this.mapRect(1345, -1100, 250, 25); //left platform
        this.mapRect(1755, -1100, 250, 25); //right platform
        this.bodyRect(1915, -1200, 60, 100); //block on platform

        this.mapRect(1300, -1850, 750, 50); //left higher platform
        this.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
        this.mapRect(1300, -2150, 450, 50); //left higher platform roof
        this.mapRect(1500, -1860, 100, 50, 'exit'); //ground bump wall

        this.mapRect(2400, -850, 600, 300); //center floating large square
        this.spawnChaser(2430, -900, 30);
        this.bodyRect(2500, -1100, 25, 250); //wall before chasers
        this.spawnChaser(2700, -950, 75);
        this.spawnChaser(2700, -1060, 40);
        this.spawnChaser(2800, -950, 85);
        this.bodyRect(2925, -1100, 25, 250); //wall next to chasers
        this.mapRect(2500, -1450, 450, 350); //higher center floating large square
        this.mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
        this.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
        this.spawnStriker(2650, -1500, 50); //on higher center floating large square
        this.bodyRect(2300, -1720, 400, 20); //platform above striker

        this.bodyRect(2570, -1800, 20, 20); //block on platform above striker
        this.bodyRect(2590, -1800, 20, 20); //block on platform above striker
        this.bodyRect(2550, -1800, 20, 20); //block on platform above striker
        this.bodyRect(2570, -1820, 20, 20); //block on platform above striker
        this.bodyRect(2590, -1820, 20, 20); //block on platform above striker

        this.spawnHopper(3200, -40, 40); //on ground far right
        this.spawnHopper(4450, -20, 20); //on ground far right
        this.mapRect(3300, -850, 150, 25); //ledge by far right building
        this.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
        this.mapRect(3600, -1100, 400, 990); //far right building
        this.bodyRect(3850, -1250, 130, 170); //block on far right building
        this.mapVertex(4200, 29.5, '-50 -40 50 -40 120 40 -120 40', 'launch');
        //mapRect(4150, -15, 100, 25, 'launch'); //far right

        this.mapRect(4500, -800, 600, 850); //far far right building
    },
	//**********************************************************************
	//**********************************************************************
    buildings: function() {
        //mech.setPosToSpawn(0, -100);
        mech.setPosToSpawn(3900,-400); //spawn near exit for testing

        this.mapRect(-1000, 0, 5100, 500); //***********ground
        //mapRect(-1000,-1000, 5100, 100); //ceiling
        //mapRect(-1000,-1000, 100, 1100); //main left wall
        //mapRect(4000,-1000, 100, 1100); //main right wall

        this.spawnBuilding(-300, -250, 600, 240) //first floor  player spawns in side
        this.spawnBuilding(-200, -500, 400, 240) //second floor
            //mapRect(-1000, -150, 400, 200); //far left block higher ground
        this.mapVertex(-844, -50, '0 0 0 -150 200 -150 400 0')
        this.bodyRect(50, -600, 50, 100); //block on top of buildings

        this.spawnShooter(650, -600, 50) //near entrance high up

        this.spawnBuilding(700, -400, 1400, 390, true) //long building
        body[body.length] = Bodies.circle(1400, -240, 20);
        this.constraintPB(1400, -375, body.length - 1, 0.9, this.propsNoRotation); //hanging ball
        this.mapRect(700, -185, 85, 25); //ledge for sneak attackers inside building
        this.mapRect(1250, -80, 300, 100); //table inside long building
        this.spawnSneakAttacker(750, -230, 30) //inside long center building
        this.mapRect(2015, -185, 85, 25); //ledge for sneak attackers inside building
        this.spawnSneakAttacker(2035, -230, 30) //inside long center building
        for (let i = 0; i < 9; i++) { //some random blocks on the roof
            const size = 20 + Math.round(Math.random() * Math.random() * 300);
            this.bodyRect(900 + 100 * i + Math.random() * 100, -600, size + Math.round(Math.random() * 50), size + Math.round(Math.random() * 50));
        }

        this.mapRect(2700, -100, 1400, 150); //far right block higher ground
        this.mapRect(3100, -200, 1000, 150); //far right block higher ground
        this.spawnBuilding(3500, -500, 500, 290, true, 'right') //building around exit at the far right
        this.mapRect(3700, -220, 100, 25, 'exit') //ground bump wall
        this.spawnChaser(-850, -190, 30) //far left on ground
        //this.spawnHopper(3150, -250, 75) //near exit on ground
        //this.spawnHopper(3000, -150, 100) //near exit on ground
        //this.spawnHopper(3700, -300, 50) //near exit on ground
        this.spawnGhoster(1000, -1800, 100) //near exit high up
        this.spawnShooter(3600, -600, 50) //near entrance high up
    },
	//**********************************************************************
	//**********************************************************************
    testing: function() {
        mech.setPosToSpawn(725, 750);
        this.mapRect(4000, -200, 100, 25, 'exit') //ground bump wall
        for (let i = 0; i < 4; i++) {
            this.spawnHopper(5000 * Math.random() - 1500, -2000 * Math.random(), 20);
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
        const x = -600;
        const r = 20;
        const y = 200;
        for (let i = 0; i < 5; i++) {
            body[body.length] = Bodies.circle(x + i * r * 2, 490, r, Object.assign({}, this.propsHeavy, this.propsOverBouncy, this.propsNoRotation));
            this.constraintPB(x + i * r * 2, 200, body.length - 1, 0.9);
        }
        body[body.length - 1].force.x = 0.02 * body[body.length - 1].mass; //give the last one a kick
        this.mapRect(-2000, 900, 3200, 100) //ground
        this.mapRect(2200, 900, 2000, 100) //far right ground
        this.mapRect(2300, 870, 50, 40) //ground bump
        this.mapVertex(-1300, 670, '0 0 -500 0 -500 200'); //angeled ceiling
        this.mapRect(700, 890, 50, 20) //ground bump
        this.mapRect(-600, 0, 400, 200); //left cave roof
        this.mapRect(-600, 600, 400, 200); //left cave
        this.mapRect(-50, 700, 100, 200); //left wall
        this.mapRect(650, 450, 200, 25); //wide platform
        this.mapRect(750, 250, 100, 25); //high platform
        this.mapRect(1000, 450, 400, 25); //platform
        this.mapRect(1200, 250, 200, 25); //platform
        Matter.Body.setAngle(map[map.length - 1], -Math.PI * 0.05)
        this.mapRect(1300, 50, 100, 25); //platform
        this.mapRect(1800, 50, 300, 25); //platform
        this.mapRect(1600, 250, 300, 25); //platform
        this.mapRect(2200, 150, 300, 400); //platform
        this.mapRect(350, 635, 700, 30); //first platform
        this.mapRect(50, 150, 400, 50); //thick wall above launcher
        this.mapRect(50, 450, 400, 80); //thick wall above launcher
        this.mapRect(-600, 2000, 3000, 100) // lower ground
        this.mapRect(1300, 1990, 100, 25, 'launch') //ground bump wall
        this.mapRect(-600, 1300, 400, 200); //left cave roof
        this.mapRect(-600, 1700, 400, 200); //left cave
        this.bodyRect(1700, 0, 100, 1100); //huge tall vertical box
        Matter.Body.setAngle(body[body.length - 1], -Math.PI * 0.35)
        this.bodyRect(800, 438, 250, 10); //long skinny box
        this.bodyRect(250, 250, 130, 200); //block inside the ledge
    },
}
