//test comment please delete
//create array of mobs
let mob = [];

//method to populate the array above
const mobs = {
    loop: function() {
        let i = mob.length;
        while (i--) {
            //run through alive mobs here and run through array of strings
            if (mob[i].alive) {
                for (let j = 0; j < mob[i].do.length; j++) {
                    //run all the behaviors for the mob each cycle
                    mob[i][mob[i].do[j]](); //do is an array that list the strings to run
                }
            } else {
                //if dead
                mob[i].force.y += mob[i].mass * game.g / 2; //turn on gravity
                mob[i].deadCounting(i); //count down to removing mob from array
            }
        }
    },
    draw: function() {
        ctx.lineWidth = 2;
        let i = mob.length;
        while (i--) {
            ctx.beginPath();
            const vertices = mob[i].vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1, len = vertices.length; j < len; ++j) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fillStyle = mob[i].fill;
            ctx.strokeStyle = mob[i].stroke;
            ctx.fill();
            ctx.stroke();
            //draw face
            // const rad = mob[i].radius
            // ctx.fillStyle = '#fff'
            // ctx.save();
            // ctx.translate(mob[i].position.x, mob[i].position.y); //center
            // ctx.rotate(mob[i].angle);
            // ctx.beginPath();
            // ctx.arc(rad*0.5, -rad*0.2, rad*0.06, 0, 2*Math.PI);
            // ctx.fill();
            // ctx.beginPath();
            // ctx.arc(-rad*0.5, -rad*0.2, rad*0.06, 0, 2*Math.PI);
            // ctx.fill();
            // ctx.beginPath();
            // ctx.arc(0, rad*0.15, rad*0.18, 0, 2*Math.PI);
            // ctx.fill();
            // ctx.restore();

            // const rad = mob[i].radius
            // ctx.fillStyle = '#fff'
            // ctx.strokeStyle='#fff';
            // ctx.save();
            // ctx.translate(mob[i].position.x, mob[i].position.y); //center
            // ctx.rotate(mob[i].angle);
            // ctx.beginPath();
            // ctx.arc(rad*0.45, -rad*0.2, rad*0.06, 0, 2*Math.PI);
            // ctx.fill();
            // ctx.beginPath();
            // ctx.arc(rad*0.6, -rad*0.2, rad*0.06, 0, 2*Math.PI);
            // ctx.fill();
            // ctx.beginPath();
            // ctx.moveTo(0,0);
            // ctx.lineTo(rad*0.7,0);
            // ctx.stroke();
            // ctx.restore();
        }
    },
    alert: function(range) {
        //add alert to draw queue
        // game.drawList.push({
        //     x: player.position.x,
        //     y: player.position.y,
        //     radius: range,
        //     color: "rgba(0,0,0,0.02)",
        //     time: game.drawTime
        // });
        range = range * range;
        for (let i = 0; i < mob.length; i++) {
            if (mob[i].distanceToPlayer2() < range) mob[i].locatePlayer();
        }
    },
    startle: function(amount) {
        for (let i = 0; i < mob.length; i++) {
            if (!mob[i].seePlayer.yes) {
                mob[i].force.x += amount * mob[i].mass * (Math.random() - 0.5);
                mob[i].force.y += amount * mob[i].mass * (Math.random() - 0.5);
            }
        }
    },
    //**********************************************************************************************
    //**********************************************************************************************
    spawn: function(xPos, yPos, sides, radius, color, methods) {
        let i = mob.length;
        mob[i] = Matter.Bodies.polygon(xPos, yPos, sides, radius, {
            //inertia: Infinity, //prevents rotation
            mob: true,
            density: 0.001,
            //friction: 0,
            frictionAir: 0.005,
            //frictionStatic: 0,
            restitution: 0.5,
            collisionFilter: {
                group: 0,
                category: 0x000001,
                mask: 0x001101
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
            stroke: "#000",
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
            seeAtDistance2: 4000000, //sqrt(4000000) = 2000 = max seeing range
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
                //fallcheck
                if (this.position.y > game.fallHeight) {
                    this.death();
                    this.deadCount = 0;
                }
            },
            // SineWaveY: function() { //must add me.sineAmp  and me.sineFreq  to mob object to run
            //     this.force.y += this.mass * this.sineAmp * Math.sin(game.cycle * this.sineFreq)
            // },
            seePlayerFreq: 20 + Math.round(Math.random() * 20), //how often NPC checks to see where player is, lower numbers have better vision
            foundPlayer: function() {
                this.locatePlayer();
                if (!this.seePlayer.yes) {
                    this.alertNearByMobs();
                    this.seePlayer.yes = true;
                }
            },
            lostPlayer: function() {
                this.seePlayer.yes = false;
                this.seePlayer.recall -= this.seePlayerFreq;
                if (this.seePlayer.recall < 0) this.seePlayer.recall = 0;
            },
            memory: 120, //default time to remember player's location
            locatePlayer: function() {
                // updates mob's memory of player location
                this.seePlayer.recall = this.memory + Math.round(this.memory * Math.random()); //seconds before mob falls a sleep
                this.seePlayer.position.x = player.position.x;
                this.seePlayer.position.y = player.position.y;
            },
            locatePlayerByDist: function() {
                if (this.distanceToPlayer2() < this.locateRange) {
                    this.locatePlayer();
                }
            },
            seePlayerCheck: function() {
                if (!(game.cycle % this.seePlayerFreq)) {
                    if (
                        Matter.Query.ray(map, this.position, player.position).length === 0 &&
                        Matter.Query.ray(body, this.position, player.position).length === 0
                    ) {
                        this.foundPlayer();
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
            },
            seePlayerCheckByDistance: function() {
                if (!(game.cycle % this.seePlayerFreq)) {
                    if (this.distanceToPlayer2() < this.seeAtDistance2) {
                        this.foundPlayer();
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
            },
            seePlayerByDistOrLOS: function() {
                if (!(game.cycle % this.seePlayerFreq)) {
                    if (
                        this.distanceToPlayer2() < this.seeAtDistance2 ||
                        (Matter.Query.ray(map, this.position, player.position).length === 0 &&
                            Matter.Query.ray(body, this.position, player.position).length === 0)
                    ) {
                        this.foundPlayer();
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
            },
            seePlayerByDistAndLOS: function() {
                if (!(game.cycle % this.seePlayerFreq)) {
                    if (
                        this.distanceToPlayer2() < this.seeAtDistance2 &&
                        (Matter.Query.ray(map, this.position, player.position).length === 0 &&
                            Matter.Query.ray(body, this.position, player.position).length === 0)
                    ) {
                        this.foundPlayer();
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
            },
            isLookingAtPlayer: function(threshold) {
                const diff = Matter.Vector.normalise(Matter.Vector.sub(player.position, this.position));
                //make a vector for the mob's direction of length 1
                const dir = {
                    x: Math.cos(this.angle),
                    y: Math.sin(this.angle)
                };
                //the dot prodcut of diff and dir will return how much over lap between the vectors
                const dot = Matter.Vector.dot(dir, diff);
                // console.log(Math.cos(dot)*180/Math.PI)
                if (dot > threshold) {
                    return true;
                } else {
                    return false;
                }
            },
            lookRange: 0.2 + Math.random() * 0.2,
            lookTorque: 0.0000004 * (Math.random() > 0.5 ? -1 : 1),
            seePlayerByLookingAt: function() {
                if (!(game.cycle % this.seePlayerFreq)) {
                    if (
                        (this.seePlayer.recall || this.isLookingAtPlayer(this.lookRange)) &&
                        this.distanceToPlayer2() < this.seeAtDistance2 &&
                        Matter.Query.ray(map, this.position, player.position).length === 0 &&
                        Matter.Query.ray(body, this.position, player.position).length === 0
                    ) {
                        this.foundPlayer();
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
                //if you don't recall player location rotate and draw to show where you are looking
                if (!this.seePlayer.recall) {
                    this.torque = this.lookTorque * this.inertia;
                    //draw
                    const range = Math.PI * this.lookRange;
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.radius * 2.5, this.angle - range, this.angle + range);
                    ctx.arc(this.position.x, this.position.y, this.radius * 1.4, this.angle + range, this.angle - range, true);
                    ctx.fillStyle = "rgba(0,0,0,0.07)";
                    ctx.fill();
                }
            },
            laserSearch: function() {
                const vertexCollision = function(v1, v1End, domain) {
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
                            if (dist2 < best.dist2) {
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
                };
                if (this.seePlayer.recall) {
					this.torque = this.lookTorque * this.inertia*2;

                    const seeRange = 2500;
                    best = { x: null, y: null, dist2: Infinity, who: null, v1: null, v2: null };
                    const look = {
                        x: this.position.x + seeRange * Math.cos(this.angle),
                        y: this.position.y + seeRange * Math.sin(this.angle)
                    };
                    vertexCollision(this.position, look, map);
                    vertexCollision(this.position, look, body);
                    vertexCollision(this.position, look, [player]);
                    // hitting player
                    if (best.who === player) {
                        dmg = 0.006 * game.dmgScale;
                        mech.damage(dmg);
                        //draw damage
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(best.x, best.y, dmg * 2000, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                    //draw beam
                    if (best.dist2 === Infinity) {
                        best = look;
                    }
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(best.x, best.y);
					ctx.strokeStyle = "#f00"; // Purple path
					ctx.lineWidth=1;
					ctx.setLineDash([50+120 * Math.random(), 50 * Math.random()]);
                    ctx.stroke(); // Draw it
					ctx.setLineDash([0, 0]);
                }
            },
            searchSpring: function() {
                ctx.beginPath();
                ctx.arc(this.cons.pointA.x, this.cons.pointA.y, 6, 0, 2 * Math.PI);
                ctx.arc(this.cons2.pointA.x, this.cons2.pointA.y, 6, 0, 2 * Math.PI);
                // ctx.arc(this.cons.bodyB.position.x, this.cons.bodyB.position.y,6,0,2*Math.PI);
                ctx.fillStyle = (ctx.fillStyle = "#222");
                ctx.fill();

                if (!(game.cycle % this.seePlayerFreq)) {
                    if (
                        (this.seePlayer.recall || this.isLookingAtPlayer(this.lookRange)) &&
                        this.distanceToPlayer2() < this.seeAtDistance2 &&
                        Matter.Query.ray(map, this.position, player.position).length === 0 &&
                        Matter.Query.ray(body, this.position, player.position).length === 0
                    ) {
                        this.foundPlayer();
                        if (!(game.cycle % (this.seePlayerFreq * 2))) {
                            this.springTarget.x = this.seePlayer.position.x;
                            this.springTarget.y = this.seePlayer.position.y;
                            this.cons.length = -200;
                            this.cons2.length = 100 + 1.5 * this.radius;
                        } else {
                            this.springTarget2.x = this.seePlayer.position.x;
                            this.springTarget2.y = this.seePlayer.position.y;
                            this.cons.length = 100 + 1.5 * this.radius;
                            this.cons2.length = -200;
                        }
                    } else if (this.seePlayer.recall) {
                        this.lostPlayer();
                    }
                }
                //if you don't recall player location rotate and draw to show where you are looking
                if (!this.seePlayer.recall) {
                    this.torque = this.lookTorque * this.inertia;
                    //draw
                    const range = Math.PI * this.lookRange;
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.radius * 2.5, this.angle - range, this.angle + range);
                    ctx.arc(this.position.x, this.position.y, this.radius * 1.4, this.angle + range, this.angle - range, true);
                    ctx.fillStyle = "rgba(0,0,0,0.07)";
                    ctx.fill();
                    //spring to random place on map
                    const vertexCollision = function(v1, v1End, domain) {
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
                                if (dist2 < best.dist2) {
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
                    };
                    const seeRange = 3000;
                    if (!(game.cycle % (this.seePlayerFreq * 10))) {
                        best = { x: null, y: null, dist2: Infinity, who: null, v1: null, v2: null };
                        const look = {
                            x: this.position.x + seeRange * Math.cos(this.angle),
                            y: this.position.y + seeRange * Math.sin(this.angle)
                        };
                        vertexCollision(this.position, look, map);
                        if (best.dist2 != Infinity) {
                            this.springTarget.x = best.x;
                            this.springTarget.y = best.y;
                            this.cons.length = 100 + 1.5 * this.radius;
                            this.cons2.length = 100 + 1.5 * this.radius;
                        }
                    }
                    if (!((game.cycle + this.seePlayerFreq * 5) % (this.seePlayerFreq * 10))) {
                        best = { x: null, y: null, dist2: Infinity, who: null, v1: null, v2: null };
                        const look = {
                            x: this.position.x + seeRange * Math.cos(this.angle),
                            y: this.position.y + seeRange * Math.sin(this.angle)
                        };
                        vertexCollision(this.position, look, map);
                        if (best.dist2 != Infinity) {
                            this.springTarget2.x = best.x;
                            this.springTarget2.y = best.y;
                            this.cons.length = 100 + 1.5 * this.radius;
                            this.cons2.length = 100 + 1.5 * this.radius;
                        }
                    }
                }
            },
            alertNearByMobs: function() {
                //this.alertRange2 is set at the very bottom of this mobs, after mob is made
                for (let i = 0; i < mob.length; i++) {
                    if (
                        !mob[i].seePlayer.recall &&
                        Matter.Vector.magnitudeSquared(Matter.Vector.sub(this.position, mob[i].position)) < this.alertRange2
                    ) {
                        mob[i].locatePlayer();
                    }
                }
                //add alert to draw queue
                // game.drawList.push({
                //     x: this.position.x,
                //     y: this.position.y,
                //     radius: Math.sqrt(this.alertRange2),
                //     color: "rgba(0,0,0,0.02)",
                //     time: game.drawTime
                // });
            },
            zoom: function() {
                if (game.cycle % this.zoomTotalCycles < this.zoomOnCycles) {
                    if (game.cycle % this.zoomTotalCycles === 0) {
                        this.setupTrail();
                    }
                    this.drawTrail();
                    if (this.seePlayer.recall) {
                        //attraction to player
                        const forceMag = this.accelMag * this.mass;
                        const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
                        this.force.x += forceMag * Math.cos(angle);
                        this.force.y += forceMag * Math.sin(angle);
                    }
                }
            },
            setupTrail: function() {
                this.trail = [];
                for (let i = 0; i < this.trailLength; ++i) {
                    this.trail.push({
                        x: this.position.x,
                        y: this.position.y
                    });
                }
            },
            drawTrail: function() {
                //dont' forget to run setupTrail() after mob spawn
                const t = this.trail;
                const len = t.length;
                t.pop();
                t.unshift({
                    x: this.position.x,
                    y: this.position.y
                });
                //draw
                ctx.strokeStyle = this.trailFill;
                ctx.beginPath();
                // ctx.moveTo(t[0].x, t[0].y);
                // ctx.lineTo(t[0].x, t[0].y);
                // ctx.globalAlpha = 0.2;
                // ctx.lineWidth = this.radius * 3;
                // ctx.stroke();
                ctx.globalAlpha = 0.5 / len;
                ctx.lineWidth = this.radius * 1.95;
                for (let i = 0; i < len; ++i) {
                    // ctx.lineWidth *= 0.96;
                    ctx.lineTo(t[i].x, t[i].y);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            },
            yank: function() {
                //accelerate towards the player
                if (this.cd < game.cycle && this.seePlayer.yes) {
                    this.cd = game.cycle + this.delay;
                    if (Matter.Vector.magnitudeSquared(Matter.Vector.sub(this.position, player.position)) < 1000000) {
                        const angle = Math.atan2(
                            this.seePlayer.position.y - this.position.y,
                            this.seePlayer.position.x - this.position.x
                        );
                        const mag = mech.onGround ? 90 * player.mass * game.g : 70 * player.mass * game.g;
                        player.force.x -= mag * Math.cos(angle);
                        player.force.y -= mag * Math.sin(angle);

                        ctx.beginPath();
                        ctx.moveTo(this.position.x, this.position.y);
                        ctx.lineTo(mech.pos.x, mech.pos.y);
                        ctx.lineWidth = Math.min(60, this.radius * 2);
                        ctx.strokeStyle = "rgba(0,0,0,0.5)";
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                        ctx.fillStyle = "rgba(0,0,0,0.3)";
                        ctx.fill();
                    }
                }
            },
            laser: function() {
                if (game.cycle % 7 && this.seePlayer.yes) {
                    ctx.setLineDash([125 * Math.random(), 125 * Math.random()]);
                    // ctx.lineDashOffset = 6*(game.cycle % 215);
                    const range = 500;
                    if (this.distanceToPlayer() < range) {
                        //if (Math.random()>0.2 && this.seePlayer.yes && this.distanceToPlayer2()<800000) {
                        mech.damage(0.0004 * game.dmgScale);
                        ctx.beginPath();
                        ctx.moveTo(this.position.x, this.position.y);
                        ctx.lineTo(mech.pos.x, mech.pos.y);
                        ctx.lineTo(mech.pos.x + (Math.random() - 0.5) * 3000, mech.pos.y + (Math.random() - 0.5) * 3000);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "rgb(255,0,170)";
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                        ctx.fillStyle = "rgba(255,0,170,0.15)";
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, range * 0.9, 0, 2 * Math.PI);
                    ctx.strokeStyle = "rgba(255,0,170,0.5)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            },
            laserTracking: function() {
                if (this.seePlayer.yes && this.distanceToPlayer2() < 1700000) {
                    //targeting laser will slowly move from the mob to the player's position
                    this.laserPos = Matter.Vector.add(
                        this.laserPos,
                        Matter.Vector.mult(Matter.Vector.sub(player.position, this.laserPos), 0.1)
                    );
                    const targetDist = Matter.Vector.magnitude(Matter.Vector.sub(this.laserPos, mech.pos));
                    let r = 30;

                    // ctx.setLineDash([15, 200]);
                    // ctx.lineDashOffset = 20*(game.cycle % 215);
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    if (targetDist < r) {
                        mech.damage(0.0005 * game.dmgScale);
                        // ctx.setLineDash([150 * Math.random(), 50 * Math.random()]);
                        ctx.setLineDash([50 + 120 * Math.random(), 50 * Math.random()]);
                        ctx.strokeStyle = "rgba(0,0,255,0.7)";
                        ctx.lineWidth = 3;
                        ctx.lineTo(this.laserPos.x, this.laserPos.y);
                        ctx.lineTo(
                            this.laserPos.x + (Math.random() - 0.5) * 3000,
                            this.laserPos.y + (Math.random() - 0.5) * 3000
                        );
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = "rgba(0,0,255,0.6)";
                        ctx.arc(this.laserPos.x, this.laserPos.y, r, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.setLineDash([]);
                    } else {
                        let laserOffR = Matter.Vector.rotateAbout(this.laserPos, (targetDist - r) * 0.002, this.position);
                        let sub = Matter.Vector.normalise(Matter.Vector.sub(laserOffR, this.position));
                        laserOffR = Matter.Vector.add(laserOffR, Matter.Vector.mult(sub, 1300));
                        ctx.lineTo(laserOffR.x, laserOffR.y);

                        let laserOffL = Matter.Vector.rotateAbout(this.laserPos, (targetDist - r) * -0.002, this.position);
                        sub = Matter.Vector.normalise(Matter.Vector.sub(laserOffL, this.position));
                        laserOffL = Matter.Vector.add(laserOffL, Matter.Vector.mult(sub, 1300));
                        ctx.lineTo(laserOffL.x, laserOffL.y);
                        // ctx.fillStyle = "rgba(0,0,255,0.15)";
                        var gradient = ctx.createRadialGradient(
                            this.position.x,
                            this.position.y,
                            0,
                            this.position.x,
                            this.position.y,
                            1300
                        );
                        gradient.addColorStop(0, `rgba(0,0,255,${r * r / (targetDist * targetDist)})`);
                        gradient.addColorStop(1, "transparent");
                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                } else {
                    this.laserPos = this.position;
                }
            },
            darkness: function() {
                // var grd = ctx.createRadialGradient(this.position.x, this.position.y, this.eventHorizon/3, this.position.x, this.position.y, this.eventHorizon);
                // grd.addColorStop(0, "rgba(0,0,0,1)");
                // grd.addColorStop(1, "rgba(0,0,0,0)");
                // ctx.fillStyle=grd;
                // ctx.beginPath();
                // ctx.arc(this.position.x, this.position.y, this.eventHorizon, 0, 2 * Math.PI);
                // ctx.fill();

                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.eventHorizon * 0.33, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0,0,0,1)";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.eventHorizon * 0.66, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.eventHorizon, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.fill();
            },
            blackHole: function() {
                //keep it slow, most to stop issues from explosion knockbacks
                if (this.speed > 5) {
                    Matter.Body.setVelocity(this, {
                        x: this.velocity.x * 0.99,
                        y: this.velocity.y * 0.99
                    });
                }
                if (Matter.Vector.magnitude(Matter.Vector.sub(this.position, player.position)) < this.eventHorizon) {
                    const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
                    player.force.x -= 1.3 * Math.cos(angle) * (mech.onGround ? 2 * player.mass * game.g : player.mass * game.g);
                    player.force.y -= 0.96 * player.mass * game.g * Math.sin(angle);

                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(mech.pos.x, mech.pos.y);
                    ctx.lineWidth = Math.min(60, this.radius * 2);
                    ctx.strokeStyle = "rgba(0,0,0,0.5)";
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0,0,0,0.3)";
                    ctx.fill();
                }
            },
            pullPlayer: function() {
                if (
                    this.seePlayer.yes &&
                    Matter.Vector.magnitudeSquared(Matter.Vector.sub(this.position, player.position)) < 1000000
                ) {
                    const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
                    player.force.x -= 1.3 * Math.cos(angle) * (mech.onGround ? 2 * player.mass * game.g : player.mass * game.g);
                    player.force.y -= 0.97 * player.mass * game.g * Math.sin(angle);

                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(mech.pos.x, mech.pos.y);
                    ctx.lineWidth = Math.min(60, this.radius * 2);
                    ctx.strokeStyle = "rgba(0,0,0,0.5)";
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(mech.pos.x, mech.pos.y, 40, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0,0,0,0.3)";
                    ctx.fill();
                }
            },
            repelBullets: function() {
                if (this.seePlayer.yes) {
                    ctx.lineWidth = "8";
                    ctx.strokeStyle = this.fill;
                    ctx.beginPath();
                    for (let i = 0, len = bullet.length; i < len; ++i) {
                        const dx = bullet[i].position.x - this.position.x;
                        const dy = bullet[i].position.y - this.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 500) {
                            ctx.moveTo(this.position.x, this.position.y);
                            ctx.lineTo(bullet[i].position.x, bullet[i].position.y);
                            const angle = Math.atan2(dy, dx);
                            const mag = 1500 * bullet[i].mass * game.g / dist;
                            bullet[i].force.x += mag * Math.cos(angle);
                            bullet[i].force.y += mag * Math.sin(angle);
                        }
                    }
                    ctx.stroke();
                }
            },
            attraction: function() {
                //accelerate towards the player
                if (this.seePlayer.recall) {
                    // && dx * dx + dy * dy < 2000000) {
                    const forceMag = this.accelMag * this.mass;
                    const angle = Math.atan2(
                        this.seePlayer.position.y - this.position.y,
                        this.seePlayer.position.x - this.position.x
                    );
                    this.force.x += forceMag * Math.cos(angle);
                    this.force.y += forceMag * Math.sin(angle);
                }
            },
            repulsionRange: 500000,
            repulsion: function() {
                //accelerate towards the player
                if (this.seePlayer.recall && this.distanceToPlayer2() < this.repulsionRange) {
                    // && dx * dx + dy * dy < 2000000) {
                    const forceMag = this.accelMag * this.mass;
                    const angle = Math.atan2(
                        this.seePlayer.position.y - this.position.y,
                        this.seePlayer.position.x - this.position.x
                    );
                    this.force.x -= 2 * forceMag * Math.cos(angle);
                    this.force.y -= 2 * forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
                }
            },
            burstAttraction: function() {
                //accelerate towards the player after a delay
                if (this.seePlayer.recall) {
                    if (this.cdBurst2 < game.cycle && this.angularSpeed < 0.01) {
                        this.cdBurst2 = Infinity;
                        this.cdBurst1 = game.cycle + 60;
                        this.burstDir = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                    } else if (this.cdBurst1 < game.cycle) {
                        this.cdBurst2 = game.cycle + this.delay;
                        this.cdBurst1 = Infinity;
                        this.force = Matter.Vector.mult(this.burstDir, this.mass * 0.25);
                        // const forceMag = (this.accelMag + this.accelMag * Math.random()) * this.mass;
                        // const angle = Math.atan2(
                        //     this.seePlayer.position.y - this.position.y,
                        //     this.seePlayer.position.x - this.position.x
                        // );
                        // this.force.x += forceMag * Math.cos(angle);
                        // this.force.y += forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
                    } else if (this.cdBurst1 != Infinity) {
                        this.torque += 0.000035 * this.inertia;
                        //draw attack vector
                        const mag = this.radius * 2 + 200;
                        const gradient = ctx.createRadialGradient(
                            this.position.x,
                            this.position.y,
                            0,
                            this.position.x,
                            this.position.y,
                            mag
                        );
                        gradient.addColorStop(0, "rgba(0,0,0,0.2)");
                        gradient.addColorStop(1, "transparent");
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 5;
                        ctx.setLineDash([10, 20]); //30
                        const dir = Matter.Vector.add(this.position, Matter.Vector.mult(this.burstDir, mag));
                        ctx.beginPath();
                        ctx.moveTo(this.position.x, this.position.y);
                        ctx.lineTo(dir.x, dir.y);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                } else {
                    this.cdBurst2 = 0;
                }
            },
            hop: function() {
                //accelerate towards the player after a delay
                if (this.cd < game.cycle && this.seePlayer.recall && this.speed < 1) {
                    this.cd = game.cycle + this.delay;
                    const forceMag = (this.accelMag + this.accelMag * Math.random()) * this.mass;
                    const angle = Math.atan2(
                        this.seePlayer.position.y - this.position.y,
                        this.seePlayer.position.x - this.position.x
                    );
                    this.force.x += forceMag * Math.cos(angle);
                    this.force.y += forceMag * Math.sin(angle) - 0.04 * this.mass; //antigravity
                }
            },
            grow: function() {
                if (this.seePlayer.recall) {
                    if (this.radius < 100) {
                        const scale = 1.03;
                        Matter.Body.scale(this, scale, scale);
                        this.radius *= scale;
                        // this.torque = -0.00002 * this.inertia;
                        this.fill = `hsl(144, ${this.radius}%, 50%)`;
                    }
                } else {
                    if (this.radius > 15) {
                        const scale = 0.99;
                        Matter.Body.scale(this, scale, scale);
                        this.radius *= scale;
                        this.fill = `hsl(144, ${this.radius}%, 50%)`;
                    }
                }
            },
            search: function() {
                //be sure to declare searchTarget in mob spawn
                //accelerate towards the searchTarget
                if (!this.seePlayer.recall) {
                    const newTarget = function(that) {
                        if (Math.random() < 0.05) {
                            that.searchTarget = player.position; //chance to target player
                        } else {
                            //target random body
                            that.searchTarget = map[Math.floor(Math.random() * (map.length - 1))].position;
                        }
                    };

                    const sub = Matter.Vector.sub(this.searchTarget, this.position);
                    if (Matter.Vector.magnitude(sub) > this.radius * 2) {
                        // ctx.beginPath();
                        // ctx.strokeStyle = "#aaa";
                        // ctx.moveTo(this.position.x, this.position.y);
                        // ctx.lineTo(this.searchTarget.x,this.searchTarget.y);
                        // ctx.stroke();
                        //accelerate at 0.1 of normal accleration
                        this.force = Matter.Vector.mult(Matter.Vector.normalise(sub), this.accelMag * this.mass * 0.2);
                    } else {
                        //after reaching random target switch to new target
                        newTarget(this);
                    }
                    //switch to a new target after a while
                    if (!(game.cycle % (this.seePlayerFreq * 15))) {
                        newTarget(this);
                    }
                }
            },
            strike: function() {
                //teleport to player when close enough on CD
                if (this.seePlayer.recall && this.cd < game.cycle) {
                    const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                    const distMag = Matter.Vector.magnitude(dist);
                    if (distMag < 430) {
                        this.cd = game.cycle + this.delay;
                        ctx.beginPath();
                        ctx.moveTo(this.position.x, this.position.y);
                        Matter.Body.translate(this, Matter.Vector.mult(Matter.Vector.normalise(dist), distMag - 20 - radius));
                        ctx.lineTo(this.position.x, this.position.y);
                        ctx.lineWidth = radius * 2;
                        ctx.strokeStyle = this.fill; //"rgba(0,0,0,0.5)"; //'#000'
                        ctx.stroke();
                    }
                }
            },
            blink: function() {
                //teleport towards player as a way to move
                if (this.seePlayer.recall && !(game.cycle % this.blinkRate)) {
                    // && !mech.lookingAtMob(this,0.5)){
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
            drift: function() {
                //teleport towards player as a way to move
                if (this.seePlayer.recall && !(game.cycle % this.blinkRate)) {
                    // && !mech.lookingAtMob(this,0.5)){
                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    const dist = Matter.Vector.sub(this.seePlayer.position, this.position);
                    const distMag = Matter.Vector.magnitude(dist);
                    const vector = Matter.Vector.mult(Matter.Vector.normalise(dist), this.blinkLength);
                    if (distMag < this.blinkLength) {
                        Matter.Body.setPosition(this, this.seePlayer.position);
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
                    ctx.strokeStyle = this.fill;
                    ctx.stroke();
                }
            },
            phase: function() {
                if (!(game.cycle % this.phaseRate)) {
                    if (this.phasedOut) {
                        this.phasedOut = false;
                        this.do = ["phase", "healthBar", "seePlayerCheck", "attraction", "gravity"];
                        this.collisionFilter.mask = 0x001101; //make mob hittable by bullets again
                        this.fill = "rgb(110,150,200)";
                        if (this.distanceToPlayer2() < 1000) {
                            this.locatePlayer();
                        }
                    } else {
                        this.phasedOut = true;
                        this.do = ["phase"];
                        this.collisionFilter.mask = 0x000001; //make mob unhittable by bullets again
                        // this.fill = "transparent";
                        this.fill = "rgba(110,150,200,0.2)";
                        this.stroke = "transparent";
                    }
                }
            },
            phaseIn: function() {
                if (this.distanceToPlayer2() < this.phaseRange2) {
                    this.do = ["phaseOut", "healthBar", "locatePlayerByDist", "attraction", "gravity"];
                    this.collisionFilter.mask = 0x001101; //make mob hittable by bullets again
                    this.fill = "rgb(110,150,255)";
                    this.stroke = "#000";
                }
            },
            phaseOut: function() {
                if (this.distanceToPlayer2() > this.phaseRange2) {
                    this.do = ["phaseIn", "locatePlayerByDist", "attraction", "gravity"];
                    this.collisionFilter.mask = 0x000001; //make mob unhittable by bullets again
                    // this.fill = "transparent";
                    this.fill = "rgba(110,150,255,0.17)";
                    this.stroke = "transparent";
                }
            },
            sneakAttack: function() {
                //speeds towards player when player isn't looking on CD
                if (
                    this.cd < game.cycle &&
                    !mech.lookingAtMob(this, 0.5) &&
                    Matter.Vector.magnitudeSquared(Matter.Vector.sub(this.position, player.position)) > 100000
                ) {
                    this.seePlayerCheck();
                    if (this.seePlayer.yes) {
                        this.cd = game.cycle + 120;
                        const mag = 0.08;
                        const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                        this.force.x += Matter.Vector.mult(unitVector, mag * this.mass).x;
                        this.force.y += Matter.Vector.mult(unitVector, mag * this.mass).y;
                        this.do = ["healthBar", "gravity", "seePlayerCheck", "attraction", "hide"];
                        this.collisionFilter.mask = 0x001101; //make mob hittable by bullets again
                        this.fill = "rgb(120,190,210)";
                        this.stroke = "#000";
                    } else {
                        this.stroke = "transparent";
                    }
                }
            },
            hide: function() {
                //reverts back to sneakattack mode when can't recall the player's position anymore
                if (!this.seePlayer.recall) {
                    this.seePlayerCheck(); //gets the stroke collor back to normal
                    this.do = ["gravity", "sneakAttack"];
                    this.collisionFilter.mask = 0x000001; //make mob unhittable by bullets again
                    this.fill = "rgba(120,190,210,0.08)";
                    this.stroke = "transparent";
                }
            },
            // toss: function() {
            //     //throw a mob/bullet at player
            //     if (!(game.cycle % this.tossFreq) && this.seePlayer.recall) {
            //         //this.seePlayer.yes) {
            //         spawn.toss(this.position.x, this.position.y);
            //         // const x = (this.seePlayer.position.x - this.position.x)
            //         // const y = (this.seePlayer.position.y - this.position.y)
            // 		const x = 100//(player.position.x - this.position.x)
            // 		const y = 10//(player.position.y - this.position.y)
            //         const v = 15;
            //         const g = -0.001*60;
            //         const root = v * v * v * v - g * (g * x * x + 2 * y * v * v);
            //         if (root > 0) {
            // 			//let a = Math.atan2((v * v + Math.sqrt(root)) , (g * x));
            // 			let a = Math.atan((v * v + Math.sqrt(root)) / (g * x));
            // 			if (x < 0){
            // 				a -= Math.PI
            // 			}
            // 			1(a*180/Math.PI);
            //             Matter.Body.setVelocity(mob[mob.length - 1], {
            //                 x: v * Math.cos(a),
            //                 y: v * Math.sin(a)
            //             });
            //         }
            //     }
            // },
            fire: function() {
                //throw a mob/bullet at player
                if (!(game.cycle % this.fireFreq) && this.seePlayer.recall) {
                    const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                    unitVector.y -= Math.abs(this.seePlayer.position.x - this.position.x) / 1600; //gives the bullet an arc
                    spawn.bullet(this.position.x, this.position.y, 5 + Math.ceil(this.radius / 15));
                    const v = 15;
                    Matter.Body.setVelocity(mob[mob.length - 1], {
                        x: this.velocity.x + unitVector.x * v,
                        y: this.velocity.y + unitVector.y * v
                    });
                    if (this.facePlayer) {
                        Matter.Body.setAngle(this, Math.atan2(unitVector.y, unitVector.x));
                        Matter.Body.setAngularVelocity(this, 0);
                    }
                }
            },
            facePlayer: function() {
                const unitVector = Matter.Vector.normalise(Matter.Vector.sub(this.seePlayer.position, this.position));
                const angle = Math.atan2(unitVector.y, unitVector.x);
                Matter.Body.setAngle(this, angle - Math.PI);
            },
            explode: function() {
                mech.damage(0.1 * Math.sqrt(this.mass) * game.dmgScale);
                game.drawList.push({
                    //add dmg to draw queue
                    x: mech.pos.x,
                    y: mech.pos.y,
                    radius: 80 * Math.sqrt(this.mass),
                    color: "rgba(255,0,0,0.25)",
                    time: 5
                });
                this.death(false); //death with no power up
            },
            timeLimit: function() {
                this.timeLeft--;
                if (this.timeLeft < 0) {
                    this.death(false); //death with no power up
                }
            },
            healthBar: function() {
                //draw health bar
                if (this.seePlayer.recall) {
                    // && this.health < 1
                    const h = this.radius * 0.3;
                    const w = this.radius * 2;
                    const x = this.position.x - w / 2;
                    const y = this.position.y - w * 0.7;
                    ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = "rgba(255,0,0,0.7)";
                    ctx.fillRect(x, y, w * this.health, h);
                }
            },
            damage: function(dmg) {
                this.health -= dmg / Math.sqrt(this.mass);
                //this.fill = this.color + this.health + ')';
                if (this.health < 0.1) this.death();
                this.onDamage(this); //custom damage effects
            },
            onDamage: function() {
                // a placeholder for custom effects on mob damage
                //to use delare custon method in mob spawn
            },
            onDeath: function() {
                // a placeholder for custom effects on mob death
                //to use delare custon method in mob spawn
            },
            deadCount: 0.2,
            death: function(powerUp = true) {
                this.onDeath(this); //custom death effects
                if (powerUp && !this.noPowerUp) powerUps.spawnRandomPowerUp(this.position.x, this.position.y, this.mass, radius);
                this.alive = false;
                this.seePlayer.recall = 0;
                this.frictionAir = 0.005;
                this.restitution = 0;
                this.fill = "rgba(0,0,0,0)";
                this.collisionFilter.category = 0x000010;
                if (this.collisionFilter.mask === 0x001100) {
                    this.collisionFilter.mask = 0x000000;
                } else {
                    this.collisionFilter.mask = 0x000001;
                }
                if (this.isStatic) {
                    Matter.Body.setMass(this, 1);
                    Matter.Body.setStatic(this, false);
                }
                if (this.isSleeping) {
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    Matter.Sleeping.set(this, false);
                }
                this.removeConsBB();
            },
            removeConsBB: function() {
                for (let i = 0, len = consBB.length; i < len; ++i) {
                    if (consBB[i].bodyA === this) {
                        if (consBB[i].bodyB.shield) {
                            consBB[i].bodyB.do = ["death"]; //delayed death to avoid issues with splice
                        }
                        consBB[i].bodyA = consBB[i].bodyB;
                        consBB.splice(i, 1);
                        this.removeConsBB();
                        break;
                    } else if (consBB[i].bodyB === this) {
                        if (consBB[i].bodyA.shield) {
                            consBB[i].bodyA.do = ["death"]; //delayed death to avoid issues with splice
                        }
                        consBB[i].bodyB = consBB[i].bodyA;
                        consBB.splice(i, 1);
                        this.removeConsBB();
                        break;
                    }
                }
            },
            removeCons: function() {
                for (let i = 0, len = cons.length; i < len; ++i) {
                    if (cons[i].bodyA === this) {
                        cons[i].bodyA = cons[i].bodyB;
                        cons.splice(i, 1);
                        this.removeCons();
                        break;
                    } else if (cons[i].bodyB === this) {
                        cons[i].bodyB = cons[i].bodyA;
                        cons.splice(i, 1);
                        this.removeCons();
                        break;
                    }
                }
            },
            deadCounting: function(i) {
                this.deadCount -= 0.0002;
                this.stroke = "rgba(0,0,0," + this.deadCount + ")"; //fade away
                if (this.deadCount < 0) {
                    Matter.World.remove(engine.world, this);
                    mob.splice(i, 1);
                }
            }
        });
        mob[i].alertRange2 = Math.pow(mob[i].radius * 3 + 200, 2);
        World.add(engine.world, mob[i]); //add to world
    }
};
