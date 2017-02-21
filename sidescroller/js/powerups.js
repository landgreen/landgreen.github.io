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
    shape: [{ //shape, friction, gravity
        name: 'bullets',
        color: '#000',
        sides: 4,
        effect: function() {
            bullets.shape = this.name
            bullets.width = 14;
            bullets.height = 5;
            bullets.frictionAir = 0.008;
			bullets.gravity = 0.001;
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
			bullets.gravity = 0.0005;
        }
    }, {
        name: 'squares',
        color: '#000',
        sides: 4,
        effect: function() {
            bullets.shape = this.name
            bullets.width = 10;
            bullets.height = 10;
            bullets.frictionAir = 0.02;
			bullets.gravity = 0.0017;
        }
    }],
    mode: [{ //fire rate, number fired, inaccuracy, duration, size, restitution, cFilter
        name: 'balanced',
        color: '#04f',
        sides: 3,
        effect: function() {
            bullets.fireCD = 15;
            bullets.mode = this.name
            bullets.number = 1;
            bullets.inaccuracy = 0.1;
            bullets.endCycle = 250;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000101; //can hit self
            bullets.sizeMode = 1;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }, {
        name: 'oneshot',
        color: '#04f',
        sides: 3,
        effect: function() {
            bullets.fireCD = 60;
            bullets.mode = this.name
            bullets.number = 1;
            bullets.inaccuracy = 0;
            bullets.endCycle = 400;
			bullets.restitution = 0.4;
			bullets.cFilter.mask = 0x000101; //can hit self
            bullets.sizeMode = 2;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }, {
        name: 'tri-shot',
        color: '#04f',
        sides: 3,
        effect: function() {
            bullets.fireCD = 30;
            bullets.mode = this.name
            bullets.number = 3;
            bullets.inaccuracy = 0.25;
            bullets.endCycle = 200;
			bullets.restitution = 0.8;
			bullets.cFilter.mask = 0x000001; //can't hit self
            bullets.sizeMode = 0.9;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }, {
        name: 'automatic',
        color: '#04f',
        sides: 3,
        effect: function() {
            bullets.fireCD = 5;
            bullets.mode = this.name
            bullets.number = 1;
            bullets.inaccuracy = 0.2;
            bullets.endCycle = 120;
			bullets.restitution = 0;
			bullets.cFilter.mask = 0x000001; //can't hit self
            bullets.sizeMode = 0.7;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }, {
        name: 'shotgun',
        color: '#04f',
        sides: 3,
        effect: function() {
            bullets.fireCD = 60;
            bullets.mode = this.name
            bullets.number = 8;
            bullets.inaccuracy = 0.8;
            bullets.endCycle = 100;
			bullets.cFilter.mask = 0x000001; //can't hit self
			bullets.restitution = 0;
            bullets.sizeMode = 0.85;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }],
    fireSpeed: [{
        name: 'fast+small', //speed, size, resitution
        color: '#f06',
        sides: 5,
        effect: function() {
            bullets.fireSpeed = this.name;
            bullets.speed = 50;
			bullets.sizeSpeed = 0.7;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
    }, {
        name: 'medium speed+size',
        color: '#f06',
        sides: 5,
        effect: function() {
            bullets.fireSpeed = this.name;
            bullets.speed = 40;
			bullets.sizeSpeed = 1;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
        }
	}, {
		name: 'slow+big',
		color: '#f06',
		sides: 5,
		effect: function() {
			bullets.fireSpeed = this.name;
			bullets.speed = 30;
			bullets.sizeSpeed = 1.3;
			bullets.size = bullets.sizeSpeed*bullets.sizeMode;
		}
    }],
    startingPowerUps: function() {
        this.shape[Math.floor(Math.random() * this.shape.length)].effect() //gives player random starting shape
        this.mode[Math.floor(Math.random() * this.mode.length)].effect() //gives player random starting fire mode
        this.fireSpeed[Math.floor(Math.random() * this.fireSpeed.length)].effect() //gives player random starting speed method
            //this.shape[1].effect();
    },
    spawnRandomPowerUp: function(x, y, mass) {
        if (Math.random() < 0.3) { //spawn heal
            powerUps.spawn(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, powerUps.heal.name, powerUps.heal.color, powerUps.heal.sides, 20, powerUps.heal.effect);
        }
        let choose = Math.floor(Math.random() * powerUps.shape.length);
        if (Math.random() < 0.1 && powerUps.shape[choose].name !== bullets.shape) {
            powerUps.spawn(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, powerUps.shape[choose].name, powerUps.shape[choose].color, powerUps.shape[choose].sides, 40, powerUps.shape[choose].effect);
        }
        choose = Math.floor(Math.random() * powerUps.mode.length);
        if (Math.random() < 0.1 && powerUps.mode[choose].name !== bullets.mode) {
            powerUps.spawn(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, powerUps.mode[choose].name, powerUps.mode[choose].color, powerUps.mode[choose].sides, 40, powerUps.mode[choose].effect);
        }
        choose = Math.floor(Math.random() * powerUps.fireSpeed.length);
        if (Math.random() < 0.1 && powerUps.fireSpeed[choose].name !== bullets.fireSpeed) {
            powerUps.spawn(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, powerUps.fireSpeed[choose].name, powerUps.fireSpeed[choose].color, powerUps.fireSpeed[choose].sides, 40, powerUps.fireSpeed[choose].effect);
        }
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
            if (!((powerUp[i].endCycle - game.cycle) % 10)) { //every second
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
