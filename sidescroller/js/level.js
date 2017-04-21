//global game variables
let body = []; //non static bodies
let map = []; //all static bodies
let cons = []; //all constaints between a point and a body
let consBB = []; //all constaints between two bodies
//main object for spawning levels
const level = {
    levels: ["towers", "skyscrapers", "rooftops"], // name of the level methods that the player runs through
    onLevel: undefined,
    start: function() {
        spawn.setSpawnList(); //picks a couple mobs types for a themed random mob spawns
		if (game.testing){
			this.boss();
		} else {
			this[this.levels[this.onLevel]]();
		}
        //this.buildings();				//this.testing();		//this.towers();
        //this.skyscrapers();        //this.rooftops();
        this.addToWorld(); //add map to world
		document.getElementById("text-log-big").textContent = document.title = 'level '+(game.levelsCleared+1)+' '+level.levels[level.onLevel]
		game.lastLogTimeBig = game.cycle+360; //log new map
		// document.getElementById("text-log").textContent = 'level '+(game.levelsCleared+1)+' '+level.levels[level.onLevel]
		// game.lastLogTime = game.cycle+360; //log new map
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    boss: function() {
        //empty map for testing mobs
        document.body.style.backgroundColor = "#fafafa";
        //this.addZone(600,-10,100,10,'fling');
        //this.addZone(400,0,100,-100,'nextLevel');
        mech.setPosToSpawn(-100, -200); //normal spawn
        spawn.mapRect(3500, -860, 100, 50); //ground bump wall
        spawn.mapRect(-200, 0, 1200, 300); //ground
        spawn.mapVertex(1250, 0, "0 0 0 300 -500 600 -500 300");
        spawn.mapRect(1500, -300, 2000, 300); //upper ground
        spawn.mapVertex(3750, 0, "0 600 0 300 -500 0 -500 300");
        spawn.mapRect(4000, 0, 1000, 300); //right lower ground
        spawn.mapRect(2200, -600, 600, 50); //center platform
        spawn.mapRect(1300, -850, 700, 50); //center platform
        spawn.mapRect(3000, -850, 700, 50); //center platform
        spawn.spawnBuilding(-200, -190, 200, 175, false, true, "left"); //far left; player spawns in side

        powerUps.spawn(750, -125, "gun", false);
		//spawn.spawner(750,-300,100)

    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    rooftops: function() {
        //playSound("ambient_wind"); //play ambient audio for level
        document.body.style.backgroundColor = "#e6e4e4";
        this.addSVG("background_rooftops", "foreground_rooftops");

        this.addZone(3600, -300, 100, 30, "nextLevel");
        this.addZone(-1275, 1080, 7600, 50, "death");

        if (!game.levelsCleared) powerUps.spawn(2450, -1675, "gun", false);

        mech.setPosToSpawn(-450, -2050); //normal spawn
        //mech.setPosToSpawn(4600, -900); //normal spawn
        //mech.setPosToSpawn(4400, -400); //normal spawn

        spawn.mapRect(-1275, 1100, 7600, 350); //ground
        spawn.mapRect(-700, -2000, 2100, 100); //Top left ledge
        spawn.mapRect(-700, -1950, 100, 3050); //left building wall
        spawn.mapRect(1300, -1950, 100, 3050); //
        spawn.mapRect(-700, -2350, 50, 400); //far left starting left wall
        spawn.mapRect(-700, -2010, 500, 50); //far left starting ground
        spawn.mapRect(-700, -2350, 500, 50); //far left starting ceiling
        spawn.mapRect(-250, -2350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(-230, -2130, 14, 140, spawn.propsFriction); //door to starting room
        spawn.bodyRect(200, -2150, 200, 220); //
        spawn.mapRect(700, -2275, 700, 50); //
        //spawn.bodyRect(675, -2225, 25, 220); //
        spawn.randomMob(900, -2125); //
        spawn.randomSmallMob(-350, -2400); //
        spawn.bodyRect(1050, -2350, 50, 75); //
        //spawn.bodyRect(1750, -1125, 125, 125); //
        spawn.mapVertex(1750, -970, "120 40 -120 40 -50 -40 50 -40");
        this.addZone(1700, -1030, 100, 30, "fling", 0, -30);
        //spawn.mapVertex(1700, -1100, '0 0 0 -300 300 0');

        spawn.mapRect(1600, -1000, 1600, 100); //middle ledge
        spawn.mapRect(1600, -950, 100, 2050); //left building vertical wall
        spawn.mapRect(3100, -950, 100, 2050); //right building vertical wall
        spawn.bodyRect(3500, -1725, 20, 475); //
        spawn.randomSmallMob(2200, -1775); //
        spawn.bodyRect(2700, -1125, 125, 125); //
        spawn.bodyRect(2710, -1250, 125, 125); //
        spawn.mapRect(3150, -1600, 350, 50); //
        spawn.mapRect(2075, -1600, 700, 50); //
        spawn.randomBoss(2225, -1325); //
        spawn.randomMob(3200, -1150); //
        spawn.bodyRect(3100, -1015, 375, 15); //

        spawn.mapRect(3500, 0, 2000, 100); //bottom right ledge
        spawn.mapRect(3400, -1000, 100, 2100); //left building wall
        spawn.mapRect(5450, -775, 100, 1900); //right building wall
        spawn.bodyRect(4850, -750, 300, 25); //
        spawn.bodyRect(3925, -1400, 100, 150); //
        spawn.mapRect(3450, -1250, 1100, 50); //
        spawn.mapRect(3450, -1225, 50, 75); //
        spawn.mapRect(4500, -1225, 50, 350); //
        spawn.mapRect(3450, -725, 1450, 50); //
        spawn.mapRect(5100, -725, 400, 50); //
        spawn.mapRect(4500, -700, 50, 600); //
        spawn.bodyRect(4500, -100, 50, 100); //
        spawn.randomMob(4250, -1350); //
        spawn.randomSmallMob(4000, -825); //
        spawn.mapVertex(5000, 30, "120 40 -120 40 -50 -40 50 -40");
        this.addZone(4950, -30, 100, 30, "fling", 0, -24);
        spawn.spawnStairs(3800, 0, 4, 150, 225); //stairs top exit
        spawn.mapRect(3500, -275, 350, 275); //exit platform
        spawn.mapRect(3600, -285, 100, 50); //ground bump wall
        spawn.randomSmallMob(4100, -100);
        spawn.randomSmallMob(4600, -100);
        spawn.randomMob(5200, -100);
        //spawn.randomBoss(4850, -1250);
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    towers: function() {
        //document.body.style.backgroundColor = "#f9f5f3";
        document.body.style.backgroundColor = "#fff";
        this.addSVG("background_towers", "foreground_towers");
        //playSound("ambient_wind");//play ambient audio for a
        mech.setPosToSpawn(1375, -1550); //normal spawn
        //mech.setPosToSpawn(600, -1200); //normal spawn
        //mech.setPosToSpawn(525, -150); //ground first building
        //mech.setPosToSpawn(3150, -700); //near exit spawn

        if (!game.levelsCleared) powerUps.spawn(525, -700, "gun", false);

        spawn.mapRect(-600, 25, 5600, 300); //ground
        const w = 2000;
        const h = 2000;
        let x = -600; //left building
        spawn.mapRect(x, 0, w, 50); //ground
        spawn.mapRect(x, -1700, 50, h - 100); //left wall
        spawn.bodyRect(-295, -1540, 40, 40); //center block under wall
        spawn.bodyRect(-298, -1580, 40, 40); //center block under wall
        spawn.mapRect(1550, -2000, 50, 550); //right wall
        spawn.mapRect(1350, -2000 + 505, 50, 1295); //right wall

        spawn.mapRect(x, -h + 250, w - 700, 50); //roof left
        spawn.mapRect(x + 1300, -h, 50, 300); //right roof wall
        spawn.mapRect(x + 1300, -h, 900, 50); //center wall
        map[map.length] = Bodies.polygon(425, -1700, 0, 15); //circle above door
        spawn.bodyRect(420, -1675, 15, 170, spawn.propsDoor); // door
        consBB[consBB.length] = Constraint.create({
            //makes door swing
            bodyA: body[body.length - 1],
            pointA: {
                x: 0,
                y: -90
            },
            bodyB: map[map.length - 1],
            stiffness: 1
        });
        spawn.mapRect(x + 300, -h * 0.75, w - 100, 50); //3rd floor
        spawn.mapRect(x + w * 0.7, -h * 0.74, 50, 375); //center wall
        spawn.bodyRect(x + w * 0.7, -h * 0.5 - 106, 50, 106); //center block under wall
        spawn.mapRect(-600, -1000, 1100, 50); //2nd floor
        spawn.mapRect(600, -1000, 500, 50); //2nd floor
        //body[body.length] = Bodies.polygon(550, -1100, 0,80);

        //spawn.bodyRect(450,-1020, 200, 10); //center block under wall
        spawn.spawnStairs(x, -1000, 5, 250, 350); //stairs 2nd
        spawn.mapRect(350, -600, 350, 150); //center table
        body[body.length] = Bodies.polygon(4450, -635, 0, 70, {
            restitution: 0.7,
            friction: 0.004,
            frictionAir: 0.004
        });

        spawn.mapRect(x + 300, -h * 0.25, w - 300, 50); //1st floor
        spawn.spawnStairs(x + w - 50, -500, 5, 250, 350, true); //stairs 1st
        spawn.spawnStairs(x, 0, 5, 250, 350); //stairs ground
        spawn.bodyRect(700, -200, 100, 100); //center block under wall
        spawn.bodyRect(700, -300, 100, 100); //center block under wall
        spawn.bodyRect(700, -400, 100, 100); //center block under wall

        spawn.mapRect(1390, 13, 30, 20); //step left
        spawn.mapRect(2980, 13, 30, 20); //step right
        spawn.mapRect(3000, 0, w, 50); //ground

        spawn.bodyRect(4250, -700, 50, 100);

        spawn.bodyRect(3000, -200, 50, 200); //door
        spawn.mapRect(3000, -1000, 50, 800); //left wall
        spawn.mapRect(3000 + w - 50, -1300, 50, 1100); //right wall
        spawn.mapRect(4150, -600, 350, 150); //table
        spawn.mapRect(3650, -1300, 50, 650); //exit wall
        spawn.mapRect(3650, -1300, 1350, 50); //exit wall
        spawn.mapRect(3000 + 250, -510, 100, 50); //ground bump wall
        this.addZone(3250, -530, 100, 30, "nextLevel");
        spawn.mapRect(3000, -h * 0.5, 700, 50); //exit roof
        spawn.mapRect(3000, -h * 0.25, w - 300, 50); //1st floor
        spawn.spawnStairs(3000 + w - 50, 0, 5, 250, 350, true); //stairs ground

        //spawn.hunter(0,-1650);
        spawn.randomSmallMob(0, -1600);
        spawn.randomMob(200, -1200);
        spawn.randomSmallMob(1315, -880, 1);
        spawn.randomMob(-250, -700);
        spawn.randomMob(-100, -225);
        //spawn.randomBoss(3050, -1400);
        spawn.randomBoss(1800, -800);
        //spawn.randomMob(2600, -100);

        //mobs.spawn(2850, -80, 5, 100, 'rgba(220,50,50,', ["seePlayerCheck", "fallCheck", "burstAttraction", 'gravity']);
        spawn[spawn.pickList[0]](2850, -80, 100);
        // mob[mob.length - 1].g = 0.0002; //required if using 'gravity'
        // mob[mob.length - 1].accelMag = 0.15;
        // mob[mob.length - 1].frictionAir = 0.02;
        // mob[mob.length - 1].restitution = 0.8;
        // mob[mob.length - 1].delay = 120;
        cons[cons.length] = Constraint.create({
            //teatherball
            pointA: {
                x: 2500,
                y: -500
            },
            bodyB: mob[mob.length - 1],
            stiffness: 0.0004
        });
        spawn.randomMob(4100, -225);
        spawn.randomBoss(4150, -1000);
        spawn.randomSmallMob(3550, -550);
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    skyscrapers: function() {
        //document.body.style.backgroundColor = "#f0f0f0";
        document.body.style.backgroundColor = "#e6e4e4";
        this.addSVG("background_skyscrapers", "foreground_skyscrapers");
        //playSound("ambient_wind"); //play ambient audio for level

        if (!game.levelsCleared) powerUps.spawn(1475, -1175, "gun", false);
        mech.setPosToSpawn(-50, -50); //normal spawn
        //mech.setPosToSpawn(1550, -1200); //spawn left high
        //mech.setPosToSpawn(1800, -2000); //spawn near exit

        spawn.mapRect(-300, 0, 5000, 300); //***********ground
        spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
        spawn.mapRect(-300, -10, 500, 50); //far left starting ground
        spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
        spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(170, -130, 14, 140, spawn.propsFriction); //door to starting room
        spawn.mapVertex(525, 29.5, "120 40 -120 40 -50 -40 50 -40");
        this.addZone(475, -30, 100, 30, "fling", 3, -30);
        spawn.mapRect(700, -1100, 400, 990); //far left building
        spawn.bodyRect(1025, -1110, 400, 10); //block on far left building
        spawn.bodyRect(1550, -1110, 250, 10); //block on far left building
        spawn.mapRect(1600, -400, 1500, 500); //long center building
        spawn.bodyRect(2557, -450, 35, 55);
        spawn.bodyRect(2957, -450, 30, 15);
        spawn.bodyRect(2900, -450, 60, 45);
        spawn.mapRect(1345, -1100, 250, 25); //left platform
        spawn.mapRect(1755, -1100, 250, 25); //right platform
        spawn.bodyRect(1915, -1200, 60, 100); //block on platform
        spawn.mapRect(1300, -1850, 750, 50); //left higher platform
        spawn.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
        spawn.mapRect(1300, -2150, 450, 50); //left higher platform roof
        spawn.mapRect(1500, -1860, 100, 50); //ground bump wall
        this.addZone(1500, -1875, 100, 30, "nextLevel");
        spawn.mapRect(2400, -850, 600, 300); //center floating large square
        //spawn.bodyRect(2500, -1100, 25, 250); //wall before chasers
        spawn.bodyRect(2925, -1100, 25, 250); //wall next to chasers
        spawn.mapRect(2500, -1450, 450, 350); //higher center floating large square
        spawn.mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
        spawn.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
        spawn.bodyRect(2300, -1720, 400, 20); //platform above striker
        spawn.bodyRect(2590, -1780, 80, 80); //block on platform above striker
        spawn.mapRect(3300, -850, 150, 25); //ledge by far right building
        spawn.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
        spawn.mapRect(3600, -1100, 400, 990); //far right building
        //spawn.bodyRect(3850, -1250, 130, 170); //block on far right building
        spawn.mapVertex(4200, 29.5, "-50 -40 50 -40 120 40 -120 40");
        this.addZone(4150, -30, 100, 30, "fling", -3, -30);

        //spawn.heavyChaser(-100,-450);
        spawn.randomSmallMob(1300, -70);
        spawn.randomMob(-100, -450);
        spawn.randomMob(2650, -975);
        //spawn.randomMob(1800, -550, 2);
        spawn.randomMob(2650, -1550);
        //spawn.randomBoss(3300, -1800);
        spawn.randomBoss(3700, -1500);
        spawn.randomBoss(1700, -900);
        spawn.randomSmallMob(3200, -100);
        spawn.randomSmallMob(4450, -100);
        spawn.randomMob(1850, -1950);
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    buildings: function() {
        document.body.style.backgroundColor = "#f9faff";
        this.addSVG("background_buildings", "foreground_buildings");
        playSound("ambient_crickets"); //play ambient audio for level
        mech.setPosToSpawn(0, -100);
        //mech.setPosToSpawn(3900,-400); //spawn near exit for testing

        spawn.mapRect(-1000, 0, 5100, 500); //***********ground
        spawn.spawnBuilding(-300, -250, 600, 240, true, true); //first floor  player spawns in side
        spawn.spawnBuilding(-200, -500, 400, 240, true, true); //second floor
        spawn.mapVertex(-844, -50, "0 0 0 -150 200 -150 400 0");
        spawn.bodyRect(50, -600, 50, 100); //block on top of buildings
        spawn.shooter(650, -600, 50); //near entrance high up
        spawn.spawnBuilding(700, -400, 1400, 390, true, true); //long building
        body[body.length] = Bodies.circle(1400, -240, 20); //hanging ball
        spawn.constraintPB(1400, -375, body.length - 1, 0.9, spawn.propsNoRotation); //hanging ball
        spawn.mapRect(700, -185, 85, 25); //ledge for sneak attackers inside building
        spawn.mapRect(1250, -80, 300, 100); //table inside long building
        spawn.sneakAttacker(765, -230, 30); //inside long center building
        spawn.mapRect(2015, -185, 85, 25); //ledge for sneak attackers inside building
        spawn.sneakAttacker(2035, -230, 30); //inside long center building
        for (let i = 0; i < 9; i++) {
            //some random blocks on the roof
            const size = 20 + Math.round(Math.random() * Math.random() * 300);
            spawn.bodyRect(
                900 + 100 * i + Math.random() * 100,
                -600,
                size + Math.round(Math.random() * 50),
                size + Math.round(Math.random() * 50)
            );
        }
        spawn.mapRect(2700, -100, 1400, 150); //far right block higher ground
        spawn.mapRect(3100, -200, 1000, 150); //far right block higher ground
        spawn.spawnBuilding(3500, -500, 500, 290, false, false, "right"); //building around exit at the far right
        spawn.mapRect(3700, -220, 100, 25); //ground bump wall
        spawn.chaser(-850, -190, 30); //far left on ground
        spawn.hopper(3150, -250, 75); //near exit on ground
        spawn.hopper(3000, -150, 100); //near exit on ground
        spawn.hopper(3700, -300, 50); //near exit on ground
        spawn.ghoster(1000, -1800, 100); //high up looks like a sun
        spawn.shooter(3600, -600, 50); //near entrance high up
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    testing: function() {
        this.addSVG("background_testing", "foreground_testing");
        playSound("ambient_wind"); //play ambient audio for level
        mech.setPosToSpawn(725, 750);

        spawn.mapRect(4000, -200, 100, 25); //ground bump wall
        for (let i = 0; i < 4; i++) {
            spawn.hopper(5000 * Math.random() - 1500, -2000 * Math.random(), 20);
        }

        for (let i = 0; i < 5; i++) {
            //random bouncy circles
            body[body.length] = Bodies.circle(
                -800 + (0.5 - Math.random()) * 200,
                400 + (0.5 - Math.random()) * 200,
                7 + Math.ceil(Math.random() * 30),
                {
                    restitution: 0.5
                }
            );
        }

        for (let i = 0; i < 3; i++) {
            //stack of medium hexagons
            body[body.length] = Bodies.polygon(-400, 30 - i * 70, 6, 40, {
                angle: Math.PI / 2
            });
        }

        for (let i = 0; i < 5; i++) {
            //stairs of boxes taller on left
            for (let j = 0; j < 5 - i; j++) {
                const r = 40;
                body[body.length] = Bodies.rectangle(50 + r / 2 + i * r, 900 - r / 2 - i * r, r, r);
            }
        }
        for (let i = 0; i < 10; i++) {
            //stairs of boxes taller on right
            for (let j = 0; j < i; j++) {
                const r = 120;
                body[body.length] = Bodies.rectangle(2639 + r / 2 + i * r, 900 + r - i * r, r, r);
            }
        }
        for (let i = 0; i < 12; i++) {
            //a stack of boxes
            body[body.length] = Bodies.rectangle(1036, 700 + i * 21, 25, 21);
        }
        for (let i = 0; i < 12; i++) {
            //a stack of boxes
            body[body.length] = Bodies.rectangle(364, 700 + i * 21, 25, 21);
        }
        const x = -600;
        const r = 20;
        const y = 200;
        for (let i = 0; i < 5; i++) {
            body[body.length] = Bodies.circle(
                x + i * r * 2,
                490,
                r,
                Object.assign({}, spawn.propsHeavy, spawn.propsOverBouncy, spawn.propsNoRotation)
            );
            spawn.constraintPB(x + i * r * 2, 200, body.length - 1, 0.9);
        }
        body[body.length - 1].force.x = 0.02 * body[body.length - 1].mass; //give the last one a kick
        spawn.mapRect(-2000, 900, 3200, 100); //ground
        spawn.mapRect(2200, 900, 2000, 100); //far right ground
        spawn.mapRect(2300, 870, 50, 40); //ground bump
        spawn.mapVertex(-1300, 670, "0 0 -500 0 -500 200"); //angeled ceiling
        spawn.mapRect(700, 890, 50, 20); //ground bump
        spawn.mapRect(-600, 0, 400, 200); //left cave roof
        spawn.mapRect(-600, 600, 400, 200); //left cave
        spawn.mapRect(-50, 700, 100, 200); //left wall
        spawn.mapRect(650, 450, 200, 25); //wide platform
        spawn.mapRect(750, 250, 100, 25); //high platform
        spawn.mapRect(1000, 450, 400, 25); //platform
        spawn.mapRect(1200, 250, 200, 25); //platform
        Matter.Body.setAngle(map[map.length - 1], -Math.PI * 0.05);
        spawn.mapRect(1300, 50, 100, 25); //platform
        spawn.mapRect(1800, 50, 300, 25); //platform
        spawn.mapRect(1600, 250, 300, 25); //platform
        spawn.mapRect(2200, 150, 300, 400); //platform
        spawn.mapRect(350, 635, 700, 30); //first platform
        spawn.mapRect(50, 150, 400, 50); //thick wall above launcher
        spawn.mapRect(50, 450, 400, 80); //thick wall above launcher
        spawn.mapRect(-600, 2000, 3000, 100); // lower ground
        spawn.mapRect(1300, 1990, 100, 25, "launch"); //ground bump wall
        spawn.mapRect(-600, 1300, 400, 200); //left cave roof
        spawn.mapRect(-600, 1700, 400, 200); //left cave
        spawn.bodyRect(1700, 0, 100, 1100); //huge tall vertical box
        Matter.Body.setAngle(body[body.length - 1], -Math.PI * 0.35);
        spawn.bodyRect(800, 438, 250, 10); //long skinny box
        spawn.bodyRect(250, 250, 130, 200); //block inside the ledge
    },
    //*****************************************************************************************************************
    //*****************************************************************************************************************
    zones: [],
    checkZones: function() {
        for (let i = 0, len = this.zones.length; i < len; ++i) {
            if (
                player.position.x > this.zones[i].x1 &&
                player.position.x < this.zones[i].x2 &&
                player.position.y > this.zones[i].y1 &&
                player.position.y < this.zones[i].y2
            ) {
                this.zoneActions[this.zones[i].action](this.zones[i].p1, this.zones[i].p2);
                break;
            }
        }
    },
    addZone: function(x, y, width, height, action, p1, p2) {
        this.zones[this.zones.length] = {
            x1: x,
            y1: y - 70,
            x2: x + width,
            y2: y + height - 70, //-70 to adjust for player height
            action: action,
            p1: p1,
            p2: p2
        };
    },
    zoneActions: {
        fling: function(Vx = 0, Vy = -30) {
            Matter.Body.setVelocity(player, {
                x: player.velocity.x*0.4 + Vx,
                y: Vy
            });
        },
        nextLevel: function() {
            level.onLevel++;
            if (level.onLevel > level.levels.length - 1) level.onLevel = 0;
            game.clearMap();
            game.dmgScale += 0.2; //damage done by mobs increases each level
            b.dmgScale *= 0.85; //damage done by player decreases each level
            game.levelsCleared++;
            level.start();
        },
        death: function() {
            mech.death();
        },
        slow: function() {
            Matter.Body.setVelocity(player, {
                //reduce player velocity every cycle until not true
                x: player.velocity.x * 0.5,
                y: player.velocity.y * 0.5
            });
        }
    },
    background: "background_buildings",
    foreground: "foreground_buildings",
    removeSVG: function() {
        document.getElementById(this.background).style.display = "none"; //show SVGs for level
        document.getElementById(this.foreground).style.display = "none"; //show SVGs for level
    },
    addSVG: function(background, foreground) {
        this.background = background;
        this.foreground = foreground;
        document.getElementById(background).style.display = "inline"; //show SVGs for level
        document.getElementById(foreground).style.display = "inline"; //show SVGs for level
    },
    addToWorld: function(mapName) {
        //needs to be run to put bodies into the world
        for (let i = 0; i < body.length; i++) {
            //body[i].collisionFilter.group = 0;
            body[i].collisionFilter.category = 0x0000001;
            body[i].collisionFilter.mask = 0x111101;
            World.add(engine.world, body[i]); //add to world
        }
        for (let i = 0; i < map.length; i++) {
            //map[i].collisionFilter.group = 0;
            map[i].collisionFilter.category = 0x000001;
            map[i].collisionFilter.mask = 0x111111;
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
};
