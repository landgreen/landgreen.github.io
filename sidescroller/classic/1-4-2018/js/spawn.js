//main object for spawning things in a level
const spawn = {
  pickList: ["starter", "starter"],
  fullPickList: [
    "chaser",
    "striker",
    "spinner",
    "hopper",
    "grower",
    "springer",
    "zoomer",
    "shooter",
    "beamer",
    "focuser",
    "laser",
    "blinker",
    "drifter",
    "sucker",
    "exploder",
    "spawner",
    "ghoster",
    "sneaker",
    "bomber"
  ],
  bossPickList: ["zoomer", "chaser", "spinner", "striker", "springer", "laser", "focuser", "beamer", "exploder", "spawner", "bomber"],
  setSpawnList: function () {
    //this is run at the start of each new level to determine the possible mobs for the level
    //each level has 2 mobs: one new mob and one from the the last level
    spawn.pickList.splice(0, 1);
    spawn.pickList.push(spawn.fullPickList[Math.floor(Math.random() * spawn.fullPickList.length)]);
  },
  randomMob: function (x, y, chance = 1) {
    if (Math.random() < chance + 0.11 * game.levelsCleared) {
      const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
      this[pick](x, y);
    }
  },
  randomSmallMob: function (
    x,
    y,
    num = Math.max(Math.min(Math.round(Math.random() * game.levelsCleared - 0.4), 4), 0),
    size = 16 + Math.ceil(Math.random() * 15),
    chance = 1
  ) {
    if (Math.random() < chance + game.levelsCleared * 0.03) {
      for (let i = 0; i < num; ++i) {
        const pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
        this[pick](x + Math.round((Math.random() - 0.5) * 20) + i * size * 2.5, y + Math.round((Math.random() - 0.5) * 20), size);
      }
    }
  },
  randomBoss: function (x, y, chance = 1) {
    if (Math.random() < chance + game.levelsCleared * 0.11 && game.levelsCleared !== 0) {
      //choose from the possible picklist
      let pick = this.pickList[Math.floor(Math.random() * this.pickList.length)];
      //is the pick able to be a boss?
      let canBeBoss = false;
      for (let i = 0, len = this.bossPickList.length; i < len; ++i) {
        if (this.bossPickList[i] === pick) {
          canBeBoss = true;
          break;
        }
      }
      if (!canBeBoss) {
        if (Math.random() < 0.4) {
          //one extra large mob
          this[pick](x, y, 90 + Math.random() * 40);
          return;
        } else if (Math.random() < 0.5) {
          pick = "randomList";
        } else {
          pick = "random";
        }
      }
      //spawn random boss
      if (Math.random() < 0.5) {
        this.nodeBoss(x, y, pick);
      } else {
        this.lineBoss(x, y, pick);
      }
    }
  },
  //mob templates *********************************************************************************************
  //***********************************************************************************************************
  starter: function (x, y, radius = 30) {
    //only on level 1
    mobs.spawn(x, y, 8, radius, "#9ccdc6");
    let me = mob[mob.length - 1];
    me.accelMag = 0.0007;
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.attraction();
    };
  },
  chaser: function (x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
    mobs.spawn(x, y, 4, radius, "rgb(110,150,200)");
    let me = mob[mob.length - 1];
    me.g = 0.0005; //required if using 'gravity'
    me.accelMag = 0.0012;
    me.memory = 240;
    if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.seePlayerCheck();
      this.attraction();
    };
  },
  grower: function (x, y, radius = 15) {
    mobs.spawn(x, y, 7, radius, "hsl(144, 15%, 50%)");
    let me = mob[mob.length - 1];
    me.big = false; //required for grow
    me.accelMag = 0.0005;
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.attraction();
      this.grow();
    };
  },
  springer: function (x, y, radius = 20 + Math.ceil(Math.random() * 35)) {
    mobs.spawn(x, y, 8, radius, "#b386e8");
    let me = mob[mob.length - 1];
    me.friction = 0;
    me.frictionAir = 0.1;
    me.lookTorque = 0.000005;
    me.g = 0.0002; //required if using 'gravity'
    me.seePlayerFreq = Math.ceil(40 + 25 * Math.random());
    me.springTarget = {
      x: me.position.x,
      y: me.position.y
    };
    let len = cons.length;
    cons[len] = Constraint.create({
      pointA: me.springTarget,
      bodyB: me,
      stiffness: 0.003,
      damping: 0.07
    });
    cons[len].length = 100 + 1.5 * radius;
    me.cons = cons[len];

    me.springTarget2 = {
      x: me.position.x,
      y: me.position.y
    };
    len = cons.length;
    cons[len] = Constraint.create({
      pointA: me.springTarget2,
      bodyB: me,
      stiffness: 0.003,
      damping: 0.07
    });
    cons[len].length = 100 + 1.5 * radius;
    me.cons2 = cons[len];

    me.onDeath = function () {
      this.removeCons();
    };
    if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.searchSpring();
    };
  },
  zoomer: function (x, y, radius = 20 + Math.ceil(Math.random() * 30)) {
    mobs.spawn(x, y, 6, radius, "#ffe2fd");
    let me = mob[mob.length - 1];
    me.trailLength = 20; //required for trails
    me.setupTrail(); //fill trails array up with the current position of mob
    me.trailFill = "#ff00f0";
    me.g = 0.001; //required if using 'gravity'
    me.frictionAir = 0.02;
    me.accelMag = 0.004;
    me.memory = 30;
    me.zoomMode = 150;
    me.onHit = function () {
      this.zoomMode = 150;
    };
    me.do = function () {
      this.healthBar();
      this.seePlayerByDistAndLOS();
      this.zoom();
      this.gravity();
    };
  },
  hopper: function (x, y, radius = 25 + Math.ceil(Math.random() * 30)) {
    mobs.spawn(x, y, 5, radius, "rgb(0,200,180)");
    let me = mob[mob.length - 1];
    me.accelMag = 0.04;
    me.g = 0.0015; //required if using 'gravity'
    me.frictionAir = 0.018;
    me.restitution = 0;
    me.delay = 110;
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.seePlayerCheck();
      this.hop();
    };
  },
  spinner: function (x, y, radius = 45 + Math.ceil(Math.random() * 40)) {
    mobs.spawn(x, y, 5, radius, "#000000");
    let me = mob[mob.length - 1];
    me.fill = randomColor({
      hue: "blue"
    });
    me.cdBurst1 = 0; //must add for burstAttraction
    me.cdBurst2 = 0; //must add for burstAttraction
    me.delay = 0;
    me.burstDir = {
      x: 0,
      y: 0
    };
    me.accelMag = 0.16;
    me.frictionAir = 0.022;
    me.lookTorque = 0.0000014;
    me.restitution = 0;
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.burstAttraction();
    };
  },
  sucker: function (x, y, radius = 30 + Math.ceil(Math.random() * 70)) {
    radius = 9 + radius / 8; //extra small
    mobs.spawn(x, y, 6, radius, "#000");
    let me = mob[mob.length - 1];
    me.eventHorizon = radius * 30; //required for blackhole
    me.seeAtDistance2 = (me.eventHorizon + 500) * (me.eventHorizon + 500); //vision limit is event horizon
    me.accelMag = 0.00009;
    // me.frictionAir = 0.005;
    me.memory = 600;
    Matter.Body.setDensity(me, 0.008); //extra dense //normal is 0.001
    me.collisionFilter.mask = 0x001100; //move through walls
    me.do = function () {
      this.seePlayerByDistOrLOS();
      this.attraction();
      this.darkness();
      this.blackHole();
      this.healthBar();
    };
  },
  beamer: function (x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
    mobs.spawn(x, y, 4, radius, "rgb(255,0,190)");
    let me = mob[mob.length - 1];
    me.repulsionRange = 90000; //squared
    // me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
    me.accelMag = 0.0006;
    me.frictionStatic = 0;
    me.friction = 0;
    if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.attraction();
      this.repulsion();
      this.laserBeam();
    };
  },
  focuser: function (x, y, radius = 15 + Math.ceil(Math.random() * 15)) {
    mobs.spawn(x, y, 4, radius, "rgb(0,0,255)");
    let me = mob[mob.length - 1];
    me.laserPos = me.position; //required for laserTracking
    me.repulsionRange = 400000; //squared
    //me.seePlayerFreq = 2 + Math.round(Math.random() * 5);
    me.accelMag = 0.0006;
    me.frictionStatic = 0;
    me.friction = 0;
    me.onDamage = function () {
      this.laserPos = this.position;
    };
    if (Math.random() < Math.min(0.2 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.attraction();
      this.repulsion();
      this.laserTracking();
    };
  },
  laser: function (x, y, radius = 30) {
    //only on level 1
    mobs.spawn(x, y, 3, radius, "#f00");
    let me = mob[mob.length - 1];
    me.vertices = Matter.Vertices.rotate(me.vertices, Math.PI, me.position); //make the pointy side of triangle the front
    Matter.Body.rotate(me, Math.random() * Math.PI * 2);
    me.accelMag = 0.00005;
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.attraction();
      this.laser();
    };
  },
  striker: function (x, y, radius = 15 + Math.ceil(Math.random() * 25)) {
    mobs.spawn(x, y, 5, radius, "rgb(221,102,119)");
    let me = mob[mob.length - 1];
    me.accelMag = 0.0004;
    me.g = 0.0002; //required if using 'gravity'
    me.frictionStatic = 0;
    me.friction = 0;
    me.delay = 60;
    Matter.Body.rotate(me, Math.PI * 0.1);
    me.onDamage = function () {
      this.cd = game.cycle + this.delay;
    };
    me.do = function () {
      this.healthBar();
      this.seePlayerCheck();
      this.attraction();
      this.gravity();
      this.strike();
    };
  },
  sneaker: function (x, y, radius = 15 + Math.ceil(Math.random() * 25)) {
    let me;
    mobs.spawn(x, y, 5, radius, "transparent");
    me = mob[mob.length - 1];
    me.accelMag = 0.0006;
    me.g = 0.0002; //required if using 'gravity'
    me.stroke = "transparent"; //used for drawSneaker
    me.alpha = 1; //used in drawSneaker
    me.canTouchPlayer = false; //used in drawSneaker
    me.collisionFilter.mask = 0x000111; //can't touch player
    // me.memory = 420;
    // me.seePlayerFreq = 60 + Math.round(Math.random() * 30);
    me.do = function () {
      this.seePlayerCheck();
      this.attraction();
      this.gravity();
      this.drawSneaker();
    };
  },
  ghoster: function (x, y, radius = 50 + Math.ceil(Math.random() * 60)) {
    let me;
    mobs.spawn(x, y, 7, radius, "transparent");
    me = mob[mob.length - 1];
    me.seeAtDistance2 = 1500000;
    me.accelMag = 0.0002;
    me.searchTarget = map[Math.floor(Math.random() * (map.length - 1))].position; //required for search
    me.stroke = "transparent"; //used for drawGhost
    me.alpha = 1; //used in drawGhost
    me.canTouchPlayer = false; //used in drawGhost
    me.collisionFilter.mask = 0x000100; //move through walls and player
    me.memory = 420;
    me.do = function () {
      this.seePlayerCheckByDistance();
      this.attraction();
      this.search();
      this.drawGhost();
    };
  },
  blinker: function (x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
    mobs.spawn(x, y, 6, radius, "rgb(0,200,255)");
    let me = mob[mob.length - 1];
    Matter.Body.rotate(me, Math.random() * 2 * Math.PI);
    me.blinkRate = 40 + Math.round(Math.random() * 60); //required for blink
    me.blinkLength = 150 + Math.round(Math.random() * 200); //required for blink
    // me.collisionFilter.mask = 0x001100; //move through walls
    me.isStatic = true;
    me.memory = 360;
    me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    me.isBig = false;
    me.onDeath = function () {
      if (this.isBig) {
        const scale = 1 / 3;
        Matter.Body.scale(this, scale, scale);
        this.isBig = false;
      }
    };
    me.do = function () {
      this.healthBar();
      this.seePlayerCheck();
      this.blink();
      //strike by expanding
      if (this.isBig) {
        if (this.cd - this.delay + 15 < game.cycle) {
          const scale = 1 / 3;
          Matter.Body.scale(this, scale, scale);
          this.isBig = false;
        }
      } else if (this.seePlayer.yes && this.cd < game.cycle) {
        const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
        const distMag2 = Matter.Vector.magnitudeSquared(dist);
        if (distMag2 < 80000) {
          this.cd = game.cycle + this.delay;
          const scale = 3;
          Matter.Body.scale(this, scale, scale);
          this.isBig = true;
        }
      }
    };
  },
  drifter: function (x, y, radius = 15 + Math.ceil(Math.random() * 40)) {
    mobs.spawn(x, y, 4.5, radius, "rgb(0,200,255)");
    let me = mob[mob.length - 1];
    Matter.Body.rotate(me, Math.random() * 2 * Math.PI);
    me.blinkRate = 30 + Math.round(Math.random() * 30); //required for blink/drift
    me.blinkLength = 160; //required for blink/drift
    //me.collisionFilter.mask = 0x001100; //move through walls
    me.isStatic = true;
    me.memory = 360;
    me.seePlayerFreq = 40 + Math.round(Math.random() * 30);
    me.do = function () {
      this.healthBar();
      this.seePlayerCheck();
      this.drift();
    };
  },
  bomber: function (x, y, radius = 15 + Math.ceil(Math.random() * 25)) {
    mobs.spawn(x, y, 4, radius, "rgba(0,0,80,0.7)");
    let me = mob[mob.length - 1];
    me.seeAtDistance2 = 800000;
    me.fireFreq = Math.ceil(30 + 2000 / radius);
    me.searchTarget = map[Math.floor(Math.random() * (map.length - 1))].position; //required for search
    me.hoverElevation = 400 + (Math.random() - 0.5) * 200; //squared
    me.hoverXOff = (Math.random() - 0.5) * 100;
    me.accelMag = Math.floor(10 * (Math.random() + 5)) * 0.00001;
    me.g = 0.0002; //required if using 'gravity'   // gravity called in hoverOverPlayer
    me.frictionStatic = 0;
    me.friction = 0;
    me.frictionAir = 0.01;
    // me.memory = 300;
    // Matter.Body.setDensity(me, 0.0015); //extra dense //normal is 0.001
    me.collisionFilter.mask = 0x001100; //move through walls
    if (Math.random() < Math.min(0.3 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.seePlayerCheckByDistance();
      this.hoverOverPlayer();
      this.bomb();
      this.search();
    };
  },
  shooter: function (x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
    mobs.spawn(x, y, 3, radius, "rgb(255,100,150)");
    let me = mob[mob.length - 1];
    me.vertices = Matter.Vertices.rotate(me.vertices, Math.PI, me.position); //make the pointy side of triangle the front
    me.memory = 120;
    me.fireFreq = 0.013 + Math.random() * 0.01;
    me.noseLength = 0;
    me.fireAngle = 0;
    me.accelMag = 0.0005;
    me.frictionAir = 0.05;
    me.lookTorque = 0.0000025 * (Math.random() > 0.5 ? -1 : 1);
    me.fireDir = {
      x: 0,
      y: 0
    };
    if (Math.random() < Math.min(0.15 + game.levelsCleared * 0.1, 0.7)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.seePlayerByLookingAt();
      this.fire();
    };
  },
  bullet: function (x, y, radius = 6, sides = 0) {
    //bullets
    mobs.spawn(x, y, sides, radius, "rgb(255,0,0)");
    let me = mob[mob.length - 1];
    me.stroke = "transparent";
    me.onHit = function () {
      this.explode();
    };
    Matter.Body.setDensity(me, 0.002); //normal is 0.001
    me.timeLeft = 240;
    me.g = 0.001; //required if using 'gravity'
    me.frictionAir = 0;
    me.restitution = 0.8;
    me.leaveBody = false;
    me.dropPowerUp = false;
    // me.collisionFilter.mask = 0x001000;
    me.collisionFilter.category = 0x010000;
    me.do = function () {
      this.gravity();
      this.timeLimit();
    };
  },
  spawner: function (x, y, radius = 55 + Math.ceil(Math.random() * 50)) {
    mobs.spawn(x, y, 4, radius, "rgb(255,150,0)");
    let me = mob[mob.length - 1];
    me.g = 0.0004; //required if using 'gravity'
    me.leaveBody = false;
    me.dropPowerUp = false;
    me.onDeath = function () {
      //run this function on death
      for (let i = 0; i < Math.ceil(this.mass * 0.2 + Math.random() * 3); ++i) {
        spawn.spawns(this.position.x + (Math.random() - 0.5) * radius * 2, this.position.y + (Math.random() - 0.5) * radius * 2);
        Matter.Body.setVelocity(mob[mob.length - 1], {
          x: (Math.random() - 0.5) * 25,
          y: (Math.random() - 0.5) * 25
        });
      }
    };
    if (Math.random() < Math.min(game.levelsCleared * 0.1, 0.5)) spawn.shield(me, x, y);
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.seePlayerCheck();
      this.attraction();
    };
  },
  spawns: function (x, y, radius = 15 + Math.ceil(Math.random() * 5)) {
    mobs.spawn(x, y, 4, radius, "rgb(255,0,0)");
    let me = mob[mob.length - 1];
    me.onHit = function () {
      //run this function on hitting player
      this.explode();
    };
    me.g = 0.0001; //required if using 'gravity'
    me.accelMag = 0.0003;
    me.memory = 30;
    me.seePlayerFreq = 80 + Math.round(Math.random() * 50);
    me.frictionAir = 0.002;
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.seePlayerCheck();
      this.attraction();
    };
  },
  exploder: function (x, y, radius = 25 + Math.ceil(Math.random() * 50)) {
    mobs.spawn(x, y, 4, radius, "rgb(255,0,0)");
    let me = mob[mob.length - 1];
    me.onHit = function () {
      //run this function on hitting player
      this.explode();
    };
    me.g = 0.0004; //required if using 'gravity'
    me.do = function () {
      this.healthBar();
      this.gravity();
      this.seePlayerCheck();
      this.attraction();
    };
  },

  shield: function (target, x, y, stiffness = 0.4) {
    if (this.allowShields) {
      mobs.spawn(x, y, 9, target.radius + 20, "rgba(220,220,255,0.6)");
      let me = mob[mob.length - 1];
      me.stroke = "rgb(220,220,255)";
      me.density = 0.0001; //very low density to not mess with the original mob's motion
      me.shield = true;
      me.collisionFilter.mask = 0x001100; //don't collide with bodies, map, and mobs, onyl bullets and player
      consBB[consBB.length] = Constraint.create({
        //attach shield to last spawned mob
        bodyA: me,
        bodyB: target,
        stiffness: stiffness,
        damping: 0.1
      });
      me.onDamage = function () {
        //make sure the mob that owns the shield can tell when damage is done
        this.alertNearByMobs();
      };
      me.leaveBody = false;
      me.dropPowerUp = false;
      //swap order of shield and mob, so that mob is behind shield graphically
      mob[mob.length - 1] = mob[mob.length - 2];
      mob[mob.length - 2] = me;
      me.do = function () {};
    }
  },
  //complex constrained mob templates**********************************************************************
  //*******************************************************************************************************
  allowShields: true,
  nodeBoss: function (
    x,
    y,
    spawn = "striker",
    nodes = Math.min(2 + Math.round(Math.random() * (game.levelsCleared + 1)), 8),
    //Math.ceil(Math.random() * 3) + Math.min(4,Math.ceil(game.levelsCleared/2)),
    radius = Math.ceil(Math.random() * 10) + 17,
    l = Math.ceil(Math.random() * 100) + 70,
    stiffness = Math.random() * 0.03 + 0.005
  ) {
    this.allowShields = false; //dont' want shields on boss mobs
    let px = 0;
    let py = 0;
    let a = 2 * Math.PI / nodes;
    for (let i = 0; i < nodes; ++i) {
      px += l * Math.cos(a * i);
      py += l * Math.sin(a * i);
      let whoSpawn = spawn;
      if (spawn === "random") {
        whoSpawn = this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)];
      } else if (spawn === "randomList") {
        whoSpawn = this.pickList[Math.floor(Math.random() * this.pickList.length)];
      }
      this[whoSpawn](x + px, y + py, radius);
    }
    if (Math.random() < 0.3) {
      this.constrain2AdjacentMobs(nodes, stiffness * 2, true);
    } else {
      this.constrainAllMobCombos(nodes, stiffness);
    }
    this.allowShields = true;
  },
  lineBoss: function (
    x,
    y,
    spawn = "striker",
    nodes = Math.min(2 + Math.round(Math.random() * (game.levelsCleared + 1)), 8),
    //Math.ceil(Math.random() * 3) + Math.min(4,Math.ceil(game.levelsCleared/2)),
    radius = Math.ceil(Math.random() * 10) + 17,
    l = Math.ceil(Math.random() * 80) + 30,
    stiffness = Math.random() * 0.06 + 0.01
  ) {
    this.allowShields = false; //dont' want shields on boss mobs
    for (let i = 0; i < nodes; ++i) {
      let whoSpawn = spawn;
      if (spawn === "random") {
        whoSpawn = this.fullPickList[Math.floor(Math.random() * this.fullPickList.length)];
      } else if (spawn === "randomList") {
        whoSpawn = this.pickList[Math.floor(Math.random() * this.pickList.length)];
      }
      this[whoSpawn](x + i * radius + i * l, y, radius);
    }
    this.constrain2AdjacentMobs(nodes, stiffness);
    this.allowShields = true;
  },
  //constraints ************************************************************************************************
  //*************************************************************************************************************
  constrainAllMobCombos: function (nodes, stiffness) {
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
  constrain2AdjacentMobs: function (nodes, stiffness, loop = false) {
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
  constraintPB: function (x, y, bodyIndex, stiffness) {
    cons[cons.length] = Constraint.create({
      pointA: {
        x: x,
        y: y
      },
      bodyB: body[bodyIndex],
      stiffness: stiffness
    });
  },
  constraintBB: function (bodyIndexA, bodyIndexB, stiffness) {
    consBB[consBB.length] = Constraint.create({
      bodyA: body[bodyIndexA],
      bodyB: body[bodyIndexB],
      stiffness: stiffness
    });
  },
  // body and map spawns ******************************************************************************
  //**********************************************************************************************
  boost: function (x, y, height = -1000) {
    spawn.mapVertex(x + 50, y + 35, "120 40 -120 40 -50 -40 50 -40");
    // level.addZone(x, y, 100, 30, "fling", {Vx:Vx, Vy: Vy});
    level.addQueryRegion(x, y - 120, 100, 120, "boost", [
      [player], body, mob, powerUp, bullet
    ], -1.1 * Math.sqrt(Math.abs(height)));
    let color = "rgba(200,0,255,";
    level.fillBG.push({
      x: x,
      y: y - 25,
      width: 100,
      height: 25,
      color: color + "0.2)"
    });
    level.fillBG.push({
      x: x,
      y: y - 55,
      width: 100,
      height: 55,
      color: color + "0.1)"
    });
    level.fillBG.push({
      x: x,
      y: y - 120,
      width: 100,
      height: 120,
      color: color + "0.05)"
    });
  },
  laserZone: function (x, y, width, height, dmg) {
    level.addZone(x, y, width, height, "laser", {
      dmg
    });
    level.fill.push({
      x: x,
      y: y,
      width: width,
      height: height,
      color: "#f00"
    });
  },
  deathQuery: function (x, y, width, height) {
    level.addQueryRegion(x, y, width, height, "death", [
      [player], mob
    ]);
    level.fill.push({
      x: x,
      y: y,
      width: width,
      height: height,
      color: "#f00"
    });
  },
  platform: function (x, y, width, height) {
    const size = 20;
    spawn.mapRect(x, y + height, width, 30);
    level.fillBG.push({
      x: x + width / 2 - size / 2,
      y: y,
      width: size,
      height: height,
      color: "#f0f0f3"
    });
  },
  debris: function (x, y, width, number = Math.floor(3 + Math.random() * 11)) {
    for (let i = 0; i < number; ++i) {
      if (Math.random() < 0.15) {
        powerUps.chooseRandomPowerUp(x + Math.random() * width, y);
      } else {
        const size = 18 + Math.random() * 25;
        body[body.length] = Bodies.rectangle(x + Math.random() * width, y, size * (0.6 + Math.random()), size * (0.6 + Math.random()));
      }
    }
  },
  bodyRect: function (
    x,
    y,
    width,
    height,
    chance = 1,
    properties = {
      friction: 0.05
    }
  ) {
    if (Math.random() < chance) {
      body[body.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
    }
  },
  bodyVertex: function (x, y, vector, properties) {
    //addes shape to body array
    body[body.length] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
  },
  mapRect: function (x, y, width, height, properties) {
    //addes reactangles to map array
    var len = map.length;
    map[len] = Bodies.rectangle(x + width / 2, y + height / 2, width, height, properties);
  },
  mapVertex: function (x, y, vector, properties) {
    //addes shape to map array
    var len = map.length;
    map[len] = Matter.Bodies.fromVertices(x, y, Vertices.fromPath(vector), properties);
  },
  //complex map templates
  spawnBuilding: function (x, y, w, h, leftDoor, rightDoor, walledSide) {
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
  spawnStairs: function (x, y, num, w, h, stepRight) {
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
  propsFrictionMedium: {
    friction: 0.15,
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