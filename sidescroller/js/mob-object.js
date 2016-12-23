let mobs = {
    loop: function() {
        let i = mob.length
        while (i--) {
            if (mob[i].alive) {
                //mob[i].fallCheck();
                //mob[i].seePlayerCheck();
                //mob[i].attraction();
                for (let j = 0; j < mob[i].do.length; j++) {
                    mob[i][mob[i].do[j]](); //do is an array that list the strings to run
                }
            } else {
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

function spawnNPC(pos, isSleeping, sides, radius, color, methods) {
    let i = mob.length;
    mob[i] = Matter.Bodies.polygon(pos.x, pos.y, sides, radius, {
        isSleeping: isSleeping,
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
        fill: color + '1)',
        stroke: '#999',
        seePlayer: {
            yes: 0,
            position: {
                x: 0,
                y: 0
            }
        },
        spawnPos: pos,
        seePlayerCheck: function() {
            //checks if the mob can see the player, but map and body objects block view
            this.stroke = '#999'
            let collisionM = Matter.Query.ray(map, this.position, player.position)
            let collisionB = Matter.Query.ray(body, this.position, player.position)
            if (collisionM.length === 0 && collisionB.length === 0) {
                this.locatePlayer();
            } else if (this.seePlayer.yes) {
                this.seePlayer.yes--;
                this.stroke = '#555'
            }
        },
        locatePlayer: function() {
            this.seePlayer.yes = 120 + Math.round(120 * Math.random()); //seconds before mob falls a sleep
            this.seePlayer.position.x = player.position.x;
            this.seePlayer.position.y = player.position.y;
            this.stroke = '#000'
        },
        attraction: function() {
            let dx = this.seePlayer.position.x - this.position.x;
            let dy = this.seePlayer.position.y - this.position.y;
            if (this.seePlayer.yes) { // && dx * dx + dy * dy < 2000000) {
                const forceMag = 0.001 * this.mass;
                let angle = Math.atan2(dy, dx);
                this.force.x += forceMag * Math.cos(angle);
                this.force.y += forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
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
            this.fill = color + this.health + ')';
            if (this.health < 0.1) {
                this.death();
            }
        },
        deadCount: 0.2,
        death: function() {
            this.alive = false;
            this.health = 1;
            this.collisionFilter.category = 0x000010;
            this.collisionFilter.mask = 0x000001;
            this.seePlayer.yes = 0;
            this.fill = 'rgba(0,0,0,0)';
            if (isSleeping) {
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
                mob.splice(i, 1); //doesn't work b/c of reference in draw bullet function
            }
        },
        fire: function() {
            if (this.seePlayer.yes) { //&& !(game.cycle % 20)) {
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
                        return Math.atan( (v2 + Math.sqrt(sqrt)) / g / x)-Math.PI/2
                        //return Math.atan2(v2 + Math.sqrt(sqrt), g * x)-Math.PI/2;
                        //return Math.atan2(g * x, v2 + Math.sqrt(sqrt))
                    } else {
                        return null;
                    }
                }
                const v = 10;
                const s = 60;
				const what = 0.06; //I don't understand this number  (60/1000???)
                const angle = angleToHit(0.001*what, v * v /s /s,
                    (this.seePlayer.position.x - this.position.x), (this.position.y - this.seePlayer.position.y));
                if (angle !== null) {
                    //const angle = -Math.PI*0.5; //2*Math.PI*Math.random();
                    const len = mobBullet.length;
                    mobBullet[len] = Bodies.rectangle(this.position.x, this.position.y, 7, 3, {
                        angle: angle,
                        density: 0.001,
                        friction: 0.5,
                        frictionStatic: 1,
                        frictionAir: 0,
                        restitution: 0,
                        collisionFilter: {
                            category: 0x000000,
                            //mask: 0x001001,
							mask: 0x000000,
                        },
                        dmg: 0.04,
                        minDmgSpeed: 8,
                        endCycle: game.cycle + 120,
                        color: '#000',
                        classType: 'mobBullet',
                        onDmg: function() {
                            this.endCycle = game.cycle;
                        },
                    });
                    Matter.Body.setVelocity(mobBullet[len], { //bullet velocity includes its motion plus a force
                        x: v * Math.cos(angle), //this.velocity.x,
                        y: v * Math.sin(angle) //this.velocity.y
                    });
                    // const impulse = 0.0015;
                    // const f = {
                    //     x: impulse * Math.cos(angle) / game.delta,
                    //     y: impulse * Math.sin(angle) / game.delta
                    // }
                    //mobBullet[len].force = f //add force to fire bullets
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
