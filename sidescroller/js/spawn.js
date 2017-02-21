//main object for spawning things in a level
const spawn = {
    randomMob: function(x, y, num = 1) {
        const size = 30 + Math.ceil(Math.random() * 40)
        switch (Math.ceil(Math.random() * 13)) {
            case 1:
                for (let i = 0; i < num; ++i) {
                    this.shooter(x + size * 3 * i, y, size);
                }
                break;
            case 2:
                for (let i = 0; i < num; ++i) {
                    this.springer(x + size * 3 * i, y, size);
                }
                break;
            case 3:
                for (let i = 0; i < num; ++i) {
                    this.chaser(x + size * 3 * i, y, size);
                }
                break;
            case 4:
                for (let i = 0; i < num; ++i) {
                    this.chaseShooter(x + size * 3 * i, y, size);
                }
                break;
            case 5:
                for (let i = 0; i < num; ++i) {
                    this.hopper(x + size * 3 * i, y, size);
                }
                break;
            case 6:
                for (let i = 0; i < num; ++i) {
                    this.burster(x + size * 3 * i, y, size);
                }
                break;
            case 7:
                for (let i = 0; i < num; ++i) {
                    this.puller(x + size * 3 * i, y, size);
                }
                break;
            case 8:
                for (let i = 0; i < num; ++i) {
                    this.laserer(x + size * 3 * i, y, size * 0.4);
                }
                break;
            case 9:
                for (let i = 0; i < num; ++i) {
                    this.striker(x + size * 3 * i, y, size * 0.8);
                }
                break;
            case 10:
                for (let i = 0; i < num; ++i) {
                    this.ghoster(x + size * 3 * i, y, size * 2.3);
                }
                break;
            case 11:
                for (let i = 0; i < num; ++i) {
                    this.blinker(x + size * 3 * i, y, size * 1.8);
                }
                break;
            case 12:
                for (let i = 0; i < num; ++i) {
                    this.sneakAttacker(x, y, size * 0.5);
                }
                break;
			case 13:
				for (let i = 0; i < num; ++i) {
					this.heavyChaser(x, y, size * 1.3);
				}
				break;
        }
    },
    randomBoss: function(x, y) {
        const elasticity = Math.random() * 0.07 + 0.01;
        const nodes = Math.ceil(Math.random() * 3) + 4;
        const distance = Math.ceil(Math.random() * 100) + 70
        const size = Math.ceil(Math.random() * 10) + 17
        switch (Math.ceil(Math.random() * 5)) {
            case 1:
                this.nodeBoss(x, y, nodes - 1, size - 5, distance, elasticity, 'striker');
                break;
            case 2:
                this.nodeBoss(x, y, nodes, size, distance, elasticity, 'chaser');
                break;
            case 3:
                this.nodeBoss(x, y, nodes, size, distance, elasticity, 'burster');
                break;
            case 4:
                this.nodeBoss(x, y, nodes - 1, size * 0.6, distance * 0.6, elasticity, 'laserer');
                break;
            case 5:
                this.nodeBoss(x, y, nodes, size + 15, distance, elasticity, 'ghoster');
                break;
        }
    },
    randomSmallMobs: function(x, y, num = 1) {
        const size = 10 + Math.ceil(Math.random() * 30)
        switch (Math.ceil(Math.random() * 10)) {
            case 1:
                for (let i = 0; i < num; ++i) {
                    this.sneakAttacker(x + size * 2.5 * i, y, size * 0.7);
                }
                break;
            case 2:
                for (let i = 0; i < num; ++i) {
                    this.springer(x + size * 2.5 * i, y, size);
                }
                break;
            case 3:
                for (let i = 0; i < num; ++i) {
                    this.chaser(x + size * 2.5 * i, y, size);
                }
                break;
            case 4:
                for (let i = 0; i < num; ++i) {
                    this.chaseShooter(x + size * 2.5 * i, y, size);
                }
                break;
            case 5:
                for (let i = 0; i < num; ++i) {
                    this.hopper(x + size * 2.5 * i, y, size);
                }
                break;
            case 6:
                for (let i = 0; i < num; ++i) {
                    this.burster(x + size * 2.5 * i, y, size);
                }
                break;
            case 7:
                for (let i = 0; i < num; ++i) {
                    this.puller(x + size * 2.5 * i, y, size);
                }
                break;
            case 8:
                for (let i = 0; i < num; ++i) {
                    this.laserer(x + size * 2.5 * i, y, size * 0.7);
                }
                break;
            case 9:
                for (let i = 0; i < num; ++i) {
                    this.striker(x + size * 2.5 * i, y, size * 0.8);
                }
                break;
			case 10:
				for (let i = 0; i < num; ++i) {
					this.heavyChaser(x + size * 2.5 * i, y, size * 1.2);
				}
				break;
        }
    },


    //basic mob templates**********************************************************************************************************
    //*****************************************************************************************************************************
    shooter: function(x, y, radius = 50) { //size 50
        mobs.spawn(x, y, 3, radius, 'rgba(215,100,215,', ["seePlayerCheck", 'fireAt']);
        mob[mob.length - 1].isStatic = true;
		mob[mob.length - 1].seePlayerFreq = 59;
        mob[mob.length - 1].memory = 20; //memory+memory*Math.random()
        mob[mob.length - 1].fireDelay = 30;
    },
    springer: function(x, y, radius = 50) {
        const index = mob.length
        mobs.spawn(x, y, 0, radius, 'rgba(223,2,58,', ['gravity', "seePlayerCheck", "fallCheck"]);
        mob[index].g = 0.0005; //required if using 'gravity'
        mob[index].accelMag = 0.0012;
        mob[index].memory = 240; //memory+memory*Math.random() in cycles
        mob[index].seePlayerFreq = 120;
        cons[cons.length] = Constraint.create({
            pointA: mob[index].seePlayer.position,
            bodyB: mob[index],
            stiffness: 0.001,
        })
        cons[cons.length - 1].length = 0;

    },
    chaser: function(x, y, radius = 50) {
        mobs.spawn(x, y, 4, radius, 'rgba(110,150,200,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0012;
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
    },
	heavyChaser: function(x, y, radius = 70) {
		mobs.spawn(x, y, 4, radius, 'rgba(55,80,255,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
		mob[mob.length - 1].g = 0.002; //required if using 'gravity'
		mob[mob.length - 1].accelMag = 0.00206;
		mob[mob.length - 1].memory = 140; //memory+memory*Math.random() in cycles
		//mob[mob.length - 1].seePlayerFreq = 97;
	},
    chaseShooter: function(x, y, radius = 50) {
        mobs.spawn(x, y, 3, radius, 'rgba(140,100,250,', ['gravity', "seePlayerCheck", "fallCheck", 'fireAt', "attraction"]);
        mob[mob.length - 1].accelMag = 0.0002;
        mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.0002;
        mob[mob.length - 1].memory = 180; //memory+memory*Math.random() in cycles
        mob[mob.length - 1].fireDelay = 90;
        mob[mob.length - 1].faceOnFire = false; //prevents rotation on fire
    },
    hopper: function(x, y, radius = 50) {
        mobs.spawn(x, y, 4, radius, 'rgba(0,200,150,', ['gravity', "seePlayerCheck", "fallCheck", "burstAttraction"]);
        mob[mob.length - 1].accelMag = 0.07;
        mob[mob.length - 1].g = 0.002; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.04;
        //mob[mob.length - 1].memory = 60; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 0;
        mob[mob.length - 1].delay = 80;
    },
    burster: function(x, y, radius = 50) {
        mobs.spawn(x, y, 6, radius, 'rgba(0,200,180,', ["seePlayerCheck", "fallCheck", "burstAttraction"]);
        mob[mob.length - 1].accelMag = 0.1;
        mob[mob.length - 1].frictionAir = 0.02;
        //mob[mob.length - 1].memory = 240; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 1;
        mob[mob.length - 1].delay = 140;
    },
    puller: function(x, y, radius = 50) {
        mobs.spawn(x, y, 7, radius, 'rgba(0,10,30,', ['gravity', "seePlayerCheck", "fallCheck", "attraction", 'pullPlayer']);
        mob[mob.length - 1].delay = 360;
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0003;
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
    },
    laserer: function(x, y, radius = 15) {
        mobs.spawn(x, y, 4, radius, 'rgba(255,0,170,', ["seePlayerCheck", "attraction", 'repulsion', "fallCheck", 'laser']);
        mob[mob.length - 1].repulsionRange = 300000; //squared
        mob[mob.length - 1].seePlayerFreq = 3;
        mob[mob.length - 1].accelMag = 0.0006;
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
    },
    striker: function(x, y, radius = 25) {
        mobs.spawn(x, y, 5, radius, 'rgba(221,102,119,', ["seePlayerCheck", "attraction", 'gravity', "fallCheck", 'strike']);
        mob[mob.length - 1].accelMag = 0.0004;
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
        mob[mob.length - 1].delay = 60;
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.1)
    },
    ghoster: function(x, y, radius = 150) {
		//pulls the background color, converts to rgba without the a
		let bgColor = 'rgba'+document.body.style.backgroundColor.substr(3, 20).replace(/.$/,",")
        mobs.spawn(x, y, 0, radius, bgColor, ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].accelMag = 0.00017;
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].memory = 720; //memory+memory*Math.random()
        //mob[mob.length - 1].frictionAir = 0.001;
    },
    blinker: function(x, y, radius = 200) {
        mobs.spawn(x, y, 6, radius, 'rgba(0,200,255,', ["seePlayerCheck", "fallCheck", 'blink']);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
    },
    sneakAttacker: function(x, y, radius = 45) {
        mobs.spawn(x, y, 6, radius, 'rgba(235,235,235,', ['gravity', "fallCheck", 'sneakAttack']);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        //mob[mob.length - 1].memory = 120; //memory+memory*Math.random()
        mob[mob.length - 1].collisionFilter.mask = 0x000001; //can't be hit by bullets or player
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.17)
        mob[mob.length - 1].fill = 'transparent'
            //mob[mob.length - 1].frictionAir = 0.001;
    },
    //complex constrained mob templates********************************************************************************************
    //*****************************************************************************************************************************
    snake: function(x, y, r = 25, l = 70, stiffness = 0.05, num = 6, faceRight = false) {
        if (faceRight) l *= -1
        mobs.spawn(x - l * 0.4, y, 4, r * 1.6, 'rgba(235,55,55,', ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].accelMag = 0.0003 * mob[mob.length - 1].mass * Math.sqrt(num);
        mob[mob.length - 1].friction = 0;
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].memory = 340; //memory+memory*Math.random() in cycles
        for (let i = 0; i < num; i += 2) {
            mobs.spawn(x + l * (i + 1), y, 4, r, 'rgba(0,0,0,', ['gravity', "fallCheck"]);
            mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
            mob[mob.length - 1].density = 0.00001;
            mob[mob.length - 1].friction = 0;
            mob[mob.length - 1].frictionStatic = 0;
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - 2],
                stiffness: stiffness
            })
            mobs.spawn(x + l * (i + 2), y, 4, r, 'rgba(235,55,55,', ['gravity', "fallCheck"]);
            mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
            mob[mob.length - 1].density = 0.00001;
            mob[mob.length - 1].friction = 0;
            mob[mob.length - 1].frictionStatic = 0;
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - 2],
                stiffness: stiffness
            })
        }
        for (let i = 0; i < num - 1; ++i) { //add constraint between mobs that are one apart
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1 - i],
                bodyB: mob[mob.length - 3 - i],
                stiffness: stiffness
            })
        }
    },
    squid: function(x, y, radius = 30, length = 500, stiffness = 0.001, num = 7) {
        //almost a blinker
        mobs.spawn(x, y, 6, radius * 6, 'rgba(0,15,30,', ["seePlayerCheck", "fallCheck", 'blink']); //,'pullPlayer','repelBullets']);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
        for (let i = 0; i < num; ++i) {
            this.burster(x + 2 * radius * i - (num - 1) * radius, y - length * 0.8 - length * 0.4 * Math.random() - radius * 2, radius);
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - i - 2],
                bodyB: mob[mob.length - 1],
                stiffness: stiffness
            })
        }
    },
    nodeBoss: function(x, y, nodes = 5, radius = 20, l = 100, stiffness = 0.05, spawn = 'striker') {
        let px = 0;
        let py = 0;
        let a = 2 * Math.PI / nodes;
        for (let i = 0; i < nodes; ++i) {
            px += l * Math.cos(a * i);
            py += l * Math.sin(a * i);
            this[spawn](x + px, y + py, radius);
        }
        this.constrainAllMobCombos(nodes, stiffness);
    },
    //constraints *****************************************************************************************************************
    //*****************************************************************************************************************************
    constrainAllMobCombos: function(num, stiffness) { //runs thourgh every combination of last 'num' bodies and constrains them
        let a = []
        for (let i = 1; i < num + 1; ++i) {
            for (let j = i + 1; j < num + 1; ++j) {
                consBB[consBB.length] = Constraint.create({
                    bodyA: mob[mob.length - i],
                    bodyB: mob[mob.length - j],
                    stiffness: stiffness
                })
            }
        }
        return a
    },
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
    //body and map spawns **********************************************************************************************************
    //******************************************************************************************************************************
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
    spawnBuilding: function(x, y, w, h, leftDoor, rightDoor, walledSide) {
        this.mapRect(x, y, w, 25); //roof
        this.mapRect(x, y + h, w, 35); //ground
        if (walledSide === 'left') {
            this.mapRect(x, y, 25, h); //wall left
        } else {
            this.mapRect(x, y, 25, h - 150); //wall left
            if (leftDoor) {
                this.bodyRect(x + 5, y + h - 150, 15, 150, this.propsFriction); //door left
            }
        }
        if (walledSide === 'right') {
            this.mapRect(x - 25 + w, y, 25, h); //wall right
        } else {
            this.mapRect(x - 25 + w, y, 25, h - 150); //wall right
            if (rightDoor) {
                this.bodyRect(x + w - 20, y + h - 150, 15, 150, this.propsFriction); //door right
            }
        }
    },
    spawnStairs: function(x, y, num, w, h, stepRight) {
        w += 50;
        if (stepRight) {
            for (let i = 0; i < num; i++) {
                this.mapRect(x - w / num * (1 + i), y - h + i * h / num, w / num + 50, h - i * h / num + 50);
            }
        } else {
            for (let i = 0; i < num; i++) {
                this.mapRect(x + i * w / num, y - h + i * h / num, w / num + 50, h - i * h / num + 50);
            }
        }


    },
    //premade property options*****************************************************************************************************
    //*****************************************************************************************************************************
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
        inertia: Infinity, //prevents rotation
    },
    propsDoor: {
        density: 0.001, //default density is 0.001
        friction: 0,
        frictionAir: 0.03,
        frictionStatic: 0,
        restitution: 0,
    },
}
