const powerUp = [];

const powerUps = {
    heal: {
        name: 'heal',
        color: '#0f8',
        sides: 0,
        effect: function() {
            mech.addHealth(0.4 + Math.random() * 0.2);
        }
    },
    shape: [{ //shape, density, friction, gravity
        name: 'bullets',
        color: '#000',
        sides: 4,
        effect: function() {
            bullets.shape = this.name
            bullets.width = 19;
            bullets.height = 6;
            bullets.frictionAir = 0.01;
			bullets.gravity = 0.001;
			bullets.density = 0.0015;
        }
    }, {
        name: 'needles',
        color: '#000',
        sides: 4,
        effect: function() {
            bullets.shape = this.name
            bullets.width = 32;
            bullets.height = 2;
            bullets.frictionAir = 0;
			bullets.gravity = 0.0007;
			bullets.density = 0.002;
        }
    }, {
        name: 'squares',
        color: '#000',
        sides: 4,
        effect: function() {
            bullets.shape = this.name
            bullets.width = 14;
            bullets.height = 14;
            bullets.frictionAir = 0.025;
			bullets.gravity = 0.0017;
			bullets.density = 0.0015;
        }
    }],
    mode: [{ //fire rate, number fired, inaccuracy, duration, size, restitution, cFilter   speed
        name: 'balanced',
        color: '#04f',
        sides: 3,
        effect: function() {
			bullets.mode = this.name
            bullets.fireCD = 18;
            bullets.number = 1;
			bullets.speed = 38;
            bullets.inaccuracy = 0.05;
            bullets.endCycle = 200;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000101; //can hit self
			bullets.size = 1.3
        }
    }, {
		name: 'spread',
		color: '#04f',
		sides: 3,
		effect: function() {
			bullets.mode = this.name
			bullets.fireCD = 60;
			bullets.number = 5;
			bullets.speed = 44;
			bullets.inaccuracy = 0.12;
			bullets.endCycle = 150;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000001; //can hit self
			bullets.size = 0.9
		}
	}, {
		name: 'high speed',
		color: '#04f',
		sides: 3,
		effect: function() {
			bullets.mode = this.name
			bullets.fireCD = 60;
			bullets.number = 1;
			bullets.speed = 60;
			bullets.inaccuracy = 0;
			bullets.endCycle = 300;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000101; //can hit self
			bullets.size = 1.4
		}
	}, {
        name: 'oneshot',
        color: '#04f',
        sides: 3,
        effect: function() {
			bullets.mode = this.name
            bullets.fireCD = 100;
            bullets.number = 1;
			bullets.speed = 35;
            bullets.inaccuracy = 0;
            bullets.endCycle = 400;
			bullets.restitution = 0.4;
			bullets.cFilter.mask = 0x000101; //can hit self
			bullets.size = 3
        }
    }, {
    //     name: 'bouncy',
    //     color: '#04f',
    //     sides: 3,
    //     effect: function() {
	// 		bullets.mode = this.name
    //         bullets.fireCD = 25;
    //         bullets.number = 3;
	// 		bullets.speed = 34;
    //         bullets.inaccuracy = 0.35;
    //         bullets.endCycle = 200;
	// 		bullets.restitution = 0.8;
	// 		bullets.cFilter.mask = 0x000001; //can't hit self
	// 		bullets.size = 1;
	// 	}
    // }, {
        name: 'automatic',
        color: '#04f',
        sides: 3,
        effect: function() {
			bullets.mode = this.name
            bullets.fireCD = 5;
            bullets.number = 1;
			bullets.speed = 38;
            bullets.inaccuracy = 0.2;
            bullets.endCycle = 80;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000001; //can't hit self
			bullets.size = 0.7;
        }
    }, {
        name: 'wide spread',
        color: '#04f',
        sides: 3,
        effect: function() {
			bullets.mode = this.name
            bullets.fireCD = 60;
            bullets.number = 8;
			bullets.speed = 45;
            bullets.inaccuracy = 1;
            bullets.endCycle = 80;
			bullets.cFilter.mask = 0x000001; //can't hit self
			bullets.restitution = 0;
			bullets.size = 0.9
        }
    }],
    startingPowerUps: function() {
        this.shape[Math.floor(Math.random() * this.shape.length)].effect() //gives player random starting shape
        this.mode[Math.floor(Math.random() * this.mode.length)].effect() //gives player random starting fire mode
		//this.mode[6].effect()
    },
    spawnRandomPowerUp: function(x, y) { //spawn heal chance is higher at low health
		let size = 20
		// if ((mech.health<0.9 && Math.random() < 0.1) || (mech.health<0.6 && Math.random() < 0.2) || (mech.health<0.3 && Math.random() < 0.3)) {
        if (Math.random()>Math.sqrt(mech.health)+0.1) {
            powerUps.spawn(x + (Math.random() - 0.5) * size, y + (Math.random() - 0.5) * size, powerUps.heal.name, powerUps.heal.color, powerUps.heal.sides, size, powerUps.heal.effect);
			return;
        }
		size = 30
        let choose = Math.floor(Math.random() * powerUps.shape.length);
        if (Math.random() < 0.13 && powerUps.shape[choose].name !== bullets.shape) {
            powerUps.spawn(x + (Math.random() - 0.5) * size, y + (Math.random() - 0.5) * size, powerUps.shape[choose].name, powerUps.shape[choose].color, powerUps.shape[choose].sides, 35, powerUps.shape[choose].effect);
			return;
        }
        choose = Math.floor(Math.random() * powerUps.mode.length);
        if (Math.random() < 0.16 && powerUps.mode[choose].name !== bullets.mode) {
            powerUps.spawn(x + (Math.random() - 0.5) * size, y + (Math.random() - 0.5) * size, powerUps.mode[choose].name, powerUps.mode[choose].color, powerUps.mode[choose].sides, size, powerUps.mode[choose].effect);
			return;
        }
        // choose = Math.floor(Math.random() * powerUps.fireSpeed.length);
        // if (Math.random() < 0.12 && powerUps.fireSpeed[choose].name !== bullets.fireSpeed) {
        //     powerUps.spawn(x + (Math.random() - 0.5) * size, y + (Math.random() - 0.5) * size, powerUps.fireSpeed[choose].name, powerUps.fireSpeed[choose].color, powerUps.fireSpeed[choose].sides, size, powerUps.fireSpeed[choose].effect);
		// 	return;
        // }
    },
    spawn: function(x, y, name, color, sides, size, effect) {
        let i = powerUp.length;
        powerUp[i] = Matter.Bodies.polygon(x, y, sides, size, {
            density: 0.001,
            //friction: 0,
            frictionAir: 0.01,
            //frictionStatic: 0,
            restitution: 0.8,
            collisionFilter: {
                group: 0,
                category: 0x100000,
                mask: 0x100001,
            },
            endCycle: game.cycle + 1080, //if change time also update color fade out
            color: color,
            alpha: 1,
            effect: effect,
            name: name,
            size: size,
        })
        Matter.Body.setVelocity(powerUp[i], { //bullet velocity includes player's motion plus a force
            x: (Math.random() - 0.5) * 10,
            y: Math.random() * -7 - 3
        });
        World.add(engine.world, powerUp[i]); //add to world
    },
    loop: function() {
        //for (let i = 0, len = powerUp.length; i < len; ++i) {
        let i = powerUp.length;
        while (i--) {
            if (!((powerUp[i].endCycle - game.cycle) % 10)) { //most of the other power up code is in the player object
                //Matter.Body.scale(powerUp[i], 0.95, 0.95) //shrinks the power up
                //powerUp[i].color = 'rgba(0,255,0, '+(powerUp[i].endCycle - game.cycle)/720+')'; //fades color to transparent
                powerUp[i].alpha = (powerUp[i].endCycle - game.cycle) / 720 + 0.1;
                if (powerUp[i].alpha > 1) powerUp[i].alpha = 1;
                if (powerUp[i].endCycle < game.cycle) { //removes the power up
                    Matter.World.remove(engine.world, powerUp[i]); //remove from game
                    powerUp.splice(i, 1); //remove from array
                    continue;
                }
            }
            //magnetic pick up of items
            // const dx = player.position.x - powerUp[i].position.x
            // const dy = player.position.y - powerUp[i].position.y
            // dist2 = dx * dx + dy * dy;
            // if (dist2 < 200000 && (mech.health < 1 || powerUp[i].name !== 'heal')) {
            //     if (dist2 < 1000) { //pick up if close
            //         powerUp[i].effect();
            //         playSound('powerup');
            //         Matter.World.remove(engine.world, powerUp[i]);
            //         powerUp.splice(i, 1);
            //         continue;
            //     } else { //float towards player
            //         Matter.Body.setVelocity(powerUp[i], { //extra friction
            //             x: powerUp[i].velocity.x * 0.95,
            //             y: powerUp[i].velocity.y * 0.95
            //         });
            //         powerUp[i].force.x += dx / dist2 * powerUp[i].mass * 0.3
            //         powerUp[i].force.y += dy / dist2 * powerUp[i].mass * 0.3 - powerUp[i].mass * game.g //negate gravity
            //     }
            // }
        }
    }
}
