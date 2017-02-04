const powerUp = [];

const powerUps = {
    spawn: function(x, y) {
        let i = powerUp.length;
        powerUp[i] = Matter.Bodies.polygon(x, y, 5, 15, {
            density: 0.001,
            //friction: 0,
            frictionAir: 0.01,
            //frictionStatic: 0,
            restitution: 0.5,
            collisionFilter: {
                group: 0,
                category: 0x100000,
                mask: 0x100001,
            },
			endCycle: game.cycle + 720, //if change time also update color fade out
			color: 'rgba(0,255,0,1)'
        })
		Matter.Body.setVelocity(powerUp[i], { //bullet velocity includes player's motion plus a force
			x: (Math.random()-0.5)*10,
			y: Math.random()*-7 - 3
		});
        World.add(engine.world, powerUp[i]); //add to world
    },
    loop: function() {
        //for (let i = 0, len = powerUp.length; i < len; ++i) {
        let i = powerUp.length;
        while (i--) {
			if ( !( (powerUp[i].endCycle - game.cycle)%10 ) ) { //every second
				//Matter.Body.scale(powerUp[i], 0.95, 0.95) //shrinks the power up
				powerUp[i].color = 'rgba(0,255,0, '+(powerUp[i].endCycle - game.cycle)/720+')'; //fades color to transparent
				if (powerUp[i].endCycle < game.cycle) {  //removes the power up
					Matter.World.remove(engine.world, powerUp[i]); //remove from game
					powerUp.splice(i, 1); //remove from array
					continue;
				}
			}
			const dx = player.position.x-powerUp[i].position.x
			const dy = player.position.y-powerUp[i].position.y
			dist2 = dx*dx+dy*dy;
            //const dist = Matter.Vector.magnitude(Matter.Vector.sub(powerUp[i].position, player.position))
            if (dist2 < 160000 && mech.health < 1) {
                if (dist2 < 1600) {
					mech.addHealth(0.2);
					playSound('powerup')
					Matter.World.remove(engine.world, powerUp[i]);
                    powerUp.splice(i, 1);
					continue;
                } else {//float towards player
					powerUp[i].force.x += dx / dist2*powerUp[i].mass * 0.1
					powerUp[i].force.y += dy / dist2*powerUp[i].mass * 0.1 - powerUp[i].mass * game.g //negate gravity
                }
            }
        }
    }
}
