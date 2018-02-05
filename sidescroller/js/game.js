// game Object ********************************************************
//*********************************************************************
const game = {
  mouse: {
    x: canvas.width / 2,
    y: canvas.height / 2
  },
  mouseInGame: {
    x: 0,
    y: 0
  },
  levelsCleared: 0,
  g: 0.001,
  dmgScale: 1,
  paused: false,
  testing: false, //testing mode: shows wireframe and some variables
  cycle: 0, //total cycles, 60 per second
  cyclePaused: 0,
  fallHeight: 3000, //below this y position the player dies
  lastTimeStamp: 0, //tracks time stamps for measuing delta
  delta: 1000 / 60, //speed of game engine //looks like it has to be 16 to match player input
  buttonCD: 0,
  drawCursor: function() {
    const size = 10;
    ctx.beginPath();
    ctx.moveTo(game.mouse.x - size, game.mouse.y);
    ctx.lineTo(game.mouse.x + size, game.mouse.y);
    ctx.moveTo(game.mouse.x, game.mouse.y - size);
    ctx.lineTo(game.mouse.x, game.mouse.y + size);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000"; //'rgba(0,0,0,0.4)'
    ctx.stroke(); // Draw it
  },
  drawList: [], //so you can draw a first frame of explosions.. I know this is bad
  drawTime: 8, //how long circles are drawn.  use to push into drawlist.time
  mobDmgColor: "rgba(255,0,0,0.7)", //used top push into drawList.color
  playerDmgColor: "rgba(0,0,0,0.7)", //used top push into drawList.color
  drawCircle: function() {
    //draws a circle for two cycles, used for showing damage mostly
    let i = this.drawList.length;
    while (i--) {
      ctx.beginPath(); //draw circle
      ctx.arc(this.drawList[i].x, this.drawList[i].y, this.drawList[i].radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.drawList[i].color;
      ctx.fill();
      if (this.drawList[i].time) {
        //remove when timer runs out
        this.drawList[i].time--;
      } else {
        this.drawList.splice(i, 1);
      }
    }
  },
  lastLogTime: 0,
  lastLogTimeBig: 0,
  boldActiveGunHUD: function() {
    for (let i = 0, len = b.inventory.length; i < len; ++i) {
      // document.getElementById(b.inventory[i]).style.color = '#ccc'
      document.getElementById(b.inventory[i]).style.opacity = "0.3";
    }
    // document.getElementById(b.activeGun).style.color = '#333'
    document.getElementById(b.activeGun).style.opacity = "1";
  },
  updateGunHUD: function() {
    for (let i = 0, len = b.inventory.length; i < len; ++i) {
      if (b.guns[b.inventory[i]].ammo === Infinity) {
        document.getElementById(b.inventory[i]).innerHTML = b.guns[b.inventory[i]].name;
      } else {
        document.getElementById(b.inventory[i]).innerHTML = b.guns[b.inventory[i]].name + " - " + b.guns[b.inventory[i]].ammo;
      }
    }
  },
  makeGunHUD: function() {
    //remove all nodes
    const myNode = document.getElementById("guns");
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
    //add nodes
    for (let i = 0, len = b.inventory.length; i < len; ++i) {
      const node = document.createElement("div");
      node.setAttribute("id", b.inventory[i]);
      let textnode;
      if (b.guns[b.inventory[i]].ammo === Infinity) {
        textnode = document.createTextNode(b.guns[b.inventory[i]].name);
      } else {
        textnode = document.createTextNode(b.guns[b.inventory[i]].name + " - " + b.guns[b.inventory[i]].ammo);
      }
      node.appendChild(textnode);
      document.getElementById("guns").appendChild(node);
    }
    game.boldActiveGunHUD();
  },
  makeTextLog: function(text, time = 180) {
    document.getElementById("text-log").innerHTML = text;
    document.getElementById("text-log").style.opacity = 1;
    game.lastLogTime = game.cycle + time;
  },
  textLog: function() {
    if (game.lastLogTime && game.lastLogTime < game.cycle) {
      game.lastLogTime = 0;
      // document.getElementById("text-log").innerHTML = " ";
      document.getElementById("text-log").style.opacity = 0;
    }
  },
  // timing: function() {
  //   this.cycle++; //tracks game cycles
  //   //delta is used to adjust forces on game slow down;
  //   this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
  //   this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
  // },
  nextGun: function() {
    b.inventoryGun++;
    if (b.inventoryGun > b.inventory.length - 1) b.inventoryGun = 0;
    game.switchGun();
  },
  previousGun: function() {
    b.inventoryGun--;
    if (b.inventoryGun < 0) b.inventoryGun = b.inventory.length - 1;
    game.switchGun();
  },
  switchGun: function() {
    b.activeGun = b.inventory[b.inventoryGun];
    b.lastActiveGun = b.activeGun;
    game.updateGunHUD();
    game.boldActiveGunHUD();
    mech.drop();
    playSound("click");
  },
  keyPress: function() {
    //runs on key press event
    if (keys[189]) {
      // -
      game.zoomScale /= 0.9;
      game.setZoom();
    } else if (keys[187]) {
      // -
      game.zoomScale *= 0.9;
      game.setZoom();
    }
    if (keys[69]) {
      // e    swap to next active gun
      game.nextGun();
    } else if (keys[81]) {
      //q    swap to previous active gun
      game.previousGun();
    }
    // else if (keys[32]) {
    //   //space to toggle back to field emitter gun
    //   if (b.activeGun === 0) {
    //     b.activeGun = b.lastActiveGun;
    //     game.switchGun();
    //   } else {
    //     b.lastActiveGun = b.activeGun;
    //     b.activeGun = 0;
    //     game.switchGun();
    //   }
    // }

    if (keys[80]) {
      //p  for pause
      if (game.paused) {
        game.paused = false;
        // engine.timing.timeScale = 1;
        requestAnimationFrame(cycle);
      } else {
        // engine.timing.timeScale = 0.001;
        game.paused = true;
        game.makeTextLog("<h1>PAUSED</h1>", 1);

        // ctx.fillText("paused", canvas.width / 2, canvas.height / 2);
      }
    }

    if (keys[84]) {
      // 84 = t
      if (this.testing) {
        this.testing = false;
      } else {
        this.testing = true;
      }
    } else if (this.testing) {
      if (keys[57]) {
        //9
        for (let i = 0; i < 16; ++i) {
          powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
        }
      }
      if (keys[79]) {
        //o
        Matter.Body.setPosition(player, this.mouseInGame);
        Matter.Body.setVelocity(player, {
          x: 0,
          y: 0
        });
      }
    }
  },
  zoom: null,
  zoomScale: 1400,
  setZoom: function() {
    //use in window resize in index.js
    this.zoom = canvas.height / game.zoomScale; //sets starting zoom scale
  },
  camera: function() {
    ctx.translate(canvas.width2, canvas.height2); //center
    ctx.scale(this.zoom, this.zoom); //zoom in once centered
    ctx.translate(-canvas.width2 + mech.transX, -canvas.height2 + mech.transY); //uncenter, translate
    //calculate in game mouse position by undoing the zoom and translations
    this.mouseInGame.x = (this.mouse.x - canvas.width2) / this.zoom + canvas.width2 - mech.transX;
    this.mouseInGame.y = (this.mouse.y - canvas.height2) / this.zoom + canvas.height2 - mech.transY;
  },
  zoomInFactor: 0,
  startZoomIn: function(time = 150) {
    game.zoom = 0;
    let count = 0;

    function zLoop() {
      game.zoom += canvas.height / game.zoomScale / time;
      count++;
      if (count < time) {
        requestAnimationFrame(zLoop);
      } else {
        game.setZoom();
      }
    }
    requestAnimationFrame(zLoop);
  },
  wipe: function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = "#000";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.globalAlpha = (mech.health < 0.7) ? (mech.health+0.3)*(mech.health+0.3) : 1
    // if (mech.health < 0.7) {
    // 	ctx.globalAlpha= 0.3 + mech.health
    // 	ctx.fillStyle = document.body.style.backgroundColor
    // 	ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 	ctx.globalAlpha=1;
    // } else {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
    //ctx.fillStyle = "rgba(255,255,255," + (1 - Math.sqrt(player.speed)*0.1) + ")";
    //ctx.fillStyle = "rgba(255,255,255,0.4)";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
  },
  gravity: function() {
    function addGravity(bodies, magnitude) {
      for (var i = 0; i < bodies.length; i++) {
        bodies[i].force.y += bodies[i].mass * magnitude;
      }
    }
    addGravity(powerUp, game.g);
    addGravity(body, game.g);
    player.force.y += player.mass * mech.gravity;
  },
  reset: function() {
    //removes guns and ammo
    b.inventory = [];
    for (let i = 0, len = b.guns.length; i < len; ++i) {
      if (b.guns[i].ammo != Infinity) {
        b.guns[i].ammo = 0;
        b.guns[i].have = false;
      } else {
        b.inventory.push(i);
      }
    }
    game.paused = false;
    engine.timing.timeScale = 1;
    game.dmgScale = 1;
    b.dmgScale = 0.9;
    b.activeGun = 0;
    game.makeGunHUD();
    mech.drop();
    mech.addHealth(1);
    mech.alive = true;
    game.levelsCleared = 0;
    // level.onLevel = Math.floor(Math.random() * level.levels.length); //picks a random starting level
    game.clearNow = true;
    document.getElementById("text-log").style.opacity = 0;
    document.getElementById("fade-out").style.opacity = 0;
  },
  firstRun: true,
  splashReturn: function() {
    // document.getElementById('splash').onclick = 'run(this)';
    document.getElementById("splash").onclick = function() {
      game.startGame();
    };
    document.getElementById("splash").style.display = "inline";
    document.getElementById("dmg").style.display = "none";
    document.getElementById("health-bg").style.display = "none";
    document.body.style.cursor = "auto";
  },
  startGame: function() {
    document.getElementById("splash").onclick = null; //removes the onclick effect so the function only runs once
    document.getElementById("splash").style.display = "none"; //hides the element that spawned the function
    document.getElementById("dmg").style.display = "inline";
    document.getElementById("health-bg").style.display = "inline";

    window.onmousedown = function(e) {
      game.mouseDown = true;
      // keep this disabled unless building maps
      // if (!game.mouseDown){
      // 	game.getCoords.pos1.x = Math.round(game.mouseInGame.x / 25) * 25;
      // 	game.getCoords.pos1.y = Math.round(game.mouseInGame.y / 25) * 25;
      // }

      // mech.throw();
    };
    document.body.style.cursor = "none";
    if (this.firstRun) mech.spawn(); //spawns the player
    // level.levels = shuffle(level.levels); //shuffles order of maps
    game.reset();
    // if (game.firstRun) Engine.run(engine); //starts game engine
    game.firstRun = false;
    requestAnimationFrame(cycle); //starts game loop
    game.lastLogTime = game.cycle + 360;
  },
  clearNow: false,
  clearMap: function() {
    //if player is holding something this remembers it before it gets deleted
    let holdTarget;
    if (mech.holdingTarget) {
      holdTarget = mech.holdingTarget;
    }
    mech.drop();
    level.fill = [];
    level.fillBG = [];
    level.zones = [];
    level.queryList = [];
    this.drawList = [];
    function removeAll(array) {
      for (let i = 0; i < array.length; ++i) Matter.World.remove(engine.world, array[i]);
    }
    removeAll(map);
    map = [];
    removeAll(body);
    body = [];
    removeAll(mob);
    mob = [];
    removeAll(powerUp);
    powerUp = [];
    removeAll(cons);
    cons = [];
    removeAll(consBB);
    consBB = [];
    removeAll(bullet);
    bullet = [];
    // if player was holding something this makes a new copy to hold
    if (holdTarget) {
      len = body.length;
      body[len] = Matter.Bodies.fromVertices(0, 0, holdTarget.vertices, {
        friction: holdTarget.friction,
        frictionAir: holdTarget.frictionAir,
        frictionStatic: holdTarget.frictionStatic
      });
      mech.holdingTarget = body[len];
    }
  },
  getCoords: {
    //used when building maps, outputs a draw rect command to console, only works in testing mode
    pos1: {
      x: 0,
      y: 0
    },
    pos2: {
      x: 0,
      y: 0
    },
    out: function() {
      if (keys[49]) {
        this.pos1.x = Math.round(game.mouseInGame.x / 25) * 25;
        this.pos1.y = Math.round(game.mouseInGame.y / 25) * 25;
      }
      if (keys[50]) {
        //press 1 in the top left; press 2 in the bottom right;copy command from console
        this.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
        this.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
        window.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(document.getElementById("test"));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        console.log(`spawn.mapRect(${this.pos1.x}, ${this.pos1.y}, ${this.pos2.x - this.pos1.x}, ${this.pos2.y - this.pos1.y}); //`);
      }
    }
  },
  fallChecks: function() {
    if (!(game.cycle % 420)) {
      remove = function(who) {
        let i = who.length;
        while (i--) {
          if (who[i].position.y > game.fallHeight) {
            Matter.World.remove(engine.world, who[i]);
            who.splice(i, 1);
          }
        }
      };
      remove(mob);
      remove(body);
      remove(powerUp);
    }
  },
  testingOutput: function() {
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    let line = 100;
    const x = canvas.width - 5;
    ctx.fillText("Press T to exit testing mode", x, line);
    line += 30;
    ctx.fillText("cycle: " + game.cycle, x, line);
    line += 20;
    ctx.fillText("x: " + player.position.x.toFixed(0), x, line);
    line += 20;
    ctx.fillText("y: " + player.position.y.toFixed(0), x, line);
    line += 20;
    ctx.fillText("Vx: " + mech.Vx.toFixed(2), x, line);
    line += 20;
    ctx.fillText("Vy: " + mech.Vy.toFixed(2), x, line);
    line += 20;
    ctx.fillText("Fx: " + player.force.x.toFixed(3), x, line);
    line += 20;
    ctx.fillText("Fy: " + player.force.y.toFixed(3), x, line);
    line += 20;
    ctx.fillText("yOff: " + mech.yOff.toFixed(1), x, line);
    line += 20;
    ctx.fillText("mass: " + player.mass.toFixed(1), x, line);
    line += 20;
    ctx.fillText("onGround: " + mech.onGround, x, line);
    line += 20;
    ctx.fillText("crouch: " + mech.crouch, x, line);
    line += 20;
    ctx.fillText("isHeadClear: " + mech.isHeadClear, x, line);
    line += 20;
    ctx.fillText("HeadIsSensor: " + headSensor.isSensor, x, line);
    line += 20;
    ctx.fillText("frictionAir: " + player.frictionAir.toFixed(3), x, line);
    line += 20;
    ctx.fillText("stepSize: " + mech.stepSize.toFixed(2), x, line);
    line += 20;
    ctx.fillText("zoom: " + this.zoom.toFixed(4), x, line);
    line += 20;
    ctx.textAlign = "center";
    ctx.fillText(`(${this.mouseInGame.x.toFixed(1)}, ${this.mouseInGame.y.toFixed(1)})`, this.mouse.x, this.mouse.y - 20);
  },
  draw: {
    powerUp: function() {
      // draw power up
      // ctx.globalAlpha = 0.4 * Math.sin(game.cycle * 0.15) + 0.6;
      // for (let i = 0, len = powerUp.length; i < len; ++i) {
      //   let vertices = powerUp[i].vertices;
      //   ctx.beginPath();
      //   ctx.moveTo(vertices[0].x, vertices[0].y);
      //   for (let j = 1; j < vertices.length; j += 1) {
      //     ctx.lineTo(vertices[j].x, vertices[j].y);
      //   }
      //   ctx.lineTo(vertices[0].x, vertices[0].y);
      //   ctx.fillStyle = powerUp[i].color;
      //   ctx.fill();
      // }
      // ctx.globalAlpha = 1;
      ctx.globalAlpha = 0.4 * Math.sin(game.cycle * 0.15) + 0.6;
      for (let i = 0, len = powerUp.length; i < len; ++i) {
        ctx.beginPath();
        ctx.arc(powerUp[i].position.x, powerUp[i].position.y, powerUp[i].size, 0, 2 * Math.PI);
        ctx.fillStyle = powerUp[i].color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    // map: function() {
    //     ctx.beginPath();
    //     for (let i = 0, len = map.length; i < len; ++i) {
    //         let vertices = map[i].vertices;
    //         ctx.moveTo(vertices[0].x, vertices[0].y);
    //         for (let j = 1; j < vertices.length; j += 1) {
    //             ctx.lineTo(vertices[j].x, vertices[j].y);
    //         }
    //         ctx.lineTo(vertices[0].x, vertices[0].y);
    //     }
    //     ctx.fillStyle = "#444";
    //     ctx.fill();
    // },
    mapPath: null, //holds the path for the map to speed up drawing
    setPaths: function() {
      //runs at each new level to store the path for the map since the map doesn't change
      this.mapPath = new Path2D();
      for (let i = 0, len = map.length; i < len; ++i) {
        let vertices = map[i].vertices;
        this.mapPath.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
          this.mapPath.lineTo(vertices[j].x, vertices[j].y);
        }
        this.mapPath.lineTo(vertices[0].x, vertices[0].y);
      }
    },
    mapFill: "#444",
    bodyFill: "#999",
    bodyStroke: "#222",
    drawMapPath: function() {
      ctx.fillStyle = this.mapFill;
      ctx.fill(this.mapPath);
    },

    seeEdges: function() {
      const eye = {
        x: mech.pos.x + 20 * Math.cos(mech.angle),
        y: mech.pos.y + 20 * Math.sin(mech.angle)
      };
      //find all vertex nodes in range and in LOS
      findNodes = function(domain, center) {
        let nodes = [];
        for (let i = 0; i < domain.length; ++i) {
          let vertices = domain[i].vertices;

          for (let j = 0, len = vertices.length; j < len; j++) {
            //calculate distance to player
            const dx = vertices[j].x - center.x;
            const dy = vertices[j].y - center.y;
            if (dx * dx + dy * dy < 800 * 800 && Matter.Query.ray(domain, center, vertices[j]).length === 0) {
              nodes.push(vertices[j]);
            }
          }
        }
        return nodes;
      };
      let nodes = findNodes(map, eye);
      //sort node list by angle to player
      nodes.sort(function(a, b) {
        //sub artan2 from player loc
        const dx = a.x - eye.x;
        const dy = a.y - eye.y;
        return Math.atan2(dy, dx) - Math.atan2(dy, dx);
      });
      console.log(nodes);
      //draw nodes
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      for (let i = 0; i < nodes.length; ++i) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
      }
      ctx.stroke();
    },
    see: function() {
      const vertexCollision = function(
        v1,
        v1End,
        domain,
        best = {
          x: null,
          y: null,
          dist2: Infinity,
          who: null,
          v1: null,
          v2: null
        }
      ) {
        for (let i = 0; i < domain.length; ++i) {
          let vertices = domain[i].vertices;
          const len = vertices.length - 1;
          for (let j = 0; j < len; j++) {
            results = game.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
            if (results.onLine1 && results.onLine2) {
              const dx = v1.x - results.x;
              const dy = v1.y - results.y;
              const dist2 = dx * dx + dy * dy;
              if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                best = {
                  x: results.x,
                  y: results.y,
                  dist2: dist2,
                  who: domain[i],
                  v1: vertices[j],
                  v2: vertices[j + 1]
                };
              }
            }
          }
          results = game.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
          if (results.onLine1 && results.onLine2) {
            const dx = v1.x - results.x;
            const dy = v1.y - results.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
              best = {
                x: results.x,
                y: results.y,
                dist2: dist2,
                who: domain[i],
                v1: vertices[0],
                v2: vertices[len]
              };
            }
          }
        }
        return best;
      };
      const range = 3000;
      ctx.beginPath();
      for (let i = 0; i < Math.PI * 2; i += Math.PI / 2 / 100) {
        const cosAngle = Math.cos(mech.angle + i);
        const sinAngle = Math.sin(mech.angle + i);

        const start = {
          x: mech.pos.x + 20 * cosAngle,
          y: mech.pos.y + 20 * sinAngle
        };
        const end = {
          x: mech.pos.x + range * cosAngle,
          y: mech.pos.y + range * sinAngle
        };
        let result = vertexCollision(start, end, map);
        result = vertexCollision(start, end, body, result);
        result = vertexCollision(start, end, mob, result);

        if (result.dist2 < range * range) {
          // ctx.arc(result.x, result.y, 2, 0, 2 * Math.PI);
          ctx.lineTo(result.x, result.y);
        } else {
          // ctx.arc(end.x, end.y, 2, 0, 2 * Math.PI);
          ctx.lineTo(end.x, end.y);
        }
      }
      // ctx.lineWidth = 1;
      // ctx.strokeStyle = "#000";
      // ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.clip();
    },
    body: function() {
      ctx.beginPath();
      for (let i = 0, len = body.length; i < len; ++i) {
        let vertices = body[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
      }
      ctx.lineWidth = 2;
      ctx.fillStyle = this.bodyFill;
      ctx.fill();
      ctx.strokeStyle = this.bodyStroke;
      ctx.stroke();
    },
    cons: function() {
      ctx.beginPath();
      for (let i = 0, len = cons.length; i < len; ++i) {
        ctx.moveTo(cons[i].pointA.x, cons[i].pointA.y);
        ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
      }
      for (let i = 0, len = consBB.length; i < len; ++i) {
        ctx.moveTo(consBB[i].bodyA.position.x, consBB[i].bodyA.position.y);
        ctx.lineTo(consBB[i].bodyB.position.x, consBB[i].bodyB.position.y);
      }
      ctx.lineWidth = 2;
      // ctx.strokeStyle = "#999";
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.stroke();
    },
    wireFrame: function() {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#999";
      const bodies = Composite.allBodies(engine.world);
      ctx.beginPath();
      for (let i = 0; i < bodies.length; ++i) {
        //ctx.fillText(bodies[i].id,bodies[i].position.x,bodies[i].position.y);  //shows the id of every body
        let vertices = bodies[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    },
    testing: function() {
      //zones
      ctx.beginPath();
      for (let i = 0, len = level.zones.length; i < len; ++i) {
        ctx.rect(level.zones[i].x1, level.zones[i].y1 + 70, level.zones[i].x2 - level.zones[i].x1, level.zones[i].y2 - level.zones[i].y1);
      }
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fill();
      //query zones
      ctx.beginPath();
      for (let i = 0, len = level.queryList.length; i < len; ++i) {
        ctx.rect(
          level.queryList[i].bounds.max.x,
          level.queryList[i].bounds.max.y,
          level.queryList[i].bounds.min.x - level.queryList[i].bounds.max.x,
          level.queryList[i].bounds.min.y - level.queryList[i].bounds.max.y
        );
      }
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      ctx.fill();
      //jump
      ctx.beginPath();
      let bodyDraw = jumpSensor.vertices;
      ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
      for (let j = 1; j < bodyDraw.length; ++j) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
      }
      ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();
      //main body
      ctx.beginPath();
      bodyDraw = playerBody.vertices;
      ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
      for (let j = 1; j < bodyDraw.length; ++j) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
      }
      ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
      ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
      ctx.fill();
      ctx.stroke();
      //head
      ctx.beginPath();
      bodyDraw = playerHead.vertices;
      ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
      for (let j = 1; j < bodyDraw.length; ++j) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
      }
      ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
      ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
      ctx.fill();
      ctx.stroke();
      //head sensor
      ctx.beginPath();
      bodyDraw = headSensor.vertices;
      ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
      for (let j = 1; j < bodyDraw.length; ++j) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
      }
      ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
      ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
      ctx.fill();
      ctx.stroke();
    }
  },
  checkLineIntersection(v1, v1End, v2, v2End) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    let denominator, a, b, numerator1, numerator2;
    let result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false
    };
    denominator = (v2End.y - v2.y) * (v1End.x - v1.x) - (v2End.x - v2.x) * (v1End.y - v1.y);
    if (denominator == 0) {
      return result;
    }
    a = v1.y - v2.y;
    b = v1.x - v2.x;
    numerator1 = (v2End.x - v2.x) * a - (v2End.y - v2.y) * b;
    numerator2 = (v1End.x - v1.x) * a - (v1End.y - v1.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = v1.x + a * (v1End.x - v1.x);
    result.y = v1.y + a * (v1End.y - v1.y);
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) result.onLine1 = true;
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) result.onLine2 = true;
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
  },
  //was used in level design
  buildingUp: function(e) {
    if (game.mouseDown) {
      game.getCoords.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
      game.getCoords.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
      let out;

      //body rect mode
      out = `spawn.mapRect(${game.getCoords.pos1.x}, ${game.getCoords.pos1.y}, ${game.getCoords.pos2.x - game.getCoords.pos1.x}, ${game.getCoords.pos2.y -
        game.getCoords.pos1.y});`;

      //mob spawn
      //out = `spawn.randomMob(${game.getCoords.pos1.x}, ${game.getCoords.pos1.y}, 0.3);`

      //draw foreground
      //out = `level.fill.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "rgba(0,0,0,0.1)"});`;

      //draw background fill
      //out = `level.fillBG.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "#ccc"});`;

      //svg mode
      //out = 'rect x="'+game.getCoords.pos1.x+'" y="'+ game.getCoords.pos1.y+'" width="'+(game.getCoords.pos2.x-game.getCoords.pos1.x)+'" height="'+(game.getCoords.pos2.y-game.getCoords.pos1.y)+'"';

      console.log(out);
      // document.getElementById("copy-this").innerHTML = out
      //
      // window.getSelection().removeAllRanges();
      // var range = document.createRange();
      // range.selectNode(document.getElementById('copy-this'));
      // window.getSelection().addRange(range);
      // document.execCommand('copy')
      // window.getSelection().removeAllRanges();
    }
  }
};
