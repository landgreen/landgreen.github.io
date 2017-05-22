//main object for spawning things in a level
const spawn = {
    pickList: [],
    fullPickList: [
        "chaser",
        "chaser",
        "chaser",
        "shooter",
        "chaseShooter",
        "hopper",
        "burster",
        "burster",
		'blackHoler',
        "laserer",
        "striker",
        "striker",
        "springer",
        "ghoster",
        "blinker",
        "drifter",
        "sneakAttacker",
        "exploder",
        "spawner",
        "laserTracker"
    ],
    bossPickList: [
        "chaser",
        "chaseShooter",
        "burster",
        "laserer",
        "striker",
        "springer",
        "ghoster",
        "exploder",
        "spawner",
        "laserTracker"
    ],
    setSpawnList: function() {
        //this is run at the start of each new level to give the mobs on each level a flavor
        this.pickList = [];
        for (let i = 0, len = 1 + Math.ceil(Math.random() * Math.random() * 3); i < len; ++i) {
            this.pickList.push(this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)]);
        }
    },
    randomMob: function(x, y, chance = 1) {
        if (Math.random() < chance + game.levelsCleared * 0.04) {
            const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
            this[pick](x, y);
        }
    },
    randomSmallMob: function(
        x,
        y,
        num = Math.min(Math.ceil(Math.random() * Math.random() * game.levelsCleared), 5),
        size = 16 + Math.ceil(Math.random() * 15),
        chance = 1
    ) {
        if (Math.random() < chance + game.levelsCleared * 0.03) {
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
        if (Math.random() < chance + game.levelsCleared * 0.05) {
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
    shooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 3, radius, "rgb(100,50,255)", ["healthBar", "seePlayerCheck", "fireAt", "healthBar"]);
        let me = mob[mob.length - 1];
        me.isStatic = true;
        me.seePlayerFreq = 40 + Math.round(Math.random() * 35);
        me.memory = 20; //memory+memory*Math.random()
        //me.fireDelay = 40;
        me.fireDelay = Math.ceil(10 + 2000 / radius);
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.15, 1)) spawn.shield(me, x, y);
    },
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
        if (Math.random() < Math.min(0.1 + game.levelsCleared * 0.15, 0.9)) spawn.shield(me, x, y);
    },
    chaser: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 4, radius, "rgb(110,150,200)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.accelMag = 0.0012;
        me.memory = 240; //memory+memory*Math.random() in cycles
        if (Math.random() < Math.min(game.levelsCleared * 0.15, 0.9)) spawn.shield(me, x, y);
    },
    chaseShooter: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 3, radius, "rgb(155,0,255)", [
            "healthBar",
            "gravity",
            "seePlayerCheck",
            "fallCheck",
            "fireAt",
            "attraction"
        ]);
        let me = mob[mob.length - 1];
        me.accelMag = 0.0002;
        me.g = 0.0001; //required if using 'gravity'
        me.frictionAir = 0.0002;
        me.memory = 180; //memory+memory*Math.random() in cycles
        //me.fireDelay = 65;
        me.fireDelay = Math.ceil(30 + 2000 / radius);
        me.faceOnFire = false; //prevents rotation on fire
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.15, 0.95)) spawn.shield(me, x, y);
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
		radius = 10+radius/4 //extra small
		mobs.spawn(x, y, 0, radius, "transparent", [
			"seePlayerCheckByDistance",
			"fallCheck",
			"attraction",
			"darkness",
			'blackHole',
			"healthBar",
		]);
		let me = mob[mob.length - 1];
		me.delay = 300;
		me.eventHorizon = radius*33; //required for blackhole
		me.seeAtDistance2 = me.eventHorizon*me.eventHorizon //vision limit is event horizon
		me.accelMag = 0.0002;
		me.frictionAir = 0.04;
		me.memory = 1; //memory+memory*Math.random() in cycles
		Matter.Body.setDensity(me, 0.01);  //extra dense //normal is 0.001
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
        me.repulsionRange = 200000; //squared
        me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
        me.accelMag = 0.0006;
        me.frictionStatic = 0;
        me.friction = 0;
        me.onHit = function(k) {
            //run this function on hitting player
            mob[k].death();
        };
        if (Math.random() < Math.min(0.25 + game.levelsCleared * 0.15, 1)) spawn.shield(me, x, y);
    },
    laserTracker: function(x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
        mobs.spawn(x, y, 4, radius, "rgb(255,50,100)", [
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
        if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.15, 0.9)) spawn.shield(me, x, y);
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
            mobs.spawn(x, y, 0, radius, "transparent", ["seePlayerCheck", "fallCheck", "attraction"]);
            me = mob[mob.length - 1];
            me.accelMag = 0.00025;
        } else {
            //slow but can yank
            mobs.spawn(x, y, 7, radius, "transparent", ["seePlayerCheck", "fallCheck", "attraction", "yank"]);
            me = mob[mob.length - 1];
            me.delay = 250 + Math.random() * 150;
            me.accelMag = 0.00015;
            if (Math.random() < Math.min(0.1 + game.levelsCleared * 0.15, 0.9)) spawn.shield(me, x, y);
        }
        me.collisionFilter.mask = 0x001100; //move through walls
        me.memory = 720; //memory+memory*Math.random()
    },
    blinker: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        mobs.spawn(x, y, 6, radius, "rgb(0,200,255)", ["healthBar", "seePlayerCheck", "fallCheck", "blink"]);
        let me = mob[mob.length - 1];
        me.blinkRate = 40 + Math.round(Math.random() * 60); //required for blink
        me.blinkLength = 150 + Math.round(Math.random() * 200); //required for blink
        me.collisionFilter.mask = 0x001100; //move through walls
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
        me.collisionFilter.mask = 0x001100; //move through walls
        me.isStatic = true;
        me.memory = 360; //memory+memory*Math.random()
        me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    },
    sneakAttacker: function(x, y, radius = 15 + Math.ceil(Math.random() * 30)) {
        mobs.spawn(x, y, 6, radius, "rgb(235,235,235)", ["healthBar", "gravity", "fallCheck", "sneakAttack"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.collisionFilter.mask = 0x000001; //can't be hit by bullets or player
        Matter.Body.rotate(me, Math.PI * 0.17);
        me.fill = "transparent";
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
    swinger: function(x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
        //'rgba(110,150,200,1)'
        mobs.spawn(x, y, 4, radius, "rgb(110,150,200)", ["healthBar", "gravity", "seePlayerCheck", "fallCheck", "attraction"]);
        let me = mob[mob.length - 1];
        me.g = 0.0005; //required if using 'gravity'
        me.accelMag = 0.0012;
        me.memory = 240; //memory+memory*Math.random() in cycles
        spawn.bodyRect(x, y + 100, 50, 50); //center platform
        consBB[consBB.length] = Constraint.create({
            bodyA: mob[mob.length - 1],
            bodyB: body[body.length - 1],
            stiffness: 0.05
        });
    },
    snake: function(x, y, r = 25, l = 70, stiffness = 0.05, num = 6, faceRight = false) {
        if (faceRight) l *= -1;
        mobs.spawn(x - l * 0.4, y, 4, r * 1.6, "rgb(235,55,55)", ["healthBar", "seePlayerCheck", "fallCheck", "attraction"]);
        mob[mob.length - 1].accelMag = 0.0006 * mob[mob.length - 1].mass * Math.sqrt(num);
        mob[mob.length - 1].friction = 0;
        mob[mob.length - 1].frictionStatic = 0;
        mob[mob.length - 1].memory = 340; //memory+memory*Math.random() in cycles
        for (let i = 0; i < num; i += 2) {
            mobs.spawn(x + l * (i + 1), y, 4, r, "rgb(0,0,0)", ["healthBar", "gravity", "fallCheck"]);
            mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
            mob[mob.length - 1].density = 0.00001;
            mob[mob.length - 1].friction = 0;
            mob[mob.length - 1].frictionStatic = 0;
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - 2],
                stiffness: stiffness
            });
            mobs.spawn(x + l * (i + 2), y, 4, r, "rgb(235,55,55)", ["healthBar", "gravity", "fallCheck"]);
            mob[mob.length - 1].g = 0.0001; //required if using 'gravity'
            mob[mob.length - 1].density = 0.00001;
            mob[mob.length - 1].friction = 0;
            mob[mob.length - 1].frictionStatic = 0;
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1],
                bodyB: mob[mob.length - 2],
                stiffness: stiffness
            });
        }
        for (let i = 0; i < num - 1; ++i) {
            //add constraint between mobs that are one apart
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - 1 - i],
                bodyB: mob[mob.length - 3 - i],
                stiffness: stiffness
            });
        }
    },
    // snake: function(x, y, r = 25, l = 30, stiffness = 0.05, num = 6, faceRight = false) {
    //     if (faceRight) l *= -1;
    // 	//head segment
    //     mobs.spawn(x - l * 0.4, y, 4, r * 1.6, "rgb(235,55,55)", ["healthBar", "seePlayerCheck", "fallCheck", "attraction"]);
    //     mob[mob.length - 1].accelMag = 0.0006 * mob[mob.length - 1].mass * Math.sqrt(num);
    //     mob[mob.length - 1].friction = 0;
    //     mob[mob.length - 1].frictionStatic = 0;
    //     mob[mob.length - 1].memory = 340; //memory+memory*Math.random() in cycles
    // 	//2nd segment
    // 	spawn.bodyRect(x + l,y,r,r,1,spawn.propsSlide)
    // 	consBB[consBB.length] = Constraint.create({
    // 		bodyA: body[body.length - 1],
    // 		bodyB: mob[mob.length - 1],
    // 		stiffness: stiffness
    // 	});
    //     for (let i = 1; i < num; i++) {
    // 		spawn.bodyRect(x + l * (i + 1),y,r,r,1,spawn.propsSlide)
    //         consBB[consBB.length] = Constraint.create({
    //             bodyA: body[body.length - 1],
    //             bodyB: body[body.length - 2],
    //             stiffness: stiffness
    //         });
    //     }
    // 	consBB[consBB.length] = Constraint.create({
    // 		bodyA: body[body.length - num+1],
    // 		bodyB: mob[mob.length - 1],
    // 		stiffness: stiffness
    // 	});
    // },
    squid: function(x, y, radius = 30, length = 500, stiffness = 0.001, num = 7) {
        //almost a blinker
        mobs.spawn(x, y, 6, radius * 6, "rgb(0,15,30)", ["healthBar", "seePlayerCheck", "fallCheck", "blink"]); //,'pullPlayer','repelBullets']);
        mob[mob.length - 1].collisionFilter.mask = 0x001100; //move through walls
        mob[mob.length - 1].isStatic = true;
        mob[mob.length - 1].memory = 360; //memory+memory*Math.random()
        for (let i = 0; i < num; ++i) {
            this.burster(
                x + 2 * radius * i - (num - 1) * radius,
                y - length * 0.8 - length * 0.4 * Math.random() - radius * 2,
                radius
            );
            consBB[consBB.length] = Constraint.create({
                bodyA: mob[mob.length - i - 2],
                bodyB: mob[mob.length - 1],
                stiffness: stiffness
            });
        }
    },
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
            this[spawn](x + px, y + py, radius);
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
            this[spawn](x + i * radius + i * l, y, radius);
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
        //runs thourgh every combination of last 'num' bodies and constrains them
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
    //***************************************************************************************************
    boost: function(x, y, Vx = 0, Vy = -30) {
        spawn.mapVertex(x + 50, y + 60, "120 40 -120 40 -50 -40 50 -40");
        // level.addZone(x, y, 100, 30, "fling", {Vx:Vx, Vy: Vy});
        level.addQueryRegion(x + 10, y, 80, 50, "bounce", [[player],body,mob,powerUp,bullet],{ Vx: Vx, Vy: Vy });
        level.fillBG.push({ x: x, y: y - 0, width: 100, height: 25, color: "rgba(200,0,255,0.2)" });
		level.fillBG.push({ x: x, y: y - 30, width: 100, height: 55, color: "rgba(200,0,255,0.1)" });
		level.fillBG.push({ x: x, y: y - 95, width: 100, height: 120, color: "rgba(200,0,255,0.05)" });
    },
    debris: function(x, y, width, number = Math.floor(3 + Math.random() * 11)) {
        for (let i = 0; i < number; ++i) {
            if (Math.random() < 0.14) {
                powerUps.chooseRandomPowerUp(x + Math.random() * width, y);
            } else {
                body[body.length] = Bodies.rectangle(
                    x + Math.random() * width,
                    y,
                    10 + Math.random() * 25,
                    10 + Math.random() * 25
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
        friction: 0.002,
        frictionStatic: 0.2,
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
        frictionAir: 0.01,
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
