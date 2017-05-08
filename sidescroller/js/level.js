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
        //game.levelsCleared = 5;  //for testing to simulate all possible mobs spawns
        spawn.setSpawnList(); //picks a couple mobs types for a themed random mob spawns
        this[this.levels[this.onLevel]]();
        //this.boss();
        //this.towers();
        //this.skyscrapers();
        //this.rooftops();
        this.addToWorld(); //add map to world
        const text = "level " + (game.levelsCleared + 1) + " " + level.levels[level.onLevel];
        document.title = text;
        //game.makeTextLog(text,120)
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    boss: function() {
        //empty map for testing mobs
        level.exit.x = 3500;
        level.exit.y = -860;
        document.body.style.backgroundColor = "#f6f6f6";
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
        //boost
        // spawn.mapVertex(600, 35, "120 40 -120 40 -50 -40 50 -40");
        // this.addZone(550, -25, 100, 30, "fling", 0, -20);
        // this.fill.push({
        // 	x: 550,
        // 	y: -25,
        // 	width: 100,
        // 	height: 30,
        // 	color: '#0ff'
        // })
        spawn.boost(550, -25);

        powerUps.spawn(450, -125, "gun", false);
        //spawn.randomBoss(1625,-1000)
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    rooftops: function() {
        document.body.style.backgroundColor = "#eee4e4";
        level.exit.x = 3600;
        level.exit.y = -300;
        this.addZone(3600, -300, 100, 30, "nextLevel");
        this.addZone(-700, -50, 4100, 100, "death");
        spawn.debris(1650, -1800, 3800, 10);
        if (!game.levelsCleared) powerUps.spawn(2450, -1675, "gun", false);
        mech.setPosToSpawn(-450, -2050); //normal spawn
        //mech.setPosToSpawn(4600, -900); //normal spawn
        //mech.setPosToSpawn(4400, -400); //normal spawn
		//foreground
        level.fill.push({ x: -650, y: -2300, width: 450, height: 300, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 3450, y: -1250, width: 1100, height: 1250, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 4550, y: -725, width: 900, height: 725, color: "rgba(0,0,0,0.1)" });
		level.fill.push({ x: 3400, y: 100, width: 2150, height: 925, color: "rgba(0,0,0,0.1)"});
		level.fill.push({ x: -700, y: -1900, width: 2100, height: 2900, color: "rgba(0,0,0,0.1)"});
		level.fill.push({ x: 1950, y: -1550, width: 1025, height: 550, color: "rgba(0,0,0,0.1)"});
		level.fill.push({ x: 1600, y: -900, width: 1600, height: 1900, color: "rgba(0,0,0,0.1)"});
		level.fill.push({ x: 3450, y: -1550, width: 350, height: 300, color: "rgba(0,0,0,0.1)"});
		level.fill.push({ x: 700, y: -2225, width: 700, height: 225, color: "rgba(0,0,0,0.1)"});

        //spawn.mapRect(-700, 0, 6250, 100); //ground
		spawn.mapRect(3400, 0, 2150, 100); //ground
        spawn.mapRect(-700, -2000, 2100, 100); //Top left ledge
        spawn.bodyRect(1350, -2125, 50, 125, 0.8); //
        spawn.bodyRect(1350, -2225, 50, 100, 0.8); //
        spawn.mapRect(-700, -2350, 50, 400); //far left starting left wall
        spawn.mapRect(-700, -2010, 500, 50); //far left starting ground
        spawn.mapRect(-700, -2350, 500, 50); //far left starting ceiling
        spawn.mapRect(-250, -2350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(-230, -2130, 14, 140, 1, spawn.propsFriction); //door to starting room
        spawn.bodyRect(200, -2150, 200, 220, 0.8); //
        spawn.mapRect(700, -2275, 700, 50); //
        spawn.bodyRect(1050, -2350, 50, 75, 0.8); //
        spawn.boost(1800, -1030);
        spawn.bodyRect(1625, -1100, 100, 75); //
        spawn.bodyRect(1350, -1025, 400, 25); //
        spawn.mapRect(-700, -1000, 2100, 100); //lower left ledge
        spawn.bodyRect(350, -1100, 200, 100, 0.8); //
        spawn.bodyRect(370, -1200, 100, 100, 0.8); //
        spawn.bodyRect(360, -1300, 100, 100, 0.8); //
        spawn.bodyRect(950, -1050, 300, 50, 0.8); //
        spawn.bodyRect(-600, -1250, 400, 250, 0.8); //
        spawn.mapRect(1600, -1000, 1600, 100); //middle ledge
        spawn.bodyRect(2700, -1125, 125, 125, 0.8); //
        spawn.bodyRect(2710, -1250, 125, 125, 0.8); //
        spawn.bodyRect(2705, -1350, 75, 100, 0.8); //
        spawn.mapRect(3450, -1600, 350, 50); //
        spawn.mapRect(1950, -1600, 1025, 50); //
        spawn.bodyRect(3100, -1015, 375, 15, 0.8); //
        spawn.bodyRect(3500, -850, 75, 125, 0.8); //
        spawn.bodyRect(4425, -1775, 75, 525, 0.1); //
        spawn.mapRect(3400, -1000, 100, 1100); //left building wall
        spawn.mapRect(5450, -775, 100, 875); //right building wall
        spawn.bodyRect(4850, -750, 300, 25, 0.8); //
        spawn.bodyRect(3925, -1400, 100, 150, 0.8); //
        spawn.mapRect(3450, -1250, 1100, 50); //
        spawn.mapRect(3450, -1225, 50, 75); //
        spawn.mapRect(4500, -1225, 50, 350); //
        spawn.mapRect(3450, -725, 1450, 50); //
        spawn.mapRect(5100, -725, 400, 50); //
        spawn.mapRect(4500, -700, 50, 600); //
        spawn.bodyRect(4500, -100, 50, 100, 0.8); //
        spawn.boost(4950, -30, 0, -24);

        spawn.spawnStairs(3800, 0, 4, 150, 225); //stairs top exit
        spawn.mapRect(3500, -275, 350, 275); //exit platform
        spawn.mapRect(3600, -285, 100, 50); //ground bump wall

        spawn.randomMob(900, -2125, 0.3); //
        spawn.randomSmallMob(-350, -2400); //
        spawn.randomMob(1225, -2400, 0.3); //

        spawn.randomBoss(600, -1575, 0);
        spawn.randomMob(1120, -1200, 0.3);
        spawn.randomSmallMob(2200, -1775); //
        spawn.randomBoss(2225, -1325, 0.4); //
        spawn.randomBoss(4900, -1200, 0); //
        spawn.randomMob(3200, -1150, 0.3); //
        spawn.randomMob(3000, -1150, 0.2); //
        spawn.randomMob(3300, -1750, 0.3); //
        spawn.randomMob(4250, -1350, 0.3); //
        spawn.randomMob(3650, -1350, 0.3); //
        spawn.randomMob(2650, -825, 0.3); //
        spawn.randomSmallMob(4000, -825); //
        spawn.randomSmallMob(4100, -100);
        spawn.randomSmallMob(4600, -100);
        spawn.randomMob(5200, -100, 0.3);
        spawn.randomMob(5275, -900, 0.2);
        spawn.randomMob(3765, -450, 0.3); //
        //spawn.randomBoss(4850, -1250,0.7);
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    towers: function() {
        document.body.style.backgroundColor = "#e0e5e0";
        mech.setPosToSpawn(1375, -1550); //normal spawn
        level.exit.x = 3250;
        level.exit.y = -530;
        this.addZone(3250, -530, 100, 30, "nextLevel");
		//foreground
        level.fill.push({ x: -550, y: -1700, width: 1300, height: 1700, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 750, y: -1450, width: 650, height: 1450, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 750, y: -1950, width: 800, height: 450, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 3000, y: -1000, width: 650, height: 1000, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 3650, y: -1300, width: 1300, height: 1300, color: "rgba(0,0,0,0.1)" });
		//background


        //mech.setPosToSpawn(600, -1200); //normal spawn
        //mech.setPosToSpawn(525, -150); //ground first building
        //mech.setPosToSpawn(3150, -700); //near exit spawn
        spawn.debris(-300, -200, 4800, 5); //ground debris
        spawn.debris(-300, -650, 4800, 5); //1st floor debris
        if (!game.levelsCleared) powerUps.spawn(525, -700, "gun", false);

        spawn.mapRect(-600, 25, 5600, 300); //ground
        spawn.mapRect(-600, 0, 2000, 50); //ground
        spawn.mapRect(-600, -1700, 50, 2000 - 100); //left wall
        spawn.bodyRect(-295, -1540, 40, 40); //center block under wall
        spawn.bodyRect(-298, -1580, 40, 40); //center block under wall
        spawn.mapRect(1550, -2000, 50, 550); //right wall
        spawn.mapRect(1350, -2000 + 505, 50, 1295); //right wall
        spawn.mapRect(-600, -2000 + 250, 2000 - 700, 50); //roof left
        spawn.mapRect(-600 + 1300, -2000, 50, 300); //right roof wall
        spawn.mapRect(-600 + 1300, -2000, 900, 50); //center wall
        map[map.length] = Bodies.polygon(425, -1700, 0, 15); //circle above door
        spawn.bodyRect(420, -1675, 15, 170, 1, spawn.propsDoor); // door
        //makes door swing
        consBB[consBB.length] = Constraint.create({
            bodyA: body[body.length - 1],
            pointA: {
                x: 0,
                y: -90
            },
            bodyB: map[map.length - 1],
            stiffness: 1
        });
        spawn.mapRect(-600 + 300, -2000 * 0.75, 1900, 50); //3rd floor
        spawn.mapRect(-600 + 2000 * 0.7, -2000 * 0.74, 50, 375); //center wall
        spawn.bodyRect(-600 + 2000 * 0.7, -2000 * 0.5 - 106, 50, 106); //center block under wall
        spawn.mapRect(-600, -1000, 1100, 50); //2nd floor
        spawn.mapRect(600, -1000, 500, 50); //2nd floor
        spawn.spawnStairs(-600, -1000, 5, 250, 350); //stairs 2nd
        spawn.mapRect(350, -600, 350, 150); //center table
        spawn.mapRect(-600 + 300, -2000 * 0.25, 2000 - 300, 50); //1st floor
        spawn.spawnStairs(-600 + 2000 - 50, -500, 5, 250, 350, true); //stairs 1st
        spawn.spawnStairs(-600, 0, 5, 250, 350); //stairs ground
        spawn.bodyRect(700, -200, 100, 100); //center block under wall
        spawn.bodyRect(700, -300, 100, 100); //center block under wall
        spawn.bodyRect(700, -400, 100, 100); //center block under wall
        spawn.mapRect(1390, 13, 30, 20); //step left
        spawn.mapRect(2980, 13, 30, 20); //step right
        spawn.mapRect(3000, 0, 2000, 50); //ground
        spawn.bodyRect(4250, -700, 50, 100);
        spawn.bodyRect(3000, -200, 50, 200); //door
        spawn.mapRect(3000, -1000, 50, 800); //left wall
        spawn.mapRect(3000 + 2000 - 50, -1300, 50, 1100); //right wall
        spawn.mapRect(4150, -600, 350, 150); //table
        spawn.mapRect(3650, -1300, 50, 650); //exit wall
        spawn.mapRect(3650, -1300, 1350, 50); //exit wall
        spawn.mapRect(3000 + 250, -510, 100, 50); //ground bump wall
        spawn.mapRect(3000, -2000 * 0.5, 700, 50); //exit roof
        spawn.mapRect(3000, -2000 * 0.25, 2000 - 300, 50); //1st floor
        spawn.spawnStairs(3000 + 2000 - 50, 0, 5, 250, 350, true); //stairs ground
        //teatherball
        spawn[spawn.pickList[0]](2850, -80, 40 + game.levelsCleared * 8);
        cons[cons.length] = Constraint.create({
            pointA: {
                x: 2500,
                y: -500
            },
            bodyB: mob[mob.length - 1],
            stiffness: 0.0004
        });
        spawn.randomSmallMob(0, -1600);
        spawn.randomMob(200, -1200, 1);
        spawn.randomMob(950, -1150, 0.25);
        spawn.randomSmallMob(1315, -880, 1);
        spawn.randomSmallMob(800, -600);
        spawn.randomMob(-250, -700, 0.4);
        spawn.randomMob(-100, -225, 0.1);
        spawn.randomMob(450, -225, 0.15);
        spawn.randomMob(1150, -225, 0.15);
        spawn.randomMob(2000, -225, 0.15);
        spawn.randomMob(3250, -225, 0.15);
        spawn.randomMob(4500, -225, 0.15);
        spawn.randomBoss(1800, -800, 0.4);
        spawn.randomMob(4100, -225, 0.4);
        spawn.randomSmallMob(4575, -560, 1);
        spawn.randomBoss(4150, -1000, 0.6);
        spawn.randomSmallMob(3550, -550);
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    skyscrapers: function() {
        document.body.style.backgroundColor = "#dcdcde";
        //playSound("ambient_wind"); //play ambient audio for level
        if (!game.levelsCleared) powerUps.spawn(1475, -1175, "gun", false);
        spawn.debris(700, -2200, 3800, 10);
        mech.setPosToSpawn(-50, -50); //normal spawn
        level.exit.x = 1500;
        level.exit.y = -1875;
        this.addZone(1500, -1875, 100, 30, "nextLevel");
        //mech.setPosToSpawn(1550, -1200); //spawn left high
        //mech.setPosToSpawn(1800, -2000); //spawn near exit
		//foreground
        level.fill.push({ x: 2500, y: -1100, width: 450, height: 250, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 2400, y: -550, width: 600, height: 150, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 2550, y: -1650, width: 250, height: 200, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 1350, y: -2100, width: 400, height: 250, color: "rgba(0,0,0,0.1)" });
        level.fill.push({ x: 700, y: -110, width: 400, height: 110, color: "rgba(0,0,0,0.2)" });
        level.fill.push({ x: 3600, y: -110, width: 400, height: 110, color: "rgba(0,0,0,0.2)" });
		level.fill.push({ x: -250, y: -300, width: 450, height: 300, color: "rgba(0,0,0,0.15)"});

		//background
		level.fillBG.push({ x: 1300, y: -1800, width: 750, height: 1800, color: "#d4d4d7"});
		level.fillBG.push({ x: 3350, y: -1325, width: 50, height: 1325, color: "#d4d4d7"});
		// level.fillBG.push({ x: 1350, y: -2100, width: 400, height: 250, color: "#d4f4f4"});

        spawn.mapRect(-300, 0, 5000, 300); //***********ground
        spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
        spawn.mapRect(-300, -10, 500, 50); //far left starting ground
        spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
        spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(170, -130, 14, 140, 1, spawn.propsFriction); //door to starting room
        spawn.boost(475, -30, 3, -30);
        spawn.mapRect(700, -1100, 400, 990); //far left building
        spawn.mapRect(1600, -400, 1500, 500); //long center building
        spawn.mapRect(1345, -1100, 250, 25); //left platform
        spawn.mapRect(1755, -1100, 250, 25); //right platform
        spawn.mapRect(1300, -1850, 750, 50); //left higher platform
        spawn.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
        spawn.mapRect(1300, -2150, 450, 50); //left higher platform roof
        spawn.mapRect(1500, -1860, 100, 50); //ground bump wall
        spawn.mapRect(2400, -850, 600, 300); //center floating large square
        //spawn.bodyRect(2500, -1100, 25, 250); //wall before chasers
        spawn.mapRect(2500, -1450, 450, 350); //higher center floating large square
        spawn.mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
        spawn.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
        spawn.mapRect(3300, -850, 150, 25); //ledge by far right building
        spawn.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
        spawn.mapRect(3600, -1100, 400, 990); //far right building
        spawn.boost(4150, -30, -3, -30);
        spawn.randomSmallMob(1300, -70);
        spawn.randomMob(-100, -450, 0.4);
        spawn.randomMob(2650, -975, 0.4);
        spawn.randomMob(2650, -1550, 0.2);
        spawn.randomMob(1450, -1300, 0.2);
        spawn.randomMob(2200, -600, 0.2);
        spawn.randomBoss(3700, -1500, 0.4);
        spawn.randomBoss(1700, -900, 0.4);
        spawn.randomSmallMob(3200, -100);
        spawn.randomSmallMob(4450, -100);
        spawn.randomMob(1850, -1950, 0.25);
        spawn.randomMob(2610, -1880, 0.25);
        spawn.randomMob(3350, -950, 0.25);
        spawn.randomMob(4150, -200, 0.15);
        spawn.randomMob(1690, -2250, 0.25);
        spawn.randomSmallMob(2700, -475);
        spawn.randomMob(900, -1300, 0.25);

        spawn.bodyRect(3200, -1375, 300, 25, 0.9);
        spawn.bodyRect(1825, -1875, 400, 25, 0.9);
        spawn.bodyRect(1800, -575, 250, 150, 0.8);
        spawn.bodyRect(2557, -450, 35, 55, 0.7);
        spawn.bodyRect(2957, -450, 30, 15, 0.7);
        spawn.bodyRect(2900, -450, 60, 45, 0.7);
        spawn.bodyRect(1915, -1200, 60, 100, 0.8);
        spawn.bodyRect(1925, -1300, 50, 100, 0.8);
        if (Math.random() < 0.9) {
            spawn.bodyRect(2300, -1720, 400, 20);
            spawn.bodyRect(2590, -1780, 80, 80);
        }
        spawn.bodyRect(2925, -1100, 25, 250, 0.8);
        spawn.bodyRect(3325, -1550, 50, 200, 0.3);
        if (Math.random() < 0.8) {
            spawn.bodyRect(1400, -75, 200, 75); //block to get up ledge from ground
            spawn.bodyRect(1525, -125, 50, 50); //block to get up ledge from ground
        }
        spawn.bodyRect(1025, -1110, 400, 10, 0.9); //block on far left building
        spawn.bodyRect(1550, -1110, 250, 10, 0.9); //block on far left building
    },
    //******************************************************************************************************************
    //******************************************************************************************************************
    buildings: function() {
        document.body.style.backgroundColor = "#f9faff";
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
    //*****************************************************************************************************************
    //*****************************************************************************************************************
    exit: {
        x: 10,
        y: 10,
        draw: function() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 30);
            ctx.lineTo(this.x, this.y - 90);
            ctx.bezierCurveTo(this.x, this.y - 180, this.x + 100, this.y - 180, this.x + 100, this.y - 90);
            ctx.lineTo(this.x + 100, this.y + 30);
            ctx.lineTo(this.x, this.y + 30);
            ctx.fillStyle = "#0ff";
            ctx.fill();
        }
    },
    fillBG: [],
    drawFillBGs: function() {
        for (let i = 0, len = level.fillBG.length; i < len; ++i) {
            const f = level.fillBG[i];
            ctx.fillStyle = f.color;
            ctx.fillRect(f.x, f.y, f.width, f.height);
        }
    },

    fill: [],
    drawFills: function() {
        for (let i = 0, len = level.fill.length; i < len; ++i) {
            const f = level.fill[i];
            ctx.fillStyle = f.color;
            ctx.fillRect(f.x, f.y, f.width, f.height);
        }
    },
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
                x: player.velocity.x * 0.4 + Vx,
                y: Vy
            });
        },
        nextLevel: function() {
            level.onLevel++;
            if (level.onLevel > level.levels.length - 1) level.onLevel = 0;
            game.dmgScale += 0.2; //damage done by mobs increases each level
            b.dmgScale *= 0.85; //damage done by player decreases each level
            game.levelsCleared++;
            game.clearNow = true;
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
