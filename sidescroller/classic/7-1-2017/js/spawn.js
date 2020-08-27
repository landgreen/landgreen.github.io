//main object for spawning things in a level
const spawn = {
    pickList: ["starter", "starter"],
    fullPickList: [
        "chaser",
        "striker",
		"burster",
		"hopper",
		"grower",
		"springer",
        "zoomer",
        "shooter",
        "chaseShooter",
		"laserer",
		"laserTracker",
		"laserSearcher",
        "blinker",
        "drifter",
		"blackHoler",
		"ghoster",
        "exploder",
        "spawner",
    ],
    bossPickList: [
        "zoomer",
        "chaser",
		"burster",
		"striker",
		"springer",
        "chaseShooter",
		"laserer",
		"laserTracker",
		"laserSearcher",
        "ghoster",
        "exploder",
        "spawner",
		"random"
    ],
    setSpawnList: function() {
        //this is run at the start of each new level to determine the possible mob for a level
		//each level has 2 mobs: one new mob and one from the the last level
        if (game.levelsCleared) {
			spawn.pickList.splice(0,1)
			spawn.pickList.push(spawn.fullPickList[Math.floor(Math.random() * spawn.fullPickList.length)]);
        }
    },
    //
    randomMob: function(x, y, chance = 1) {
        if ( (Math.random() < chance + game.levelsCleared * 0.03) && (mob.length < 2 + game.levelsCleared * 2) ) {
            const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
            this[pick](x, y);
        }
    },
    //
    randomSmallMob: function(
        x,
        y,
        num = Math.min(Math.ceil(Math.random() * Math.random() * game.levelsCleared), 5),
        size = 16 + Math.ceil(Math.random() * 15),
        chance = 1
    ) {
        if ( (Math.random() < chance + game.levelsCleared * 0.02) && (game.levelsCleared !== 0) ) {
            const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
            for (let i = 0; i < num; ++i) {
                this[pick](
                    x + Math.round((Math.random() - 0.5) * 20) + i * size * 2.5,
                    y + Math.round((Math.random() - 0.5) * 20),
                    size
                );
            }
        }
    },
    randomBoss: function(x, y, chance = 1) {
        if ( (Math.random() < chance + game.levelsCleared * 0.04) && (game.levelsCleared !== 0) ) {
            if (Math.random() < 0.50) {
                this.nodeBoss(x, y, this.bossPickList[Math.floor(Math.random() * this.bossPickList.length)]);
            } else if (Math.random() < 0.50) {
                this.lineBoss(x, y, this.bossPickList[Math.floor(Math.random() * this.bossPickList.length)]);
            } else {
                const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
                this[pick](x, y, 80 + Math.random() * 40);
            }
        }
    },
    //basic mob templates****************************************************************************************
    //***********************************************************************************************************
    starter: function(x, y, radius = 30) {
        //only on level 1
        mobs.spawn(x, y, 9, radius, "#8ccec1", ["healthBar", "seePlayerByLookingAt", "attraction"]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.0007;
    },
	laserSearcher: function(x, y, radius = 30) {
		//only on level 1
		mobs.spawn(x, y, 3, radius, "#f00", ["healthBar", "seePlayerByLookingAt", "attraction", 'laserSearch']);
		let me = mob[mob.length - 1];
		me.vertices = Matter.Vertices.rotate(me.vertices, Math.PI, me.position); //make the pointy side of triangle the front
		Matter.Body.rotate(me, Math.random()*Math.PI*2)
		me.accelMag = 0.00005;
	},
    searcher: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 5, radius, "rgb(110,150,200)", ["healthBar", "seePlayerCheck", "attraction", "search"]);
        let me = mob[mob.length - 1];
        me.searchTarget = body[Math.floor(Math.random() * (body.length - 1))].position; //required for search
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    grower: function(x, y, radius = 15) {
        mobs.spawn(x, y, 7, radius, "hsl(144, 15%, 50%)", ["healthBar", "seePlayerByLookingAt", "attraction", "grow"]);
        let me = mob[mob.length - 1];
        me.big = false; //required for grow
        me.searchTarget = body[Math.floor(Math.random() * (body.length - 1))].position; //required for search
    },
    springer: function(x, y, radius = 20 + Math.ceil(Math.random() * 35)) {
        mobs.spawn(x, y, 10, radius, "rgb(170,60,100)", ["healthBar", "gravity", "searchSpring"]);
        let me = mob[mob.length - 1];
        me.friction = 0;
		me.frictionAir = 0.1;
		me.lookTorque = 0.000005;
        me.g = 0.0002; //required if using 'gravity'
        me.seePlayerFreq = Math.ceil(40 + 25 * Math.random());
        me.springTarget = { x: me.position.x, y: me.position.y };
        let len = cons.length;
        cons[len] = Constraint.create({
            pointA: me.springTarget,
            bodyB: me,
            stiffness: 0.003
        });
		cons[len].length = 100+1.5*radius;
		me.cons = cons[len]

		me.springTarget2 = { x: me.position.x, y: me.position.y };
        len = cons.length;
        cons[len] = Constraint.create({
            pointA: me.springTarget2,
            bodyB: me,
            stiffness: 0.003
        });
		cons[len].length = 100+1.5*radius;
		me.cons2 = cons[len]

        me.onDeath = function() {
            this.removeCons();
        };
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    chaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 4, radius, "rgb(110,150,200)", ["healthBar", "gravity", "seePlayerCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.accelMag = 0.0012;
        me.memory = 240;
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    zoomer: function(x, y, radius = 25 + Math.ceil(Math.random() * 40)) {
        mobs.spawn(x, y, 8, radius, "#ffe2fd", ["healthBar", "seePlayerByDistAndLOS", "zoom", "gravity"]);
        let me = mob[mob.length - 1];
        me.trailLength = 20; //required for trails
        me.setupTrail(); //fill trails array up with the current position of mob
        me.trailFill = "#ff00f0";
        me.zoomTotalCycles = 300;
        me.zoomOnCycles = 150;
        me.g = 0.0007; //required if using 'gravity'
        me.frictionAir = 0.04;
        me.accelMag = 0.004;
        me.memory = 60;
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    hopper: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 4, radius, "rgb(0,200,150)", ["healthBar", "gravity", "seePlayerCheck", "hop"]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.12;
        me.g = 0.0025; //required if using 'gravity'
        me.frictionAir = 0.033;
        me.restitution = 0;
        me.delay = 90;
    },
    burster: function(x, y, radius = 45 + Math.ceil(Math.random() * 40)) {
        mobs.spawn(x, y, 5, radius, "rgb(0,200,180)", ["healthBar", "seePlayerByLookingAt", "burstAttraction"]);
        let me = mob[mob.length - 1];
        me.cdBurst1 = 0; //must add for burstAttraction
        me.cdBurst2 = 0; //must add for burstAttraction
        me.burstDir = { x: 0, y: 0 };
        me.accelMag = 0.15;
        me.frictionAir = 0.02;
        me.lookTorque = 0.0000013;
        me.restitution = 0;
        me.delay = 60;
    },
    blackHoler: function(x, y, radius = 30 + Math.ceil(Math.random() * 40)) {
        radius = 10 + radius / 4; //extra small
        mobs.spawn(x, y, 0, radius, "#000", ["seePlayerByDistOrLOS", "attraction", "darkness", "blackHole", "healthBar"]);
        let me = mob[mob.length - 1];
        me.eventHorizon = radius * 20; //required for blackhole
        me.seeAtDistance2 = (me.eventHorizon + 500) * (me.eventHorizon + 500); //vision limit is event horizon
        me.accelMag = 0.00008;
        // me.frictionAir = 0.005;
        me.memory = 600;
        Matter.Body.setDensity(me, 0.005); //extra dense //normal is 0.001
        me.collisionFilter.mask = 0x001100; //move through walls
    },
    laserer: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
        mobs.spawn(x, y, 4, radius, "rgb(255,0,190)", ["healthBar", "seePlayerByLookingAt", "attraction", "repulsion", "laser"]);
        let me = mob[mob.length - 1];
        me.repulsionRange = 160000; //squared
        // me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
        me.accelMag = 0.0006;
        me.frictionStatic = 0;
        me.friction = 0;
        me.onHit = function() {
            //run this function on hitting player
            this.death();
        };
        if (Math.random() < Math.min(0.2+game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    laserTracker: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
        mobs.spawn(x, y, 4, radius, "rgb(0,0,255)", [
            "healthBar",
            "seePlayerByLookingAt",
            "attraction",
            "repulsion",
            "laserTracking"
        ]);
        let me = mob[mob.length - 1];
        me.laserPos = me.position; //required for laserTracking
        me.repulsionRange = 400000; //squared
        //me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
        me.accelMag = 0.0006;
        me.frictionStatic = 0;
        me.friction = 0;
        me.onHit = function() {
            //run this function on hitting player
            this.death();
        };
        me.onDamage = function() {
            this.laserPos = this.position;
        };
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    striker: function(x, y, radius = 15 + Math.ceil(Math.random() * 25)) {
        mobs.spawn(x, y, 5, radius, "rgb(221,102,119)", ["healthBar", "seePlayerCheck", "attraction", "gravity", "strike"]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.0004;
        me.g = 0.0002; //required if using 'gravity'
        me.frictionStatic = 0;
        me.friction = 0;
        me.delay = 60;
        Matter.Body.rotate(me, Math.PI * 0.1);
        me.onDamage = function() {
            this.cd = game.cycle + this.delay;
        };
    },
    ghoster: function(x, y, radius = 50 + Math.ceil(Math.random() * 70)) {
        let me;
        if (Math.random() > 0.25) {
            //fast
            mobs.spawn(x, y, 9, radius, "transparent", ["healthBar", "seePlayerByLookingAt", "attraction", "search"]);
            me = mob[mob.length - 1];
            me.accelMag = 0.00025;
        } else {
            //slow but can yank
            mobs.spawn(x, y, 7, radius, "transparent", ["healthBar", "seePlayerByLookingAt", "attraction", "yank", "search"]);
            me = mob[mob.length - 1];
            me.delay = 250 + Math.random() * 150;
            me.accelMag = 0.00015;
        }
        me.searchTarget = body[Math.floor(Math.random() * (body.length - 1))].position; //required for search
        me.lookTorque = 0.0000003;
        me.stroke = "#999";
        me.memory = 420;
        me.collisionFilter.mask = 0x001100; //move through walls
    },
    blinker: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 6, radius, "rgb(0,200,255)", ["healthBar", "seePlayerCheck", "blink"]);
        let me = mob[mob.length - 1];
        me.blinkRate = 40 + Math.round(Math.random() * 60); //required for blink
        me.blinkLength = 150 + Math.round(Math.random() * 200); //required for blink
        //me.collisionFilter.mask = 0x001100; //move through walls
        me.isStatic = true;
        me.memory = 360;
        me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    },
    drifter: function(x, y, radius = 15 + Math.ceil(Math.random() * 40)) {
        mobs.spawn(x, y, 4.5, radius, "rgb(0,200,255)", ["healthBar", "seePlayerCheck", "drift"]);
        Matter.Body.rotate(mob[mob.length - 1], Math.random() * 2 * Math.PI);
        let me = mob[mob.length - 1];
        me.blinkRate = 30 + Math.round(Math.random() * 30); //required for blink/drift
        me.blinkLength = 150; //required for blink/drift
        //me.collisionFilter.mask = 0x001100; //move through walls
        me.isStatic = true;
        me.memory = 360;
        me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    },
    phaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 30)) {
        mobs.spawn(x, y, 6, radius, "rgba(110,150,255,0.17)", ["phaseIn", "locatePlayerByDist", "attraction", "gravity"]);
        let me = mob[mob.length - 1];
        me.stroke = "transparent";
        me.accelMag = 0.001;
        me.g = 0.0005; //required if using 'gravity'
        me.phaseRange2 = Math.round(Math.pow(radius + 270, 2));
        me.locateRange = 1000 * 1000;
        me.collisionFilter.mask = 0x000001; //can't be hit by bullets or player
    },
    sneakAttacker: function(x, y, radius = 25 + Math.ceil(Math.random() * 30)) {
        mobs.spawn(x, y, 6, radius, "rgba(120,190,210,0.08)", ["gravity", "sneakAttack"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.collisionFilter.mask = 0x000001; //can't be hit by bullets or player
        Matter.Body.rotate(me, Math.PI * 0.17);
    },
    shooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        // mobs.spawn(x, y, 3, radius, "rgb(100,50,255)", ["healthBar", "seePlayerByDistAndLOS", "fire"]);
        mobs.spawn(x, y, 3, radius, "rgb(100,50,255)", ["healthBar", "seePlayerByLookingAt", "fire"]);
        let me = mob[mob.length - 1];
        me.vertices = Matter.Vertices.rotate(me.vertices, Math.PI, me.position); //make the pointy side of triangle the front
        me.facePlayer = true;
        me.fireFreq = Math.ceil(20 + 2000 / radius);
        me.memory = 120;
        if (Math.random() < Math.min(0.15 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    chaseShooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 3, radius, "rgb(155,0,255)", ["healthBar", "seePlayerByLookingAt", "attraction", "fire"]);
        let me = mob[mob.length - 1];
        me.vertices = Matter.Vertices.rotate(me.vertices, Math.PI, me.position); //make the pointy side of triangle the front
        me.facePlayer = true;
        me.accelMag = 0.0003;
        me.fireFreq = Math.ceil(40 + 2000 / radius);
        me.memory = 120;
        if (Math.random() < Math.min(0.15 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    },
    bullet: function(x, y, radius = 6) {
        //bullets
        mobs.spawn(x, y, 0, radius, "rgb(255,0,0)", ["gravity", "timeLimit"]);
        let me = mob[mob.length - 1];
        me.stroke = "transparent";
        me.onHit = function() {
            this.explode();
        };
        me.onDeath = function() {
            this.deadCount = 0; //don't leave a ghost body
        };
        Matter.Body.setDensity(me, 0.002); //normal is 0.001
        me.timeLeft = 240;
        me.g = 0.001; //required if using 'gravity'
        me.frictionAir = 0;
        me.restitution = 0.8;
        me.noPowerUp = true;
        // me.collisionFilter.mask = 0x001000;
        me.collisionFilter.category = 0x010000;
    },
    spawner: function(x, y, radius = 55 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 5, radius, "rgb(255,150,0)", ["healthBar", "gravity", "seePlayerCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0004; //required if using 'gravity'
        me.accelMag = 0.001;
        me.memory = 240;
        me.onDeath = function() {
            //run this function on death
            for (let i = 0; i < Math.ceil(this.mass * 0.25 + Math.random() * 3); ++i) {
                spawn.spawns(
                    this.position.x + (Math.random() - 0.5) * radius * 2,
                    this.position.y + (Math.random() - 0.5) * radius * 2
                );
                Matter.Body.setVelocity(mob[mob.length - 1], {
                    x: (Math.random() - 0.5) * 25,
                    y: (Math.random() - 0.5) * 25
                });
            }
        };
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.5)) spawn.shield(me, x, y);
    },
    spawns: function(x, y, radius = 15 + Math.ceil(Math.random() * 5)) {
        mobs.spawn(x, y, 4, radius, "rgb(255,0,0)", ["healthBar", "gravity", "seePlayerCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.onHit = function() {
            //run this function on hitting player
            this.explode();
        };
        me.g = 0.00015; //required if using 'gravity'
        me.accelMag = 0.0004;
        me.seePlayerFreq = 75 + Math.round(Math.random() * 50);
        me.frictionAir = 0.002;
    },
    exploder: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 7, radius, "rgb(255,0,0)", ["healthBar", "gravity", "seePlayerCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.onHit = function() {
            //run this function on hitting player
            this.explode();
        };
        me.g = 0.0004; //required if using 'gravity'
        me.accelMag = 0.0013;
    },

    shield: function(target, x, y, stiffness = 0.4) {
        if (this.allowShields) {
            mobs.spawn(x, y, 9, target.radius + 20, "rgba(220,220,255,0.6)", []);
            let me = mob[mob.length - 1];
            me.stroke = "rgb(220,220,255)";
            me.density = 0.0001; //very low density to not mess with the original mob's motion
            me.shield = true;
            me.collisionFilter.mask = 0x001100; //don't collide with bodies, map, and mobs
            consBB[consBB.length] = Constraint.create({
                //attach shield to last spawned mob
                bodyA: me,
                bodyB: target,
                stiffness: stiffness
            });
            me.onDeath = function() {
                this.deadCount = 0; //don't show a body after death
            };
            me.onDamage = function() {
                //make sure the mob that owns the shield can tell when damage is done
                this.alertNearByMobs();
            };
            //swap order of shield and mob, so that mob is behind shield graphically
            mob[mob.length - 1] = mob[mob.length - 2];
            mob[mob.length - 2] = me;
        }
    },
    //complex constrained mob templates**********************************************************************
    //*******************************************************************************************************
    allowShields: true,
    nodeBoss: function(
        x,
        y,
        spawn = "striker",
        nodes = Math.min(2 + Math.round(Math.random() * (game.levelsCleared + 1)), 8),
        //Math.ceil(Math.random() * 3) + Math.min(4,Math.ceil(game.levelsCleared/2)),
        radius = Math.ceil(Math.random() * 10) + 17,
        l = Math.ceil(Math.random() * 100) + 70,
        stiffness = Math.random() * 0.07 + 0.01
    ) {
        this.allowShields = false;
        let px = 0;
        let py = 0;
        let a = 2 * Math.PI / nodes;
        for (let i = 0; i < nodes; ++i) {
            px += l * Math.cos(a * i);
            py += l * Math.sin(a * i);
            // this[this.bossPickList[Math.floor(Math.random() * this.bossPickList.length)]](x + px, y + py, radius);
            if (spawn === "random") {
                this[this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]](x + px, y + py, radius);
            } else {
                this[spawn](x + px, y + py, radius);
            }
        }
        if (Math.random() < 0.3) {
            this.constrain2AdjacentMobs(nodes, stiffness * 2, true);
        } else {
            this.constrainAllMobCombos(nodes, stiffness);
        }
        this.allowShields = true;
    },
    lineBoss: function(
        x,
        y,
        spawn = "striker",
        nodes = Math.min(2 + Math.round(Math.random() * (game.levelsCleared + 1)), 8),
        //Math.ceil(Math.random() * 3) + Math.min(4,Math.ceil(game.levelsCleared/2)),
        radius = Math.ceil(Math.random() * 10) + 17,
        l = Math.ceil(Math.random() * 80) + 30,
        stiffness = Math.random() * 0.5 + 0.01
    ) {
        this.allowShields = false;
        for (let i = 0; i < nodes; ++i) {
            if (spawn === "random") {
                this[this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]](x + i * radius + i * l, y, radius);
            } else {
                this[spawn](x + i * radius + i * l, y, radius);
            }
        }
        this.constrain2AdjacentMobs(nodes, stiffness);
        this.allowShields = true;
    },
    //constraints ************************************************************************************************
    //*************************************************************************************************************
    constrainAllMobCombos: function(nodes, stiffness) {
        //runs through every combination of last 'num' bodies and constrains them
        for (let i = 1; i < nodes + 1; ++i) {
            for (let j = i + 1; j < nodes + 1; ++j) {
                consBB[consBB.length] = Constraint.create({
                    bodyA: mob[mob.length - i],
                    bodyB: mob[mob.length - j],
                    stiffness: stiffness
                });
            }
        }
    },
    constrain2AdjacentMobs: function(nodes, stiffness, loop = false) {
        //runs through every combination of last 'num' bodies and constrains them
        for (let i = 0; i < nodes - 1; ++i) {
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - i - 1],
                bodyB: mob[mob.length - i - 2],
                stiffness: stiffness
            });
        }
        if (nodes > 2) {
            for (let i = 0; i < nodes - 2; ++i) {
                consBB[consBB.length] = Constraint.create({
                    bodyA: mob[mob.length - i - 1],
                    bodyB: mob[mob.length - i - 3],
                    stiffness: stiffness
                });
            }
        }
        //optional connect the tail to head
        if (loop && nodes > 3) {
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - nodes],
                stiffness: stiffness
            });
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 2],
                bodyB: mob[mob.length - nodes],
                stiffness: stiffness
            });
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - nodes + 1],
                stiffness: stiffness
            });
        }
    },
    constraintPB: function(x, y, bodyIndex, stiffness) {
        cons[cons.length] = Constraint.create({
            pointA: {
                x: x,
                y: y
            },
            bodyB: body[bodyIndex],
            stiffness: stiffness
        });
    },
    constraintBB: function(bodyIndexA, bodyIndexB, stiffness) {
        consBB[consBB.length] = Constraint.create({
            bodyA: body[bodyIndexA],
            bodyB: body[bodyIndexB],
            stiffness: stiffness
        });
    },
    // body and map spawns ******************************************************************************
    //**********************************************************************************************
    boost: function(x, y, Vx = 0, Vy = -0.007) {
        spawn.mapVertex(x + 50, y + 35, "120 40 -120 40 -50 -40 50 -40");
        // level.addZone(x, y, 100, 30, "fling", {Vx:Vx, Vy: Vy});
        level.addQueryRegion(x + 10, y - 220, 80, 220, "force", [[player], body, mob, powerUp, bullet], { Vx: Vx, Vy: Vy });
        let color = "rgba(200,0,255,";
        level.fillBG.push({ x: x, y: y - 25, width: 100, height: 25, color: color + "0.2)" });
        level.fillBG.push({ x: x, y: y - 55, width: 100, height: 55, color: color + "0.1)" });
        level.fillBG.push({ x: x, y: y - 120, width: 100, height: 120, color: color + "0.05)" });
    },
    laserZone: function(x, y, width, height, dmg) {
        level.addZone(x, y, width, height, "laser", { dmg });
        level.fill.push({ x: x, y: y, width: width, height: height, color: "#f00" });
    },
    deathQuery: function(x, y, width, height) {
        level.addQueryRegion(x, y, width, height, "death", [[player], mob]);
        level.fill.push({ x: x, y: y, width: width, height: height, color: "#f00" });
    },
    debris: function(x, y, width, number = Math.floor(3 + Math.random() * 11)) {
        for (let i = 0; i < number; ++i) {
            if (Math.random() < 0.2) {
                powerUps.chooseRandomPowerUp(x + Math.random() * width, y);
            } else {
                const size = 18 + Math.random() * 25;
                body[body.length] = Bodies.rectangle(
                    x + Math.random() * width,
                    y,
                    size * (0.6 + Math.random()),
                    size * (0.6 + Math.random())
                );
            }
        }
    },
    bodyRect: function(x, y, width, height, chance = 1, properties) {
        if (Math.random() < chance) {
            body[body.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
        }
    },
    bodyVertex: function(x, y, vector, properties) {
        //addes shape to body array
        body[body.length] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
    },
    mapRect: function(x, y, width, height, properties) {
        //addes reactangles to map array
        var len = map.length;
        map[len] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
    },
    mapVertex: function(x, y, vector, properties) {
        //addes shape to map array
        var len = map.length;
        map[len] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
    },
    //complex map templates
    spawnBuilding: function(x, y, w, h, leftDoor, rightDoor, walledSide) {
        this.mapRect(x, y, w, 25); //roof
        this.mapRect(x, y + h, w, 35); //ground
        if (walledSide === "left") {
            this.mapRect(x, y, 25, h); //wall left
        } else {
            this.mapRect(x, y, 25, h - 150); //wall left
            if (leftDoor) {
                this.bodyRect(x + 5, y + h - 150, 15, 150, this.propsFriction); //door left
            }
        }
        if (walledSide === "right") {
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
    //premade property options*************************************************************************************
    //*************************************************************************************************************
    //Object.assign({}, propsHeavy, propsBouncy, propsNoRotation)      //will combine properties into a new object
    propsFriction: {
        friction: 0.5,
        frictionAir: 0.02,
        frictionStatic: 1
    },
    propsBouncy: {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1
    },
    propsSlide: {
        friction: 0.003,
        frictionStatic: 0.4,
        restitution: 0,
        density: 0.002
    },
    propsLight: {
        density: 0.001
    },
    propsOverBouncy: {
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        restitution: 1.05
    },
    propsHeavy: {
        density: 0.01 //default density is 0.001
    },
    propsNoRotation: {
        inertia: Infinity //prevents rotation
    },
    propsHoist: {
        inertia: Infinity, //prevents rotation
        frictionAir: 0.001,
        friction: 0,
        frictionStatic: 0,
        restitution: 0
        // density: 0.0001
    },
    propsDoor: {
        density: 0.001, //default density is 0.001
        friction: 0,
        frictionAir: 0.03,
        frictionStatic: 0,
        restitution: 0
    },
    sandPaper: {
        friction: 1,
        frictionStatic: 1,
        restitution: 0
    }
};
