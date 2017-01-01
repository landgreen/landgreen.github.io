//bullets**************************************************************
//*********************************************************************
//*********************************************************************
//*********************************************************************

const bullet = []; //holds all the bullets

function bulletLoop() {
    if (game.mouseDown && mech.fireCDcycle < game.cycle && !game.isPaused) {
        mech.fireCDcycle = game.cycle + guns[mech.gun].fireCD;
        guns[mech.gun].fire();
    }
    let i = bullet.length;
    while (i--) {
        ctx.beginPath();
        ctx.fillStyle = bullet[i].color;
        let vertices = bullet[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        if (bullet[i].endCycle < game.cycle) {
            Matter.World.remove(engine.world, bullet[i]);
            bullet.splice(i, 1);
        }
        ctx.fill();
    }

}


const cFilter = {
	category: 0x000100,
	mask: 0x000001,
}

const guns = { //prototype for each bullet/gun type
    machine: {
        fireCD: 4,
        fire: function() {
            const len = bullet.length;
            const dir = (Math.random() - 0.5) * 0.1 + mech.angle
            bullet[len] = Bodies.rectangle(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 7, 3, {
                angle: dir,
                density: 0.001,
                friction: 0.5,
                frictionAir: 0,
                restitution: 0,
                collisionFilter: cFilter,
                //isSensor: true,
				dmg: 0.003,
				minDmgSpeed: 10,
                endCycle: game.cycle + 100,
                color: '#000',
                classType: 'bullet',
                onDmg: function() {},
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
            const impulse = 0.002 + 0.0002 * Math.random();
            const f = {
                x: impulse * Math.cos(dir) / game.delta,
                y: impulse * Math.sin(dir) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
    needle: {
        fireCD: 45,
        fire: function() {
            const len = bullet.length;
            bullet[len] = Bodies.rectangle(mech.pos.x + 20 * Math.cos(mech.angle), mech.pos.y + 20 * Math.sin(mech.angle), 20, 1, {
                angle: mech.angle,
                density: 0.0000001,
                friction: 1,
                frictionStatic: 1,
                frictionAir: 0,
                restitution: 0.25,
				collisionFilter: cFilter,
				dmg: 0.024,
				minDmgSpeed: 13,
                endCycle: game.cycle + 400,
                color: '#000',
                classType: 'bullet',
                onDmg: function() {
                    this.endCycle = game.cycle;
                },
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
            const impulse = 0.00000035;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
    shot: {
        fireCD: 50,
        fire: function() {
            for (let i = 0; i < 13; i++) {
                const len = bullet.length;
                const dir = (Math.random() - 0.5) * 0.7 + mech.angle
                bullet[len] = Bodies.polygon(mech.pos.x + 15 * Math.cos(mech.angle), mech.pos.y + 15 * Math.sin(mech.angle), 5, 3, {
                    angle: dir,
                    density: 0.03,
                    frictionAir: 0.015,
                    restitution: 0,
					collisionFilter: cFilter,
					dmg: 0.0035,
					minDmgSpeed: 10,
                    endCycle: game.cycle + 100,
                    color: '#000',
                    classType: 'bullet',
                    onDmg: function() {
                        this.endCycle = game.cycle;
                    },
                });
                Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                    x: mech.Vx,
                    y: mech.Vy
                });
                const impulse = 0.07 + 0.01 * Math.random()
                const f = {
                    x: impulse * Math.cos(dir) / game.delta,
                    y: impulse * Math.sin(dir) / game.delta
                }
                bullet[len].force = f //add force to fire bullets
                player.force.x -= f.x * 0.1;
                player.force.y -= f.y * 0.05; //more horizontal then vertical to prevent jumping too high
                World.add(engine.world, bullet[len]); //add bullet to world
            }
        }
    },
    super: {
        fireCD: 10,
        fire: function() {
            const len = bullet.length;
            const dir = (Math.random() - 0.5) * 0.1 + mech.angle
            bullet[len] = Bodies.polygon(mech.pos.x + 25 * Math.cos(mech.angle), mech.pos.y + 25 * Math.sin(mech.angle), 0, 6, {
                angle: dir,
                density: 0.002,
                frictionAir: 0,
                restitution: 1,
				collisionFilter: cFilter,
				dmg: 0.01,
				minDmgSpeed: 8,
                endCycle: game.cycle + 300,
                color: randomColor({
                    luminosity: 'bright',
                    //hue: 'blue'
                }),
                classType: 'bullet',
                onDmg: function() {
                    // this.color='#f00';
                    // Matter.Body.scale(this, 5, 5);
                    // this.collisionFilter.mask = 0x0000;
                    // Matter.Body.setStatic(this, true);
                    // this.endCycle = game.cycle + 10;
                },
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
    },
    cannon: {
        fireCD: 80,
        fire: function() {
			mobs.alert(); //this gun is loud!
            const len = bullet.length;
            bullet[len] = Bodies.polygon(mech.pos.x + 40 * Math.cos(mech.angle), mech.pos.y + 40 * Math.sin(mech.angle), 0, 30, {
                angle: mech.angle,
                density: 0.002,
                frictionAir: 0.001,
                restitution: 0.5,
				collisionFilter: cFilter,
				dmg: 0.04,
				minDmgSpeed: 5,
                endCycle: game.cycle + 300,
                color: '#212',
                classType: 'bullet',
                onDmg: function() {},
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
            const impulse = 1;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            player.force.x -= f.x * 0.1;
            player.force.y -= f.y * 0.05;
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
    experimental: {
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
				collisionFilter: cFilter,
				dmg: 0.08,
				minDmgSpeed: 3,
                endCycle: game.cycle + 240,
                color: '#ff0',
                classType: 'bullet',
                onDmg: function() {},
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
        fireCD: 100,
        fire: function() {
			mobs.alert(); //this gun is loud!
            const len = bullet.length;
            bullet[len] = Bodies.rectangle(mech.pos.x + 60 * Math.cos(mech.angle), mech.pos.y + 60 * Math.sin(mech.angle), 60, 3, {
                angle: mech.angle,
                density: 0.002,
                friction: 1,
                frictionStatic: 1,
                frictionAir: 0,
                restitution: 0.1,
				collisionFilter: cFilter,
				dmg: 0.04,
				minDmgSpeed: 15,
                endCycle: game.cycle + 600,
                color: '#000',
                classType: 'bullet',
                onDmg: function() {},
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
            const impulse = 0.09;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            player.force.x -= f.x * 0.5;
            player.force.y -= f.y * 0.1;
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
    spiritBomb: {
    	fireCD: 60,
        fire: function() {
            const len = bullet.length;
            bullet[len] = Bodies.polygon(mech.pos.x + 40 * Math.cos(mech.angle), mech.pos.y + 40 * Math.sin(mech.angle), 0, 20, {
                angle: mech.angle,
                density: 0.00001,
                frictionAir: 0.001,
                restitution: 0.5,
                isSensor: true,
				isStatic: true,
				collisionFilter: cFilter,
				dmg: 1,
				minDmgSpeed: 0,
                endCycle: game.cycle + 500,
                color: 'rgba(255,0,255,0.2)',
                classType: 'bullet',
                onDmg: function() {
                    this.endCycle = game.cycle;
                },
            });
            Matter.Body.setVelocity(bullet[len], { //bullet velocity includes player's motion plus a force
                x: mech.Vx,
                y: mech.Vy
            });
            const impulse = 0.006;
            const f = {
                x: impulse * Math.cos(mech.angle) / game.delta,
                y: impulse * Math.sin(mech.angle) / game.delta
            }
            bullet[len].force = f //add force to fire bullets
            World.add(engine.world, bullet[len]); //add bullet to world
        }
    },
}
