let mobs = {
    loop: function() {
        let i = mob.length
        while (i--) {
            if (mob[i].alive) {
                for (let j = 0; j < mob[i].do.length; j++) {
                    mob[i][mob[i].do[j]](); //do is an array that list the strings to run
                }
            } else {
                mob[i].force.y += mob[i].mass * game.g / 2;
                mob[i].deadCounting(i); //pass i to know what array index to delete on death
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
            for (let j = 1; j < vertices.length; j += 1) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fillStyle = mob[i].fill;
            ctx.strokeStyle = mob[i].stroke;
            ctx.fill();
            ctx.stroke();
        }
    },
    alert: function() {
        for (let i = 0; i < mob.length; i++) {
            mob[i].locatePlayer();
        }
    },
    startle: function(amount) {
        for (let i = 0; i < mob.length; i++) {
            if (!mob[i].seePlayer.yes) {
                mob[i].force.x += amount * mob[i].mass * (Math.random() - 0.5)
                mob[i].force.y += amount * mob[i].mass * (Math.random() - 0.5)
            }
        }
    }

}


const mob = [];

function spawnNPC(xPos, yPos, sides, radius, color, accelMag, methods) {
    let i = mob.length;
    mob[i] = Matter.Bodies.polygon(xPos, yPos, sides, radius, {
        //inertia: Infinity, //prevents player rotation
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
        alive: true,
        index: i,
        health: 1,
        accelMag: accelMag,
        color: color,
        fill: color + '1)',
        stroke: 'transparent',
        cd: 0,
        seePlayer: {
            yes: false,
            recall: 0,
            position: {
                x: 0,
                y: 0
            }
        },
        spawnPos: {
            x: xPos,
            y: yPos
        },
        gravity: function() {
            this.force.y += this.mass * this.g;
        },
        seePlayerCheck: function() { //checks if the mob can see the player, but map and body objects block view
            if (!(game.cycle % 10)) {
                this.stroke = 'transparent';
                let collisionM = Matter.Query.ray(map, this.position, player.position)
                let collisionB = Matter.Query.ray(body, this.position, player.position)
                if (collisionM.length === 0 && collisionB.length === 0) {
                    this.locatePlayer();
                    this.seePlayer.yes = true;
                } else if (this.seePlayer.recall) {
                    this.seePlayer.yes = false;
                    this.seePlayer.recall -= 10;
					if (this.seePlayer.recall<0)
						this.seePlayer.recall = 0;
                    this.stroke = '#444'
                }
            }
        },
        memory: 120,
        locatePlayer: function() { // updates mob's memory of player location
            this.seePlayer.recall = this.memory + Math.round(this.memory * Math.random()); //seconds before mob falls a sleep
            this.seePlayer.position.x = player.position.x;
            this.seePlayer.position.y = player.position.y;
            this.stroke = '#000';
        },
        attraction: function() { //accelerate towards the player
            if (this.seePlayer.recall) { // && dx * dx + dy * dy < 2000000) {
                let dx = this.seePlayer.position.x - this.position.x;
                let dy = this.seePlayer.position.y - this.position.y;
                const forceMag = this.accelMag * this.mass;
                let angle = Math.atan2(dy, dx);
                this.force.x += forceMag * Math.cos(angle);
                this.force.y += forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
            }
        },
        hop: function() { //accelerate towards the player
            if (this.cd < game.cycle && this.seePlayer.recall) {
                this.cd = game.cycle + 80;
                let dx = this.seePlayer.position.x - this.position.x;
                let dy = this.seePlayer.position.y - this.position.y;
                const forceMag = (accelMag + accelMag * Math.random()) * this.mass;
                let angle = Math.atan2(dy, dx);
                this.force.x += forceMag * Math.cos(angle);
                this.force.y += forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
            }
        },
        blink: function() { //teleport towards player as a way to move
            if (this.seePlayer.recall && !(game.cycle % 60)) { // && !mech.lookingAtMob(this,0.5)){
                const dist = Matter.Vector.sub(this.seePlayer.position, this.position)
                const distMag = Matter.Vector.magnitude(dist)
                const unitVector = Matter.Vector.normalise(dist);
                if (distMag < 150) {
                    Matter.Body.translate(this, Matter.Vector.mult(unitVector, distMag))
                } else {
                    Matter.Body.translate(this, Matter.Vector.mult(unitVector, 150))
                }

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
                        //switch modes to chaser
                    this.do = ['gravity', "seePlayerCheck", "fallCheck", "attraction", 'hide']
                    this.collisionFilter.mask = 0x001101; //make mob hittable by bullets again
                    this.color = 'rgba(120,190,210,'
                    this.fill = this.color + this.health + ')';
                } else {
                    this.stroke = 'transparent';
                }
            }
            // else if (this.cd < game.cycle + 30 && this.cd > game.cycle) { //CD ready strobe warning
            //     this.stroke = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            // }
        },
        hide: function() { //reverts back to sneakattack mode when can't recall the player's position anymore
            if (!this.seePlayer.recall) {
                this.seePlayerCheck(); //gets the stroke collor back to normal
                this.do = ['gravity', "fallCheck", 'sneakAttack']
                this.collisionFilter.mask = 0x001001; //make mob unhittable by bullets again
                this.color = 'rgba(235,235,235,'
                this.fill = this.color + this.health + ')';
            }
        },
        strike: function() { //teleport to player when close enough on CD
            if (this.seePlayer.recall && this.cd < game.cycle) {
                const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                const distMag = Matter.Vector.magnitude(dist);
                if (distMag < 350) {
                    this.cd = game.cycle + 300;
                    Matter.Body.translate(this, Matter.Vector.mult(Matter.Vector.normalise(dist), distMag - 20 - radius))
                }
            }
        },
        fallCheck: function() {
            if (this.position.y > game.fallHeight) {
                Matter.Body.setPosition(this, this.spawnPos);
                Matter.Body.setVelocity(this, {
                    x: 0,
                    y: 0
                });
            }
        },
        damage: function(dmg) {
            this.health -= dmg / (Math.sqrt(this.mass));
            this.fill = this.color + this.health + ')';
            if (this.health < 0.1) {
                this.death();
            }
        },
        deadCount: 0.2,
        death: function() {
            this.alive = false;
            this.seePlayer.recall = 0;
            this.frictionAir = 0.005;
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
        },
        deadCounting: function(i) {
            this.deadCount -= 0.0002;
            this.stroke = 'rgba(0,0,0,' + this.deadCount + ')'; //fade away
            if (this.deadCount < 0) {
                Matter.World.remove(engine.world, this);
                mob.splice(i, 1);
            }
        },
        fireAt: function() {
            if (this.seePlayer.recall && this.cd < game.cycle) {
                this.cd = game.cycle + 50;
                const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                const angle = Math.atan2(unitVector.y, unitVector.x)
                Matter.Body.setAngle(this, angle - Math.PI)
                const len = mobBullet.length;
                mobBullet[len] = Bodies.rectangle(this.position.x, this.position.y, 7, 3, {
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
                    dmg: 0.04,
                    minDmgSpeed: 8,
                    endCycle: game.cycle + 180,
                    color: '#000',
                    classType: 'mobBullet',
                    onDmg: function() {
                        this.endCycle = game.cycle;
                    },
                });
                const f = {
                    x: 0.0012 * Math.cos(angle) / game.delta,
                    y: 0.0012 * Math.sin(angle) / game.delta
                }
                mobBullet[len].force = f //add force to fire bullets
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


const mobBullet = [];

function mobBulletLoop() {
    let i = mobBullet.length;
    ctx.beginPath();
    while (i--) {
        let vertices = mobBullet[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        if (mobBullet[i].endCycle < game.cycle) {
            Matter.World.remove(engine.world, mobBullet[i]);
            mobBullet.splice(i, 1);
        }
    }
    ctx.fillStyle = '#000';
    ctx.fill();
}
