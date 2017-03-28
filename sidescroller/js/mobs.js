const mob = [];

const mobs = {
    loop: function() {
        let i = mob.length
        while (i--) {
            if (mob[i].alive) {
                for (let j = 0; j < mob[i].do.length; j++) { //run all the behaviors for the mob each cycle
                    mob[i][mob[i].do[j]](); //do is an array that list the strings to run
                }
            } else { //if dead
                mob[i].force.y += mob[i].mass * game.g / 2; //turn on gravity
                mob[i].deadCounting(i); //count down to removing mob from array
            }
        }
    },
    draw: function() {
        ctx.lineWidth = 2;
        let i = mob.length
        while (i--) {
            ctx.beginPath();
            let vertices = mob[i].vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1, len = vertices.length; j < len; ++j) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fillStyle = mob[i].fill;
            ctx.strokeStyle = mob[i].stroke;
            ctx.fill();
            ctx.stroke();
        }
    },
    alert: function(range) {
        for (let i = 0; i < mob.length; i++) {
            if (mob[i].distanceToPlayer() < range) mob[i].locatePlayer();
        }
    },
    startle: function(amount) {
        for (let i = 0; i < mob.length; i++) {
            if (!mob[i].seePlayer.yes) {
                mob[i].force.x += amount * mob[i].mass * (Math.random() - 0.5)
                mob[i].force.y += amount * mob[i].mass * (Math.random() - 0.5)
            }
        }
    },
    //**********************************************************************************************************************
    //**********************************************************************************************************************
    spawn: function(xPos, yPos, sides, radius, color, methods, name = 'test') {
        let i = mob.length;
        mob[i] = Matter.Bodies.polygon(xPos, yPos, sides, radius, {
            name: name,
            //inertia: Infinity, //prevents rotation
            density: 0.001,
            //friction: 0,
            frictionAir: 0.005,
            //frictionStatic: 0,
            restitution: 0.5,
            collisionFilter: {
                group: 0,
                category: 0x000001,
                mask: 0x001101,
            },
            do: methods,
            onHit: undefined,
            alive: true,
            index: i,
            health: 1,
            accelMag: 0.001,
            cd: 0, //game cycle when cooldown will be over
            delay: 60, //static: time between cooldowns
            fill: color,
            stroke: 'transparent',
            // radius: radius,
            seePlayer: {
                yes: false,
                recall: 0,
                position: {
                    x: xPos,
                    y: yPos
                }
            },
            radius: radius,
            spawnPos: {
                x: xPos,
                y: yPos
            },
            distanceToPlayer: function() {
                const dx = this.position.x - player.position.x;
                const dy = this.position.y - player.position.y;
                return Math.sqrt(dx * dx + dy * dy);
            },
            distanceToPlayer2: function() {
                const dx = this.position.x - player.position.x;
                const dy = this.position.y - player.position.y;
                return dx * dx + dy * dy;
            },
            gravity: function() {
                this.force.y += this.mass * this.g;
            },
            // SineWaveY: function() { //must add me.sineAmp  and me.sineFreq  to mob object to run
            //     this.force.y += this.mass * this.sineAmp * Math.sin(game.cycle * this.sineFreq)
            // },
            seePlayerFreq: 20 + Math.round(Math.random() * 30), //how often NPC checks to see where player is, lower numbers have better vision
            seePlayerCheck: function() {
                if (!(game.cycle % this.seePlayerFreq)) { // && this.distanceToPlayer2() < 2000000) { //view distance = 1414
                    this.stroke = 'transparent';
                    //checks if the mob can see the player, but map and body objects block view
                    if (Matter.Query.ray(map, this.position, player.position).length === 0 &&
                        Matter.Query.ray(body, this.position, player.position).length === 0) {
                        this.seePlayer.yes = true;
                        this.locatePlayer();
                    } else if (this.seePlayer.recall) {
                        this.stroke = '#444'
                        this.seePlayer.yes = false;
                        this.seePlayer.recall -= this.seePlayerFreq;
                        if (this.seePlayer.recall < 0) this.seePlayer.recall = 0;
                    }
                }
            },
            memory: 120, //default time to remember player's location
            locatePlayer: function() { // updates mob's memory of player location
                this.seePlayer.recall = this.memory + Math.round(this.memory * Math.random()); //seconds before mob falls a sleep
                this.seePlayer.position.x = player.position.x;
                this.seePlayer.position.y = player.position.y;
                this.stroke = '#000';
            },
            yank: function() { //accelerate towards the player
                if (this.cd < game.cycle && this.seePlayer.yes) {
                    this.cd = game.cycle + this.delay;
                    const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x);
                    const mag = player.mass * game.g
                    player.force.x -= 80 * mag * Math.cos(angle);
                    player.force.y -= 80 * mag * Math.sin(angle);
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(mech.pos.x, mech.pos.y)
                    ctx.lineWidth = 15;
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(0,0,0,0.3)'
                    ctx.fill();
                }
            },
            laser: function() {
                if (game.cycle % 7 && this.seePlayer.yes && this.distanceToPlayer2() < 500000) {
                    //if (Math.random()>0.2 && this.seePlayer.yes && this.distanceToPlayer2()<800000) {
                    mech.damage(0.0003 * game.dmgScale);
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(mech.pos.x, mech.pos.y);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "rgb(255,0,170)";
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(255,0,170,0.2)";
                    ctx.fill();
                }
            },
            laserTracking: function() {
                if (game.cycle % 11) {
                    if (this.seePlayer.yes) {
						//targeting laser will slowly move from the mob to the player's position
						this.laserPos = Matter.Vector.add(this.laserPos, Matter.Vector.mult(Matter.Vector.sub(this.seePlayer.position, this.laserPos), 0.05))
						//if laser is near the player do damage and darken laser color
                        if (Matter.Vector.magnitude(Matter.Vector.sub(this.laserPos, mech.pos)) < this.radius*2) {
                            mech.damage(0.002 * game.dmgScale);
                            ctx.strokeStyle = ctx.fillStyle = "rgb(0,255,255)";
							ctx.beginPath();
							ctx.arc(this.laserPos.x, this.laserPos.y, this.radius*2, 0, 2 * Math.PI);
							ctx.fill();
							ctx.lineWidth = 2;
							ctx.beginPath();
							ctx.moveTo(this.position.x, this.position.y);
							ctx.lineTo(this.laserPos.x, this.laserPos.y);
							ctx.stroke();
                        } else {
                            ctx.fillStyle = ctx.strokeStyle = "rgba(0,255,255,0.3)";
							ctx.beginPath();
							ctx.arc(this.laserPos.x, this.laserPos.y, this.radius, 0, 2 * Math.PI);
							ctx.fill();
                        }

                    } else {
						this.laserPos =	this.position
					}
                }
            },
            pullPlayer: function() {
                // if (this.cd < game.cycle && this.seePlayer.yes) {
                //     this.cd = game.cycle + this.delay;
                if (this.seePlayer.yes) {
                    const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x);
                    const mag = player.mass * game.g
                    player.force.x -= 1.6 * mag * Math.cos(angle);
                    player.force.y -= 0.97 * mag * Math.sin(angle);

                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(mech.pos.x, mech.pos.y)
                    ctx.lineWidth = 15;
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(0,0,0,0.3)'
                    ctx.fill();
                }
            },
            repelBullets: function() {
                if (this.seePlayer.yes) {
                    ctx.lineWidth = "8";
                    ctx.strokeStyle = this.fill
                    ctx.beginPath();
                    for (let i = 0, len = bullet.length; i < len; ++i) {
                        const dx = bullet[i].position.x - this.position.x;
                        const dy = bullet[i].position.y - this.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 500) {
                            ctx.moveTo(this.position.x, this.position.y);
                            ctx.lineTo(bullet[i].position.x, bullet[i].position.y);
                            const angle = Math.atan2(dy, dx);
                            const mag = 1500 * bullet[i].mass * game.g / dist
                            bullet[i].force.x += mag * Math.cos(angle);
                            bullet[i].force.y += mag * Math.sin(angle);
                        }
                    }
                    ctx.stroke();
                }
            },
            attraction: function() { //accelerate towards the player
                if (this.seePlayer.recall) { // && dx * dx + dy * dy < 2000000) {
                    const forceMag = this.accelMag * this.mass;
                    const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x);
                    this.force.x += forceMag * Math.cos(angle);
                    this.force.y += forceMag * Math.sin(angle);
                }
            },
            repulsionRange: 500000,
            repulsion: function() { //accelerate towards the player
                if (this.seePlayer.recall && this.distanceToPlayer2() < this.repulsionRange) { // && dx * dx + dy * dy < 2000000) {
                    const forceMag = this.accelMag * this.mass;
                    const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x);
                    this.force.x -= 2 * forceMag * Math.cos(angle);
                    this.force.y -= 2 * forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
                }
            },
            burstAttraction: function() { //accelerate towards the player after a delay
                if (this.seePlayer.recall) {
                    if (this.cdBurst2 < game.cycle && this.angularSpeed < 0.01) {
                        this.torque += this.mass * this.mass * (Math.round(Math.random()) * 2 - 1)
                        this.cdBurst2 = Infinity
                        this.cdBurst1 = game.cycle + 20
                    }
                    if (this.cdBurst1 < game.cycle) {
                        this.cdBurst2 = game.cycle + this.delay
                        this.cdBurst1 = Infinity
                        const forceMag = (this.accelMag + this.accelMag * Math.random()) * this.mass
                        const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x)
                        this.force.x += forceMag * Math.cos(angle)
                        this.force.y += forceMag * Math.sin(angle) // - 0.0007 * this.mass; //antigravity
                    }
                } else {
                    this.cdBurst2 = 0
                }
            },
            hop: function() { //accelerate towards the player after a delay
                if (this.cd < game.cycle && this.seePlayer.recall && this.speed < 1) {
                    this.cd = game.cycle + this.delay
                    const forceMag = (this.accelMag + this.accelMag * Math.random()) * this.mass
                    const angle = Math.atan2(this.seePlayer.position.y - this.position.y, this.seePlayer.position.x - this.position.x)
                    this.force.x += forceMag * Math.cos(angle)
                    this.force.y += forceMag * Math.sin(angle) - 0.04 * this.mass; //antigravity
                }
            },
            strike: function() { //teleport to player when close enough on CD
                if (this.seePlayer.recall && this.cd < game.cycle) {
                    const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                    const distMag = Matter.Vector.magnitude(dist);
                    if (distMag < 430) {
                        this.cd = game.cycle + this.delay;
                        ctx.beginPath();
                        ctx.moveTo(this.position.x, this.position.y);
                        Matter.Body.translate(this, Matter.Vector.mult(Matter.Vector.normalise(dist), distMag - 20 - radius))
                        ctx.lineTo(this.position.x, this.position.y);
                        ctx.lineWidth = radius * 2;
                        ctx.strokeStyle = this.fill; //"rgba(0,0,0,0.5)"; //'#000'
                        ctx.stroke();
                    }
                }
            },
            blink: function() { //teleport towards player as a way to move
                if (this.seePlayer.recall && !(game.cycle % this.blinkRate)) { // && !mech.lookingAtMob(this,0.5)){
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                    const distMag = Matter.Vector.magnitude(dist);
                    const unitVector = Matter.Vector.normalise(dist);
                    const rando = (Math.random() - 0.5) * 50;
                    if (distMag < this.blinkLength) {
                        Matter.Body.translate(this, Matter.Vector.mult(unitVector, distMag + rando));
                    } else {
                        Matter.Body.translate(this, Matter.Vector.mult(unitVector, this.blinkLength + rando));
                    }
                    ctx.lineTo(this.position.x, this.position.y);
                    ctx.lineWidth = radius * 2;
                    ctx.strokeStyle = this.fill; //"rgba(0,0,0,0.5)"; //'#000'
                    ctx.stroke();
                }
            },
            drift: function() { //teleport towards player as a way to move
                if (this.seePlayer.recall && !(game.cycle % this.blinkRate)) { // && !mech.lookingAtMob(this,0.5)){
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                    const distMag = Matter.Vector.magnitude(dist);
                    const vector = Matter.Vector.mult(Matter.Vector.normalise(dist), this.blinkLength)
                    if (distMag < this.blinkLength) {
                        Matter.Body.setPosition(this, this.seePlayer.position)
                        Matter.Body.translate(this, {
                            x: (Math.random() - 0.5) * 50,
                            y: (Math.random() - 0.5) * 50
                        });
                    } else {
                        vector.x += (Math.random() - 0.5) * 200;
                        vector.y += (Math.random() - 0.5) * 200;
                        Matter.Body.translate(this, vector);
                    }
                    ctx.lineTo(this.position.x, this.position.y);
                    ctx.lineWidth = radius * 2;
                    ctx.strokeStyle = this.fill
                    ctx.stroke();
                }
            },
            sneakAttack: function() { //speeds towards player when player isn't looking on CD
                if (this.cd < game.cycle && !mech.lookingAtMob(this, 0.5)) {
                    this.seePlayerCheck();
                    if (this.seePlayer.yes) {
                        this.cd = game.cycle + 120;
                        const mag = 0.08;
                        const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                        this.force.x += Matter.Vector.mult(unitVector, mag * this.mass).x
                        this.force.y += Matter.Vector.mult(unitVector, mag * this.mass).y
                        this.do = ['healthBar', 'gravity', "seePlayerCheck", "fallCheck", "attraction", 'hide']
                        this.collisionFilter.mask = 0x001101; //make mob hittable by bullets again
                        this.fill = 'rgb(120,190,210)'
                    } else {
                        this.stroke = 'transparent';
                    }
                }
            },
            hide: function() { //reverts back to sneakattack mode when can't recall the player's position anymore
                if (!this.seePlayer.recall) {
                    this.seePlayerCheck(); //gets the stroke collor back to normal
                    this.do = ['gravity', "fallCheck", 'sneakAttack']
                    this.collisionFilter.mask = 0x000001; //make mob unhittable by bullets again
                    this.fill = 'transparent';
                    this.stroke = 'transparent';
                }
            },
            // regen: function() {
            //     if (game.cycle % 19) {
            //         this.health += 0.1
            //         if (this.health > 1) this.health = 1;
            //     }
            // },
            fallCheck: function() {
                if (this.position.y > game.fallHeight) {
                    this.death();
                    this.deadCount = 0;
                }
            },
            onHitDamage: function() { //used in engine.js mob/player collisions
                let dmg = 0.01 * Math.sqrt(this.mass) * game.dmgScale;
                if (dmg < 0.01) dmg = 0.01;
                return dmg
            },
            damage: function(dmg) {
                this.health -= dmg / (Math.sqrt(this.mass));
                //this.fill = this.color + this.health + ')';
                if (this.health < 0.1) this.death();
            },
            healthBar: function() { //draw health bar
                if (this.seePlayer.recall) { // && this.health < 1
                    const h = this.radius * 0.3
                    const w = this.radius * 2
                    const x = this.position.x - w / 2
                    const y = this.position.y - w * 0.7
                    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = '#f00' //'rgba(255,0,0,0.8)'
                    ctx.fillRect(x, y, w * this.health, h);
                }
            },
            deadCount: 0.2,
            onDeath: function() { // a placeholder for custom effects on mob death
            },
            death: function(powerUp = true) {
                this.onDeath(this); //custom death effects
                if (powerUp) powerUps.spawnRandomPowerUp(this.position.x, this.position.y, this.mass, radius);
                this.alive = false;
                this.seePlayer.recall = 0;
                this.frictionAir = 0.005;
                this.restitution = 0;
                this.fill = 'rgba(0,0,0,0)';
                this.collisionFilter.category = 0x000010;
                if (this.collisionFilter.mask === 0x001100) {
                    this.collisionFilter.mask = 0x000000;
                } else {
                    this.collisionFilter.mask = 0x000001;
                }
                if (this.isStatic) {
                    Matter.Body.setMass(this, 1)
                    Matter.Body.setStatic(this, false)
                }
                if (this.isSleeping) {
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    Matter.Sleeping.set(this, false)
                }
                this.removeCons();
            },
            removeCons: function() {
                for (let i = 0, len = consBB.length; i < len; ++i) {
                    if (consBB[i].bodyA === this) {
                        consBB[i].bodyA = consBB[i].bodyB;
                        consBB.splice(i, 1);
                        this.removeCons();
                        break;
                    } else if (consBB[i].bodyB === this) {
                        consBB[i].bodyB = consBB[i].bodyA;
                        consBB.splice(i, 1);
                        this.removeCons();
                        break;
                    }
                }
            },
            deadCounting: function(i) {
                this.deadCount -= 0.0002;
                this.stroke = 'rgba(0,0,0,' + this.deadCount + ')'; //fade away
                if (this.deadCount < 0) {
                    Matter.World.remove(engine.world, this);
                    mob.splice(i, 1);
                }
            },
            faceOnFire: true,
            fireDelay: 50,
            fireCD: 0,
            fireAt: function() {
                if (this.seePlayer.recall && this.fireCD < game.cycle) {
                    this.fireCD = game.cycle + this.fireDelay;
                    const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                    const angle = Math.atan2(unitVector.y, unitVector.x)
                    if (this.faceOnFire) Matter.Body.setAngle(this, angle - Math.PI)
                    const len = mobBullet.length;
                    mobBullet[len] = Bodies.rectangle(this.position.x, this.position.y, 14, 6, {
                        angle: angle,
                        density: 0.001,
                        friction: 0.5,
                        frictionStatic: 1,
                        frictionAir: 0,
                        restitution: 0,
                        collisionFilter: {
                            category: 0x010000,
                            mask: 0x001001,
                        },
                        dmg: 0.05,
                        minDmgSpeed: 8,
                        endCycle: game.cycle + 180,
                        color: '#000',
                        classType: 'mobBullet',
                        onDmg: function() {
                            this.endCycle = game.cycle;
                        },
                    });
                    const speed = 15;
                    Matter.Body.setVelocity(mobBullet[len], {
                        x: speed * Math.cos(angle),
                        y: speed * Math.sin(angle)
                    });
                    World.add(engine.world, mobBullet[len]); //add to world
                }
            },

            fire: function() {
                this.cd = game.cycle + 50;
                if (this.seePlayer.recall && this.cd < game.cycle) {
                    //set angle of bullet
                    function angleToHit(g, v2, x, y) {
                        //console.log(0.5*Math.asin(g*x/v2))
                        //return 0.5*Math.asin(g*x/v2)-Math.PI/2;  //angle of reach
                        if (g === 0 || x === 0) return null;
                        let sqrt;
                        if (game.cycle % 2) {
                            sqrt = v2 * v2 - g * (g * x * x + 2 * y * v2);
                        } else {
                            sqrt = v2 * v2 + g * (g * x * x + 2 * y * v2);
                        }
                        if (sqrt > 0) {
                            //console.log(Math.atan2(v * v + Math.sqrt(sqrt), g * x))
                            //console.log(Math.atan(v * v + Math.sqrt(sqrt) / (g * x)));
                            //console.log('v2:',v2);
                            //console.log('y:',y);
                            //console.log(v2 + Math.sqrt(sqrt) / g / x);
                            //console.log(Math.atan(v2 - Math.sqrt(sqrt) / g / x));
                            // if (game.cycle % 3 === 0) {
                            //     return Math.atan((v2 + Math.sqrt(sqrt)) / (g * x)) + Math.PI;
                            // } else {
                            //     return Math.atan((v2 + Math.sqrt(sqrt)) / (g * x)) - Math.PI;
                            // }
                            // let a = Math.atan(((v2 + Math.sqrt(sqrt)) / g / x))
                            // if(x>0){
                            // 	return Math.atan( (v2 + Math.sqrt(sqrt)) / g / x)-Math.PI/2
                            // } else{
                            // 	return Math.atan( (v2 + Math.sqrt(sqrt)) / g / x)+Math.PI/2
                            // }

                            // if (game.cycle % 3 === 0){
                            // 	return Math.atan(((v2 + Math.sqrt(sqrt)) / g / x))
                            // } else{
                            // 	return Math.atan(((v2 + Math.sqrt(sqrt)) / g / x)*-1)
                            // }
                            return Math.atan((v2 + Math.sqrt(sqrt)) / g / x) - Math.PI / 2
                                //return Math.atan2(v2 + Math.sqrt(sqrt), g * x)-Math.PI/2;
                                //return Math.atan2(g * x, v2 + Math.sqrt(sqrt))
                        } else {
                            return null;
                        }
                    }
                    const v = 15;
                    //const angle = angleToHit(0.001*0.06, v * v /60/60,(this.seePlayer.position.x - this.position.x), (this.position.y - this.seePlayer.position.y));
                    const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                    const angle = Math.atan2(unitVector.y, unitVector.x)
                    if (angle !== null) {
                        //const angle = -Math.PI*0.5; //2*Math.PI*Math.random();
                        const len = mobBullet.length;
                        mobBullet[len] = Bodies.rectangle(this.position.x, this.position.y, 7, 3, {
                            angle: angle,
                            density: 0.001,
                            friction: 1,
                            frictionStatic: 1,
                            frictionAir: 0,
                            restitution: 0,
                            collisionFilter: {
                                category: 0x010000,
                                mask: 0x001001,
                            },
                            dmg: 0.04,
                            minDmgSpeed: 8,
                            endCycle: game.cycle + 180,
                            color: '#000',
                            classType: 'mobBullet',
                            onDmg: function() {
                                this.endCycle = game.cycle;
                            },
                        });
                        // Matter.Body.setVelocity(mobBullet[len], { //bullet velocity includes its motion plus a force
                        //     x: v * Math.cos(angle), //this.velocity.x,
                        //     y: v * Math.sin(angle) //this.velocity.y
                        // });
                        const f = {
                            x: 0.0012 * Math.cos(angle) / game.delta,
                            y: 0.0012 * Math.sin(angle) / game.delta
                        }
                        mobBullet[len].force = f //add force to fire bullets
                        World.add(engine.world, mobBullet[len]); //add to world
                    }
                }
            },
        });
        World.add(engine.world, mob[i]); //add to world
    }
}
