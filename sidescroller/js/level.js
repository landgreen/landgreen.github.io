//global game variables
const body = []; //non static bodies
const map = []; //all static bodies
const cons = []; //all constaints between a point and a body
const consBB = []; //all constaints between two bodies
//main object for spawning levels
const level = {
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    boss: function() {
        document.body.style.backgroundColor = "#fff";
        mech.setPosToSpawn(-100, -200); //normal spawn
        spawn.mapRect(-200, 0, 1200, 300); //ground
        spawn.mapVertex(1250, 0, '0 0 0 300 -500 600 -500 300');
        spawn.mapRect(1500, -300, 2000, 300); //upper ground
        spawn.mapVertex(3750, 0, '0 600 0 300 -500 0 -500 300');
        spawn.mapRect(4000, 0, 1000, 300); //right lower ground
        spawn.mapRect(2200, -600, 600, 50); //center platform
        spawn.mapRect(1300, -850, 700, 50); //center platform
        spawn.mapRect(3000, -850, 700, 50); //center platform
        spawn.spawnBuilding(-200, -190, 200, 175, false, true, 'left') //far left; player spawns in side

		//spawn.springer(2500,-2000);
        //spawn.squid(2500, -4000,20); //very high up
        spawn.snake(3900, -150,25,60);
        //spawn.puller(2500,-2000,100);
	        // spawn.laserer(2500, -2000);
	        // spawn.laserer(2500, -1200);
	        // spawn.laserer(2500, -1400);
	        // spawn.laserer(2500, -1800);
	    //spawn.laserer(2500, -1600);
        spawn.snake(1000, -1000,25,60);
        //spawn.nodeBoss(1500,-900,5,20,100,0.05);
		//spawn.nodeBoss(2500,-2900,70,10,50,0.005,'laserer');
    },
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    twoTowers: function() {
        //document.body.style.backgroundColor = "#f9f5f3";
        document.body.style.backgroundColor = "#fff";
        this.addSVG('background_twoTowers', 'foreground_twoTowers');
        //playSound("ambient_wind");//play ambient audio for level
        mech.setPosToSpawn(1375, -1600); //normal spawn
        //mech.setPosToSpawn(600, -1200); //normal spawn
        //mech.setPosToSpawn(4500, -1700); //near exit spawn
        //mech.setPosToSpawn(525, -150); //ground first building

        spawn.mapRect(-600, 25, 5600, 300); //ground
        const w = 2000;
        const h = 2000;
        let x = -600; //left building
        spawn.mapRect(x, 0, w, 50); //ground
        spawn.mapRect(x, -h + 300, 50, h - 100); //left wall
        spawn.mapRect(1550, -h, 50, 500); //right wall
        spawn.mapRect(1350, -h + 505, 50, 1295); //right wall

        spawn.mapRect(x, -h + 250, w - 700, 50); //roof left
        spawn.mapRect(x + 1300, -h, 50, 300); //right roof wall
        spawn.mapRect(x + 1300, -h, 900, 50); //center wall
        map[map.length] = Bodies.polygon(425, -1700, 0, 15); //circle above door
        spawn.bodyRect(420, -1675, 15, 170, spawn.propsDoor); // door
        consBB[consBB.length] = Constraint.create({ //makes door swing
            bodyA: body[body.length - 1],
            pointA: {
                x: 0,
                y: -90
            },
            bodyB: map[map.length - 1],
            stiffness: 1
        })
        spawn.mapRect(x + 300, -h * 0.75, w - 100, 50); //3rd floor
        spawn.mapRect(x + w * 0.7, -h * 0.74, 50, 375); //center wall
        spawn.bodyRect(x + w * 0.7, -h * 0.5 - 106, 50, 106); //center block under wall
        spawn.mapRect(x, -h * 0.5, w - 300, 50); //2nd floor
        spawn.spawnStairs(x, -1000, 5, 250, 350); //stairs 2nd
        spawn.mapRect(350, -600, 350, 150); //center table
        spawn.mapRect(x + 300, -h * 0.25, w - 300, 50); //1st floor
        spawn.spawnStairs(x + w - 50, -500, 5, 250, 350, true); //stairs 1st
        spawn.spawnStairs(x, 0, 5, 250, 350); //stairs ground
        spawn.bodyRect(700, -200, 100, 100); //center block under wall
        spawn.bodyRect(700, -300, 100, 100); //center block under wall
        spawn.bodyRect(700, -400, 100, 100); //center block under wall
        x = 3000; //right building
        spawn.mapRect(x, 0, w, 50); //ground
        spawn.bodyRect(3000, -200, 50, 200); //door
        spawn.mapRect(x, -1000, 50, 800); //left wall
        spawn.mapRect(x + w - 50, -1300, 50, 1100); //right wall
        spawn.mapRect(4150, -600, 350, 150); //table
        spawn.mapRect(3650, -1300, 50, 650); //exit wall
        spawn.mapRect(3650, -1300, 1350, 50); //exit wall
        spawn.mapRect(x + 250, -510, 100, 50, 'exit'); //ground bump wall
        spawn.mapRect(x, -h * 0.5, 700, 50); //exit roof
        spawn.mapRect(x, -h * 0.25, w - 300, 50); //1st floor
        spawn.spawnStairs(x + w - 50, 0, 5, 250, 350, true); //stairs ground

		if (Math.random()>0.5){
			this.twoTowersMobs();
		} else {
			this.twoTowersMobs2();
		}
    },
	twoTowersMobs: function(){
		spawn.hopper(0, -1550, 80); //on left 3rd floor
		spawn.hopper(-100, -1040, 60); //on left 3rd floor
		spawn.hopper(250, -1070, 100); //on left 3rd floor
		spawn.chaser(750, -750, 50); //by right stairs
		spawn.chaser(895, -600, 50); //by right stairs
		spawn.chaser(955, -650, 50); //by right stairs
		spawn.striker(-400, -230, 25); //left side
		spawn.striker(-341, -172, 30); //left side
		spawn.striker(-288, -95, 20); //left side
		spawn.chaseShooter(3450, -50, 50)
		spawn.chaseShooter(4500, -50, 50)
		spawn.blinker(2200, -1400, 200)
		spawn.burster(2500, -75, 50); //by right stairs
		cons[cons.length] = Constraint.create({ //teatherball
			pointA: {
				x: 2500,
				y: -500
			},
			bodyB: mob[mob.length - 1],
			stiffness: 0.0015
		})
		spawn.burster(3850, -1050, 30)
		spawn.burster(4400, -1100, 45)
		spawn.burster(4800, -1150, 60)
		spawn.burster(3450, -625, 50); //by right stairs
	},
	twoTowersMobs2: function(){
		//firstbuilding
		spawn.nodeBoss(100,-1300,6,15,100,0.05,'chaser');
		spawn.nodeBoss(100,-800,4,15,100,0.05,'striker');
		// spawn.nodeBoss(100,-200,	4,40,160,0.01,'hopper');
			spawn.snake(100,-200);
		//outside
		// spawn.laserer(1450, -1400);
		// spawn.laserer(1450, -900);
		// spawn.laserer(2975, -900);
		// spawn.laserer(2975, -600);

		//teatherball
		spawn.nodeBoss(2500,-1375,5,25,240,0.001,'burster');
		cons[cons.length] = Constraint.create({
			pointA: {
				x: 2500,
				y: -500
			},
			bodyB: mob[mob.length - 3],
			stiffness: 0.0015
		})
		//second building
		// spawn.nodeBoss(3900,-300,3,25,160,0.01,'puller');
		// spawn.nodeBoss(4100,-1000,5,10,160,0.001,'laserer');
		spawn.nodeBoss(4100,-1000,3,25,160,0.01,'puller');
		spawn.nodeBoss(3900,-300,5,15,160,0.001,'laserer');
	},
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    skyscrapers: function() {
        document.body.style.backgroundColor = "#f0f0f0";
        document.body.style.backgroundColor = "#e6e4e4";
        this.addSVG('background_skyscrapers', 'foreground_skyscrapers');
        playSound("ambient_wind"); //play ambient audio for level

        mech.setPosToSpawn(-50, -100); //normal spawn
        //mech.setPosToSpawn(1550, -1200); //spawn left high
        //mech.setPosToSpawn(1800, -2000); //spawn near exit

        spawn.mapRect(-300, 0, 5000, 300); //***********ground
        spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
        spawn.mapRect(-300, -10, 500, 50); //far left starting ground
        spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
        spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(170, -130, 14, 140, spawn.propsFriction); //door to starting room
        spawn.chaser(0, -390, 50); //above starting room
        //sneakAttacker(0, -390, 50);  //above starting room

        //mapRect(4700, -300, 150, 400); //far right ground wall
        spawn.mapVertex(525, 29.5, '120 40 -120 40 -50 -40 50 -40', 'launch');
        //spawn.mapVertex(525, 29.5, '-50 -40 50 -40 120 40 -120 40', 'launch');
        //mapRect(475, -15, 100, 25, 'launch'); //next to first tall building
        spawn.hopper(1300, -20, 20); //hiding underplatorm

        spawn.mapRect(700, -1100, 400, 990); //far left building
        //bodyRect(900, -1350, 50, 350); //block on far left building
        spawn.bodyRect(1025, -1110, 400, 10); //block on far left building
        spawn.bodyRect(1550, -1110, 250, 10); //block on far left building

        spawn.mapRect(1600, -400, 1500, 500); //long center building
        spawn.hopper(1650, -450, 30); //hiding underplatorm
        spawn.hopper(1750, -450, 40); //hiding underplatorm
        spawn.hopper(1850, -450, 20); //hiding underplatorm
        spawn.bodyRect(2557, -450, 35, 55); //wall before chasers
        spawn.bodyRect(2957, -450, 30, 15); //wall before chasers
        spawn.bodyRect(2900, -450, 60, 45); //wall before chasers

        spawn.mapRect(1345, -1100, 250, 25); //left platform
        spawn.mapRect(1755, -1100, 250, 25); //right platform
        spawn.bodyRect(1915, -1200, 60, 100); //block on platform

        spawn.mapRect(1300, -1850, 750, 50); //left higher platform
        spawn.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
        spawn.mapRect(1300, -2150, 450, 50); //left higher platform roof
        spawn.mapRect(1500, -1860, 100, 50, 'exit'); //ground bump wall

        spawn.mapRect(2400, -850, 600, 300); //center floating large square
        spawn.chaser(2430, -900, 30);
        spawn.bodyRect(2500, -1100, 25, 250); //wall before chasers
        spawn.chaser(2700, -950, 75);
        spawn.chaser(2700, -1060, 40);
        spawn.chaser(2800, -950, 85);
        spawn.bodyRect(2925, -1100, 25, 250); //wall next to chasers
        spawn.mapRect(2500, -1450, 450, 350); //higher center floating large square
        spawn.mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
        spawn.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
        //spawn.striker(2650, -1500, 50); //on higher center floating large square
        spawn.snake(2840, -1470, 20, 45, 0.05, 6, true);

        spawn.bodyRect(2300, -1720, 400, 20); //platform above striker

        spawn.bodyRect(2590, -1780, 80, 80); //block on platform above striker
        spawn.hopper(3200, -40, 40); //on ground far right
        spawn.hopper(4450, -20, 20); //on ground far right
        spawn.mapRect(3300, -850, 150, 25); //ledge by far right building
        spawn.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
        spawn.mapRect(3600, -1100, 400, 990); //far right building
        spawn.bodyRect(3850, -1250, 130, 170); //block on far right building
        spawn.mapVertex(4200, 29.5, '-50 -40 50 -40 120 40 -120 40', 'launch');
        //mapRect(4150, -15, 100, 25, 'launch'); //far right

        //spawn.mapRect(4500, -800, 600, 850); //far far right building
    },
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    skyscrapers2: function() {
        document.body.style.backgroundColor = "#f0f0f0";
        document.body.style.backgroundColor = "#e6e4e4";
        this.addSVG('background_skyscrapers', 'foreground_skyscrapers');
        playSound("ambient_wind"); //play ambient audio for level

        mech.setPosToSpawn(-50, -100); //normal spawn
        //mech.setPosToSpawn(1550, -1200); //spawn left high
        //mech.setPosToSpawn(1800, -2000); //spawn near exit

        spawn.mapRect(-300, 0, 5000, 300); //***********ground
        spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
        spawn.mapRect(-300, -10, 500, 50); //far left starting ground
        spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
        spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
        spawn.bodyRect(170, -130, 14, 140, spawn.propsFriction); //door to starting room

        spawn.mapVertex(525, 29.5, '120 40 -120 40 -50 -40 50 -40', 'launch');

        spawn.mapRect(700, -1100, 400, 990); //far left building
        spawn.bodyRect(1025, -1110, 400, 10); //block on far left building
        spawn.bodyRect(1550, -1110, 250, 10); //block on far left building

        spawn.mapRect(1600, -400, 1500, 500); //long center building
        spawn.bodyRect(2557, -450, 35, 55); //wall before chasers
        spawn.bodyRect(2957, -450, 30, 15); //wall before chasers
        spawn.bodyRect(2900, -450, 60, 45); //wall before chasers

        spawn.mapRect(1345, -1100, 250, 25); //left platform
        spawn.mapRect(1755, -1100, 250, 25); //right platform
        spawn.bodyRect(1915, -1200, 60, 100); //block on platform

        spawn.mapRect(1300, -1850, 750, 50); //left higher platform
        spawn.mapRect(1300, -2150, 50, 350); //left higher platform left edge wall
        spawn.mapRect(1300, -2150, 450, 50); //left higher platform roof
        spawn.mapRect(1500, -1860, 100, 50, 'exit'); //ground bump wall

        spawn.mapRect(2400, -850, 600, 300); //center floating large square
        spawn.bodyRect(2500, -1100, 25, 250); //wall before chasers
        spawn.bodyRect(2925, -1100, 25, 250); //wall next to chasers
        spawn.mapRect(2500, -1450, 450, 350); //higher center floating large square
        spawn.mapRect(2500, -1700, 50, 300); //left wall on higher center floating large square
        spawn.mapRect(2500, -1700, 300, 50); //roof on higher center floating large square
        //spawn.striker(2650, -1500, 50); //on higher center floating large square

        spawn.bodyRect(2300, -1720, 400, 20); //platform above striker

        spawn.bodyRect(2590, -1780, 80, 80); //block on platform above striker
        spawn.mapRect(3300, -850, 150, 25); //ledge by far right building
        spawn.mapRect(3300, -1350, 150, 25); //higher ledge by far right building
        spawn.mapRect(3600, -1100, 400, 990); //far right building
        spawn.bodyRect(3850, -1250, 130, 170); //block on far right building
        spawn.mapVertex(4200, 29.5, '-50 -40 50 -40 120 40 -120 40', 'launch');
        //mapRect(4150, -15, 100, 25, 'launch'); //far right

        //spawn.mapRect(4500, -800, 600, 850); //far far right building
        spawn.squid(-500, -3000);
        spawn.nodeBoss(2675, -1030, 5)
            //spawn.nodeBoss(0,-2000,5)
    },
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    buildings: function() {
        document.body.style.backgroundColor = "#f9faff";
        this.addSVG('background_buildings', 'foreground_buildings');
        playSound("ambient_crickets"); //play ambient audio for level
        mech.setPosToSpawn(0, -100);
        //mech.setPosToSpawn(3900,-400); //spawn near exit for testing

        spawn.mapRect(-1000, 0, 5100, 500); //***********ground
        spawn.spawnBuilding(-300, -250, 600, 240, true, true) //first floor  player spawns in side
        spawn.spawnBuilding(-200, -500, 400, 240, true, true) //second floor
        spawn.mapVertex(-844, -50, '0 0 0 -150 200 -150 400 0')
        spawn.bodyRect(50, -600, 50, 100); //block on top of buildings
        spawn.shooter(650, -600, 50) //near entrance high up
        spawn.spawnBuilding(700, -400, 1400, 390, true, true) //long building
        body[body.length] = Bodies.circle(1400, -240, 20); //hanging ball
        spawn.constraintPB(1400, -375, body.length - 1, 0.9, spawn.propsNoRotation); //hanging ball
        spawn.mapRect(700, -185, 85, 25); //ledge for sneak attackers inside building
        spawn.mapRect(1250, -80, 300, 100); //table inside long building
        spawn.sneakAttacker(765, -230, 30) //inside long center building
        spawn.mapRect(2015, -185, 85, 25); //ledge for sneak attackers inside building
        spawn.sneakAttacker(2035, -230, 30) //inside long center building
        for (let i = 0; i < 9; i++) { //some random blocks on the roof
            const size = 20 + Math.round(Math.random() * Math.random() * 300);
            spawn.bodyRect(900 + 100 * i + Math.random() * 100, -600, size + Math.round(Math.random() * 50), size + Math.round(Math.random() * 50));
        }
        spawn.mapRect(2700, -100, 1400, 150); //far right block higher ground
        spawn.mapRect(3100, -200, 1000, 150); //far right block higher ground
        spawn.spawnBuilding(3500, -500, 500, 290, false, false, 'right') //building around exit at the far right
        spawn.mapRect(3700, -220, 100, 25, 'exit') //ground bump wall
        spawn.chaser(-850, -190, 30) //far left on ground
        spawn.hopper(3150, -250, 75) //near exit on ground
        spawn.hopper(3000, -150, 100) //near exit on ground
        spawn.hopper(3700, -300, 50) //near exit on ground
        spawn.ghoster(1000, -1800, 100) //high up looks like a sun
        spawn.shooter(3600, -600, 50) //near entrance high up
    },
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    testing: function() {
        this.addSVG('background_testing', 'foreground_testing');
        playSound("ambient_wind"); //play ambient audio for level
        mech.setPosToSpawn(725, 750);

        spawn.mapRect(4000, -200, 100, 25, 'exit') //ground bump wall
        for (let i = 0; i < 4; i++) {
            spawn.hopper(5000 * Math.random() - 1500, -2000 * Math.random(), 20);
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
            body[body.length] = Bodies.circle(x + i * r * 2, 490, r, Object.assign({}, spawn.propsHeavy, spawn.propsOverBouncy, spawn.propsNoRotation));
            spawn.constraintPB(x + i * r * 2, 200, body.length - 1, 0.9);
        }
        body[body.length - 1].force.x = 0.02 * body[body.length - 1].mass; //give the last one a kick
        spawn.mapRect(-2000, 900, 3200, 100) //ground
        spawn.mapRect(2200, 900, 2000, 100) //far right ground
        spawn.mapRect(2300, 870, 50, 40) //ground bump
        spawn.mapVertex(-1300, 670, '0 0 -500 0 -500 200'); //angeled ceiling
        spawn.mapRect(700, 890, 50, 20) //ground bump
        spawn.mapRect(-600, 0, 400, 200); //left cave roof
        spawn.mapRect(-600, 600, 400, 200); //left cave
        spawn.mapRect(-50, 700, 100, 200); //left wall
        spawn.mapRect(650, 450, 200, 25); //wide platform
        spawn.mapRect(750, 250, 100, 25); //high platform
        spawn.mapRect(1000, 450, 400, 25); //platform
        spawn.mapRect(1200, 250, 200, 25); //platform
        Matter.Body.setAngle(map[map.length - 1], -Math.PI * 0.05)
        spawn.mapRect(1300, 50, 100, 25); //platform
        spawn.mapRect(1800, 50, 300, 25); //platform
        spawn.mapRect(1600, 250, 300, 25); //platform
        spawn.mapRect(2200, 150, 300, 400); //platform
        spawn.mapRect(350, 635, 700, 30); //first platform
        spawn.mapRect(50, 150, 400, 50); //thick wall above launcher
        spawn.mapRect(50, 450, 400, 80); //thick wall above launcher
        spawn.mapRect(-600, 2000, 3000, 100) // lower ground
        spawn.mapRect(1300, 1990, 100, 25, 'launch') //ground bump wall
        spawn.mapRect(-600, 1300, 400, 200); //left cave roof
        spawn.mapRect(-600, 1700, 400, 200); //left cave
        spawn.bodyRect(1700, 0, 100, 1100); //huge tall vertical box
        Matter.Body.setAngle(body[body.length - 1], -Math.PI * 0.35)
        spawn.bodyRect(800, 438, 250, 10); //long skinny box
        spawn.bodyRect(250, 250, 130, 200); //block inside the ledge
    },
    //********************************************************************************************************************************
    //********************************************************************************************************************************
    addSVG: function(background, foreground) {
        game.levels.background = background;
        game.levels.foreground = foreground;
        document.getElementById(background).style.display = "inline"; //show SVGs for level
        document.getElementById(foreground).style.display = "inline"; //show SVGs for level
    },
    addToWorld: function(mapName) { //needs to be run to put bodies into the world
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
    },
}
