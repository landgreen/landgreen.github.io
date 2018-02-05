//global player variables for use in matter.js physics
let player, jumpSensor, playerBody, playerHead, headSensor;

// player Object Prototype *********************************************
const mech = {
  spawn: function() {
    //load player in matter.js physic engine
    //let vector = Vertices.fromPath('0 40  0 115  20 130  30 130  50 115  50 40');//player as a series of vertices
    let vector = Vertices.fromPath("0 40  50 40 50 115 0 115 30 130 20 130"); //player as a series of vertices
    playerBody = Matter.Bodies.fromVertices(0, 0, vector);
    jumpSensor = Bodies.rectangle(0, 46, 36, 6, {
      //this sensor check if the player is on the ground to enable jumping
      sleepThreshold: 99999999999,
      isSensor: true
    });
    vector = Vertices.fromPath("2 -66 18 -82  2 -37 43 -37 43 -66 32 -82");
    // vector = Vertices.fromPath("0 -66 18 -82  0 -37 50 -37 50 -66 32 -82");
    playerHead = Matter.Bodies.fromVertices(0, -55, vector); //this part of the player lowers on crouch
    headSensor = Bodies.rectangle(0, -57, 48, 45, {
      //senses if the player's head is empty and can return after crouching
      sleepThreshold: 99999999999,
      isSensor: true
    });
    player = Body.create({
      //combine jumpSensor and playerBody
      parts: [playerBody, playerHead, jumpSensor, headSensor],
      inertia: Infinity, //prevents player rotation
      friction: 0.002,
      //frictionStatic: 0.5,
      restitution: 0.1,
      sleepThreshold: Infinity,
      collisionFilter: {
        group: 0,
        category: 0x001000,
        mask: 0x010011
      },
      death: function() {
        mech.death();
      }
    });
    Matter.Body.setMass(player, mech.mass);
    World.add(engine.world, [player]);

    mech.holdConstraint = Constraint.create({
      //holding body constraint
      pointA: {
        x: 0,
        y: 0
      },
      bodyB: jumpSensor, //setting constraint to jump sensor because it has to be on something until the player picks up things
      stiffness: 0.4
    });
    World.add(engine.world, mech.holdConstraint);
  },
  width: 50,
  radius: 30,
  fillColor: "#fff",
  fillColorDark: "#ccc",
  fireCDcycle: 0,
  height: 42,
  yOffWhen: {
    crouch: 22,
    stand: 49,
    jump: 70
  },
  yOff: 70,
  yOffGoal: 70,
  onGround: false, //checks if on ground or in air
  standingOn: undefined,
  numTouching: 0,
  crouch: false,
  isHeadClear: true,
  spawnPos: {
    x: 0,
    y: 0
  },
  spawnVel: {
    x: 0,
    y: 0
  },
  pos: {
    x: 0,
    y: 0
  },
  setPosToSpawn: function(xPos, yPos) {
    this.spawnPos.x = this.pos.x = xPos;
    this.spawnPos.y = this.pos.y = yPos;
    this.transX = this.transSmoothX = canvas.width2 - this.pos.x;
    this.transY = this.transSmoothY = canvas.height2 - this.pos.y;
    this.Vx = this.spawnVel.x;
    this.Vy = this.spawnVel.y;
    player.force.x = 0;
    player.force.y = 0;
    Matter.Body.setPosition(player, this.spawnPos);
    Matter.Body.setVelocity(player, this.spawnVel);
  },
  Sy: 0, //adds a smoothing effect to vertical only
  Vx: 0,
  Vy: 0,
  VxMax: 10,
  mass: 5,
  Fx: 0.025, //run Force on ground
  FxAir: 0.015, //run Force in Air
  jumpForce: 0.38,
  gravity: 0.0019,
  friction: {
    ground: 0.01,
    crouch: 0.2,
    air: 0.0025
  },
  angle: 0,
  walk_cycle: 0,
  stepSize: 0,
  flipLegs: -1,
  hip: {
    x: 12,
    y: 24
  },
  knee: {
    x: 0,
    y: 0,
    x2: 0,
    y2: 0
  },
  foot: {
    x: 0,
    y: 0
  },
  legLength1: 55,
  legLength2: 45,
  transX: 0,
  transY: 0,
  move: function() {
    this.pos.x = player.position.x;
    this.pos.y = playerBody.position.y - this.yOff;
    this.Vx = player.velocity.x;
    this.Vy = player.velocity.y;
  },
  transSmoothX: 0,
  transSmoothY: 0,
  lastGroundedPositionY: 0,
  // mouseZoom: 0,
  look: function() {
    //always on mouse look
    this.angle = Math.atan2(game.mouseInGame.y - this.pos.y, game.mouseInGame.x - this.pos.x);
    //smoothed translations
    const scale = 1.4;
    this.transSmoothX = canvas.width2 - this.pos.x - (game.mouse.x - canvas.width2) * scale;
    this.transSmoothY = canvas.height2 - this.pos.y - (game.mouse.y - canvas.height2) * scale;

    // only track vertical camera if player is on ground   //or going past 50% of screen?
    // if (this.onGround) {
    //   this.lastGroundedPositionY += (this.pos.y - this.lastGroundedPositionY) * 0.05;
    //   this.transSmoothX = canvas.width2 - this.pos.x - (game.mouse.x - canvas.width2) * scale;
    //   this.transSmoothY = canvas.height2 - this.lastGroundedPositionY - (game.mouse.y - canvas.height2) * scale;
    // } else {
    //   this.transSmoothX = canvas.width2 - this.pos.x - (game.mouse.x - canvas.width2) * scale;
    //   this.transSmoothY = canvas.height2 - this.lastGroundedPositionY - (game.mouse.y - canvas.height2) * scale;
    // }

    // this.transX = this.transX * 0.93 + this.transSmoothX * 0.07;
    // this.transY = this.transY * 0.93 + this.transSmoothY * 0.07;
    this.transX += (this.transSmoothX - this.transX) * 0.07;
    this.transY += (this.transSmoothY - this.transY) * 0.07;
    //zoom in/out based on mouse distance from player
    //very cool, but too distracting and makes aiming even harder
    // this.mouseZoom = this.mouseZoom*0.97 + (Math.sqrt(mX*mX+mY*mY)*0.5)*0.03
    // game.zoom = canvas.height / (game.zoomScale + this.mouseZoom )
  },
  doCrouch: function() {
    if (!this.crouch) {
      this.crouch = true;
      this.yOffGoal = this.yOffWhen.crouch;
      Matter.Body.translate(playerHead, {
        x: 0,
        y: 40
      });
    }
  },
  undoCrouch: function() {
    this.crouch = false;
    this.yOffGoal = this.yOffWhen.stand;
    Matter.Body.translate(playerHead, {
      x: 0,
      y: -40
    });
  },
  enterAir: function() {
    this.onGround = false;
    player.frictionAir = this.friction.air;
    if (this.isHeadClear) {
      if (this.crouch) {
        this.undoCrouch();
      }
      this.yOffGoal = this.yOffWhen.jump;
    }
  },
  enterLand: function() {
    this.onGround = true;
    if (this.crouch) {
      if (this.isHeadClear) {
        this.undoCrouch();
        player.frictionAir = this.friction.ground;
      } else {
        this.yOffGoal = this.yOffWhen.crouch;
        player.frictionAir = this.friction.crouch;
      }
    } else {
      this.yOffGoal = this.yOffWhen.stand;
      player.frictionAir = this.friction.ground;
    }
  },
  buttonCD_jump: 0, //cooldown for player buttons
  keyMove: function() {
    if (this.onGround) {
      //on ground **********************
      if (this.crouch) {
        //crouch
        if (!keys[83] && this.isHeadClear) {
          //not pressing crouch anymore
          this.undoCrouch();
          player.frictionAir = this.friction.ground;
        }
      } else if (keys[83]) {
        //on ground && not crouched and pressing s or down
        this.doCrouch();
        player.frictionAir = this.friction.crouch;
      } else if ((keys[87] || keys[32]) && this.buttonCD_jump + 20 < game.cycle) {
        this.buttonCD_jump = game.cycle; //can't jump again until 20 cycles pass

        player.force.y = -this.jumpForce; //jump force
        //apply a fraction of the jump force to the thing the player is jumping off of
        Matter.Body.applyForce(mech.standingOn, mech.pos, {
          x: 0,
          y: this.jumpForce * 0.2 * Math.min(mech.standingOn.mass, 1)
        });

        //zero player y-velocity for consistent jumps
        Matter.Body.setVelocity(player, {
          x: player.velocity.x,
          y: 0
        });
      }
      //horizontal move on ground
      const stoppingFriction = 0.9;
      if (keys[65]) {
        //left / a
        player.force.x -= this.Fx * (1 - Math.sqrt(Math.abs(player.velocity.x) / this.VxMax));
        // if (player.velocity.x > -this.VxMax) {
        // 		player.force.x -= this.Fx
        // }
        if (player.velocity.x > 0) {
          Matter.Body.setVelocity(player, {
            x: player.velocity.x * stoppingFriction,
            y: player.velocity.y * stoppingFriction
          });
        }
      } else if (keys[68]) {
        //right / d
        player.force.x += this.Fx * (1 - Math.sqrt(Math.abs(player.velocity.x) / this.VxMax));
        // if (player.velocity.x < this.VxMax) {
        // 		player.force.x += this.Fx;
        // }
        if (player.velocity.x < 0) {
          Matter.Body.setVelocity(player, {
            x: player.velocity.x * stoppingFriction,
            y: player.velocity.y * stoppingFriction
          });
        }
      } else {
        //come to a stop
        Matter.Body.setVelocity(player, {
          x: player.velocity.x * stoppingFriction,
          y: player.velocity.y * stoppingFriction
        });
      }
    } else {
      // in air **********************************
      //check for short jumps
      if (
        this.buttonCD_jump + 60 > game.cycle && //just pressed jump
        !(keys[87] || keys[32]) && //but not pressing jump key
        this.Vy < 0 //moving up
      ) {
        Matter.Body.setVelocity(player, {
          //reduce player y-velocity every cycle
          x: player.velocity.x,
          y: player.velocity.y * 0.94
        });
      }
      if (keys[65]) {
        // move player   left / a
        if (player.velocity.x > -6) {
          player.force.x += -this.FxAir;
        }
      } else if (keys[68]) {
        //move player  right / d
        if (player.velocity.x < 6) {
          player.force.x += this.FxAir;
        }
      }
    }
    //smoothly move leg height towards height goal
    this.yOff = this.yOff * 0.85 + this.yOffGoal * 0.15;
  },
  alive: true,
  death: function() {
    if (this.alive) {
      this.alive = false;
      game.paused = true;
      this.health = 0;
      this.displayHealth();
      document.getElementById("text-log").style.opacity = 0; //fade out any active text logs
      document.getElementById("fade-out").style.opacity = 1; //slowly fades out
      setTimeout(function() {
        game.splashReturn();
      }, 5000);

      // setTimeout(
      //     function() {
      //         document.getElementById("fade-out").style.opacity = 0;
      //         engine.timing.timeScale = 1;
      //         game.reset();
      //         game.paused = false;
      //         requestAnimationFrame(cycle);
      //     },
      //     5000
      // ); //the time here needs to match the css transition time  3s = 3000
    }
  },
  health: 0,
  regen: function() {
    if (this.health < 1 && game.cycle % 15 === 0) {
      this.addHealth(0.01);
    }
  },
  drawHealth: function() {
    if (this.health < 1) {
      ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
      ctx.fillRect(this.pos.x - this.radius, this.pos.y - 50, 60, 10);
      ctx.fillStyle = "#f00";
      ctx.fillRect(this.pos.x - this.radius, this.pos.y - 50, 60 * this.health, 10);
    }
  },
  displayHealth: function() {
    id = document.getElementById("health");
    id.style.width = Math.floor(300 * this.health) + "px";
    //css animation blink if health is low
    if (this.health < 0.3) {
      id.classList.add("low-health");
    } else {
      id.classList.remove("low-health");
    }
  },
  addHealth: function(heal) {
    this.health += heal;
    if (this.health > 1) this.health = 1;
    // document.getElementById("health").setAttribute("width", 225 * this.health);
    this.displayHealth();
  },
  damage: function(dmg) {
    this.health -= dmg;
    if (this.health < 0) {
      this.health = 0;
      this.death();
      return;
    }
    this.displayHealth();
    document.getElementById("dmg").style.transition = "opacity 0s";
    document.getElementById("dmg").style.opacity = 0.1 + dmg * 5;
    setTimeout(function() {
      document.getElementById("dmg").style.transition = "opacity 1s";
      document.getElementById("dmg").style.opacity = "0";
    }, 1);
    // document.getElementById("health").setAttribute("width", 225 * this.health);
  },
  deathCheck: function() {
    if (this.pos.y > game.fallHeight) {
      // if player is 4000px deep
      this.death();
    }
  },
  damageImmune: 0,
  hitMob: function(i, dmg) {
    //prevents damage happening too quick
  },
  buttonCD: 0, //cooldown for player buttons
  usePowerUp: function(i) {
    powerUp[i].effect();
    Matter.World.remove(engine.world, powerUp[i]);
    powerUp.splice(i, 1);
  },
  closest: {
    dist: 1000,
    index: 0
  },
  lookingAt: function(who, threshold) {
    //calculate a vector from body to player and make it length 1
    const diff = Matter.Vector.normalise(Matter.Vector.sub(who.position, player.position));
    //make a vector for the player's direction of length 1
    const dir = {
      x: Math.cos(mech.angle),
      y: Math.sin(mech.angle)
    };
    //the dot product of diff and dir will return how much over lap between the vectors
    if (Matter.Vector.dot(dir, diff) > threshold) {
      return true;
    }
    return false;
  },
  isHolding: false,
  grabRange: 175,
  holding: null,
  drop: function() {
    if (this.isHolding) {
      this.isHolding = false;
      Matter.Body.setMass(player, 5);
      this.holdingTarget.collisionFilter.category = 0x000001;
      this.holdingTarget.collisionFilter.mask = 0x111111;
      this.holdingTarget = null;
      this.throwCharge = 0;
    }
  },
  drawHold: function(target) {
    const eye = 15;
    const len = target.vertices.length - 1;
    ctx.fillStyle = "rgba(110,170,200," + (0.2 + 0.4 * Math.random()) + ")";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
    ctx.lineTo(target.vertices[len].x, target.vertices[len].y);
    ctx.lineTo(target.vertices[0].x, target.vertices[0].y);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < len; i++) {
      ctx.beginPath();
      ctx.moveTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
      ctx.lineTo(target.vertices[i].x, target.vertices[i].y);
      ctx.lineTo(target.vertices[i + 1].x, target.vertices[i + 1].y);
      ctx.fill();
      ctx.stroke();
    }
  },
  fieldArc: 0.2,
  fieldThreshold: 0.87,
  throwCharge: 0,
  throwChargeMax: 50,
  hold: function() {
    if (b.activeGun === 0) {
      if (this.isHolding) {
        //hold blocks
        this.drawHold(this.holdingTarget);
        Matter.Body.setPosition(this.holdingTarget, {
          x: mech.pos.x + 70 * Math.cos(this.angle),
          y: mech.pos.y + 70 * Math.sin(this.angle)
        });
        Matter.Body.setVelocity(this.holdingTarget, player.velocity);
        Matter.Body.rotate(this.holdingTarget, 0.01 / this.holdingTarget.mass); //gently spin the block
        if (game.mouseDown) {
          this.throwCharge++;
          //draw charge
          const x = mech.pos.x + 15 * Math.cos(this.angle);
          const y = mech.pos.y + 15 * Math.sin(this.angle);
          const len = this.holdingTarget.vertices.length - 1;
          const edge = this.throwCharge * this.throwCharge * 0.02;
          const grd = ctx.createRadialGradient(x, y, edge, x, y, edge + 5);
          grd.addColorStop(0, "rgba(255,50,150,0.3)");
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(this.holdingTarget.vertices[len].x, this.holdingTarget.vertices[len].y);
          ctx.lineTo(this.holdingTarget.vertices[0].x, this.holdingTarget.vertices[0].y);
          ctx.fill();
          for (let i = 0; i < len; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.holdingTarget.vertices[i].x, this.holdingTarget.vertices[i].y);
            ctx.lineTo(this.holdingTarget.vertices[i + 1].x, this.holdingTarget.vertices[i + 1].y);
            ctx.fill();
          }
        } else if (this.throwCharge > 0) {
          this.fireCDcycle = game.cycle + 15;
          this.isHolding = false;
          //bullet-like collisions
          this.holdingTarget.collisionFilter.category = 0x000100;
          this.holdingTarget.collisionFilter.mask = 0x111111;
          //check every second to see if player is away from thrown body, and make solid
          const solid = function(that) {
            const dx = that.position.x - player.position.x;
            const dy = that.position.y - player.position.y;
            if (dx * dx + dy * dy > 3000 && that.speed < 3) {
              that.collisionFilter.category = 0x000001; //make solid
            } else {
              setTimeout(solid, 250, that);
            }
          };
          setTimeout(solid, 1000, this.holdingTarget);
          //throw speed scales a bit with mass
          const speed = Math.min(54 / this.holdingTarget.mass + 5, 48) * Math.min(this.throwCharge, this.throwChargeMax) / this.throwChargeMax;
          this.throwCharge = 0;
          Matter.Body.setVelocity(this.holdingTarget, {
            x: player.velocity.x * 0.5 + Math.cos(this.angle) * speed,
            y: player.velocity.y * 0.5 + Math.sin(this.angle) * speed
          });
          //player recoil //stronger in x-dir to prevent jump hacking
          Matter.Body.setVelocity(player, {
            x: player.velocity.x - Math.cos(this.angle) * 2,
            y: player.velocity.y - Math.sin(this.angle) * 0.4
          });
          //return to normal player mass
          Matter.Body.setMass(player, 5);
        }
      } else if (game.mouseDown && this.fireCDcycle < game.cycle) {
        //pick up blocks with field

        //draw field
        const range = this.grabRange - 20;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, range, this.angle - Math.PI * this.fieldArc, this.angle + Math.PI * this.fieldArc, false);
        let eye = 13;
        ctx.lineTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
        if (this.holdingTarget) {
          ctx.fillStyle = "rgba(110,170,200," + (0.05 + 0.1 * Math.random()) + ")";
        } else {
          ctx.fillStyle = "rgba(110,170,200," + (0.15 + 0.15 * Math.random()) + ")";
        }

        ctx.fill();
        //draw random lines in field for cool effect
        let offAngle = this.angle + 2 * Math.PI * this.fieldArc * (Math.random() - 0.5);
        ctx.beginPath();
        eye = 15;
        ctx.moveTo(mech.pos.x + eye * Math.cos(this.angle), mech.pos.y + eye * Math.sin(this.angle));
        ctx.lineTo(this.pos.x + range * Math.cos(offAngle), this.pos.y + range * Math.sin(offAngle));
        ctx.strokeStyle = "rgba(120,170,255,0.4)";
        ctx.stroke();

        // push all mobs in range
        for (let i = 0, len = mob.length; i < len; ++i) {
          if (
            this.lookingAt(mob[i], this.fieldThreshold) &&
            Matter.Vector.magnitude(Matter.Vector.sub(mob[i].position, this.pos)) < this.grabRange &&
            Matter.Query.ray(map, mob[i].position, this.pos).length === 0
          ) {
            this.fireCDcycle = game.cycle + 30; //cool down
            // const dmg = b.dmgScale * 0.1;
            // mob[i].damage(dmg);
            mob[i].locatePlayer();
            this.drawHold(mob[i]);
            //mob and player knock back
            const angle = Math.atan2(player.position.y - mob[i].position.y, player.position.x - mob[i].position.x);
            Matter.Body.setVelocity(mob[i], {
              x: player.velocity.x - 15 * Math.cos(angle) / Math.sqrt(mob[i].mass),
              y: player.velocity.y - 15 * Math.sin(angle) / Math.sqrt(mob[i].mass)
            });
            Matter.Body.setVelocity(player, {
              x: player.velocity.x + 5 * Math.cos(angle) * Math.sqrt(mob[i].mass),
              y: player.velocity.y + 5 * Math.sin(angle) * Math.sqrt(mob[i].mass)
            });
          }
        }

        //find body to pickup
        const grabbing = {
          targetIndex: null,
          targetRange: this.grabRange,
          lookingAt: false
        };
        for (let i = 0, len = body.length; i < len; ++i) {
          if (Matter.Query.ray(map, body[i].position, this.pos).length === 0) {
            //is this next body a better target then my current best
            const dist = Matter.Vector.magnitude(Matter.Vector.sub(body[i].position, this.pos));
            const looking = this.lookingAt(body[i], this.fieldThreshold);
            if (dist < grabbing.targetRange && (looking || !grabbing.lookingAt)) {
              grabbing.targetRange = dist;
              grabbing.targetIndex = i;
              grabbing.lookingAt = looking;
            }
          }
        }

        // set pick up target for when mouse is released
        if (body[grabbing.targetIndex]) {
          this.holdingTarget = body[grabbing.targetIndex];
          //
          ctx.beginPath(); //draw on each valid body
          let vertices = this.holdingTarget.vertices;
          ctx.moveTo(vertices[0].x, vertices[0].y);
          for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
          }
          ctx.lineTo(vertices[0].x, vertices[0].y);
          ctx.fillStyle = "rgba(190,215,230," + (0.3 + 0.7 * Math.random()) + ")";
          ctx.fill();

          ctx.globalAlpha = 0.2;
          this.drawHold(this.holdingTarget);
          ctx.globalAlpha = 1;
        } else {
          this.holdingTarget = null;
        }
      } else if (!game.mouseDown && this.holdingTarget && this.fireCDcycle < game.cycle) {
        this.isHolding = true;
        if (this.holdingTarget) {
          this.holdingTarget.collisionFilter.category = 0x000001;
          this.holdingTarget.collisionFilter.mask = 0x111111;
        }
        //combine momentum
        const px = player.velocity.x * player.mass + this.holdingTarget.velocity.x * this.holdingTarget.mass;
        const py = player.velocity.y * player.mass - this.holdingTarget.velocity.y * this.holdingTarget.mass;
        Matter.Body.setVelocity(player, {
          x: px / (player.mass + this.holdingTarget.mass),
          y: py / (player.mass + this.holdingTarget.mass)
        });
        Matter.Body.setMass(player, 5 + this.holdingTarget.mass / 2);
        //collide with nothing
        this.holdingTarget.collisionFilter.category = 0x000000;
        this.holdingTarget.collisionFilter.mask = 0x000000;
      } else {
        this.holdingTarget = null;
      }
    }
  },
  drawLeg: function(stroke) {
    if (game.mouseInGame.x > this.pos.x) {
      this.flipLegs = 1;
    } else {
      this.flipLegs = -1;
    }
    ctx.save();
    ctx.scale(this.flipLegs, 1); //leg lines
    ctx.beginPath();
    ctx.moveTo(this.hip.x, this.hip.y);
    ctx.lineTo(this.knee.x, this.knee.y);
    ctx.lineTo(this.foot.x, this.foot.y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 7;
    ctx.stroke();

    //toe lines
    ctx.beginPath();
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x - 15, this.foot.y + 5);
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x + 15, this.foot.y + 5);
    ctx.lineWidth = 4;
    ctx.stroke();

    //hip joint
    ctx.beginPath();
    ctx.arc(this.hip.x, this.hip.y, 11, 0, 2 * Math.PI);
    //knee joint
    ctx.moveTo(this.knee.x + 7, this.knee.y);
    ctx.arc(this.knee.x, this.knee.y, 7, 0, 2 * Math.PI);
    //foot joint
    ctx.moveTo(this.foot.x + 6, this.foot.y);
    ctx.arc(this.foot.x, this.foot.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
  calcLeg: function(cycle_offset, offset) {
    this.hip.x = 12 + offset;
    this.hip.y = 24 + offset;
    //stepSize goes to zero if Vx is zero or not on ground (make this transition cleaner)
    this.stepSize = 0.8 * this.stepSize + 0.2 * (7 * Math.sqrt(Math.abs(this.Vx)) * this.onGround);
    //changes to stepsize are smoothed by adding only a percent of the new value each cycle
    const stepAngle = 0.034 * this.walk_cycle + cycle_offset;
    this.foot.x = 2.2 * this.stepSize * Math.cos(stepAngle) + offset;
    this.foot.y = offset + 1.2 * this.stepSize * Math.sin(stepAngle) + this.yOff + this.height;
    const Ymax = this.yOff + this.height;
    if (this.foot.y > Ymax) this.foot.y = Ymax;

    //calculate knee position as intersection of circle from hip and foot
    const d = Math.sqrt((this.hip.x - this.foot.x) * (this.hip.x - this.foot.x) + (this.hip.y - this.foot.y) * (this.hip.y - this.foot.y));
    const l = (this.legLength1 * this.legLength1 - this.legLength2 * this.legLength2 + d * d) / (2 * d);
    const h = Math.sqrt(this.legLength1 * this.legLength1 - l * l);
    this.knee.x = l / d * (this.foot.x - this.hip.x) - h / d * (this.foot.y - this.hip.y) + this.hip.x + offset;
    this.knee.y = l / d * (this.foot.y - this.hip.y) + h / d * (this.foot.x - this.hip.x) + this.hip.y;
  },
  draw: function() {
    ctx.fillStyle = this.fillColor;
    this.walk_cycle += this.flipLegs * this.Vx;

    //draw body
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    this.calcLeg(Math.PI, -3);
    this.drawLeg("#4a4a4a");
    this.calcLeg(0, 0);
    this.drawLeg("#333");
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    let grd = ctx.createLinearGradient(-30, 0, 30, 0);
    grd.addColorStop(0, this.fillColorDark);
    grd.addColorStop(1, this.fillColor);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.arc(15, 0, 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(15, 0, 3, 0, 2 * Math.PI);
    // ctx.fillStyle = '#9cf' //'#0cf';
    // ctx.fill()
    ctx.restore();
  }
};
