//bullets**************************************************************
//*********************************************************************
//*********************************************************************
//*********************************************************************

const bullet = []; //holds all the bullets

function bulletLoop() {
    //fire check
    if (game.mouseDown && mech.fireCDcycle < game.cycle && !game.isPaused) {
        mech.fireCDcycle = game.cycle + guns[mech.gun].fireCD;
        guns[mech.gun].fire();
    }
    //all bullet loop
    ctx.beginPath();
    let i = bullet.length;
    while (i--) {
        //draw body
        let vertices = bullet[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        if (bullet[i].endCycle < game.cycle && !game.isPaused) {
            Matter.World.remove(engine.world, bullet[i]);
            bullet.splice(i, 1);
        }
    }
    ctx.fillStyle = '#000';
    ctx.fill();
}


const guns = { //prototype for each bullet/gun type
    machine: {
        dmg: 0.003,
        fireCD: 2,
        fire: function() {
            const len = bullet.length;
            const dir = (Math.random() - 0.5) * 0.1 + mech.angle
            bullet[len] = Bodies.rectangle(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 7, 3, {
                angle: dir,
                density: 0.001,
				friction: 0.5,
                frictionAir: 0,
                restitution: 0,
                collisionFilter: {
                    group: 0,
                    category: 0x0100,
                    mask: 0x0001,
                },
                endCycle: game.cycle+70,
                classType: 'bullet',
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
			const impulse = 0.002 + 0.0002*Math.random();
            const f = {
                x: impulse * Math.cos(dir) / game.delta,
                y: impulse * Math.sin(dir) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
			//player.force.x -= f.x;			player.force.y -= f.y;
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
    needle: {
        dmg: 0.015,
        fireCD: 20,
        fire: function() {
            const len = bullet.length;
            bullet[len] = Bodies.rectangle(mech.pos.x + 20 * Math.cos(mech.angle), mech.pos.y + 20 * Math.sin(mech.angle), 20, 1, {
                angle: mech.angle,
                density: 0.0000001,
				friction: 1,
				frictionStatic: 1,
                frictionAir: 0,
                restitution: 0.25,
                collisionFilter: {
                    group: 0,
                    category: 0x0100,
                    mask: 0x0001,
                },
                endCycle: game.cycle+400,
                classType: 'bullet',
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
			const impulse = 0.00000033;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
	shot: {
		dmg: 0.005,
		fireCD: 60,
		fire: function() {
			for (let i = 0; i < 12; i++) {
				const len = bullet.length;
				const dir = (Math.random() - 0.5)*0.7 + mech.angle
				bullet[len] = Bodies.polygon(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 5, 3, {
					angle: dir,
					density: 0.02,
					frictionAir: 0.035,
					restitution: 0,
					collisionFilter: {
						group: 0,
						category: 0x0100,
						mask: 0x0001,
					},
					endCycle: game.cycle+100,
					classType: 'bullet',
				});
				Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
					x: mech.Vx,
					y: mech.Vy
				});
				const impulse = 0.056 + 0.008*Math.random()
				const f = {
					x: impulse * Math.cos(dir) / game.delta,
					y: impulse * Math.sin(dir) / game.delta
				}
				bullet[len].force = f //add force to fire bullets
				player.force.x -= f.x*0.1;
				player.force.y -= f.y*0.05;  //more horizontal then vertical to prevent jumping too high
				World.add(engine.world, bullet[len]); //add bullet to world
			}
		}
	},
    super: {
        dmg: 0.01,
        fireCD: 30,
        fire: function() {
            for (let i = 0; i < 3; i++) {
                const len = bullet.length;
                const dir = (Math.random() - 0.5) * 0.6 + mech.angle
                bullet[len] = Bodies.polygon(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 0, 6, {
                    angle: dir,
                    density: 0.002,
                    frictionAir: 0,
                    restitution: 1,
                    collisionFilter: {
                        group: 0,
                        category: 0x0100,
                        mask: 0x0001,
                    },
                    endCycle: game.cycle+300,
                    classType: 'bullet',
                });
                Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                    x: mech.Vx,
                    y: mech.Vy
                });
				const impulse = 0.02;
                const f = {
                    x: impulse * Math.cos(dir) / game.delta,
                    y: impulse * Math.sin(dir) / game.delta
                }
                bullet[len].force = f //add force to fire bullets
                World.add(engine.world, bullet[len]); //add bullet to world
            }
        }
    },
    cannon: {
        dmg: 0.04,
        fireCD: 70,
        fire: function() {
            const len = bullet.length;
            bullet[len] = Bodies.polygon(mech.pos.x + 40 * Math.cos(mech.angle), mech.pos.y + 40 * Math.sin(mech.angle), 0, 30, {
                angle: mech.angle,
                density: 0.002,
                frictionAir: 0.001,
                restitution: 0.5,
                collisionFilter: {
                    group: 0,
                    category: 0x0100,
                    mask: 0x0001,
                },
                endCycle: game.cycle+300,
                classType: 'bullet',
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
			const impulse = 0.9;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
			player.force.x -= f.x*0.1;
			player.force.y -= f.y*0.05;
            World.add(engine.world, bullet[len]); //add bullet to world

        }
    },
	experimental: {
		dmg: 0.08,
		fireCD: 10,
		fire: function() {
			const len = bullet.length;
			bullet[len] = Bodies.polygon(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 6, 12, {
				angle: mech.angle,
				density: 0.001,
				frictionAir: 0,
				friction: -1,
				frictionStatic: -1,
				restitution: 0,
				collisionFilter: {
					group: 0,
					category: 0x0100,
					mask: 0x0001,
				},
				endCycle: game.cycle+240,
				classType: 'bullet',
			});
			// Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
			// 	x: mech.Vx,
			// 	y: mech.Vy
			// });
			const impulse = 0.004;
			const f = {
				x: impulse * Math.cos(mech.angle) / game.delta,
				y: impulse * Math.sin(mech.angle) / game.delta
			}
			bullet[len].force = f //add force to fire bullets
			World.add(engine.world, bullet[len]); //add bullet to world
		}
	},
	rail: {
		dmg: 0.05,
		fireCD: 70,
		fire: function() {
			const len = bullet.length;
			bullet[len] = Bodies.rectangle(mech.pos.x + 45 * Math.cos(mech.angle), mech.pos.y + 45 * Math.sin(mech.angle), 60, 3, {
				angle: mech.angle,
				density: 0.002,
				friction: 1,
				frictionStatic: 1,
				frictionAir: 0,
				restitution: 0.1,
				collisionFilter: {
					group: 0,
					category: 0x0100,
					mask: 0x0001,
				},
				endCycle: game.cycle+600,
				classType: 'bullet',
			});
			Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
				x: mech.Vx,
				y: mech.Vy
			});
			const impulse = 0.085;
			const f = {
				x: impulse * Math.cos(mech.angle) / game.delta,
				y: impulse * Math.sin(mech.angle) / game.delta
			}
			bullet[len].force = f //add force to fire bullets
			player.force.x -= f.x*0.5;
			player.force.y -= f.y*0.1;
			World.add(engine.world, bullet[len]); //add bullet to world
		}
	},
}
