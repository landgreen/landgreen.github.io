//main object for spawning things in a level
const spawn = {
    pickList: [],
	fullPickList: ['chaser', 'chaser', 'shooter', 'chaseShooter', 'hopper', 'burster', 'burster', 'puller', 'laserer', 'striker','striker','springer','ghoster', 'blinker', 'sneakAttacker', 'pullSploder', 'exploder', 'drifter', 'spawner'],
	setSpawnList: function(){ //this is run at the start of each new level to give the mobs on each level a flavor
		this.pickList = [];
		for(let i = 0; i<1+Math.ceil(Math.random()*Math.random()*3);++i){
			this.pickList.push(this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]);
		}
	},
    randomMob: function(x, y) {
        const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)]
        this[pick](x, y);
    },
    randomSmallMob: function(x, y, num = 1, size = 16 + Math.ceil(Math.random() * 15)) {
        const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)]
        for (let i = 0; i < num; ++i) {
            this[pick](x + i * size * 2.5, y, size);
        }
    },
    randomBoss: function(x, y) {
        //const pick = ['springer', 'chaser', 'chaseShooter', 'hopper', 'burster', 'puller', 'laserer', 'striker', 'ghoster', 'pullSploder', 'exploder'];
		//const pick = ['springer', 'chaser', 'chaseShooter','burster','striker'];
		//this.nodeBoss(x, y, pick[Math.floor(Math.random() * pick.length)]);
		const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)]
		this.nodeBoss(x, y, pick);
    },
    //basic mob templates**********************************************************************************************************
    //*****************************************************************************************************************************
    shooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(215,100,215,1)'
        mobs.spawn(x, y, 3, radius, 'rgba(215,100,215,', ["seePlayerCheck", 'fireAt']);
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].seePlayerFreq = 59;
        mob[mob.length - 1].memory = 20; //memory+memory*Math.random()
        //mob[mob.length - 1].fireDelay = 40;
        mob[mob.length - 1].fireDelay = Math.ceil(10 + 2000 / radius)
    },
    springer: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(223,2,58,1)'
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
    chaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(110,150,200,1)'
        mobs.spawn(x, y, 4, radius, 'rgba(110,150,200,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0012;
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
    },
    chaseShooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(140,100,250,1)'
        mobs.spawn(x, y, 3, radius, 'rgba(140,100,250,', ['gravity', "seePlayerCheck", "fallCheck", 'fireAt', "attraction"]);
        mob[mob.length - 1].accelMag = 0.0002;
        mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.0002;
        mob[mob.length - 1].memory = 180; //memory+memory*Math.random() in cycles
        //mob[mob.length - 1].fireDelay = 65;
		mob[mob.length - 1].fireDelay = Math.ceil(30 + 2000 / radius)
        mob[mob.length - 1].faceOnFire = false; //prevents rotation on fire
    },
    hopper: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(0,200,150,1)'
        mobs.spawn(x, y, 4, radius, 'rgba(0,200,150,', ['gravity', "seePlayerCheck", "fallCheck", "burstAttraction"]);
        mob[mob.length - 1].accelMag = 0.09;
        mob[mob.length - 1].g = 0.002; //required if using 'gravity'
        mob[mob.length - 1].frictionAir = 0.035;
        //mob[mob.length - 1].memory = 60; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 0;
        mob[mob.length - 1].delay = 90;
    },
    burster: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(0,200,180,1)'
        mobs.spawn(x, y, 6, radius, 'rgba(0,200,180,', ["seePlayerCheck", "fallCheck", "burstAttraction"]);
        mob[mob.length - 1].accelMag = 0.1;
        mob[mob.length - 1].frictionAir = 0.02;
        //mob[mob.length - 1].memory = 240; //memory+memory*Math.random()
        mob[mob.length - 1].restitution = 1;
        mob[mob.length - 1].delay = 140;
    },
    puller: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(0,10,30,1)'
        mobs.spawn(x, y, 7, radius, 'rgba(0,10,30,', ['gravity', "seePlayerCheck", "fallCheck", "attraction", 'pullPlayer']);
        mob[mob.length - 1].delay = 360;
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0003;
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
    },
    laserer: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) { //'rgba(255,0,170,1)'
        mobs.spawn(x, y, 4, radius, 'rgba(255,0,170,', ["seePlayerCheck", "attraction", 'repulsion', "fallCheck", 'laser']);
        mob[mob.length - 1].repulsionRange = 300000; //squared
        mob[mob.length - 1].seePlayerFreq = 3;
        mob[mob.length - 1].accelMag = 0.0006;
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
        mob[mob.length - 1].onHit = function(k) { //run this function on hitting player
            mob[k].death()
        }
    },
    striker: function(x, y, radius = 15 + Math.ceil(Math.random() * 25)) { //'rgba(221,102,119,1)'
        mobs.spawn(x, y, 5, radius, 'rgba(221,102,119,', ["seePlayerCheck", "attraction", 'gravity', "fallCheck", 'strike']);
        mob[mob.length - 1].accelMag = 0.0004;
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].friction = 0;
        mob[mob.length - 1].delay = 60;
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.1)
    },
    ghoster: function(x, y, radius = 50 + Math.ceil(Math.random() * 70)) { //'rgba(255,255,255,1)'
        //pulls the background color, converts to rgba without the a
        let bgColor = 'rgba' + document.body.style.backgroundColor.substr(3, 20).replace(/.$/, ",")
        mobs.spawn(x, y, 0, radius, bgColor, ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].accelMag = 0.00017;
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].memory = 720; //memory+memory*Math.random()
    },
    blinker: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(0,200,255,1)'
        mobs.spawn(x, y, 6, radius, 'rgba(0,200,255,', ["seePlayerCheck", "fallCheck", 'blink']);
        mob[mob.length - 1].blinkRate = 40 + Math.round(Math.random() * 60); //required for blink
        mob[mob.length - 1].blinkLength = 150 + Math.round(Math.random() * 200); //required for blink
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
        mob[mob.length - 1].seePlayerFreq = 47;
    },
    drifter: function(x, y, radius = 15 + Math.ceil(Math.random() * 40)) { //'rgba(0,200,255,1)'
        mobs.spawn(x, y, 4.5, radius, 'rgba(0,200,255,', ["seePlayerCheck", "fallCheck", 'drift']);
        Matter.Body.rotate(mob[mob.length - 1], Math.random() * 2 * Math.PI)
        mob[mob.length - 1].blinkRate = 20 + Math.round(Math.random() * 10); //required for blink
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
        mob[mob.length - 1].seePlayerFreq = 74;
    },
    sneakAttacker: function(x, y, radius = 15 + Math.ceil(Math.random() * 30)) { //'rgba(235,235,235,1)'
        mobs.spawn(x, y, 6, radius, 'rgba(235,235,235,', ['gravity', "fallCheck", 'sneakAttack']);
        mob[mob.length - 1].g = 0.0005; //required if using 'gravity'
        mob[mob.length - 1].collisionFilter.mask = 0x000001; //can't be hit by bullets or player
        Matter.Body.rotate(mob[mob.length - 1], Math.PI * 0.17)
        mob[mob.length - 1].fill = 'transparent'
    },
    spawner: function(x, y, radius = 55 + Math.ceil(Math.random() * 50)) { //'rgba(110,150,150,1)'
        mobs.spawn(x, y, 5, radius, 'rgba(110,150,150,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].g = 0.0004; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.001;
        mob[mob.length - 1].memory = 240; //memory+memory*Math.random() in cycles
        mob[mob.length - 1].onDeath = function(that) { //run this function on hitting player
            for (let i = 0; i < Math.ceil(that.mass * 0.35); ++i) {
                spawn.spawns(that.position.x + (Math.random() - 0.5) * 20, that.position.y + (Math.random() - 0.5) * 20);
            }
        }
    },
    spawns: function(x, y, radius = 15 + Math.ceil(Math.random() * 5)) { //'rgba(110,175,175,1)'
        mobs.spawn(x, y, 4, radius, 'rgba(110,175,175,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].onHit = function(k) { //run this function on hitting player
            for (let i = 1; i < 3 + 1; ++i) { //dots
                setTimeout(function() {
                    mech.damage(0.05 * Math.sqrt(mob[k].mass) * game.dmgScale);
                    const hit = mech.pos //draw damage circles
                    hit.radius = 50;
                    hit.color = 'rgba(125,100,150,0.5)';
                    game.drawList.push(hit);
                }, i * 2000);
            }
            const hit = mech.pos //draw damage circle
            hit.radius = 80;
            hit.color = 'rgba(125,100,150,0.5)';
            game.drawList.push(hit);
            mob[k].death()
        }
        mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0004;
    },
    exploder: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(125,100,150,1)'
        mobs.spawn(x, y, 7, radius, 'rgba(125,100,150,', ['gravity', "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].onHit = function(k) { //run this function on hitting player
            for (let i = 1; i < 7 + 1; ++i) { //dots
                setTimeout(function() {
                    mech.damage(0.05 * Math.sqrt(mob[k].mass) * game.dmgScale);
                    const hit = mech.pos //draw damage circles
                    hit.radius = 50;
                    hit.color = 'rgba(125,100,150,0.5)';
                    game.drawList.push(hit);
                }, i * 2000);
            }
            const hit = mech.pos //draw damage circle
            hit.radius = 80;
            hit.color = 'rgba(125,100,150,0.5)';
            game.drawList.push(hit);
            mob[k].death()
        }
        mob[mob.length - 1].g = 0.0004; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0014;
    },
    pullSploder: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) { //'rgba(25,25,45,1)'
        mobs.spawn(x, y, 4.5, radius, 'rgba(25,25,45,', ['gravity', "seePlayerCheck", "fallCheck", "attraction", 'pullPlayer']);
        mob[mob.length - 1].onHit = function(k) { //run this function on hitting player
            for (let i = 1; i < 7 + 1; ++i) { //dots
                setTimeout(function() {
                    mech.damage(0.05 * Math.sqrt(mob[k].mass) * game.dmgScale);
                    const hit = mech.pos //draw damage circles
                    hit.radius = 50;
                    hit.color = 'rgba(25,25,45,0.5)';
                    game.drawList.push(hit);
                }, i * 2000);
            }
            const hit = mech.pos //draw damage circle
            hit.radius = 80;
            hit.color = 'rgba(25,25,45,0.5)';
            game.drawList.push(hit);
            mob[k].death()
        }
        mob[mob.length - 1].g = 0.0004; //required if using 'gravity'
        mob[mob.length - 1].accelMag = 0.0008;
    },
    //complex constrained mob templates********************************************************************************************
    //*****************************************************************************************************************************
    snake: function(x, y, r = 25, l = 70, stiffness = 0.05, num = 6, faceRight = false) {
        if (faceRight) l *= -1
        mobs.spawn(x - l * 0.4, y, 4, r * 1.6, 'rgba(235,55,55,', ["seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].accelMag = 0.0006 * mob[mob.length - 1].mass * Math.sqrt(num);
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
    nodeBoss: function(x, y, spawn = 'striker',
        nodes = Math.ceil(Math.random() * 3) + 4,
        radius = Math.ceil(Math.random() * 10) + 17,
        l = Math.ceil(Math.random() * 100) + 70,
        stiffness = Math.random() * 0.07 + 0.01) {
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
