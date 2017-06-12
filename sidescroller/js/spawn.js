//main object for spawning things in a level
const spawn = {
    pickList: [],
    fullPickList: [
        "chaser",
        "chaser",
        "chaser",
        "burster",
        "burster",
        "striker",
        "striker",
        "shooter",
        "chaseShooter",
        "hopper",
        "springer",
        "ghoster",
        "blinker",
        "drifter",
        "sneakAttacker",
        "exploder",
        "spawner",
        "laserer",
        "laserTracker",
        "blackHoler",
		"phaser"
    ],
    bossPickList: [
        "chaser",
        "chaseShooter",
        "burster",
        "striker",
        "springer",
        "ghoster",
        "exploder",
        "spawner",
        "laserer",
        "laserTracker",
		"phaser",
		'random'
    ],
    setSpawnList: function() {
        //this is run at the start of each new level to give the mobs on each level a flavor
        this.pickList = [];
        for (let i = 0, len = Math.ceil(0.93 + Math.random() * Math.random() * 3); i < len; ++i) {
            this.pickList.push(this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]);
        }
    },
    //
    randomMob: function(x, y, chance = 1) {
        if (game.levelsCleared === 0) {
            //cap mobs at 3 if on level 1
            if (Math.random() < chance + game.levelsCleared * 0.04 && mob.length < 3) {
                const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
                this[pick](x, y);
            }
        } else if (Math.random() < chance + game.levelsCleared * 0.04) {
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
        if (Math.random() < chance + game.levelsCleared * 0.03 && game.levelsCleared != 0) {
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
        if (Math.random() < chance + game.levelsCleared * 0.05 && game.levelsCleared != 0) {
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
    springer: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 0, radius, "rgb(223,2,58)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.accelMag = 0.0012;
        me.memory = 240; //memory+memory*Math.random() in cycles
        me.seePlayerFreq = 100 + Math.round(Math.random() * 40);
        me.cons = cons.length;
        cons[me.cons] = Constraint.create({
            pointA: me.seePlayer.position,
            bodyB: me,
            stiffness: 0.001
        });
        cons[me.cons].length = 0;
        me.onDeath = function() {
            this.removeCons();
        };
        if (Math.random() < Math.min(0.1 + game.levelsCleared * 0.1, 0.9)) spawn.shield(me, x, y);
    },
    chaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 4, radius, "rgb(110,150,200)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.accelMag = 0.0012;
        me.memory = 240; //memory+memory*Math.random() in cycles
        if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.9)) spawn.shield(me, x, y);
    },
    hopper: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 4, radius, "rgb(0,200,150)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "hop"]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.12;
        me.g = 0.0025; //required if using 'gravity'
        me.frictionAir = 0.033;
        me.restitution = 0;
        me.delay = 90;
    },
    burster: function(x, y, radius = 45 + Math.ceil(Math.random() * 40)) {
        mobs.spawn(x, y, 5, radius, "rgb(0,200,180)", ["healthBar", "seePlayerCheck", "fallCheck", "burstAttraction"]);
        let me = mob[mob.length - 1];
        me.cdBurst1 = 0; //must add for burstAttraction
        me.cdBurst2 = 0; //must add for burstAttraction
        me.accelMag = 0.15;
        me.frictionAir = 0.02;
        me.restitution = 0;
        me.delay = 60;
    },
    blackHoler: function(x, y, radius = 30 + Math.ceil(Math.random() * 40)) {
        radius = 10 + radius / 4; //extra small
        mobs.spawn(x, y, 0, radius, "#000", [
            "seePlayerbyDistOrLOS",
            "fallCheck",
            "attraction",
            "darkness",
            "blackHole",
            "healthBar"
        ]);
        let me = mob[mob.length - 1];
        me.delay = 300;
        me.eventHorizon = radius * 17; //required for blackhole
        me.seeAtDistance2 = (me.eventHorizon + 500) * (me.eventHorizon + 500); //vision limit is event horizon
        me.accelMag = 0.00008;
        // me.frictionAir = 0.01;
        //me.memory = 50; //memory+memory*Math.random() in cycles
        Matter.Body.setDensity(me, 0.01); //extra dense //normal is 0.001
        me.collisionFilter.mask = 0x001100; //move through walls
        //if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.16, 0.9)) spawn.shield(me, x, y);
    },
    laserer: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
        mobs.spawn(x, y, 4, radius, "rgb(255,0,190)", [
            "healthBar",
            "seePlayerCheck",
            "attraction",
            "repulsion",
            "fallCheck",
            "laser"
        ]);
        let me = mob[mob.length - 1];
        me.repulsionRange = 160000; //squared
        me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
        me.accelMag = 0.0006;
        me.frictionStatic = 0;
        me.friction = 0;
        me.onHit = function(k) {
            //run this function on hitting player
            mob[k].death();
        };
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.1, 1)) spawn.shield(me, x, y);
    },
    laserTracker: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
        mobs.spawn(x, y, 4, radius, "rgb(0,0,255)", [
            "healthBar",
            "seePlayerCheck",
            "attraction",
            "repulsion",
            "fallCheck",
            "laserTracking"
        ]);
        let me = mob[mob.length - 1];
        me.laserPos = me.position; //required for laserTracking
        me.repulsionRange = 400000; //squared
        me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
        me.accelMag = 0.0006;
        me.frictionStatic = 0;
        me.friction = 0;
        me.onHit = function(k) {
            //run this function on hitting player
            mob[k].death();
        };
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.1, 0.9)) spawn.shield(me, x, y);
    },
    striker: function(x, y, radius = 15 + Math.ceil(Math.random() * 25)) {
        mobs.spawn(x, y, 5, radius, "rgb(221,102,119)", [
            "healthBar",
            "seePlayerCheck",
            "attraction",
            "gravity",
            "fallCheck",
            "strike"
        ]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.0004;
        me.g = 0.0002; //required if using 'gravity'
        me.frictionStatic = 0;
        me.friction = 0;
        me.delay = 60;
        Matter.Body.rotate(me, Math.PI * 0.1);
    },
    ghoster: function(x, y, radius = 50 + Math.ceil(Math.random() * 70)) {
        let me;
        if (Math.random() > 0.25) {
            //fast
            mobs.spawn(x, y, 9, radius, "transparent", ["seePlayerCheckByDistance", "fallCheck", "attraction", "healthBar"]);
            me = mob[mob.length - 1];
            me.accelMag = 0.00025;
        } else {
            //slow but can yank
            mobs.spawn(x, y, 7, radius, "transparent", [
                "seePlayerCheckByDistance",
                "fallCheck",
                "attraction",
                "yank",
                "healthBar"
            ]);
            me = mob[mob.length - 1];
            me.delay = 250 + Math.random() * 150;
            me.accelMag = 0.00015;
            if (Math.random() < Math.min(0.1 + game.levelsCleared * 0.1, 0.9)) spawn.shield(me, x, y);
        }
        me.seeAtDistance2 = Math.pow(1000 - radius * 3, 2); //sees longer distance at smaller radius
        me.collisionFilter.mask = 0x001110; //move through walls
        me.memory = 400; //memory+memory*Math.random()
    },
    blinker: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 6, radius, "rgb(0,200,255)", ["healthBar", "seePlayerCheck", "fallCheck", "blink"]);
        let me = mob[mob.length - 1];
        me.blinkRate = 40 + Math.round(Math.random() * 60); //required for blink
        me.blinkLength = 150 + Math.round(Math.random() * 200); //required for blink
        //me.collisionFilter.mask = 0x001100; //move through walls
        me.isStatic = true;
        me.memory = 360; //memory+memory*Math.random()
        me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    },
    drifter: function(x, y, radius = 15 + Math.ceil(Math.random() * 40)) {
        mobs.spawn(x, y, 4.5, radius, "rgb(0,200,255)", ["healthBar", "seePlayerCheck", "fallCheck", "drift"]);
        Matter.Body.rotate(mob[mob.length - 1], Math.random() * 2 * Math.PI);
        let me = mob[mob.length - 1];
        me.blinkRate = 30 + Math.round(Math.random() * 30); //required for blink/drift
        me.blinkLength = 150; //required for blink/drift
        //me.collisionFilter.mask = 0x001100; //move through walls
        me.isStatic = true;
        me.memory = 360; //memory+memory*Math.random()
        me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    },
	phaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 30)) {
		mobs.spawn(x, y, 6, radius, "rgba(110,150,255,0.17)", ["phaseIn", "locatePlayerByDist", "attraction", "gravity"]);
		let me = mob[mob.length - 1];
		me.accelMag = 0.001;
		me.g = 0.0005; //required if using 'gravity'
		me.phaseRange2 = Math.round(Math.pow(radius+210,2))
		me.locateRange = 1000*1000;
		me.collisionFilter.mask = 0x000001; //can't be hit by bullets or player
	},
    sneakAttacker: function(x, y, radius = 25 + Math.ceil(Math.random() * 30)) {
        mobs.spawn(x, y, 6, radius, "rgb(235,235,235)", ["healthBar", "gravity", "fallCheck", "sneakAttack"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.collisionFilter.mask = 0x000001; //can't be hit by bullets or player
        Matter.Body.rotate(me, Math.PI * 0.17);
        me.fill = "transparent";
    },
    shooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 3, radius, "rgb(100,50,255)", ["healthBar", "seePlayerbyDistAndLOS", "fire"]);
        let me = mob[mob.length - 1];
        me.facePlayer = true;
        me.isStatic = true;
		me.seeAtDistance2 = 4000000
        me.fireFreq = Math.ceil(20 + 2000 / radius);
        me.memory = 120; //memory+memory*Math.random() in cycles
        if (Math.random() < Math.min(0.15 + game.levelsCleared * 0.1, 1)) spawn.shield(me, x, y);
    },
    chaseShooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 3, radius, "rgb(155,0,255)", [
            "healthBar",
            "gravity",
            "seePlayerbyDistAndLOS",
            "fallCheck",
            "attraction",
            "fire"
        ]);
        let me = mob[mob.length - 1];
        me.facePlayer = false;
        me.g = 0.0002; //required if using 'gravity'
        me.accelMag = 0.0003;
		me.seeAtDistance2 = 4000000
        me.fireFreq = Math.ceil(40 + 2000 / radius);
        me.memory = 120; //memory+memory*Math.random() in cycles
        if (Math.random() < Math.min(0.15 + game.levelsCleared * 0.1, 1)) spawn.shield(me, x, y);
    },
    bullet: function(x, y, radius = 4) {
        //bullets
        mobs.spawn(x, y, 0, radius, "rgb(255,0,0)", ["gravity", "timeLimit"]);
        let me = mob[mob.length - 1];
        me.onHit = function(k) {
            //run this function on hitting player
            spawn.explode(k);
            this.timeLeft = 0;
        };
        me.onDeath = function(k) {
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
        mobs.spawn(x, y, 5, radius, "rgb(255,150,0)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0004; //required if using 'gravity'
        me.accelMag = 0.001;
        me.memory = 240; //memory+memory*Math.random() in cycles
        me.onDeath = function(that) {
            //run this function on death
            for (let i = 0; i < Math.ceil(that.mass * 0.25 + Math.random() * 3); ++i) {
                spawn.spawns(
                    that.position.x + (Math.random() - 0.5) * radius * 2,
                    that.position.y + (Math.random() - 0.5) * radius * 2
                );
                Matter.Body.setVelocity(mob[mob.length - 1], {
                    x: (Math.random() - 0.5) * 25,
                    y: (Math.random() - 0.5) * 25
                });
            }
        };
    },
    spawns: function(x, y, radius = 15 + Math.ceil(Math.random() * 5)) {
        mobs.spawn(x, y, 4, radius, "rgb(255,0,0)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.onHit = function(k) {
            //run this function on hitting player
            spawn.explode(k);
        };
        me.g = 0.00015; //required if using 'gravity'
        me.accelMag = 0.0004;
        me.seePlayerFreq = 75 + Math.round(Math.random() * 50);
        me.frictionAir = 0.002;
    },
    exploder: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 7, radius, "rgb(255,0,0)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.onHit = function(k) {
            //run this function on hitting player
            spawn.explode(k);
        };
        me.g = 0.0004; //required if using 'gravity'
        me.accelMag = 0.0014;
    },
    explode: function(k) {
        mech.damage(0.1 * Math.sqrt(mob[k].mass) * game.dmgScale);
        game.drawList.push({
            //add dmg to draw queue
            x: mech.pos.x,
            y: mech.pos.y,
            radius: 80 * Math.sqrt(mob[k].mass),
            color: "rgba(255,0,0,0.25)",
            time: 5
        });
        mob[k].death(false); //death with no power up
    },
    dotsploder: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 7, radius, "rgb(55,0,165)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.onHit = function(k) {
            //run this function on hitting player
            spawn.dot(k, 7, 1500);
            mob[k].death(false); //death with no power up
        };
        me.g = 0.0004; //required if using 'gravity'
    },
    dot: function(k, num = 3, delay = 1000) {
        //adds a damage over time to the mob onHit method
        //sometimes causes the player to have undefined health (and be unkillable)
        for (let i = 0; i < num; ++i) {
            //dots
            setTimeout(
                function() {
                    mech.damage(0.01 * Math.sqrt(mob[k].mass) * game.dmgScale);
                    game.drawList.push({
                        //add dmg to draw queue
                        x: mech.pos.x,
                        y: mech.pos.y,
                        radius: 50,
                        color: "rgba(125,100,150,0.5)",
                        time: 1
                    });
                },
                (i + 1) * 1000
            );
        }
        game.drawList.push({
            //add dmg to draw queue
            x: mech.pos.x,
            y: mech.pos.y,
            radius: 100,
            color: "rgba(125,100,150,0.5)",
            time: 5
        });
    },
    shield: function(target, x, y, stiffness = 0.6) {
        if (this.allowShields) {
            mobs.spawn(x, y, 9, target.radius + 20, "transparent", ["fallCheck"]);
            let me = mob[mob.length - 1];
            me.stroke = "#000";
            me.density = 0.0001; //very low density to not mess with the original mob's motion
            me.shield = true;
            me.collisionFilter.mask = 0x001100;
            consBB[consBB.length] = Constraint.create({
                //attach shield to last spawned mob
                bodyA: me,
                bodyB: target,
                stiffness: stiffness
            });
            me.onDeath = function(that) {
                //run this function on death
                that.deadCount = 0; //don't show a body after death
            };
        }
    },
    //complex constrained mob templates**********************************************************************
    //*******************************************************************************************************
    allowShields: true,
    nodeBoss: function(
        x,
        y,
        spawn = "striker",
        nodes = Math.min(3 + Math.round(Math.random() * (game.levelsCleared + 1)), 7),
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
			if (spawn === 'random'){
				this[this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]](x + px, y + py, radius);
			} else {
				this[spawn](x + px, y + py, radius);
			}
        }
        this.constrainAllMobCombos(nodes, stiffness);
        this.allowShields = true;
    },
    lineBoss: function(
        x,
        y,
        spawn = "striker",
        nodes = Math.min(3 + Math.round(Math.random() * (game.levelsCleared + 1)), 7),
        //Math.ceil(Math.random() * 3) + Math.min(4,Math.ceil(game.levelsCleared/2)),
        radius = Math.ceil(Math.random() * 10) + 17,
        l = Math.ceil(Math.random() * 80) + 30,
        stiffness = Math.random() * 0.5 + 0.01
    ) {
        this.allowShields = false;
        for (let i = 0; i < nodes; ++i) {
			if (spawn === 'random'){
				this[this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]](x + i * radius + i * l, y, radius);
			} else {
				this[spawn](x + i * radius + i * l, y, radius);
			}
        }
        for (let i = 0; i < nodes - 1; ++i) {
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - i - 1],
                bodyB: mob[mob.length - i - 2],
                stiffness: stiffness
            });
        }
        for (let i = 0; i < nodes - 2; ++i) {
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - i - 1],
                bodyB: mob[mob.length - i - 3],
                stiffness: stiffness
            });
        }

        this.allowShields = true;
    },
    //constraints ************************************************************************************************
    //*************************************************************************************************************
    constrainAllMobCombos: function(num, stiffness) {
        //runs through every combination of last 'num' bodies and constrains them
        for (let i = 1; i < num + 1; ++i) {
            for (let j = i + 1; j < num + 1; ++j) {
                consBB[consBB.length] = Constraint.create({
                    bodyA: mob[mob.length - i],
                    bodyB: mob[mob.length - j],
                    stiffness: stiffness
                });
            }
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
	laserZone: function(x,y,width,height,dmg){
		level.addZone(x, y, width, height, "laser",{dmg});
		level.fill.push({x: x, y: y, width: width, height: height, color: '#f00'});
	},
	deathQuery: function(x,y,width,height){
		level.addQueryRegion(x, y, width, height, "death", [[player], mob]);
		level.fill.push({x: x, y: y, width: width, height: height, color: '#f00'});
	},
    debris: function(x, y, width, number = Math.floor(3 + Math.random() * 11)) {
        for (let i = 0; i < number; ++i) {
            if (Math.random() < 0.14) {
                powerUps.chooseRandomPowerUp(x + Math.random() * width, y);
            } else {
                const size = 15 + Math.random() * 25;
                body[body.length] = Bodies.rectangle(
                    x + Math.random() * width,
                    y,
                    size * (0.5 + Math.random() * 1),
                    size * (0.5 + Math.random() * 1)
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
