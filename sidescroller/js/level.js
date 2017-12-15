//global game variables
let body = []; //non static bodies
let map = []; //all static bodies
let cons = []; //all constaints between a point and a body
let consBB = []; //all constaints between two bodies
//main object for spawning levels
const level = {
  // levels: ["towers", "skyscrapers", "rooftops", "warehouse", "highrise"], // name of the level methods that the player runs through
  onLevel: undefined,
  start: function() {
    // game.levelsCleared = 3;  //for testing to simulate all possible mobs spawns
    spawn.setSpawnList(); //picks a couple mobs types for a themed random mob spawns
    this.procedural();

    // this[this.levels[this.onLevel]](); //spawn the level player is on, this cycles in a loop
    // this.boss(); //this.warehouse();    //this.highrise();    //this.towers();    // this.skyscrapers();    //this.rooftops();

    this.addToWorld(); //add map to world
    game.draw.setPaths();
    this.levelAnnounce();
  },
  //******************************************************************************************************************
  //******************************************************************************************************************
  //empty map for testing mobs
  boss: function() {
    // game.levelsCleared = 5; //for testing to simulate all possible mobs spawns
    // for (let i = 0; i < 5; i++) {
    //   game.dmgScale += 0.4; //damage done by mobs increases each level
    //   b.dmgScale *= 0.9; //damage done by player decreases each level
    // }
    mech.setPosToSpawn(-75, -60); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;

    level.exit.x = 3500;
    level.exit.y = -870;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    // this.addZone(250, -1000, 500, 1500, "laser");
    //spawn.debris(0, -900, 4500, 10); //15 debris per level
    // setTimeout(function() {
    //   document.body.style.backgroundColor = "#eee";
    // }, 1);
    document.body.style.backgroundColor = "#fff";
    // document.body.style.backgroundColor = "#fafcff";
    // document.body.style.backgroundColor = "#bbb";
    // document.body.style.backgroundColor = "#eee4e4";
    // document.body.style.backgroundColor = "#dcdcde";
    // document.body.style.backgroundColor = "#e0e5e0";

    // this.addQueryRegion(550, -25, 100, 50, "bounce", { Vx: 0, Vy: -25 });
    // level.fillBG.push({ x: 550, y: -25, width: 100, height: 50, color: "#ff0" });

    spawn.mapRect(-1200, 0, 2200, 300); //left ground
    spawn.mapRect(3500, -860, 100, 50); //ground bump wall
    spawn.mapVertex(1250, 0, "0 0 0 300 -500 600 -500 300");
    spawn.mapRect(1500, -300, 2000, 300); //upper ground
    spawn.mapVertex(3750, 0, "0 600 0 300 -500 0 -500 300");
    spawn.mapRect(4000, 0, 1000, 300); //right lower ground
    spawn.mapRect(2200, -600, 600, 50); //center platform
    spawn.mapRect(1300, -850, 700, 50); //center platform
    spawn.mapRect(3000, -850, 700, 50); //center platform
    spawn.mapRect(0, -2000, 3000, 50); //center platform
    spawn.spawnBuilding(-200, -250, 275, 240, false, true, "left"); //far left; player spawns in side
    //spawn.boost(350, 0, 0, -0.005);
    for (let i = 0; i < 17; i++) {
      powerUps.spawn(450, -125, "gun", false);
    }
    // powerUps.spawn(450, -125, "gun", false);
    // powerUps.spawn(450, -125, "gun", false);
    for (let i = 0; i < 5; i++) {
      //powerUps.spawn(2500+i*15, -1000, "gun", false);
      powerUps.spawn(2500 + i * 20, -1300, "gun", false);
      powerUps.spawn(2500 + i * 20, -1100, "ammo", false);
    }
    spawn.bodyRect(700, -50, 50, 50);
    spawn.bodyRect(700, -100, 50, 50);
    spawn.bodyRect(700, -150, 50, 50);
    spawn.bodyRect(700, -200, 50, 50);
    spawn.bodyRect(-100, -260, 250, 10);
    // spawn.springer(100, -550);
    // spawn.grower(100, -550);
    // spawn.chaser(100, -550);
    // spawn.striker(100, -550);
    // spawn.burster(100, -550);
    // spawn.hopper(100, -550);
    // spawn.grower(100, -550);
    // spawn.springer(100, -550);
    // spawn.zoomer(100, -550);
    // spawn.shooter(100, -550);
    // spawn.beamer(100, -550);
    // spawn.focuser(100, -550);
    // spawn.laser(100, -550);
    // spawn.blinker(100, -550);
    // spawn.drifter(100, -550);
    // spawn.sucker(100, -550);
    // spawn.exploder(100, -550);
    // spawn.spawner(100, -550);
    // spawn.ghoster(100, -550);
    // spawn.sneaker(100, -550);
    // spawn.bomber(100, -550);

    // for (let i = 0; i < 4; ++i) {
    //   spawn.shooter(800, -1150);
    // }
    // spawn.nodeBoss(900, -1070, "shooter", 9);
    // spawn.randomBoss(-100, -1470);
    // spawn.randomBoss(500, -1470);
    // spawn.randomBoss(900, -1470);
    // spawn.randomBoss(900, -1000);
  },
  warehouse: function() {
    // document.body.style.backgroundColor = (Math.random() < 0.5) ? "#aaa" : "#e3e3f0"
    document.body.style.backgroundColor = "#bbb";
    mech.setPosToSpawn(25, -60); //normal spawn
    //mech.setPosToSpawn(-2000, -1700); // left ledge spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = 425;
    level.exit.y = -35;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    //level.addQueryRegion(-600, -250, 180, 420, "death", [[player]],{});

    spawn.debris(-2250, 1330, 3000, 6); //15 debris per level
    spawn.debris(-3000, -800, 3280, 5); //15 debris per level
    spawn.debris(-1400, 410, 2300, 4); //15 debris per level
    spawn.mapGunPowerUp(-1250, 560);
    //foreground
    // level.fill.push({ x: -3025, y: 50, width: 4125, height: 1350, color: "rgba(0,0,0,0.05)"});
    // level.fill.push({ x: -1800, y: -500, width: 1975, height: 550, color: "rgba(0,0,0,0.05)"});
    // level.fill.push({ x: -2600, y: -150, width: 700, height: 200, color: "rgba(0,0,0,0.05)"});
    //background
    const BGColor = "#f3f3ea";
    level.fillBG.push({
      x: -3025,
      y: 50,
      width: 4125,
      height: 1350,
      color: BGColor
    });
    level.fillBG.push({
      x: -1800,
      y: -500,
      width: 1975,
      height: 555,
      color: BGColor
    });
    level.fillBG.push({
      x: -2600,
      y: -150,
      width: 700,
      height: 205,
      color: BGColor
    });
    level.fillBG.push({
      x: 300,
      y: -250,
      width: 350,
      height: 250,
      color: "#cff"
    });
    spawn.mapRect(-1500, 0, 2750, 100);
    spawn.mapRect(175, -600, 125, 700);
    spawn.mapRect(-1900, -600, 2200, 100);
    spawn.mapRect(-1900, -600, 100, 1300);
    //house
    spawn.mapRect(-175, -550, 50, 400);
    spawn.mapRect(-175, -15, 350, 50);
    spawn.mapRect(-25, -25, 100, 50);
    // spawn.mapRect(-175, -275, 350, 25);
    // spawn.mapRect(-175, -250, 25, 75);
    // spawn.bodyRect(-170, -175, 14, 160, 1, spawn.propsFriction); //door to starting room
    //exit house
    spawn.mapRect(300, -15, 350, 50);
    spawn.mapRect(300, -275, 350, 25);
    spawn.mapRect(625, -250, 25, 75);
    spawn.mapRect(425, -25, 100, 25);
    // spawn.mapRect(-1900, 600, 2700, 100);
    spawn.mapRect(1100, 0, 150, 1500);
    spawn.mapRect(-2850, 1400, 4100, 100);
    spawn.mapRect(-2375, 875, 1775, 100);
    spawn.mapRect(-1450, 950, 75, 346);
    spawn.mapRect(-1433, 662, 41, 111);
    spawn.bodyRect(-1418, 773, 11, 102, 1, spawn.propsFriction); //blocking path
    spawn.mapRect(-2950, 1250, 175, 250);
    spawn.mapRect(-3050, 1100, 150, 400);
    spawn.mapRect(-3150, 50, 125, 1450);
    spawn.mapRect(-2375, 600, 3175, 100);
    spawn.mapRect(-2125, 350, 250, 325);
    spawn.mapRect(-1950, -400, 100, 25);
    spawn.mapRect(-3150, 50, 775, 100);
    spawn.mapRect(-2600, -200, 775, 50);
    spawn.bodyRect(-1350, -200, 200, 200, 1, spawn.propsSlide); //weight
    spawn.bodyRect(-1800, 0, 300, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: -1650,
        y: -500
      },
      bodyB: body[body.length - 1],
      stiffness: 0.0001,
      length: 140,
      damping: 0.001
    });

    spawn.bodyRect(400, 400, 200, 200, 1, spawn.propsSlide); //weight
    spawn.bodyRect(800, 600, 300, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: 950,
        y: 100
      },
      bodyB: body[body.length - 1],
      stiffness: 0.0001,
      length: 140,
      damping: 0.001
    });

    spawn.bodyRect(-2775, 1150, 190, 150, 1, spawn.propsSlide); //weight
    spawn.bodyRect(-2575, 1150, 200, 150, 1, spawn.propsSlide); //weight
    spawn.bodyRect(-2775, 1300, 400, 100, 1, spawn.propsHoist); //hoist
    cons[cons.length] = Constraint.create({
      pointA: {
        x: -2575,
        y: 150
      },
      bodyB: body[body.length - 1],
      stiffness: 0.0001,
      length: 360,
      damping: 0.001
    });
    //blocks
    //spawn.bodyRect(-155, -150, 10, 140, 1, spawn.propsFriction);
    spawn.bodyRect(-165, -150, 30, 35, 1);
    spawn.bodyRect(-165, -115, 30, 35, 1);
    spawn.bodyRect(-165, -80, 30, 35, 1);
    spawn.bodyRect(-165, -45, 30, 35, 1);

    spawn.bodyRect(-750, 400, 150, 150, 0.5);
    spawn.mapRect(-400, 1175, 50, 250); //block to get to top path on bottom level
    // spawn.bodyRect(-1450, 737, 75, 103, 0.5); //blocking path

    spawn.bodyRect(-2525, -50, 145, 100, 0.5);
    spawn.bodyRect(-2325, -300, 150, 100, 0.5);
    spawn.bodyRect(-1275, -750, 200, 150, 0.5); //roof block
    spawn.bodyRect(-525, -700, 125, 100, 0.5); //roof block
    // spawn.nodeBoss(900, -1070,'chaser',13);
    //mobs
    spawn.randomSmallMob(-1125, 550);
    spawn.randomSmallMob(-2325, 800);
    spawn.randomSmallMob(-2950, -50);
    spawn.randomSmallMob(825, 300);
    spawn.randomSmallMob(-900, 825);
    spawn.randomMob(-2025, 175, 0.7);
    spawn.randomMob(-2325, 450, 0.7);
    spawn.randomMob(-2925, 675, 0.7);
    spawn.randomMob(-2700, 300, 0.25);
    spawn.randomMob(-2500, 300, 0.25);
    spawn.randomMob(-2075, -425, 0.25);
    spawn.randomMob(-1550, -725, 0.25);
    spawn.randomMob(375, 1100, 0.15);
    spawn.randomMob(-1425, -100, 0.3);
    spawn.randomMob(-800, -750, 0.2);
    spawn.randomMob(400, -350, 0);
    spawn.randomMob(650, 1300, 0.1);
    spawn.randomMob(-750, -150, 0);
    spawn.randomMob(475, 300, 0);
    spawn.randomMob(-75, -700, 0);
    spawn.randomMob(900, -200, 0);
    spawn.randomBoss(-125, 275, 0);
    spawn.randomBoss(-825, 1000, 0.3);
    spawn.randomBoss(-1300, -1100, 0.1);
    //spawn.randomBoss(600, -1575, 0);
    //spawn.randomMob(1120, -1200, 0.3);
    //spawn.randomSmallMob(2200, -1775); //
  },
  highrise: function() {
    document.body.style.backgroundColor = "#fafcff";
    mech.setPosToSpawn(0, -700); //normal spawn
    //mech.setPosToSpawn(-2000, -1700); // left ledge spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = -4275;
    level.exit.y = -2805;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    spawn.mapGunPowerUp(-2550, -700);

    // spawn.debris(-2500, -2050, 2500, 8); //15 debris per level
    // spawn.debris(-2600, -700, 1700, 7); //15 debris per level
    spawn.debris(-2000, -50, 390, 4); //15 debris per level
    spawn.debris(-950, -1185, 500, 4); //15 debris per level
    spawn.debris(-2650, -650, 450, 4); //15 debris per level
    spawn.debris(-3350, -650, 400, 2); //15 debris per level
    spawn.debris(-600, -50, 400, 2); //15 debris per level

    //background
    level.fillBG.push({
      x: -4425,
      y: -3050,
      width: 425,
      height: 275,
      color: "#cff"
    });
    //foreground
    level.fill.push({
      x: -1650,
      y: -1575,
      width: 550,
      height: 425,
      color: "rgba(10,10,0,0.12)"
    });
    level.fill.push({
      x: -2600,
      y: -2400,
      width: 450,
      height: 1800,
      color: "rgba(10,10,0,0.12)"
    });
    level.fill.push({
      x: -3425,
      y: -2150,
      width: 525,
      height: 1550,
      color: "rgba(10,10,0,0.12)"
    });
    level.fill.push({
      x: -1850,
      y: -1150,
      width: 2025,
      height: 1150,
      color: "rgba(10,10,0,0.12)"
    });

    //building 1
    spawn.bodyRect(-1000, -675, 25, 25);
    spawn.mapRect(-2225, 0, 2475, 150);
    spawn.mapRect(175, -1000, 75, 1100);

    spawn.mapRect(-175, -985, 25, 175);
    spawn.bodyRect(-170, -810, 14, 160, 1, spawn.propsFriction); //door to starting room
    spawn.mapRect(-600, -650, 825, 50);
    spawn.mapRect(-1300, -650, 500, 50);
    spawn.mapRect(-175, -250, 425, 300);
    spawn.bodyRect(-75, -300, 50, 50);

    spawn.boost(-750, 0, 0, -0.011);
    spawn.bodyRect(-425, -1375, 150, 250);
    spawn.bodyRect(-1075, -1280, 100, 130);
    spawn.mapRect(-1125, -1575, 50, 475);
    spawn.bodyRect(-1475, -1275, 250, 125);
    spawn.bodyRect(-825, -1160, 250, 10);

    spawn.mapRect(-1650, -1575, 400, 50);
    spawn.mapRect(-600, -1150, 850, 175);

    spawn.mapRect(-1850, -1150, 1050, 175);
    spawn.bodyRect(-1907, -1600, 550, 25);
    spawn.bodyRect(-1600, -125, 125, 125);
    spawn.bodyRect(-1560, -200, 75, 75);
    // spawn.bodyRect(-1100, -125, 150, 125);
    spawn.bodyRect(-1200, -75, 75, 75);

    spawn.bodyRect(-1280, -750, 100, 100);

    //building 2
    spawn.mapRect(-3450, -600, 1300, 750);
    spawn.mapRect(-2225, -450, 175, 550);
    spawn.boost(-2800, -600, 0, -0.0055);
    spawn.mapRect(-3450, -1325, 550, 50);
    spawn.mapRect(-3425, -2200, 525, 50);
    spawn.mapRect(-2600, -1750, 450, 50);
    spawn.mapRect(-2600, -2450, 450, 50);
    spawn.bodyRect(-2275, -2700, 50, 60);
    spawn.bodyRect(-2600, -1975, 250, 225);
    spawn.bodyRect(-3415, -1425, 100, 100);
    spawn.bodyRect(-3400, -1525, 100, 100);
    spawn.bodyRect(-3305, -1425, 100, 100);

    //building 3
    spawn.mapRect(-4450, -1750, 1025, 1900);
    spawn.mapRect(-3750, -2000, 175, 275);
    spawn.mapRect(-4000, -2355, 275, 675);
    // spawn.mapRect(-4450, -2650, 475, 1000);
    spawn.mapRect(-4450, -2775, 475, 1125);
    spawn.bodyRect(-3720, -2050, 50, 50);
    spawn.bodyRect(-3710, -2100, 50, 50);
    spawn.bodyRect(-3715, -2150, 40, 40);
    spawn.bodyRect(-3570, -1800, 50, 50);
    spawn.bodyRect(-2970, -2250, 50, 50);
    spawn.bodyRect(-3080, -2250, 40, 40);
    spawn.bodyRect(-3420, -650, 50, 50);

    //exit
    spawn.mapRect(-4450, -3075, 25, 300);
    spawn.mapRect(-4450, -3075, 450, 25);
    spawn.mapRect(-4025, -3075, 25, 100);
    spawn.mapRect(-4275, -2785, 100, 25);

    //mobs
    spawn.randomMob(-2500, -2700, 1);
    spawn.randomMob(-3200, -750, 1);
    spawn.randomMob(-1875, -775, 0.2);
    spawn.randomMob(-950, -1675, 0.2);
    spawn.randomMob(-1525, -1750, 0.2);
    spawn.randomMob(-1375, -1400, 0.2);
    spawn.randomMob(-1625, -1275, 0.2);
    spawn.randomMob(-1900, -1250, 0.2);
    spawn.randomMob(-2250, -1850, 0.2);
    spawn.randomMob(-2475, -2200, 0.2);
    spawn.randomMob(-3000, -1475, 0.2);
    spawn.randomMob(-3850, -2500, 0.2);
    spawn.randomMob(-3650, -2125, 0.2);
    spawn.randomMob(-4010, -3200, 0.2);
    spawn.randomMob(-3500, -1825, 0.2);
    spawn.randomMob(-975, -100, 0);
    spawn.randomMob(-1050, -725, 0.2);
    spawn.randomMob(-1525, -100, 0);
    spawn.randomMob(-525, -1700, 0.1);
    spawn.randomMob(-125, -1500, 0.1);
    spawn.randomMob(-325, -1900, 0.1);
    spawn.randomMob(-550, -100, 0.1);
    spawn.randomBoss(-3250, -2700, 0.2);
    spawn.randomBoss(-2450, -1100, 0.2);
  },
  //******************************************************************************************************************
  //******************************************************************************************************************
  rooftops: function() {
    document.body.style.backgroundColor = "#eee9e9";
    // this.addZone(-700, -50, 4100, 100, "death");
    mech.setPosToSpawn(-450, -2050); //normal spawn
    //mech.setPosToSpawn(4600, -900); //normal spawn
    //mech.setPosToSpawn(4400, -400); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = 3600;
    level.exit.y = -300;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    // spawn.debris(1650, -1800, 3800, 15); //15 debris per level
    spawn.debris(1950, -1050, 700, 3); //15 debris per level
    spawn.debris(4600, -825, 800, 3); //15 debris per level
    spawn.debris(550, -1150, 1050, 3); //15 debris per level
    spawn.debris(2000, -1650, 500, 3); //15 debris per level

    spawn.mapGunPowerUp(2450, -1675);

    //foreground
    level.fill.push({
      x: -650,
      y: -2300,
      width: 450,
      height: 300,
      color: "rgba(0,0,0,0.15)"
    });
    level.fill.push({
      x: 3450,
      y: -1250,
      width: 1100,
      height: 1250,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 4550,
      y: -725,
      width: 900,
      height: 725,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3400,
      y: 100,
      width: 2150,
      height: 900,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: -700,
      y: -1900,
      width: 2100,
      height: 2900,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 1950,
      y: -1550,
      width: 1025,
      height: 550,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 1600,
      y: -900,
      width: 1600,
      height: 1900,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3450,
      y: -1550,
      width: 350,
      height: 300,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 700,
      y: -2225,
      width: 700,
      height: 225,
      color: "rgba(0,0,0,0.1)"
    });

    //spawn.mapRect(-700, 0, 6250, 100); //ground
    spawn.mapRect(3400, 0, 2150, 100); //ground
    spawn.mapRect(-700, -2000, 2100, 100); //Top left ledge
    spawn.bodyRect(1350, -2125, 50, 125, 0.8); //
    spawn.bodyRect(1350, -2225, 50, 100, 0.8); //
    spawn.mapRect(-700, -2350, 50, 400); //far left starting left wall
    spawn.mapRect(-700, -2010, 500, 50); //far left starting ground
    spawn.mapRect(-700, -2350, 500, 50); //far left starting ceiling
    spawn.mapRect(-250, -2350, 50, 200); //far left starting right part of wall
    spawn.bodyRect(-240, -2150, 30, 36); //door to starting room
    spawn.bodyRect(-240, -2115, 30, 36); //door to starting room
    spawn.bodyRect(-240, -2080, 30, 35); //door to starting room
    spawn.bodyRect(-240, -2045, 30, 35); //door to starting room

    spawn.bodyRect(200, -2150, 200, 220, 0.8); //
    spawn.mapRect(700, -2275, 700, 50); //
    spawn.bodyRect(1050, -2350, 30, 30, 0.8); //
    spawn.boost(1800, -1000);
    spawn.bodyRect(1625, -1100, 100, 75); //
    spawn.bodyRect(1350, -1025, 400, 25); //
    spawn.mapRect(-700, -1000, 2100, 100); //lower left ledge
    spawn.bodyRect(350, -1100, 200, 100, 0.8); //
    spawn.bodyRect(370, -1200, 100, 100, 0.8); //
    spawn.bodyRect(360, -1300, 100, 100, 0.8); //
    spawn.bodyRect(950, -1050, 300, 50, 0.8); //
    spawn.bodyRect(-600, -1250, 400, 250, 0.8); //
    spawn.mapRect(1600, -1000, 1600, 100); //middle ledge
    spawn.bodyRect(2600, -1950, 100, 250, 0.8); //
    spawn.bodyRect(2700, -1125, 125, 125, 0.8); //
    spawn.bodyRect(2710, -1250, 125, 125, 0.8); //
    spawn.bodyRect(2705, -1350, 75, 100, 0.8); //
    spawn.mapRect(3450, -1600, 350, 50); //
    spawn.mapRect(1950, -1600, 1025, 50); //
    spawn.bodyRect(3100, -1015, 375, 15, 0.8); //
    spawn.bodyRect(3500, -850, 75, 125, 0.8); //
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
    // spawn.boost(4950, 0, 0, -0.005);

    spawn.spawnStairs(3800, 0, 3, 150, 206); //stairs top exit
    spawn.mapRect(3500, -275, 350, 275); //exit platform
    spawn.mapRect(3600, -285, 100, 50); //ground bump wall

    spawn.randomSmallMob(2200, -1775); //
    spawn.randomSmallMob(4000, -825); //
    spawn.randomSmallMob(4100, -100);
    spawn.randomSmallMob(4600, -100);
    spawn.randomSmallMob(-350, -2400); //
    spawn.randomMob(4250, -1350, 0.8); //
    spawn.randomMob(2550, -1350, 0.8); //
    spawn.randomMob(1225, -2400, 0.3); //
    spawn.randomMob(1120, -1200, 0.3);
    spawn.randomMob(3000, -1150, 0.2); //
    spawn.randomMob(3200, -1150, 0.3); //
    spawn.randomMob(3300, -1750, 0.3); //
    spawn.randomMob(3650, -1350, 0.3); //
    spawn.randomMob(3600, -1800, 0.1); //
    spawn.randomMob(5200, -100, 0.3);
    spawn.randomMob(5275, -900, 0.2);
    spawn.randomMob(3765, -450, 0.3); //
    spawn.randomMob(900, -2125, 0.3); //
    spawn.randomBoss(600, -1575, 0);
    spawn.randomBoss(4900, -1200, 0); //
    spawn.randomBoss(2225, -1325, 0.4); //
    //spawn.randomBoss(4850, -1250,0.7);
  },
  //******************************************************************************************************************
  //******************************************************************************************************************
  towers: function() {
    mech.setPosToSpawn(1375, -1550); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = 3250;
    level.exit.y = -530;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    document.body.style.backgroundColor = "#e5eae5";
    //foreground
    level.fill.push({
      x: -550,
      y: -1700,
      width: 1300,
      height: 1700,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 750,
      y: -1450,
      width: 650,
      height: 1450,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 750,
      y: -1950,
      width: 800,
      height: 450,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3000,
      y: -1000,
      width: 650,
      height: 1000,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3650,
      y: -1300,
      width: 1300,
      height: 1300,
      color: "rgba(0,0,0,0.1)"
    });
    //background
    level.fillBG.push({
      x: 2495,
      y: -500,
      width: 10,
      height: 525,
      color: "#ccc"
    });

    //mech.setPosToSpawn(600, -1200); //normal spawn
    //mech.setPosToSpawn(525, -150); //ground first building
    //mech.setPosToSpawn(3150, -700); //near exit spawn
    spawn.debris(-200, -50, 4800, 15); //1st floor debris //15 debris per level

    spawn.mapGunPowerUp(525, -700);

    spawn.mapRect(-600, 25, 5600, 300); //ground
    spawn.mapRect(-600, 0, 2000, 50); //ground
    spawn.mapRect(-600, -1700, 50, 2000 - 100); //left wall
    spawn.bodyRect(-295, -1540, 40, 40); //center block under wall
    spawn.bodyRect(-298, -1580, 40, 40); //center block under wall
    spawn.bodyRect(1500, -1540, 30, 30); //left of entrance

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
    spawn.spawnStairs(-600, -1000, 4, 250, 350); //stairs 2nd
    spawn.mapRect(350, -600, 350, 150); //center table
    spawn.mapRect(-600 + 300, -2000 * 0.25, 2000 - 300, 50); //1st floor
    spawn.spawnStairs(-600 + 2000 - 50, -500, 4, 250, 350, true); //stairs 1st
    spawn.spawnStairs(-600, 0, 4, 250, 350); //stairs ground
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
    spawn.spawnStairs(3000 + 2000 - 50, 0, 4, 250, 350, true); //stairs ground
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
    spawn.randomSmallMob(3550, -550);
    spawn.randomSmallMob(4575, -560, 1);
    spawn.randomSmallMob(1315, -880, 1);
    spawn.randomSmallMob(800, -600);
    spawn.randomSmallMob(-100, -1600);
    spawn.randomMob(4100, -225, 0.8);
    spawn.randomMob(-250, -700, 0.8);
    spawn.randomMob(4500, -225, 0.15);
    spawn.randomMob(3250, -225, 0.15);
    spawn.randomMob(-100, -225, 0.1);
    spawn.randomMob(1150, -225, 0.15);
    spawn.randomMob(2000, -225, 0.15);
    spawn.randomMob(450, -225, 0.15);
    spawn.randomMob(100, -1200, 1);
    spawn.randomMob(950, -1150, 0.1);
    spawn.randomBoss(1800, -800, 0.4);
    spawn.randomBoss(4150, -1000, 0.6);
  },
  //******************************************************************************************************************
  //******************************************************************************************************************
  skyscrapers: function() {
    mech.setPosToSpawn(-50, -50); //normal spawn
    //mech.setPosToSpawn(1550, -1200); //spawn left high
    //mech.setPosToSpawn(1800, -2000); //spawn near exit
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y + 20;
    level.exit.x = 1500;
    level.exit.y = -1875;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");

    if (game.levelsCleared < 2 || game.levelsCleared === 4 || game.levelsCleared === 7) powerUps.spawn(1475, -1175, "gun", false);

    spawn.debris(-240, -400, 310, 3); //15 debris per level
    spawn.debris(625, -50, 750, 3); //15 debris per level
    spawn.debris(2100, -450, 950, 3); //15 debris per level
    spawn.debris(750, -1150, 1100, 3); //15 debris per level
    spawn.debris(3150, -50, 950, 3); //15 debris per level

    document.body.style.backgroundColor = "#dcdcde";

    //foreground
    level.fill.push({
      x: 2500,
      y: -1100,
      width: 450,
      height: 250,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2400,
      y: -550,
      width: 600,
      height: 150,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2550,
      y: -1650,
      width: 250,
      height: 200,
      color: "rgba(0,0,0,0.1)"
    });
    //level.fill.push({ x: 1350, y: -2100, width: 400, height: 250, color: "rgba(0,255,255,0.1)" });
    level.fill.push({
      x: 700,
      y: -110,
      width: 400,
      height: 110,
      color: "rgba(0,0,0,0.2)"
    });
    level.fill.push({
      x: 3600,
      y: -110,
      width: 400,
      height: 110,
      color: "rgba(0,0,0,0.2)"
    });
    level.fill.push({
      x: -250,
      y: -300,
      width: 450,
      height: 300,
      color: "rgba(0,0,0,0.15)"
    });

    //background
    level.fillBG.push({
      x: 1300,
      y: -1800,
      width: 750,
      height: 1800,
      color: "#d4d4d7"
    });
    level.fillBG.push({
      x: 3350,
      y: -1325,
      width: 50,
      height: 1325,
      color: "#d4d4d7"
    });
    level.fillBG.push({
      x: 1350,
      y: -2100,
      width: 400,
      height: 250,
      color: "#d4f4f4"
    });

    spawn.mapRect(-300, 0, 5000, 300); //***********ground
    spawn.mapRect(-300, -350, 50, 400); //far left starting left wall
    spawn.mapRect(-300, -10, 500, 50); //far left starting ground
    spawn.mapRect(-300, -350, 500, 50); //far left starting ceiling
    spawn.mapRect(150, -350, 50, 200); //far left starting right part of wall
    spawn.bodyRect(170, -130, 14, 140, 1, spawn.propsFriction); //door to starting room
    spawn.boost(475, 0, 0.0005, -0.0083);
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
    spawn.boost(4150, 0, -0.0005, -0.0083);

    spawn.bodyRect(3200, -1375, 300, 25, 0.9);
    spawn.bodyRect(1825, -1875, 400, 25, 0.9);
    // spawn.bodyRect(1800, -575, 250, 150, 0.8);
    spawn.bodyRect(1800, -600, 250, 200, 0.8);
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

    spawn.randomSmallMob(1300, -70);
    spawn.randomSmallMob(3200, -100);
    spawn.randomSmallMob(4450, -100);
    spawn.randomSmallMob(2700, -475);
    spawn.randomMob(2650, -975, 0.8);
    spawn.randomMob(2650, -1550, 0.8);
    spawn.randomMob(4150, -200, 0.15);
    spawn.randomMob(1700, -1300, 0.2);
    spawn.randomMob(1850, -1950, 0.25);
    spawn.randomMob(2610, -1880, 0.25);
    spawn.randomMob(3350, -950, 0.25);
    spawn.randomMob(1690, -2250, 0.25);
    spawn.randomMob(2200, -600, 0.2);
    spawn.randomMob(900, -1300, 0.25);
    spawn.randomMob(-100, -900, 0.2);
    spawn.randomBoss(3700, -1500, 0.4);
    spawn.randomBoss(1700, -900, 0.4);
  },
  //****************************************************************************************************
  //****************************************************************************************************
  //****************************************************************************************************
  //****************************************************************************************************
  //****************************************************************************************************
  procedural: function() {
    // game.levelsCleared = 5; //for testing to simulate all possible mobs spawns
    // for (let i = 0; i < 5; i++) {
    //   game.dmgScale += 0.4; //damage done by mobs increases each level
    //   b.dmgScale *= 0.9; //damage done by player decreases each level
    // }
    const mobChance = 0.3;
    const maxJump = 390;
    //
    document.body.style.backgroundColor = "#fff";
    mech.setPosToSpawn(0, -10); //normal spawn
    level.enter.x = mech.spawnPos.x - 50;
    level.enter.y = mech.spawnPos.y - 15;
    //starting zone
    spawn.mapRect(-250, -320, 50, 400); //far left starting left wall
    spawn.mapRect(-250, -0, 500, 110); //far left starting ground
    spawn.mapRect(-250, -340, 500, 50); //far left starting ceiling
    spawn.mapRect(200, -320, 50, 180); //far left starting right part of wall
    spawn.bodyRect(220, -120, 14, 140, 1, spawn.propsFriction); //door to starting room
    spawn.mapRect(-50, -10, 100, 50);
    spawn.mapRect(0, 10, 400, 100); //***********ground
    if (b.inventory.length < 4) {
      powerUps.spawn(550, -50, "gun", false); //starting gun
    } else {
      powerUps.spawnRandomPowerUp(550, -50);
    }
    level.fill.push({
      x: -250,
      y: -300,
      width: 500,
      height: 300,
      color: "rgba(0,0,0,0.15)"
    });

    let o = { x: 400, y: 10 }; //keeps track of where the next mapNode should be added
    mapNode = [
      function() {
        //one or two shelves
        let nodeRange = { x: 650 + Math.round(Math.random() * 900), y: 0 };
        spawn.mapRect(o.x, o.y, nodeRange.x, 100);
        spawn.randomMob(o.x + 200 + 600 * Math.random(), o.y - 50, mobChance);
        spawn.debris(o.x + 50, o.y, nodeRange.x - 100, 2);

        //shelf(s)
        const shelfElevation = 200 + 230 * Math.random();
        const shelfWidth = nodeRange.x - 200 - 300 * Math.random();
        if (Math.random() < 0.85 && shelfWidth > 650) {
          const len = 1 + Math.ceil(Math.random() * Math.random() * Math.random() * 5);
          const sep = 50 + 100 * Math.random();
          const x1 = o.x + nodeRange.x / 2 - shelfWidth / 2;
          const x2 = o.x + nodeRange.x / 2 + sep;
          for (let i = 1; i < len; ++i) {
            //two shelves
            spawn.mapRect(x1, o.y - shelfElevation * i, shelfWidth / 2 - sep, 50);
            spawn.mapRect(x2, o.y - shelfElevation * i, shelfWidth / 2 - sep, 50);
            //plank connecting shelves
            spawn.bodyRect(
              o.x + (nodeRange.x - shelfWidth) / 2 + shelfWidth / 2 - sep - 75,
              o.y - shelfElevation * i - 30,
              sep + 250,
              10,
              0.6,
              spawn.propsFrictionMedium
            );
          }
          level.fillBG.push({
            x: x1,
            y: o.y - shelfElevation * (len - 1),
            width: shelfWidth / 2 - sep,
            height: shelfElevation * (len - 1),
            color: "#f0f0f3"
          });
          level.fillBG.push({
            x: x2,
            y: o.y - shelfElevation * (len - 1),
            width: shelfWidth / 2 - sep,
            height: shelfElevation * (len - 1),
            color: "#f0f0f3"
          });
        } else {
          const len = 1 + Math.ceil(Math.random() * Math.random() * Math.random() * 5);
          for (let i = 1; i < len; ++i) {
            //one shelf
            spawn.mapRect(o.x + (nodeRange.x - shelfWidth) / 2, o.y - shelfElevation * i, shelfWidth, 50);
            level.fillBG.push({
              x: o.x + (nodeRange.x - shelfWidth) / 2,
              y: o.y - shelfElevation * (len - 1),
              width: shelfWidth,
              height: shelfElevation * (len - 1),
              color: "#f0f0f3"
            });
          }
        }

        //square block
        const blockSize = 60 + Math.random() * 120;
        if (shelfElevation > blockSize + 100) {
          spawn.bodyRect(o.x + 100 + Math.random() * (nodeRange.x - 200), o.y - blockSize, blockSize, blockSize, 0.3);
        } else {
          spawn.bodyRect(o.x + 50 + (nodeRange.x - shelfWidth) / 2, o.y - shelfElevation - blockSize, blockSize, blockSize, 0.3);
        }
        spawn.randomMob(o.x + (nodeRange.x - shelfWidth) / 2, o.y - shelfElevation - 100, mobChance); //mob above shelf
        spawn.debris(o.x + 50 + (nodeRange.x - shelfWidth) / 2, o.y - shelfElevation - 50, shelfWidth - 100, 1);
        // set starting position for new mapNode
        o.x += nodeRange.x;
        o.y += nodeRange.y;
      },
      // function() {
      //   //large ground elevation types
      //   let nodeRange = { x: 600, y: -250 - 700 * Math.random() };
      //   spawn.mapRect(o.x, o.y, nodeRange.x, 100); //ground
      //   let leadIn = 200;
      //   let buildingWidth = nodeRange.x - leadIn;
      //   if (Math.random() < 0.4 && nodeRange.y < -600) {
      //     spawn.randomMob(o.x + nodeRange.x - 150, o.y - 100); //mob above shelf

      //     nodeRange.x -= 300;
      //     if (nodeRange.y < -350) {
      //       spawn.boost(o.x + 100, o.y, 0, 0.0000076 * nodeRange.y); //-0.007
      //     }
      //   } else if (Math.random() < 0.4) {
      //     spawn.mapRect(o.x + (nodeRange.x - buildingWidth), o.y + nodeRange.y, buildingWidth, -nodeRange.y); //building

      //     //square block
      //     const blockSize = 60 + Math.random() * 200;
      //     spawn.bodyRect(o.x + (nodeRange.x - buildingWidth) + Math.random() * 200, o.y + nodeRange.y - blockSize, blockSize, blockSize, 0.3);
      //     if (nodeRange.y < -350) {
      //       spawn.boost(o.x + 75, o.y, 0, 0.0000076 * nodeRange.y); //-0.007
      //     }
      //   } else {
      //     nodeRange.y = -150 - 1000 * Math.random();
      //     leadIn = 50 + Math.floor(Math.random() * 50);
      //     buildingWidth = nodeRange.x - leadIn;

      //     let min = Math.ceil(-nodeRange.y / maxJump);
      //     let len = min + Math.floor(Math.random() * Math.random() * 5);
      //     for (let i = 1; i < len; i++) {
      //       spawn.mapRect(o.x + leadIn + buildingWidth * i / len, o.y + nodeRange.y * i / len, buildingWidth / len, -nodeRange.y * i / len);
      //     }
      //   }

      //   // set starting position for new mapNode
      //   o.x += nodeRange.x;
      //   o.y += nodeRange.y;
      // },
      // function() {
      //   //large drop with possible boost back up
      //   let nodeRange = { x: 600, y: 300 + 600 * Math.random() };
      //   const buildingWidth = nodeRange.x - 275;
      //   spawn.mapRect(o.x, o.y + nodeRange.y, nodeRange.x, 100); //ground
      //   spawn.mapRect(o.x, o.y, buildingWidth, nodeRange.y);
      //   // }
      //   if (nodeRange.y > 450 && Math.random() < 0.5) {
      //     spawn.boost(o.x + (nodeRange.x - buildingWidth) + 100, o.y + nodeRange.y, 0, -0.0000076 * nodeRange.y); //-0.007
      //   } else {
      //     //square block
      //     const blockSize = 60 + Math.random() * 200;
      //     spawn.bodyRect(o.x + (nodeRange.x - buildingWidth) + Math.random() * 200, o.y + nodeRange.y - blockSize, blockSize, blockSize, 0.5);
      //   }
      //   // set starting position for new mapNode
      //   o.x += nodeRange.x;
      //   o.y += nodeRange.y;
      // },
      function() {
        //several platforms that rise up
        const wide = 120 + Math.floor(Math.random() * Math.random() * 450);
        let nodeRange = { x: 100, y: -Math.floor(200 + Math.random() * 150) };
        for (let i = 0, len = 1 + Math.ceil(Math.random() * 4); i < len; i++) {
          spawn.platform(o.x + nodeRange.x, o.y, wide, nodeRange.y);
          spawn.debris(o.x + nodeRange.x - 120, o.y, wide + 250, Math.floor(Math.random() * 0.8 + 0.5));
          if (Math.random() < 0.3) {
            spawn.randomBoss(o.x + nodeRange.x + 20 + (wide - 40) * Math.random(), o.y + nodeRange.y - 450, mobChance);
          } else {
            spawn.randomMob(o.x + nodeRange.x + 20 + (wide - 40) * Math.random(), o.y + nodeRange.y - 50, mobChance); //mob above shelf
          }
          nodeRange.x += Math.floor(wide + 155 + Math.random() * 200);
          nodeRange.y -= Math.floor(115 + Math.random() * 200);
        }
        spawn.mapRect(o.x, o.y, nodeRange.x, 100); //ground
        spawn.mapRect(o.x + nodeRange.x, o.y + nodeRange.y + 15, 100, -nodeRange.y + 85); //right wall
        // set starting position for new mapNode
        o.x += nodeRange.x;
        o.y += nodeRange.y;
      },
      function() {
        //s-shaped building goes up 2 levels
        const floorHeight = maxJump - Math.floor(Math.random() * 150); //maxJump = 390
        let nodeRange = { x: 700 + Math.floor(Math.random() * 800), y: -floorHeight * 2 };
        const wallWidth = 20 + Math.floor(Math.random() * 40);
        const numberOfFloors = 2 + Math.floor(Math.random() * 2);
        const frontYardWidth = 250;
        o.x += frontYardWidth;
        spawn.mapRect(o.x - frontYardWidth, o.y, nodeRange.x + frontYardWidth, 100); //first floor  ground
        let floorWidth = nodeRange.x - wallWidth - 250 - Math.random() * Math.random() * nodeRange.x * 0.4; //possible open area with only half long 2nd floor
        spawn.mapRect(o.x + wallWidth, o.y - floorHeight, floorWidth, wallWidth); //second floor
        spawn.mapRect(o.x + 300, o.y - floorHeight * 2, nodeRange.x - 300, wallWidth); //third floor
        if (numberOfFloors > 2) spawn.mapRect(o.x, o.y - floorHeight * 3, nodeRange.x, wallWidth); //optional roof
        spawn.mapRect(o.x, o.y - floorHeight * numberOfFloors, wallWidth, floorHeight * numberOfFloors - 175); //left building wall
        if (Math.random() < 0.8) {
          spawn.mapRect(o.x + nodeRange.x - wallWidth, o.y - floorHeight * 2 + wallWidth, wallWidth, floorHeight * 2); //right building wall
        } else {
          spawn.mapRect(o.x + nodeRange.x - wallWidth, o.y - floorHeight * 2 + wallWidth, wallWidth, floorHeight * 2 - 175 - wallWidth); //right building wall with right door
        }
        level.fill.push({
          x: o.x,
          y: o.y - floorHeight * numberOfFloors,
          width: nodeRange.x,
          height: floorHeight * numberOfFloors,
          color: "rgba(0,0,0,0.1)"
        });

        //random extras
        const debrisRange = nodeRange.x - wallWidth * 4;
        spawn.debris(o.x + wallWidth, o.y - 50, debrisRange, 1);
        spawn.debris(o.x + wallWidth, o.y - 50 - floorHeight, debrisRange - 250, 1);
        spawn.debris(o.x + wallWidth + 250, o.y - 50 - floorHeight * 2, debrisRange - 250, 1);
        spawn.randomSmallMob(o.x + wallWidth + Math.random() * debrisRange, o.y - 80, 3);
        spawn.randomSmallMob(o.x + wallWidth + Math.random() * (debrisRange - 250), o.y - 80 - floorHeight);
        spawn.randomSmallMob(o.x + wallWidth + 250 + Math.random() * (debrisRange - 250), o.y - 80 - floorHeight * 2);
        let blockSize = 70 + Math.random() * 70;
        spawn.bodyRect(o.x - blockSize + nodeRange.x - wallWidth - Math.random() * 30, o.y - blockSize, blockSize, blockSize, 0.4);
        blockSize = 70 + Math.random() * 100;
        spawn.bodyRect(o.x + wallWidth + Math.random() * 30, o.y - floorHeight - blockSize, blockSize, blockSize, 0.4);

        o.x += nodeRange.x;
        if (Math.random() < 0.5) o.y += nodeRange.y; //start the next level at the top floor of the building
      },
      function() {
        //building with several floors that goes down a couple levels
        const numberOfFloors = 2 + Math.floor(Math.random() * 2);
        const floorHeight = maxJump - Math.floor(Math.random() * 150); //maxJump = 390
        let nodeRange = { x: 825 + Math.floor(Math.random() * 800), y: floorHeight * numberOfFloors };
        const wallWidth = 20 + Math.floor(Math.random() * 40);
        const frontYardWidth = 250;
        o.x += frontYardWidth;
        spawn.mapRect(o.x, o.y - floorHeight * 2, nodeRange.x, wallWidth); //roof level 2
        if (Math.random() < 0.5) {
          spawn.mapRect(o.x + 300, o.y - floorHeight, nodeRange.x - 600, wallWidth); //level 1
        } else if (Math.random() < 0.5) {
          spawn.mapRect(o.x + 300, o.y - floorHeight, nodeRange.x - 600, wallWidth + floorHeight); //level 1
        }
        spawn.mapRect(o.x - frontYardWidth, o.y, nodeRange.x + frontYardWidth - 300, wallWidth); //ground
        // spawn.mapRect(o.x - frontYardWidth, o.y + 10, frontYardWidth, 100 - 10); // makes the front yard look 100 deep
        let floorWidth = nodeRange.x - wallWidth - 250 - Math.random() * Math.random() * nodeRange.x * 0.4; //possible open area with only half long 2nd floor
        spawn.mapRect(o.x + nodeRange.x - floorWidth, o.y + floorHeight, floorWidth, wallWidth); //B1 floor
        spawn.mapRect(o.x, o.y + floorHeight * numberOfFloors, nodeRange.x, 100); //B2 floor

        spawn.mapRect(o.x, o.y - floorHeight * 2, wallWidth, floorHeight * 2 - 175); //left building wall above ground
        spawn.mapRect(o.x, o.y + wallWidth, wallWidth, floorHeight * numberOfFloors); //left building wall lower
        spawn.mapRect(o.x + nodeRange.x - wallWidth, o.y + wallWidth - floorHeight * 2, wallWidth, floorHeight * (numberOfFloors + 2) - wallWidth - 175); //right building wall with right door

        level.fill.push({
          x: o.x,
          y: o.y - floorHeight * 2,
          width: nodeRange.x,
          height: floorHeight * (numberOfFloors + 2),
          color: "rgba(0,0,0,0.1)"
        });
        //random extras
        spawn.debris(o.x, o.y, nodeRange.x - 300, 1); //ground
        spawn.debris(o.x, o.y + floorHeight * 2, nodeRange.x, 1); //B2
        spawn.randomSmallMob(o.x + wallWidth + Math.random() * nodeRange.x - 300, o.y - 50); //ground
        if (numberOfFloors === 3) {
          spawn.randomBoss(o.x + nodeRange.x / 2, o.y + floorHeight * 2 - 50);
        } else {
          spawn.randomSmallMob(o.x + wallWidth + Math.random() * nodeRange.x * 0.8, o.y + floorHeight - 50); //B1
          spawn.randomSmallMob(o.x + wallWidth + Math.random() * nodeRange.x * 0.8, o.y + floorHeight * numberOfFloors - 50); //B2
        }

        o.x += nodeRange.x;
        o.y += nodeRange.y; //start the next level at the top floor of the building
      },
      function() {
        //large room with boost to roof exit
        const wallWidth = 20 + Math.floor(Math.random() * 40);
        const boostX = 500 + Math.floor(Math.random() * 1500);
        const boostPadding = 35 + Math.floor(Math.random() * 200);
        let nodeRange = { x: boostX + 500 + Math.floor(Math.random() * 500), y: 700 + Math.floor(Math.random() * 1000) };
        //optional basement mode
        if (Math.random() < 0.75 && boostX > 1000) {
          spawn.mapRect(o.x, o.y, 200 + wallWidth, wallWidth); //ground entrance
          const basementDepth = Math.min(400 + Math.floor(Math.random() * 300), nodeRange.y - 200);
          o.y += basementDepth;
          o.x += 200;
          spawn.mapRect(o.x, o.y, nodeRange.x, 100); //basement ground
          spawn.mapRect(o.x, o.y - nodeRange.y + 15, wallWidth, nodeRange.y - 200 - basementDepth); //left building wall
          spawn.mapRect(o.x, o.y - basementDepth + 15, wallWidth, basementDepth); //left basement wall
        } else {
          spawn.mapRect(o.x, o.y, nodeRange.x + 200, 100); //ground
          o.x += 200;
          spawn.mapRect(o.x, o.y - nodeRange.y + 15, wallWidth, nodeRange.y - 200); //left building wall
        }
        spawn.mapRect(o.x + nodeRange.x - wallWidth, o.y - nodeRange.y + 15, wallWidth, nodeRange.y); //right building wall
        spawn.mapRect(o.x, o.y - nodeRange.y, boostX - boostPadding, wallWidth); //left roof
        spawn.mapRect(o.x + boostX + 100 + boostPadding, o.y - nodeRange.y, nodeRange.x - boostX - 100 - boostPadding, wallWidth); //right roof
        if (boostPadding < 100 && nodeRange.y < 1300) {
          spawn.boost(o.x + boostX, o.y, 0, -0.0000076 * nodeRange.y - 0.004); //-0.007
          spawn.bodyRect(o.x + boostX - boostPadding - 100, o.y - nodeRange.y - 20, 300 + 2 * boostPadding, 15, 1);
        } else {
          spawn.boost(o.x + boostX, o.y, 0, -0.0000076 * nodeRange.y); //-0.007
        }

        const ledgeHeight = 500 + Math.random() * (nodeRange.y - 900);
        if (Math.random() < 0.9) spawn.mapRect(o.x + boostX + 100 + boostPadding, o.y - ledgeHeight, nodeRange.x - boostX - 100 - boostPadding, wallWidth); //right inside ledge
        if (boostX > 1000) {
          const ledgeWidth = 500;
          if (Math.random() < 0.9) spawn.mapRect(o.x + boostX - ledgeWidth, o.y - ledgeHeight, ledgeWidth - boostPadding, wallWidth); //left inside ledge
          if (nodeRange.y > 1000) {
            let blockHeight = Math.min(maxJump - 15, Math.floor(ledgeHeight / 2));
            if (Math.random() < 0.6) {
              spawn.mapRect(o.x + 300, o.y - blockHeight, boostX - ledgeWidth - 300, blockHeight); //block to get up to second floor
            } else {
              let blockSize = 100 + Math.random() * 70;
              spawn.bodyRect(o.x + blockSize + 50, o.y - blockSize, blockSize, blockSize, 0.6);
            }
            // blockHeight = 100 + Math.floor(Math.random() * 300);
            if (Math.random() < 0.5)
              spawn.mapRect(o.x + boostX + 100 + boostPadding, o.y - blockHeight, nodeRange.x - boostX - 100 - boostPadding, blockHeight); //block on right side of building
          }
        } else {
          if (Math.random() < 0.9) spawn.mapRect(o.x, o.y - ledgeHeight, boostX - boostPadding, wallWidth); //left inside ledge
        }

        spawn.debris(o.x, o.y - nodeRange.y, boostX - boostPadding, 2); //on roof
        spawn.randomMob(o.x + 200, o.y - ledgeHeight - 150, mobChance); //mob in left top corner
        spawn.randomMob(o.x + boostX + 100 + boostPadding + 100, o.y - ledgeHeight - 100, mobChance); //mob above right ledge
        spawn.randomBoss(o.x + boostX + 100 + boostPadding + 100, o.y - nodeRange.y - 500, mobChance); //boss above right roof
        // spawn.randomBoss(o.x + nodeRange.x + 20 + (wide - 40) * Math.random(), o.y + nodeRange.y - 450);

        level.fill.push({
          x: o.x,
          y: o.y - nodeRange.y,
          width: nodeRange.x,
          height: nodeRange.y,
          color: "rgba(0,0,0,0.1)"
        });
        o.x += nodeRange.x;
        if (Math.random() < 0.5) o.y -= nodeRange.y; //start the next level at the top floor of the building or not
      },
      function() {
        //series of platforming ledges
        //first platform to get up to top height
        let wallWidth = 25 + Math.floor(Math.random() * 30);
        const startingX = o.x;
        const frontYard = 200;
        let firstPlatW = 800 + Math.floor(Math.random() * 350);
        o.x += frontYard;
        //optional extra lower floor
        let zeroFloor = 0;
        if (Math.random() < 0.7) {
          zeroFloor = maxJump - 100;
          spawn.mapRect(o.x, o.y - zeroFloor, firstPlatW + 100, zeroFloor + 15); //0th floor
        }
        const firstFloorH = maxJump - Math.floor(Math.random() * 50) + zeroFloor;
        const fullHeight = firstFloorH + 300 + 300;

        const totalCases = 4;
        switch (Math.ceil(Math.random() * totalCases)) {
          case 1:
            spawn.mapRect(o.x, o.y - firstFloorH, firstPlatW, 100); //1st floor
            spawn.mapRect(o.x, o.y - firstFloorH - 300, 100, 315); //1st floor left wall
            spawn.mapRect(o.x + 300, o.y - fullHeight, firstPlatW - 400, 450); //2st floor

            level.fill.push({
              //darkness under first floor left building
              x: o.x,
              y: o.y - firstFloorH,
              width: firstPlatW,
              height: firstFloorH - zeroFloor,
              color: "rgba(0,0,0,0.15)"
            });
            level.fill.push({
              //darkness under second floor left building
              x: o.x + 300,
              y: o.y - firstFloorH - 300,
              width: firstPlatW - 400,
              height: firstFloorH - zeroFloor,
              color: "rgba(0,0,0,0.2)"
            });
            break;
          case 2:
            if (Math.random() < 0.1) {
              spawn.mapRect(o.x + 200, o.y - firstFloorH, 200, firstFloorH + 15 - zeroFloor);
            } else {
              const size = 50 + Math.floor(Math.random() * 100);
              for (let i = 0, len = Math.ceil(Math.random() * 8); i < len; ++i) {
                spawn.bodyRect(o.x + 200, o.y - zeroFloor - size * (1 + i), size, size);
              }
            }
            spawn.boost(o.x + firstPlatW - 100, o.y - zeroFloor, 0, -0.000007 * fullHeight); //-0.007
            break;
          case 3:
            spawn.mapRect(o.x + 200, o.y - firstFloorH, firstPlatW - 200, 100); //1st floor
            spawn.mapRect(o.x + 400, o.y - firstFloorH - 300, firstPlatW - 400, 315); //1st floor left wall
            spawn.mapRect(o.x + 600, o.y - fullHeight, firstPlatW - 600, 450); //2st floor
            level.fill.push({
              //darkness under second floor left building
              x: o.x + 200,
              y: o.y - firstFloorH,
              width: firstPlatW - 200,
              height: firstFloorH - zeroFloor,
              color: "rgba(0,0,0,0.1)"
            });
            break;
          case 4:
            const poleWidth = 50;
            const platWidth = 200;
            const secondPlatX = platWidth + 125;
            const totalWidth = platWidth + secondPlatX;
            spawn.mapRect(o.x + firstPlatW - totalWidth, o.y - firstFloorH - 350, platWidth, wallWidth);
            spawn.mapRect(o.x + firstPlatW - totalWidth, o.y - firstFloorH + 100, platWidth, wallWidth);
            spawn.mapRect(o.x + secondPlatX + firstPlatW - totalWidth, o.y - firstFloorH - 100, platWidth, wallWidth);
            spawn.mapRect(o.x + secondPlatX + firstPlatW - totalWidth, o.y - fullHeight, platWidth, wallWidth);
            level.fillBG.push({
              x: o.x + platWidth / 2 - poleWidth / 2 + firstPlatW - totalWidth,
              y: o.y - firstFloorH - 350,
              width: poleWidth,
              height: firstFloorH + 350 - zeroFloor,
              color: "rgba(0,0,0,0.2)"
            });
            level.fillBG.push({
              x: o.x + platWidth / 2 - poleWidth / 2 + secondPlatX + firstPlatW - totalWidth,
              y: o.y - fullHeight,
              width: poleWidth,
              height: fullHeight - zeroFloor,
              color: "rgba(0,0,0,0.2)"
            });
            if (Math.random() < 0.9) {
              const platX = firstPlatW - totalWidth - platWidth - 125;
              spawn.mapRect(o.x + platX, o.y - firstFloorH - 100, platWidth, wallWidth);
              spawn.mapRect(o.x + platX, o.y - fullHeight, platWidth, wallWidth);

              level.fillBG.push({
                x: o.x + platWidth / 2 - poleWidth / 2 + platX,
                y: o.y - fullHeight,
                width: poleWidth,
                height: fullHeight - zeroFloor,
                color: "rgba(0,0,0,0.2)"
              });
            }
            break;
        }
        spawn.debris(o.x, o.y - zeroFloor, firstPlatW, 2);
        spawn.randomMob(o.x + firstPlatW - 200 - Math.random() * 600, o.y - zeroFloor - 100, mobChance); //in shadow
        spawn.randomMob(o.x + firstPlatW - 200 - Math.random() * 400, o.y - fullHeight - 100, mobChance); //top
        spawn.randomBoss(o.x + firstPlatW - 200, o.y - fullHeight - 500, mobChance); //top

        //random platforms
        let offX = o.x + firstPlatW;
        const len = Math.ceil(Math.random() * Math.random() * 4.5);
        for (let i = 0; i < len; i++) {
          const totalCases = 3;
          switch (Math.ceil(Math.random() * totalCases)) {
            case 1:
              const width = 150 + Math.floor(Math.random() * 500);
              const middle = Math.floor(width / 2);
              spawn.mapRect(offX + 300, o.y - fullHeight, width, wallWidth); //top platform
              if (Math.random() < 0.5) spawn.mapRect(offX + 300, o.y - 50, width, 65); //ground bump
              //optional room on second floor
              if (width > 400) {
                roomHeight = Math.min(maxJump, width) - 100;
                roomLipWidth = 200;
                spawn.mapRect(offX + 300 + width - wallWidth, o.y - fullHeight - roomHeight, wallWidth, roomHeight + 15); //room right wall
                spawn.mapRect(offX + 300 + roomLipWidth, o.y - fullHeight - roomHeight, width - roomLipWidth, wallWidth); //room roof
                level.fill.push({
                  x: offX + 300 + roomLipWidth,
                  y: o.y - fullHeight - roomHeight + wallWidth,
                  width: width - roomLipWidth,
                  height: roomHeight - wallWidth,
                  color: "rgba(0,0,0,0.1)"
                });
              } else if (Math.random() < 0.5) {
                spawn.mapRect(offX + 300, o.y - firstFloorH, width, wallWidth); //middle platform
                spawn.bodyRect(offX + 300 - Math.floor(Math.random() * 100), o.y - fullHeight - 20, width + Math.floor(Math.random() * 300), 20, 0.7); //plank on top platform)
              }
              level.fillBG.push({
                x: offX + 300 + middle - 25,
                y: o.y - fullHeight,
                width: 50,
                height: fullHeight,
                color: "rgba(0,0,0,0.2)"
              });
              spawn.debris(offX + 300, o.y - 50, width, 1);
              spawn.randomMob(offX + 300 + Math.random() * width, o.y - fullHeight - 100, 1); //top
              offX += 300 + width;
              break;
            case 2:
              const width2 = 500 + Math.floor(Math.random() * 400);
              const forkDepth = 300;
              const forkBaseHeight = fullHeight - forkDepth - (maxJump - 100) - 250;
              spawn.mapRect(offX + 300, o.y - maxJump + 100, width2, maxJump - 100); //base
              spawn.mapRect(offX + 300, o.y - fullHeight + forkDepth, width2, forkBaseHeight); //fork base
              if (Math.random() < 0.7) spawn.mapRect(offX + 300, o.y - fullHeight, 100, forkDepth); //left fork
              spawn.mapRect(offX + 300 + width2 - 100, o.y - fullHeight, 100, forkDepth); //right fork

              level.fill.push({
                x: offX + 300,
                y: o.y - fullHeight + forkDepth + forkBaseHeight,
                width: width2,
                height: fullHeight - forkDepth - forkBaseHeight - maxJump + 100,
                color: "rgba(0,0,0,0.1)"
              });
              spawn.debris(offX + 300, o.y - maxJump + 100, width2, 1);
              spawn.randomMob(offX + 450 + Math.random() * (width2 - 300), o.y - fullHeight + 200, 1); //top
              offX += 300 + width2;
              break;
            case 3:
              const width3 = 200 + Math.floor(Math.random() * 300);
              if (Math.random() < 0.7) {
                spawn.mapRect(offX + 300, o.y - fullHeight, width3, fullHeight - 150); //top platform

                level.fill.push({
                  x: offX + 300,
                  y: o.y - 150,
                  width: width3,
                  height: 150,
                  color: "rgba(0,0,0,0.25)"
                });
              } else {
                //add a gap
                const gap = (fullHeight - 150) / 2 + 100;
                spawn.mapRect(offX + 300, o.y - fullHeight, width3, fullHeight - 150 - gap); //top platform
                spawn.mapRect(offX + 300, o.y - fullHeight + gap, width3, fullHeight - 150 - gap); //top platform
                level.fill.push({
                  x: offX + 300,
                  y: o.y - 150,
                  width: width3,
                  height: 150,
                  color: "rgba(0,0,0,0.25)"
                });
                level.fill.push({
                  x: offX + 300,
                  y: o.y - 150 - gap,
                  width: width3,
                  height: 200,
                  color: "rgba(0,0,0,0.25)"
                });
              }
              spawn.randomMob(offX + 300 + Math.random() * width3, o.y - fullHeight - 100, mobChance); //top
              spawn.debris(offX + 300, o.y - fullHeight - 100, width3, 1);
              offX += 300 + width3;
              break;
          }
        }
        o.x += offX - o.x + 200;
        spawn.mapRect(startingX, o.y, o.x - startingX + 15, 100); //ground
        spawn.mapRect(o.x, o.y - fullHeight + 15, 100, fullHeight + 85); //right wall
        o.y -= fullHeight;
      }
    ];
    //randomized zone spawns
    mapNodes = Math.min(4, 2 + game.levelsCleared);
    for (let i = 0; i < mapNodes; ++i) {
      // mapNode[5]();
      mapNode[Math.floor(Math.random() * mapNode.length)](); //run a random mapNode
    }

    //ending zone
    o.x += 200;
    level.exit.x = o.x + 200;
    level.exit.y = o.y - 35;
    this.addZone(level.exit.x, level.exit.y, 100, 30, "nextLevel");
    spawn.mapRect(o.x + 200, o.y - 20, 100, 50);
    spawn.mapRect(o.x + 450, o.y - 330, 50, 380);
    spawn.mapRect(o.x - 200, o.y - 10, 700, 110);
    spawn.mapRect(o.x, o.y - 325, 50, 100);
    spawn.mapRect(o.x, o.y - 350, 500, 50);
    // spawn.mapRect(o.x - 200, o.y, 300, 200);
    // spawn.mapGunPowerUp(o.x - 50, o.y + 0); //spawns a gun on most early levels
    level.fillBG.push({
      x: o.x,
      y: o.y,
      width: 450,
      height: -350,
      color: "#dff"
    });
    //set new fall height
    game.fallHeight = o.y + 15000;
  },
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  //*****************************************************************************************************************
  enter: {
    x: 0,
    y: 0,
    draw: function() {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 30);
      ctx.lineTo(this.x, this.y - 80);
      ctx.bezierCurveTo(this.x, this.y - 170, this.x + 100, this.y - 170, this.x + 100, this.y - 80);
      ctx.lineTo(this.x + 100, this.y + 30);
      ctx.lineTo(this.x, this.y + 30);
      ctx.fillStyle = "#ccc";
      ctx.fill();
    }
  },
  exit: {
    x: 0,
    y: 0,
    draw: function() {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 30);
      ctx.lineTo(this.x, this.y - 80);
      ctx.bezierCurveTo(this.x, this.y - 170, this.x + 100, this.y - 170, this.x + 100, this.y - 80);
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
  zones: [], //zone do actions when player is in a region   // to effect everything use a query
  checkZones: function() {
    for (let i = 0, len = this.zones.length; i < len; ++i) {
      if (
        player.position.x > this.zones[i].x1 &&
        player.position.x < this.zones[i].x2 &&
        player.position.y > this.zones[i].y1 &&
        player.position.y < this.zones[i].y2
      ) {
        this.zoneActions[this.zones[i].action](i);
        break;
      }
    }
  },
  addZone: function(x, y, width, height, action, info) {
    this.zones[this.zones.length] = {
      x1: x,
      y1: y - 150,
      x2: x + width,
      y2: y + height - 70, //-70 to adjust for player height
      action: action,
      info: info
    };
  },
  zoneActions: {
    fling: function(i) {
      Matter.Body.setVelocity(player, {
        x: level.zones[i].info.Vx,
        y: level.zones[i].info.Vy
      });
    },
    nextLevel: function() {
      //enter when player isn't falling
      if (player.velocity.y < 0.1) {
        game.dmgScale += 0.4; //damage done by mobs increases each level
        b.dmgScale *= 0.98; //damage done by player decreases each level
        game.levelsCleared++;
        game.clearNow = true; //triggers in the physics engine to remove all physics bodies
      }
    },
    death: function() {
      mech.death();
    },
    laser: function(i) {
      //draw these in game with spawn.background
      mech.damage(level.zones[i].info.dmg);
    },
    slow: function() {
      Matter.Body.setVelocity(player, {
        x: player.velocity.x * 0.5,
        y: player.velocity.y * 0.5
      });
    }
  },
  queryList: [], //queries do actions on many objects in regions
  checkQuery: function() {
    let bounds, action, info;

    function isInZone(targetArray) {
      let results = Matter.Query.region(targetArray, bounds);
      for (let i = 0, len = results.length; i < len; ++i) {
        level.queryActions[action](results[i], info);
      }
    }
    for (let i = 0, len = level.queryList.length; i < len; ++i) {
      bounds = level.queryList[i].bounds;
      action = level.queryList[i].action;
      info = level.queryList[i].info;
      for (let j = 0, l = level.queryList[i].groups.length; j < l; ++j) {
        isInZone(level.queryList[i].groups[j]);
      }
    }
  },
  //oddly query regions can't get smaller than 50 width?
  addQueryRegion: function(x, y, width, height, action, groups = [[player], body, mob, powerUp, bullet], info) {
    this.queryList[this.queryList.length] = {
      bounds: {
        min: {
          x: x,
          y: y
        },
        max: {
          x: x + width,
          y: y + height
        }
      },
      action: action,
      groups: groups,
      info: info
    };
  },
  queryActions: {
    bounce: function(target, info) {
      //jerky fling upwards
      Matter.Body.setVelocity(target, {
        x: info.Vx + (Math.random() - 0.5) * 6,
        y: info.Vy
      });
      target.torque = (Math.random() - 0.5) * 2 * target.mass;
    },
    force: function(target, info) {
      if (target.velocity.y < 0) {
        //gently force up if already on the way up
        target.force.x += info.Vx * target.mass;
        target.force.y += info.Vy * target.mass;
      } else {
        target.force.y -= 0.0007 * target.mass; //gently fall in on the way down
      }
    },
    antiGrav: function(target) {
      target.force.y -= 0.0011 * target.mass;
    },
    death: function(target) {
      target.death();
    }
  },
  levelAnnounce: function() {
    // let text = "n-gon L" + (game.levelsCleared + 1) + " " + level.levels[level.onLevel];
    let text = "n-gon Level " + (game.levelsCleared + 1);
    document.title = text;
    // text = "Level " + (game.levelsCleared + 1) + ": " + spawn.pickList[0] + "s + " + spawn.pickList[1] + "s";
    // game.makeTextLog(text, 300);

    // text = text + " with population: ";
    // for (let i = 0, len = spawn.pickList.length; i < len; ++i) {
    //     if (spawn.pickList[i] != spawn.pickList[i - 1]) {
    //         text += spawn.pickList[i] + ", ";
    //     }
    // }
    // this.speech(text);
    // game.makeTextLog(text, 360);
  },
  addToWorld: function(mapName) {
    //needs to be run to put bodies into the world
    for (let i = 0; i < body.length; i++) {
      //body[i].collisionFilter.group = 0;
      body[i].collisionFilter.category = 0x0000001;
      body[i].collisionFilter.mask = 0x011111;
      body[i].classType = "body";
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
