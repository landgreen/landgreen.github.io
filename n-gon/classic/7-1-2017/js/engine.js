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
engine.world.gravity.scale = 0; //turn off gravity (it's added back in later)
// engine.velocityIterations = 100
// engine.positionIterations = 100
// engine.enableSleeping = true

// matter events *********************************************************
//************************************************************************
//************************************************************************
//************************************************************************

function playerOnGroundCheck(event) {
    //runs on collisions events
    function enter() {
        mech.numTouching++;
        if (!mech.onGround) mech.enterLand();
    }
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];
        if (pair.bodyA === jumpSensor) {
			mech.standingOn = pair.bodyB //keeping track to correctly provide recoil on jump
            enter();
        } else if (pair.bodyB === jumpSensor) {
			mech.standingOn = pair.bodyA //keeping track to correctly provide recoil on jump
            enter();
        }
    }
}

function playerOffGroundCheck(event) {
    //runs on collisions events
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

function playerHeadCheck(event) {
    //runs on collisions events
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

function mobCollisionChecks(event) {
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; i++) {
        for (let k = 0; k < mob.length; k++) {
            if (mob[k].alive) {
                if (pairs[i].bodyA === mob[k]) {
                    collide(pairs[i].bodyB);
                    break;
                } else if (pairs[i].bodyB === mob[k]) {
                    collide(pairs[i].bodyA);
                    break;
                }

                function collide(obj) {
                    //player and mob collision
                    if (obj === playerBody || obj === playerHead) {
                        mob[k].locatePlayer();
                        let dmg = Math.min(Math.max(0.01 * Math.sqrt(mob[k].mass) * game.dmgScale,0.01), 0.35)
                        mech.hitMob(k, dmg);
                        if (mob[k].onHit) mob[k].onHit(k);
                        game.drawList.push({
                            //add dmg to draw queue
                            x: pairs[i].activeContacts[0].vertex.x,
                            y: pairs[i].activeContacts[0].vertex.y,
                            radius: dmg * 1000,
                            color: game.mobDmgColor,
                            time: game.drawTime
                        });
                        return;
                    }
                    //bullet mob collisions
                    if (obj.classType === "bullet" && obj.speed > obj.minDmgSpeed) {
                        mob[k].locatePlayer();
                        let dmg = b.dmgScale *
                            (obj.dmg +
                                0.15 * obj.mass * Matter.Vector.magnitude(Matter.Vector.sub(mob[k].velocity, obj.velocity)));
                        mob[k].damage(dmg);
                        obj.onDmg(); //some bullets do actions when they hits things, like despawn
                        game.drawList.push({
                            //add dmg to draw queue
                            x: pairs[i].activeContacts[0].vertex.x,
                            y: pairs[i].activeContacts[0].vertex.y,
                            radius: Math.sqrt(dmg) * 40,
                            color: game.playerDmgColor,
                            time: game.drawTime
                        });
                        return;
                    }
                    //mob and body collisions
                    if (obj.classType === "body" && obj.speed > 6) {
                        const v = Matter.Vector.magnitude(Matter.Vector.sub(mob[k].velocity, obj.velocity));
                        if (v > 9) {
                            let dmg = b.dmgScale * v * Math.sqrt(obj.mass) * 0.15;
                            mob[k].damage(dmg);
                            if (mob[k].distanceToPlayer2() < 1000000) mob[k].locatePlayer();
                            game.drawList.push({
                                //add dmg to draw queue
                                x: pairs[i].activeContacts[0].vertex.x,
                                y: pairs[i].activeContacts[0].vertex.y,
                                radius: Math.sqrt(dmg) * 40,
                                color: game.playerDmgColor,
                                time: game.drawTime
                            });
                        }
                    }
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
    player.force.y += player.mass * game.g;

    if (game.clearNow) {
        //reset before update to avoid getting into trouble with looking at array elements that don't exist
        game.clearNow = false;
        game.clearMap();
        level.start();
    }
});

//determine if player is on the ground
Events.on(engine, "collisionStart", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
    mobCollisionChecks(event);
});
Events.on(engine, "collisionActive", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
});
Events.on(engine, "collisionEnd", function(event) {
    playerOffGroundCheck(event);
});
