//arrays that hold all the elements that are drawn by the renderer
const body = []; //non static bodies
const map = []; //all static bodies
const cons = []; //all constaints between a point and a body
const consBB = []; //all constaints between two bodies

function spawn() { //spawns bodies and map elements
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


    //testingsMap******************************************************************
    //*****************************************************************************
    //*****************************************************************************
    function empty() {
        mech.spawnPos = {
            x: 500,
            y: -100
        };
        mech.setPosToSpawn();
        mech.canFire = false;
        mapRect(-4000, 200, 10000, 200) //ground1
        bodyRect(-200, 100, 30, 30) //cube on left ledge
		let pos = {
			x:200,
			y:190
		}
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
		pos.y -= 200
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
		pos.y -= 200
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
		pos.x += 500
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
		pos.y += 200
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
		pos.y += 200
		spawnNPC(pos, true, 4,10,'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving

    }


    function mapPuzzler1() {
        mech.spawnPos = {
            x: 0,
            y: 600
        };
        for (let i = 0; i < 1; i++) {
            spawnNPC(2000 * Math.random() - 500, 500 - 1000 * Math.random());
        }
        //mech.spawnPos = { x: 2205,  y: 803  };
        mech.setPosToSpawn();
        mech.canFire = false;
        mapRect(-1000, 900, 2200, 100) //ground1
        mapRect(-1000, 670, 500, 230) //left ledge
        bodyRect(-800, 400, 70, 70, propsSlide) //cube on left ledge
        bodyRect(200, 800, 70, 70, propsSlide) //cube on ground
        mapRect(400, 550, 500, 350) //right ledge
        bodyRect(790, -300, 100, 900); //huge tall vertical box
        mapRect(1800, 900, 2000, 100) //ground2
        mapRect(2310, 890, 70, 10, 'launch') //launchpad
        mapRect(2400, -300, 500, 1200) //launch adjacent ledge
        for (let i = 0; i < 10; i++) { //stack of medium hexagons
            body[body.length] = Bodies.polygon(2650, -330 - i * 70, 6, 40, {
                angle: Math.PI / 2,
            });
        }
    }


    //testingsMap******************************************************************
    //*****************************************************************************
    //*****************************************************************************
    function testingsMap() {
        mech.spawnPos = {
            x: 725,
            y: 750
        };
        mech.canFire = true;
        //mech.spawnPos = { x: 0,  y: 0  };
        mech.setPosToSpawn();
        //mapRect(1100, 890, 100, 25, 'exit') //ground bump wall
        mapRect(4000, -200, 100, 25, 'exit') //ground bump wall
            //spawn NPCs
        for (let i = 0; i < 2; i++) {
			let pos = {
				x: 5000 * Math.random() - 1500,
				y: -1000 * (Math.random()-0.5)
			}
			spawnNPC(pos, true, 3 + Math.floor(Math.random() * 4), Math.random() * 60 + 20, 'rgba(255,0,255,', ["seePlayerCheck", 'fire']); //nonmoving
        }
		for (let i = 0; i < 10; i++) {
			let pos = {
				x: 5000 * Math.random() - 1500,
				y: -2000 * Math.random()
			}
		    spawnNPC(pos, false, 3 + Math.floor(Math.random() * 4), Math.random() * 60 + 20, 'rgba(0,255,255,', ["seePlayerCheck","fallCheck","attraction"]); //nonmoving
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


    //add to the world******************************************************
    //*****************************************************************************
    //*****************************************************************************
    //*****************************************************************************

    testingsMap();
    //mapPuzzler1();
    //empty();

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
}
