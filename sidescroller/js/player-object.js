// player Object Prototype *********************************************

const mechProto = function() {
    this.width = 50;
    this.radius = 30;
    this.stroke = "#333";
    this.fill = "#eee";
    this.canFire = true;
    this.height = 42;
    this.yOffWhen = {
        crouch: 22,
        stand: 49,
        jump: 70
    }
    this.yOff = 70;
    this.yOffGoal = 70;
    this.onGround = false; //checks if on ground or in air
    this.onBody = {
        id: 0,
        index: 0,
        type: "map",
        action: ''
    };
    this.numTouching = 0;
    this.crouch = false;
    this.isHeadClear = true;
    this.spawnPos = {
        x: 0,
        y: 0
    };
    this.spawnVel = {
        x: 0,
        y: 0
    };
    this.x = this.spawnPos.x;
    this.y = this.spawnPos.y;
    this.setPosToSpawn = function() {
        this.x = this.spawnPos.x;
        this.y = this.spawnPos.y;
        this.Vx = this.spawnVel.x;
        this.Vy = this.spawnVel.y;
        Matter.Body.setPosition(player, this.spawnPos);
        Matter.Body.setVelocity(player, this.spawnVel);
    }
    this.Sy = this.y; //adds a smoothing effect to vertical only
    this.Vx = 0;
    this.Vy = 0;
    this.VxMax = 7;
    this.mass = 5;
    this.Fx = 0.004 * this.mass; //run Force on ground
    this.FxAir = 0.0006 * this.mass; //run Force in Air
    this.Fy = -0.04 * this.mass; //jump Force
    this.angle = 0;
    this.walk_cycle = 0;
    this.stepSize = 0;
    this.flipLegs = -1;
    this.hip = {
        x: 12,
        y: 24,
    };
    this.knee = {
        x: 0,
        y: 0,
        x2: 0,
        y2: 0
    };
    this.foot = {
        x: 0,
        y: 0
    };
    this.legLength1 = 55;
    this.legLength2 = 45;
    this.canvasX = canvas.width / 2;
    this.canvasY = canvas.height / 2;
    this.transX = this.canvasX - this.x;
    this.transY = this.canvasX - this.x;
    this.mouse = {
        x: canvas.width / 3,
        y: canvas.height
    };
    this.getMousePos = function(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    };
    this.testingMoveLook = function() {
        //move
        this.x = player.position.x;
        this.y = playerBody.position.y - this.yOff;
        this.Vx = player.velocity.x;
        this.Vy = player.velocity.y;
        //look
        this.canvasX = canvas.width / 2
        this.canvasY = canvas.height / 2
        this.transX = this.canvasX - this.x;
        this.transY = this.canvasY - this.y;
        this.angle = Math.atan2(this.mouse.y - this.canvasY, this.mouse.x - this.canvasX);
    }

    this.move = function() {
        this.x = player.position.x;
        //looking at player body, to ignore the other parts of the player composite
        this.y = playerBody.position.y - this.yOff;
        this.Vx = player.velocity.x;
        this.Vy = player.velocity.y;
    };
    this.look = function() {
        //set a max on mouse look
        let mX = this.mouse.x;
        if (mX > canvas.width * 0.8) {
            mX = canvas.width * 0.8;
        } else if (mX < canvas.width * 0.2) {
            mX = canvas.width * 0.2;
        }
        let mY = this.mouse.y;
        if (mY > canvas.height * 0.8) {
            mY = canvas.height * 0.8;
        } else if (mY < canvas.height * 0.2) {
            mY = canvas.height * 0.2;
        }
        //set mouse look
        this.canvasX = this.canvasX * 0.94 + (canvas.width - mX) * 0.06;
        this.canvasY = this.canvasY * 0.94 + (canvas.height - mY) * 0.06;
        //set translate values
        this.transX = this.canvasX - this.x;
        this.Sy = 0.99 * this.Sy + 0.01 * (this.y);
        //hard caps how behind y position tracking can get.
        if (this.Sy - this.y > canvas.height / 2) {
            this.Sy = this.y + canvas.height / 2
        } else if (this.Sy - this.y < -canvas.height / 2) {
            this.Sy = this.y - canvas.height / 2
        }
        this.transY = this.canvasY - this.Sy;
        //make player head angled towards mouse
        this.angle = Math.atan2(this.mouse.y - this.canvasY, this.mouse.x - this.canvasX);
    };
    this.doCrouch = function() {
        if (!this.crouch) {
            this.crouch = true;
            this.yOffGoal = this.yOffWhen.crouch;
            Matter.Body.translate(playerHead, {
                x: 0,
                y: 40
            })
        }
    }
    this.undoCrouch = function() {
        this.crouch = false;
        this.yOffGoal = this.yOffWhen.stand;
        Matter.Body.translate(playerHead, {
            x: 0,
            y: -40
        })
    }
    this.enterAir = function() {
        this.onGround = false;
        player.frictionAir = 0.001;
        if (this.isHeadClear) {
            if (this.crouch) {
                this.undoCrouch();
            }
            this.yOffGoal = this.yOffWhen.jump;
        };
    }
    this.enterLand = function() {
        this.onGround = true;
        if (this.crouch) {
            if (this.isHeadClear) {
                this.undoCrouch();
                player.frictionAir = 0.12;
            } else {
                this.yOffGoal = this.yOffWhen.crouch;
                player.frictionAir = 0.5;
            }
        } else {
            this.yOffGoal = this.yOffWhen.stand;
            player.frictionAir = 0.12;
        }
    };
    this.buttonCD_jump = 0; //cooldown for player buttons
    this.keyMove = function() {
        if (this.onGround) { //on ground **********************
            if (this.crouch) { //crouch
                if (!(keys[40] || keys[83]) && this.isHeadClear) { //not pressing crouch anymore
                    this.undoCrouch();
                    player.frictionAir = 0.12;
                }
            } else if (keys[40] || keys[83]) { //on ground && not crouched and pressing s or down
                this.doCrouch();
                player.frictionAir = 0.5;
            } else if ((keys[32] || keys[38] || keys[87]) && this.buttonCD_jump + 20 < game.cycle) { //jump
                this.buttonCD_jump = game.cycle; //can't jump until 20 cycles pass
                Matter.Body.setVelocity(player, { //zero player velocity for consistant jumps
                    x: player.velocity.x,
                    y: 0
                });
                player.force.y = this.Fy / game.delta; //jump force / delta so that force is the same on game slowdowns
            }
            //horizontal move on ground
            if (keys[37] || keys[65]) { //left or a
                if (player.velocity.x > -this.VxMax) {
                    player.force.x += -this.Fx / game.delta;
                }
            } else if (keys[39] || keys[68]) { //right or d
                if (player.velocity.x < this.VxMax) {
                    player.force.x += this.Fx / game.delta;
                }
            }

        } else { // in air **********************************
            //check for short jumps
            if (this.buttonCD_jump + 60 > game.cycle && //just pressed jump
                !(keys[32] || keys[38] || keys[87]) && //but not pressing jump key
                this.Vy < 0) { // and velocity is up
                Matter.Body.setVelocity(player, { //reduce player velocity every cycle until not true
                    x: player.velocity.x,
                    y: player.velocity.y * 0.94
                });
            }
            if (keys[37] || keys[65]) { // move player   left / a
                if (player.velocity.x > -this.VxMax + 2) {
                    player.force.x += -this.FxAir / game.delta;
                }
            } else if (keys[39] || keys[68]) { //move player  right / d
                if (player.velocity.x < this.VxMax - 2) {
                    player.force.x += this.FxAir / game.delta;
                }
            }
        }
        //smoothly move height towards height goal ************
        this.yOff = this.yOff * 0.85 + this.yOffGoal * 0.15
    };
    this.death = function() {
        Matter.Body.setPosition(player, this.spawnPos);
        Matter.Body.setVelocity(player, this.spawnVel);
        this.dropBody();
        game.zoom = 0;
        this.health = 1;
        //this.testingMoveLook();  //updates mech position
        //this.Sy = mech.y  //moves camera to new position quickly
    }
    this.health = 1;
    this.regen = function() {
        if (this.health < 1 && game.cycle % 15 === 0) {
            this.health += 0.01;
        }
    };
    this.drawHealth = function() {
        if (this.health < 1) {
            ctx.fillStyle = "#aaa";
            ctx.fillRect(this.x - this.radius, this.y - 50, 60, 10);
            ctx.fillStyle = "#f00";
            ctx.fillRect(this.x - this.radius, this.y - 50, 60 * this.health, 10);
        }
    };
    this.damage = function(dmg) {
        this.health -= dmg;
        if (this.health <= 0) {
            this.death();
        }
    }
    this.deathCheck = function() {
        if (this.y > game.fallHeight) { // if player is 4000px deep reset to spawn Position and Velocity
            this.death();
        }
    };
    this.hitMob = function(i) {
        this.damage(0.1);
        //extra kick between player and mob
        //this section would be better with forces but they don't work...
        let angle = Math.atan2(player.position.y - mob[i].position.y, player.position.x - mob[i].position.x);
        Matter.Body.setVelocity(player, {
          x: player.velocity.x + 10 * Math.cos(angle),
          y: player.velocity.y + 10 * Math.sin(angle)
        });
        Matter.Body.setVelocity(mob[i], {
          x: mob[i].velocity.x - 10 * Math.cos(angle),
          y: mob[i].velocity.y - 10 * Math.sin(angle)
        });
    }
    this.holdKeyDown = 0;
    this.buttonCD = 0; //cooldown for player buttons
    this.keyHold = function() { //checks for holding/dropping/picking up bodies
        if (this.isHolding) {
            //give the constaint more length and less stiffness if it is pulled out of position
            const Dx = body[this.holdingBody].position.x - holdConstraint.pointA.x;
            const Dy = body[this.holdingBody].position.y - holdConstraint.pointA.y;
            holdConstraint.length = Math.sqrt(Dx * Dx + Dy * Dy) * 0.95;
            holdConstraint.stiffness = -0.01 * holdConstraint.length + 1;
            if (holdConstraint.length > 90) this.dropBody(); //drop it if the constraint gets too long
            holdConstraint.pointA = { //set constraint position
                x: this.x + 50 * Math.cos(this.angle), //just in front of player nose
                y: this.y + 50 * Math.sin(this.angle)
            };
            if (keys[81]) { // q = rotate the body
                body[this.holdingBody].torque = 0.05 * body[this.holdingBody].mass;
            }
            //look for dropping held body
            if (this.buttonCD < game.cycle) {
                if (keys[69]) { //if holding e drops
                    this.holdKeyDown++;
                } else if (this.holdKeyDown && !keys[69]) {
                    this.dropBody(); //if you hold down e long enough the body is thrown
                    this.throwBody();
                }
            }
        } else if (keys[69]) { //when not holding  e = pick up body
            this.findClosestBody();
            if (this.closest.dist2 < 10000) { //pick up if distance closer then 100*100
                this.isHolding = true;
                this.holdKeyDown = 0;
                this.buttonCD = game.cycle + 20;
                body[this.holdingBody].collisionFilter.group = 2; //force old holdingBody to collide with player
                this.holdingBody = this.closest.index; //set new body to be the holdingBody
                //body[this.closest.index].isSensor = true; //sensor seems a bit inconsistant
                body[this.holdingBody].collisionFilter.group = -2; //don't collide with player
                body[this.holdingBody].frictionAir = 0.1; //makes the holding body less jittery
                holdConstraint.bodyB = body[this.holdingBody];
                holdConstraint.length = 0;
                holdConstraint.pointA = {
                    x: this.x + 50 * Math.cos(this.angle),
                    y: this.y + 50 * Math.sin(this.angle)
                };
            }
        }
    };
    this.dropBody = function() {
        let timer; //reset player collision
        function resetPlayerCollision() {
            timer = setTimeout(function() {
                const dx = mech.x - body[mech.holdingBody].position.x
                const dy = mech.y - body[mech.holdingBody].position.y
                if (dx * dx + dy * dy > 15000) {
                    body[mech.holdingBody].collisionFilter.group = 2; //can collide with player
                } else {
                    resetPlayerCollision();
                }
            }, 100);
        }
        resetPlayerCollision();
        this.isHolding = false;
        body[this.holdingBody].frictionAir = 0.01;
        holdConstraint.bodyB = jumpSensor; //set on sensor to get the constaint on somethign else
    };
    this.throwMax = 150;
    this.throwBody = function() {
        let throwMag = 0;
        if (this.holdKeyDown > 20) {
            if (this.holdKeyDown > this.throwMax) this.holdKeyDown = this.throwMax;
            //scale fire with mass and with holdKeyDown time
            throwMag = body[this.holdingBody].mass * this.holdKeyDown * 0.001;
        }
        body[this.holdingBody].force.x = throwMag * Math.cos(this.angle);
        body[this.holdingBody].force.y = throwMag * Math.sin(this.angle);
    };
    this.isHolding = false;
    this.holdingBody = 0;
    this.closest = {
        dist2: 1000000,
        index: 0
    };
    this.findClosestBody = function() {
        this.closest.dist2 = 100000;
        for (let i = 0; i < body.length; i++) {
            const Px = body[i].position.x - (this.x + 50 * Math.cos(this.angle));
            const Py = body[i].position.y - (this.y + 50 * Math.sin(this.angle));
            if (body[i].mass < player.mass && Px * Px + Py * Py < this.closest.dist2) {
                this.closest.dist2 = Px * Px + Py * Py;
                this.closest.index = i;
            }
        }
    };
    this.standingOnActions = function() {
        if (this.onBody.type === 'map') {
            var that = this; //brings the this ness into the deeper object methods
            var actions = {
                'death': function() {
                    that.death();
                },
                'slow': function() {
                    Matter.Body.setVelocity(player, { //reduce player velocity every cycle until not true
                        x: player.velocity.x * 0.5,
                        y: player.velocity.y * 0.5
                    });
                },
                'launch': function() {
                    //that.dropBody();
                    Matter.Body.setVelocity(player, { //zero player velocity for consistant jumps
                        x: player.velocity.x,
                        y: 0
                    });
                    player.force.y = -0.1 * that.mass / game.delta;
                },
                'default': function() {}
            };
            (actions[map[this.onBody.index].action] || actions['default'])();
        }
    }

    /*   this.forcePoke = function() {
        for (var i = 0; i < body.length; i++) {
          var Dx = body[i].position.x - (this.mouse.x - this.transX);
          var Dy = body[i].position.y - (this.mouse.y - this.transY);
          var accel = 0.2 / Math.sqrt(Dx * Dx + Dy * Dy);
          if (accel > 0.01) accel = 0.01; //cap accel
          accel = accel * body[i].mass //scale with mass
          var angle = Math.atan2(Dy, Dx);
          body[i].force.x -= accel * Math.cos(angle);
          body[i].force.y -= accel * Math.sin(angle);
        }
      }; */
    this.drawLeg = function(stroke) {
        ctx.save();
        ctx.scale(this.flipLegs, 1); //leg lines
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(this.hip.x, this.hip.y);
        ctx.lineTo(this.knee.x, this.knee.y);
        ctx.lineTo(this.foot.x, this.foot.y);
        ctx.stroke();
        //toe lines
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.foot.x, this.foot.y);
        ctx.lineTo(this.foot.x - 15, this.foot.y + 5);
        ctx.moveTo(this.foot.x, this.foot.y);
        ctx.lineTo(this.foot.x + 15, this.foot.y + 5);
        ctx.stroke();
        //hip joint
        ctx.strokeStyle = this.stroke;
        ctx.fillStyle = this.fill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.hip.x, this.hip.y, 11, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        //knee joint
        ctx.beginPath();
        ctx.arc(this.knee.x, this.knee.y, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        //foot joint
        ctx.beginPath();
        ctx.arc(this.foot.x, this.foot.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    this.calcLeg = function(cycle_offset, offset) {
        this.hip.x = 12 + offset;
        this.hip.y = 24 + offset;
        //stepSize goes to zero if Vx is zero or not on ground (make this transition cleaner)
        this.stepSize = 0.9 * this.stepSize + 0.1 * (8 * Math.sqrt(Math.abs(this.Vx)) * this.onGround);
        //changes to stepsize are smoothed by adding only a percent of the new value each cycle
        const stepAngle = 0.037 * this.walk_cycle + cycle_offset;
        this.foot.x = 2 * this.stepSize * Math.cos(stepAngle) + offset;
        this.foot.y = offset + this.stepSize * Math.sin(stepAngle) + this.yOff + this.height;
        const Ymax = this.yOff + this.height;
        if (this.foot.y > Ymax) this.foot.y = Ymax;

        //calculate knee position as intersection of circle from hip and foot
        const d = Math.sqrt((this.hip.x - this.foot.x) * (this.hip.x - this.foot.x) +
            (this.hip.y - this.foot.y) * (this.hip.y - this.foot.y));
        const l = (this.legLength1 * this.legLength1 - this.legLength2 * this.legLength2 + d * d) / (2 * d);
        const h = Math.sqrt(this.legLength1 * this.legLength1 - l * l);
        this.knee.x = l / d * (this.foot.x - this.hip.x) - h / d * (this.foot.y - this.hip.y) + this.hip.x + offset;
        this.knee.y = l / d * (this.foot.y - this.hip.y) + h / d * (this.foot.x - this.hip.x) + this.hip.y;
    };
    this.draw = function() {
        ctx.fillStyle = this.fill;
        if (this.mouse.x > canvas.width / 2) {
            this.flipLegs = 1;
        } else {
            this.flipLegs = -1;
        }
        this.walk_cycle += this.flipLegs * this.Vx;

        //draw body
        ctx.save();
        // if(game.gravityDir){
        //   ctx.scale(1, -1);
        //   //ctx.translate(0,-1.5*canvas.height)
        //   ctx.translate(this.x, -this.y-this.yOff-this.height);
        // } else{
        //   ctx.translate(this.x, this.y);
        // }
        ctx.translate(this.x, this.y);
        this.calcLeg(Math.PI, -3);
        this.drawLeg('#444');
        this.calcLeg(0, 0);
        this.drawLeg('#333');
        ctx.rotate(this.angle);
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = 2;
        //ctx.fillStyle = this.fill;
        let grd = ctx.createLinearGradient(-30, 0, 30, 0);
        grd.addColorStop(0, "#bbb");
        grd.addColorStop(1, "#fff");
        ctx.fillStyle = grd;
        ctx.beginPath();
        //ctx.moveTo(0, 0);
        ctx.arc(0, 0, 30, 0, 2 * Math.PI);
        ctx.arc(15, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        //draw holding graphics
        if (this.isHolding) {
            if (this.holdKeyDown > 20) {
                if (this.holdKeyDown > this.throwMax) {
                    ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
                } else {
                    ctx.strokeStyle = 'rgba(255, 0, 255, ' + (0.2 + 0.4 * this.holdKeyDown / this.throwMax) + ')';
                }
            } else {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
            }
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(holdConstraint.bodyB.position.x + Math.random() * 2,
                holdConstraint.bodyB.position.y + Math.random() * 2);
            ctx.lineTo(this.x + 15 * Math.cos(this.angle), this.y + 15 * Math.sin(this.angle));
            //ctx.lineTo(holdConstraint.pointA.x,holdConstraint.pointA.y);
            ctx.stroke();
        }
    };
};




//makes the player object based on mechprototype
const mech = new mechProto();
