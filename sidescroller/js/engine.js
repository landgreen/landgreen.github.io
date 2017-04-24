//matter.js ***********************************************************
// module aliases
const Engine = Matter.Engine,
    World = Matter.World,
    Events = Matter.Events,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Vertices = Matter.Vertices,
    Query = Matter.Query,
    Body = Matter.Body,
    Bodies = Matter.Bodies;

// create an engine
const engine = Engine.create();
engine.world.gravity.scale = 0;  //turn off gravity (it's added back in later)

// matter events *********************************************************
//************************************************************************
//************************************************************************
//************************************************************************

function playerOnGroundCheck(event) { //runs on collisions events
    function enter() {
        mech.numTouching++;
        if (!mech.onGround) mech.enterLand();
    }
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];
        if (pair.bodyA === jumpSensor) {
            enter();
        } else if (pair.bodyB === jumpSensor) {
            enter();
            mech.onBody = pair.bodyA.id;
        }
    }
}

function playerOffGroundCheck(event) { //runs on collisions events
    function enter() {
        if (mech.onGround && mech.numTouching === 0) mech.enterAir();
    }
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; ++i) {
        if (pairs[i].bodyA === jumpSensor) {
            enter();
        } else if (pairs[i].bodyB === jumpSensor) {
            enter();
        }
    }
}

function playerHeadCheck(event) { //runs on collisions events
    if (mech.crouch) {
        mech.isHeadClear = true;
        const pairs = event.pairs;
        for (let i = 0, j = pairs.length; i != j; ++i) {
            if (pairs[i].bodyA === headSensor) {
                mech.isHeadClear = false;
            } else if (pairs[i].bodyB === headSensor) {
                mech.isHeadClear = false;
            }
        }
    }
}

function collisionChecks(event) {
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; i++) {
		//player and mobbullet collisions
		for (let k = 0; k < mobBullet.length; k++) {
			if ( (pairs[i].bodyA === mobBullet[k] && pairs[i].bodyA.speed > 10 &&
				 (pairs[i].bodyB === playerBody || pairs[i].bodyB === playerHead)) ||
				 (pairs[i].bodyB === mobBullet[k] && pairs[i].bodyB.speed > 10 &&
				 (pairs[i].bodyA === playerBody || pairs[i].bodyA === playerHead)) ){
				   const dmg = game.dmgScale * mobBullet[k].dmg;
				   mech.damage(dmg);
				   mobBullet[k].endCycle = game.cycle;
				   game.drawList.push({//add dmg to draw queue
					   x: pairs[i].activeContacts[0].vertex.x,
					   y: pairs[i].activeContacts[0].vertex.y,
					   radius: dmg*1000,
					   color: game.mobDmgColor,
					   time: game.drawTime
				   });
				break;
			}
		}
        for (let k = 0; k < mob.length; k++) {
            if (mob[k].alive) {
				//player and mob collision
				if((pairs[i].bodyA === mob[k] &&
				   (pairs[i].bodyB === playerBody || pairs[i].bodyB === playerHead)) ||
				   (pairs[i].bodyB === mob[k] &&
				   (pairs[i].bodyA === playerBody || pairs[i].bodyA === playerHead)) ){
					mob[k].locatePlayer();
					let dmg = mob[k].onHitDamage();
					mech.hitMob(k, dmg);
					if (mob[k].onHit) mob[k].onHit(k)
					game.drawList.push({//add dmg to draw queue
						x: pairs[i].activeContacts[0].vertex.x,
						y: pairs[i].activeContacts[0].vertex.y,
						radius: dmg*1000,
						color: game.mobDmgColor,
						time: game.drawTime
					});
					break;
				}
				//bullet mob collisions
                if (pairs[i].bodyA === mob[k]) {
                    if (pairs[i].bodyB.classType === "bullet" && pairs[i].bodyB.speed > pairs[i].bodyB.minDmgSpeed) {
                        mob[k].locatePlayer();
                        let dmg = b.dmgScale*(pairs[i].bodyB.dmg + 0.15 * pairs[i].bodyB.mass * Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity)));
                        mob[k].damage(dmg);
                        pairs[i].bodyB.onDmg(); //some bullets do actions when they hits things, like despawn
						game.drawList.push({//add dmg to draw queue
							x: pairs[i].activeContacts[0].vertex.x,
							y: pairs[i].activeContacts[0].vertex.y,
							radius: Math.sqrt(dmg)*40,
							color: game.playerDmgColor,
							time: game.drawTime
						});
                    }
                    break;
                } else if (pairs[i].bodyB === mob[k]) {
                    if (pairs[i].bodyA.classType === "bullet" && pairs[i].bodyA.speed > pairs[i].bodyA.minDmgSpeed) {
                        mob[k].locatePlayer();
                        let dmg = b.dmgScale*(pairs[i].bodyA.dmg + 0.15 * pairs[i].bodyA.mass * Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity)))
                        mob[k].damage(dmg);
                        pairs[i].bodyA.onDmg(); //some bullets do actions when they hits things, like despawn
                        game.drawList.push({ //add dmg to draw queue
							x: pairs[i].activeContacts[0].vertex.x,
							y: pairs[i].activeContacts[0].vertex.y,
							radius: Math.sqrt(dmg)*40,
							color: game.playerDmgColor,
							time: game.drawTime
						});
                    }
                    break;
                }
            }
        }
    }
}

Events.on(engine, "beforeUpdate", function(event) {
    mech.numTouching = 0;
    //gravity
    function addGravity(bodies, magnitude) {
        for (var i = 0; i < bodies.length; i++) {
            bodies[i].force.y += bodies[i].mass * magnitude;
        }
    }
	addGravity(powerUp, game.g);
    addGravity(body, game.g);
    // addGravity(bullet, b.gravity);
    // addGravity(mobBullet, game.g);
    player.force.y += player.mass * game.g;

	if (game.clearNow){  //reset before update to avoid getting into trouble with looking at array elements that don't exist
		game.clearNow = false;
		game.clearMap();
		level.start();
	}
});

//determine if player is on the ground
Events.on(engine, "collisionStart", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
    collisionChecks(event);
});
Events.on(engine, "collisionActive", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
});
Events.on(engine, 'collisionEnd', function(event) {
    playerOffGroundCheck(event);
});
