let bullet = [];

const b = {
    dmgScale: 1, //scales all gun damage from momentum, but not raw .dmg
    gravity: 0.0006, //most other bodies have   gravity = 0.001
    activeGun: 0, //current gun in use by player
    inventory: [0], //list of what guns player has  // 0 starts with basic gun
    // findGunInInventory: function() {
    //     for (let i = 0, len = b.inventory.length; i < len; ++i) {
    //         if (b.inventory[i] === b.activeGun) return i;
    //     }
    // },
    fireProps: function(cd, speed, dir, me) {
        mech.fireCDcycle = game.cycle + cd; //cooldown
        Matter.Body.setVelocity(bullet[me], {
            x: mech.Vx / 2 + speed * Math.cos(dir),
            y: mech.Vy / 2 + speed * Math.sin(dir)
        });
        World.add(engine.world, bullet[me]); //add bullet to world
    },
    fireAttributes: function(dir) {
        return {
            // density: 0.0015,			//frictionAir: 0.01,			//restitution: 0,
            angle: dir,
            friction: 0.5,
            frictionAir: 0,
            dmg: 0, //damage done in addition to the damage from momentum
            classType: "bullet",
            collisionFilter: {
                category: 0x000100,
                mask: 0x000001 //mask: 0x000101,  //for self collision
            },
            minDmgSpeed: 10,
            onDmg: function() {}, //this.endCycle = 0  //triggers despawn
            onEnd: function() {}
        };
    },
    explode: function(me) {
        //  typically explode is used as some bullets are .onEnd
        playSound("boom");
        game.drawList.push({
            //add dmg to draw queue
            x: bullet[me].position.x,
            y: bullet[me].position.y,
            radius: bullet[me].explodeRad,
            color: "rgba(255,0,0,0.4)",
            time: game.drawTime
        });
        let dist, sub, knock;
        const dmg = b.dmgScale * bullet[me].explodeRad * 0.01;
        //knock back body in range
        for (let i = 0, len = body.length; i < len; ++i) {
            sub = Matter.Vector.sub(bullet[me].position, body[i].position);
            dist = Matter.Vector.magnitude(sub);
            if (dist < bullet[me].explodeRad) {
                //add knockback for mobs
                knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -Math.sqrt(dmg) * body[i].mass / 10);
                body[i].force.x += knock.x;
                body[i].force.y += knock.y;
            }
        }
        //power up knockbacks
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            sub = Matter.Vector.sub(bullet[me].position, powerUp[i].position);
            dist = Matter.Vector.magnitude(sub);
            if (dist < bullet[me].explodeRad) {
                //add knockback for mobs
                knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -Math.sqrt(dmg) * powerUp[i].mass / 10);
                powerUp[i].force.x += knock.x;
                powerUp[i].force.y += knock.y;
            }
        }
        //destroy all bullets in range
        // for (let i = 0, len = bullet.length; i < len; ++i) {
        //     if (me != i) {
        //         sub = Matter.Vector.sub(bullet[me].position, bullet[i].position);
        //         dist = Matter.Vector.magnitude(sub);
        //         if (dist < bullet[me].explodeRad) {
        //             bullet[i].endCycle = game.cycle;
        //         }
        //     }
        // }
        const alertRange2 = Math.pow(300 + bullet[me].explodeRad * 1.3, 2); //alert range
        // game.drawList.push({
        //     //add alert to draw queue
        //     x: bullet[me].position.x,
        //     y: bullet[me].position.y,
        //     radius: Math.sqrt(alertRange2),
        //     color: "rgba(0,0,0,0.02)",
        //     time: game.drawTime
        // });
        for (let i = 0, len = mob.length; i < len; ++i) {
            if (mob[i].alive) {
                sub = Matter.Vector.sub(bullet[me].position, mob[i].position);
                dist = Matter.Vector.magnitude(sub);
                if (dist < bullet[me].explodeRad) {
                    mob[i].damage(dmg);
                    mob[i].locatePlayer();
                    //add knockback for mobs
                    knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -Math.sqrt(dmg) * mob[i].mass / 10);
                    mob[i].force.x += knock.x;
                    mob[i].force.y += knock.y;
                } else if (
                    !mob[i].seePlayer.recall &&
                    Matter.Vector.magnitudeSquared(Matter.Vector.sub(bullet[me].position, mob[i].position)) < alertRange2
                ) {
                    mob[i].locatePlayer();
                }
            }
        }
        //damage and knock back player in range
        sub = Matter.Vector.sub(bullet[me].position, player.position);
        dist = Matter.Vector.magnitude(sub);
        if (dist < bullet[me].explodeRad) {
            mech.damage(bullet[me].explodeRad * 0.0005);
            knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -Math.sqrt(dmg) * player.mass / 40);
            player.force.x += knock.x;
            player.force.y += knock.y;
        }
    },
    guns: [
        {
            name: "throw",
            ammo: Infinity,
            ammoPack: Infinity,
            have: true,
            fire: function() {}
        },
		// {
        //     name: "maneuver gear",
        //     ammo: Infinity,
        //     ammoPack: Infinity,
        //     have: true,
        //     fire: function() {
		// 		mech.fireCDcycle = game.cycle + 30; //cooldown
		// 		//constraint
		// 		const i = cons.length
		// 		cons[i] = Constraint.create({
		// 			pointA: {x:200,y:-1000},
		// 			bodyB: player,
		// 			// pointB: {x:0,y:-100},
		// 			stiffness: 0.001,
		// 			// length: 0
		// 		});
		// 		cons[i].pointB = {x:0,y:-100}
		// 		cons[i].length = 0
		//
		// 		World.add(engine.world, cons[i]);
        //     }
        // },
        // {
        // 	name: "basic",
        // 	ammo: Infinity,
        // 	ammoPack: Infinity,
        // 	have: true,
        // 	fire: function() {
        // 		const me = bullet.length;
        // 		playSound("snare2");
        // 		const dir = (Math.random() - 0.5) * 0.09 + mech.angle;
        // 		bullet[me] = Bodies.rectangle(
        // 			mech.pos.x + 30 * Math.cos(mech.angle),
        // 			mech.pos.y + 30 * Math.sin(mech.angle),
        // 			18,
        // 			6,
        // 			b.fireAttributes(dir)
        // 		);
        // 		b.fireProps(20, 36, dir, me); //cd , speed
        // 		bullet[me].endCycle = game.cycle + 180;
        // 		bullet[me].frictionAir = 0.01;
        // 		bullet[me].do = function() {
        // 			this.force.y += this.mass * 0.001;
        // 		};
        // 	}
        // },
        {
            name: "laser",
            ammo: 0,
            ammoPack: 200,
            have: false,
            fire: function() {
				//mech.fireCDcycle = game.cycle + 1
				let best
				const color = '#f00'
				const range = 3000;
				const path = [
					{ x: mech.pos.x + 20 * Math.cos(mech.angle), y: mech.pos.y + 20 * Math.sin(mech.angle) },
					{ x: mech.pos.x + range * Math.cos(mech.angle), y: mech.pos.y + range * Math.sin(mech.angle) }
				];
                const vertexCollision = function(v1, v1End, domain) {
                    for (let i = 0; i < domain.length; ++i) {
                        let vertices = domain[i].vertices;
                        const len = vertices.length - 1;
                        for (let j = 0; j < len; j++) {
                            results = game.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
                            if (results.onLine1 && results.onLine2){
								const dx = v1.x - results.x;
								const dy = v1.y - results.y;
								const dist2 = dx * dx + dy * dy;
								if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive) ){
									best = { x: results.x, y: results.y, dist2: dist2, who: domain[i], v1:vertices[j], v2:vertices[j+1]};
								}
							}
                        }
                        results = game.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
						if (results.onLine1 && results.onLine2){
							const dx = v1.x - results.x;
							const dy = v1.y - results.y;
							const dist2 = dx * dx + dy * dy;
							if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive) ){
								best = { x: results.x, y: results.y, dist2: dist2, who: domain[i], v1:vertices[0], v2:vertices[len]};
							}
						}
                    }
                };
				const checkforCollisions = function(){
					best = { x: null, y: null, dist2: Infinity, who: null, v1:null, v2:null};
	                vertexCollision(path[path.length - 2], path[path.length - 1], mob);
	                vertexCollision(path[path.length - 2], path[path.length - 1], map);
	                vertexCollision(path[path.length - 2], path[path.length - 1], body);
				}
				const laserHitMob = function(dmg){
					if (best.who.alive) {
						dmg *= b.dmgScale * 0.07;
						best.who.damage(dmg);
						best.who.locatePlayer();
						//draw mob damage circle
						ctx.fillStyle = color;
						ctx.beginPath();
						ctx.arc(path[path.length-1].x, path[path.length-1].y, Math.sqrt(dmg) * 60, 0, 2 * Math.PI);
						ctx.fill();


					}
				}

				const reflection = function(){
					// https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
					const n = Matter.Vector.perp( Matter.Vector.normalise(Matter.Vector.sub(best.v1, best.v2)) )
					const d = Matter.Vector.sub(path[path.length - 1], path[path.length - 2])
					const nn = Matter.Vector.mult(n, 2*Matter.Vector.dot(d, n) )
					const r = Matter.Vector.normalise(Matter.Vector.sub(d, nn))
					path[path.length] = Matter.Vector.add(Matter.Vector.mult(r, range),path[path.length - 1])
				}
				//beam before reflection
				checkforCollisions()
                if (best.dist2 != Infinity) { //if hitting something
					path[path.length - 1] = { x: best.x, y: best.y };
                    laserHitMob(1)

					//1st reflection beam
					reflection()
					//ugly bug fix: this stops the reflection on a bug where the beam gets trapped inside a body
					let who = best.who
					checkforCollisions()
	                if (best.dist2 != Infinity) { //if hitting something
						path[path.length - 1] = { x: best.x, y: best.y };
						laserHitMob(0.8)

						//2nd reflection beam
						//ugly bug fix: this stops the reflection on a bug where the beam gets trapped inside a body
						if (who !== best.who){
							reflection()
							checkforCollisions()
							if (best.dist2 != Infinity) { //if hitting something
								path[path.length - 1] = { x: best.x, y: best.y };
								laserHitMob(0.6)
							}
						}
	                }
                }
                //draw the laser path
				// ctx.strokeStyle = "#f00";
				// ctx.lineWidth = 2;
				// ctx.setLineDash([Math.ceil(120 * Math.random()), Math.ceil(120 * Math.random())]);
				// ctx.beginPath();
				// ctx.moveTo(path[0].x, path[0].y);
				// for (let i = 1, len = path.length; i < len; ++i) {
				// 	ctx.lineTo(path[i].x, path[i].y);
				// }
				// ctx.stroke();
				// ctx.setLineDash([0, 0]);
				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.setLineDash([50+120 * Math.random(), 50 * Math.random()]);
                for (let i = 1, len = path.length; i < len; ++i) {
					ctx.beginPath();
					ctx.moveTo(path[i-1].x, path[i-1].y);
                    ctx.lineTo(path[i].x, path[i].y);
					ctx.stroke();
					ctx.globalAlpha *= 0.6;
					// ctx.beginPath();
					// ctx.arc(path[i].x, path[i].y, 5, 0, 2 * Math.PI);
					// ctx.fill();
                }
				ctx.setLineDash([0, 0]);
				ctx.globalAlpha=1;
            }
        },
        {
            name: "rapid fire",
            ammo: 0,
            ammoPack: 40,
            have: false,
            fire: function() {
                const me = bullet.length;
                playSound("snare2");
                if (Math.random() > 0.2) mobs.alert(500);
                const dir = (Math.random() - 0.5) * 0.15 + mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 30 * Math.cos(mech.angle),
                    mech.pos.y + 30 * Math.sin(mech.angle),
                    17,
                    5,
                    b.fireAttributes(dir)
                );
                b.fireProps(5, 38, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 60;
                bullet[me].frictionAir = 0.01;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.001;
                };
            }
        },
        {
            name: "spray",
            ammo: 0,
            ammoPack: 4,
            have: false,
            fire: function() {
                playSound("snare2");
                mobs.alert(650);
                for (let i = 0; i < 9; i++) {
                    const me = bullet.length;
                    const dir = (Math.random() - 0.5) * 0.6 + mech.angle;
                    bullet[me] = Bodies.rectangle(
                        mech.pos.x + 30 * Math.cos(mech.angle),
                        mech.pos.y + 30 * Math.sin(mech.angle),
                        11,
                        11,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(30, 36 + Math.random() * 11, dir, me); //cd , speed
                    bullet[me].endCycle = game.cycle + 60;
                    bullet[me].frictionAir = 0.02;
                    bullet[me].do = function() {
                        this.force.y += this.mass * 0.001;
                    };
                }
            }
        },
        {
            name: "needles",
            ammo: 0,
            ammoPack: 9,
            have: false,
            fire: function() {
                const me = bullet.length;
                playSound("snare2");
                const dir = mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 40 * Math.cos(mech.angle),
                    mech.pos.y + 40 * Math.sin(mech.angle),
                    31,
                    2,
                    b.fireAttributes(dir)
                );
                b.fireProps(20, 45, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].dmg = 1;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0002;
                };
            }
        },
        // {
        //     name: "missile",
        //     ammo: 0,
        //     ammoPack: 2,
        //     have: false,
        //     fire: function() {
        //         let dir = mech.angle;
        //         const me = bullet.length;
        //         bullet[me] = Bodies.rectangle(
        //             mech.pos.x + 50 * Math.cos(mech.angle),
        //             mech.pos.y + 50 * Math.sin(mech.angle),
        //             60,
        //             9,
        //             b.fireAttributes(dir)
        //         );
        //         //Matter.Body.setAngularVelocity(bullet[me], (Math.random()-0.5)*0.04)
        //         b.fireProps(30, 1, dir, me); //cd , speed
        //         bullet[me].collisionFilter.mask = 0x000101; //for self collision
        //         bullet[me].frictionAir = 0.05;
        //         bullet[me].minDmgSpeed = 0;
        //         bullet[me].endCycle = game.cycle + 360;
        //         bullet[me].explodeRad = 250;
        //         bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
        //         bullet[me].onDmg = function() {
        //             this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
        //         };
        //         bullet[me].close = undefined;
        //         bullet[me].lookFrequency = Math.floor(20 + Math.random() * 10);
        //         bullet[me].do = function() {
        //             if (!(game.cycle % this.lookFrequency)) {
        //                 this.close = null;
        //                 let closeDist = Infinity;
        //                 for (let i = 0, len = mob.length; i < len; ++i) {
        //                     if (
        //                         mob[i].alive &&
        //                         Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
        //                         Matter.Query.ray(body, this.position, mob[i].position).length === 0
        //                     ) {
        //                         const dist = Matter.Vector.magnitude(Matter.Vector.sub(this.position, mob[i].position));
        //                         if (dist < closeDist) {
        //                             this.close = mob[i].position;
        //                             closeDist = dist;
        //                         }
        //                     }
        //                 }
        //                 if (this.close) {
        //                     //just blow up if you get close enough
        //                     if (closeDist < this.explodeRad) {
        //                         this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
        //                     }
        //                 }
        //             }
        //             //accelerate in direction bullet is facing
        //             const dir = this.angle; // + (Math.random() - 0.5);
        //             this.force.x += Math.cos(dir) * 0.002;
        //             this.force.y += Math.sin(dir) * 0.002;
        //             //draw rocket
        //             ctx.beginPath();
        //             ctx.arc(
        //                 this.position.x - Math.cos(this.angle) * 46 + (Math.random() - 0.5) * 4,
        //                 this.position.y - Math.sin(this.angle) * 46 + (Math.random() - 0.5) * 4,
        //                 16,
        //                 0,
        //                 2 * Math.PI
        //             );
        //             ctx.fillStyle = "rgba(255,155,0,0.5)";
        //             ctx.fill();
        //             if (this.close) {
        //                 //show targeting
        //                 // ctx.beginPath();
        //                 // ctx.moveTo(this.position.x, this.position.y);
        //                 // ctx.lineTo(this.close.x, this.close.y);
        //                 // ctx.strokeStyle = "#2f6";
        //                 // ctx.stroke();
        //                 //rotate missile towards the target
        //                 const face = {
        //                     x: Math.cos(this.angle),
        //                     y: Math.sin(this.angle)
        //                 };
        //                 const target = Matter.Vector.normalise(Matter.Vector.sub(this.position, this.close));
        //                 if (Matter.Vector.dot(target, face) > -0.98) {
        //                     if (Matter.Vector.cross(target, face) > 0) {
        //                         Matter.Body.rotate(this, 0.09);
        //                     } else {
        //                         Matter.Body.rotate(this, -0.09);
        //                     }
        //                 }
        //             }
        //         };
        //     }
        // },
        {
            name: "missiles",
            ammo: 0,
            ammoPack: 2,
            have: false,
            fire: function() {
                playSound("snare2");
                const twist = 0.05 + Math.random() * 0.05;
                let dir = mech.angle - twist * 2;
                //let rotation = 0.02;
                let speed = -15;
                for (let i = 0; i < 3; i++) {
                    dir += twist;
                    const me = bullet.length;
                    bullet[me] = Bodies.rectangle(mech.pos.x, mech.pos.y, 30, 4, b.fireAttributes(dir));
                    //rotation -= 0.01;
                    //Matter.Body.setAngularVelocity(bullet[me], rotation);
                    b.fireProps(45, speed, dir, me); //cd , speed
                    speed += 9;
                    //bullet[me].collisionFilter.mask = 0x000101; //for self collision
                    bullet[me].frictionAir = 0.04;
                    bullet[me].endCycle = game.cycle + Math.floor(240 + Math.random() * 80);
                    bullet[me].explodeRad = 170;
                    bullet[me].lookFrequency = Math.floor(25 + Math.random() * 15);
                    bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
                    bullet[me].onDmg = function() {
                        this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
                    };
                    bullet[me].do = function() {
                        if (!(game.cycle % this.lookFrequency)) {
                            this.close = null;
                            let closeDist = Infinity;
                            for (let i = 0, len = mob.length; i < len; ++i) {
                                if (
                                    mob[i].alive &&
                                    Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                    Matter.Query.ray(body, this.position, mob[i].position).length === 0
                                ) {
                                    const dist = Matter.Vector.magnitude(Matter.Vector.sub(this.position, mob[i].position));
                                    if (dist < closeDist) {
                                        this.close = mob[i].position;
                                        closeDist = dist;
                                    }
                                }
                            }
                            if (this.close) {
                                //just blow up if you get close enough
                                if (closeDist < this.explodeRad * 0.7) {
                                    this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
                                }
                            }
                        }
                        //accelerate in direction bullet is facing
                        const dir = this.angle; // + (Math.random() - 0.5);
                        this.force.x += Math.cos(dir) * 0.00045;
                        this.force.y += Math.sin(dir) * 0.00045;
                        //draw rocket
                        ctx.beginPath();
                        ctx.arc(
                            this.position.x - Math.cos(this.angle) * 27 + (Math.random() - 0.5) * 4,
                            this.position.y - Math.sin(this.angle) * 27 + (Math.random() - 0.5) * 4,
                            11,
                            0,
                            2 * Math.PI
                        );
                        ctx.fillStyle = "rgba(255,155,0,0.5)";
                        ctx.fill();
                        if (this.close) {
                            //show targeting
                            // ctx.beginPath();
                            // ctx.moveTo(this.position.x, this.position.y);
                            // ctx.lineTo(this.close.x, this.close.y);
                            // ctx.strokeStyle = "#2f6";
                            // ctx.stroke();
                            //rotate missile towards the target
                            const face = {
                                x: Math.cos(this.angle),
                                y: Math.sin(this.angle)
                            };
                            const target = Matter.Vector.normalise(Matter.Vector.sub(this.position, this.close));
                            if (Matter.Vector.dot(target, face) > -0.98) {
                                if (Matter.Vector.cross(target, face) > 0) {
                                    Matter.Body.rotate(this, 0.09);
                                } else {
                                    Matter.Body.rotate(this, -0.09);
                                }
                            }
                        }
                    };
                    // bullet[me].do = function() {
                    //     //accelerate in direction bullet is facing
                    //     const dir = this.angle; // + (Math.random()-0.5)
                    //     this.force.x += Math.cos(dir) * 0.0003;
                    //     this.force.y += Math.sin(dir) * 0.0003;
                    //     //draw rocket
                    //     ctx.beginPath();
                    //     ctx.arc(
                    //         this.position.x - Math.cos(this.angle) * 18 + (Math.random() - 0.5) * 4,
                    //         this.position.y - Math.sin(this.angle) * 18 + (Math.random() - 0.5) * 4,
                    //         7,
                    //         0,
                    //         2 * Math.PI
                    //     );
                    //     ctx.fillStyle = "rgba(255,155,0,0.5)";
                    //     ctx.fill();
                    // };
                }
            }
        },
        {
            name: "flak",
            ammo: 0,
            ammoPack: 4,
            have: false,
            fire: function() {
                playSound("snare2");
                let dir = mech.angle - 0.1;
                for (let i = 0; i < 5; i++) {
                    dir += 0.05 + (Math.random() - 0.5) * 0.04;
                    const me = bullet.length;
                    bullet[me] = Bodies.rectangle(
                        mech.pos.x + 50 * Math.cos(mech.angle),
                        mech.pos.y + 50 * Math.sin(mech.angle),
                        17,
                        4,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(25, 32 + (Math.random() - 0.5) * 8, dir, me); //cd , speed
                    //Matter.Body.setDensity(bullet[me], 0.00001);
                    bullet[me].endCycle = game.cycle + 15 + Math.floor(Math.random() * 11);
                    // bullet[me].restitution = 0.2;
                    bullet[me].explodeRad = 90 + (Math.random() - 0.5) * 75;
                    bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
                    bullet[me].onDmg = function() {
                        this.endCycle = 0; //bullet ends cycle after doing damage  //this triggers explosion
                    };
                    bullet[me].do = function() {
                        // this.force.y += this.mass * 0.001
                    };
                }
            }
        },
        {
            name: "grenade",
            ammo: 0,
            ammoPack: 2,
            have: false,
            fire: function() {
                playSound("launcher");
                const me = bullet.length;
                const dir = mech.angle;
                bullet[me] = Bodies.circle(
                    mech.pos.x + 30 * Math.cos(mech.angle),
                    mech.pos.y + 30 * Math.sin(mech.angle),
                    17,
                    b.fireAttributes(dir)
                );
                b.fireProps(40, 28, dir, me); //cd , speed
                Matter.Body.setDensity(bullet[me], 0.000001);
                bullet[me].endCycle = game.cycle + 140;
                bullet[me].restitution = 0.4;
                // bullet[me].frictionAir = 0.01;
                bullet[me].friction = 0.15;
                bullet[me].explodeRad = 350;
                bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
                bullet[me].minDmgSpeed = 1;
                bullet[me].onDmg = function() {
                    this.endCycle = 0; //bullet ends cycle after doing damage  //this triggers explosion
                };
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0015;
                };
            }
        },
        {
            name: "super balls",
            ammo: 0,
            ammoPack: 6,
            have: false,
            fire: function() {
                playSound("snare2");
                mobs.alert(450);
                let dir = mech.angle - 0.05;
                for (let i = 0; i < 3; i++) {
                    dir += 0.05;
                    const me = bullet.length;
                    bullet[me] = Bodies.circle(
                        mech.pos.x + 30 * Math.cos(mech.angle),
                        mech.pos.y + 30 * Math.sin(mech.angle),
                        7,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(20, 30, dir, me); //cd , speed
                    Matter.Body.setDensity(bullet[me], 0.0001);
                    bullet[me].endCycle = game.cycle + 300;
                    bullet[me].dmg = 0.5;
                    bullet[me].minDmgSpeed = 0;
                    bullet[me].restitution = 0.96;
                    bullet[me].friction = 0;
                    bullet[me].do = function() {
                        this.force.y += this.mass * 0.001;
                    };
                }
            }
        },
        {
            name: "one shot",
            ammo: 0,
            ammoPack: 2,
            have: false,
            fire: function() {
                playSound("snare2");
                mobs.alert(800);
                const me = bullet.length;
                const dir = mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 50 * Math.cos(mech.angle),
                    mech.pos.y + 50 * Math.sin(mech.angle),
                    50,
                    17,
                    b.fireAttributes(dir)
                );
                b.fireProps(50, 52, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0005;
                };
            }
        }
    ],
    fire: function() {
        if (game.mouseDown && mech.fireCDcycle < game.cycle) {
            if (b.guns[this.activeGun].ammo > 0) {
                b.guns[this.activeGun].fire();
                b.guns[this.activeGun].ammo--;
                game.updateGunHUD();
            } else {
                mech.fireCDcycle = game.cycle + 30; //cooldown
                game.makeTextLog(
                    "<div style='font-size:150%;'>NO AMMO</div><span class = 'box'>E</span> / <span class = 'box'>Q</span>",
                    80
                );
                playSound("no");
            }
        }
    },
    draw: function() {
        ctx.beginPath();
        let i = bullet.length;
        while (i--) {
            //draw
            let vertices = bullet[i].vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j += 1) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            //remove bullet if at endcycle for that bullet
            if (bullet[i].endCycle < game.cycle) {
                bullet[i].onEnd(i); //some bullets do stuff on end
                if (bullet[i]) {
                    Matter.World.remove(engine.world, bullet[i]);
                    bullet.splice(i, 1);
                } else {
                    break; //if bullet[i] doesn't exist don't complete the for loop, because the game probably reset
                }
            }
        }
        ctx.fillStyle = "#000";
        ctx.fill();
        //do things
        for (let i = 0, len = bullet.length; i < len; i++) {
            bullet[i].do();
        }
    }
};
