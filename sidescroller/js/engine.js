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
engine.world.gravity.scale = 0;
//engine.enableSleeping = true;  //might want to turn this off to improve accuracy

// matter events *********************************************************
//************************************************************************
//************************************************************************
//************************************************************************
function findindexFromID(id) { //used to find the index of what the player is standing on
    /*   for (let i = 0; i < body.length; i++) {
        if (body[i].id === id) {
          return {
            id: id,
            index: i,
            type: "body"
          }
        }
      } */
    for (let i = 0; i < map.length; i++) {
        if (map[i].id === id) {
            return {
                id: id,
                index: i,
                type: "map",
                action: map[i].action
            }
        }
    }
    /*   for (let i = 0; i < bullet.length; i++) {
        if (bullet[i].id === id) {
          return {
            id: id,
            index: i,
            type: "bullet"
          }
        }
      } */
    return {
        id: null,
        index: null,
        type: "none",
        action: null
    }
}

function playerOnGroundCheck(event) { //runs on collisions events
    function enter() {
        mech.numTouching++;
        if (!mech.onGround) mech.enterLand();
    }
    function getGroundInfo(idNum) {
        if (mech.onBody.id != idNum) { //if the id has changed
            var touching = findindexFromID(idNum);
            if (touching.type === "map") {
                mech.onBody = touching;
            }
        }
    }
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; ++i) {
        let pair = pairs[i];
        if (pair.bodyA === jumpSensor) {
            getGroundInfo(pair.bodyB.id);
            enter();
        } else if (pair.bodyB === jumpSensor) {
            getGroundInfo(pair.bodyA.id);
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

function mobCollisionCheck(event) {
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; i++) {
        for (let k = 0; k < mob.length; k++) {
            if (mob[k].alive) {
                if (pairs[i].bodyA === mob[k]) {
                    if (pairs[i].bodyB === playerBody || pairs[i].bodyB === playerHead) { //mob hitting player check
                        mob[k].locatePlayer();
                        let dmg = Math.sqrt(mob[k].mass) * game.dmgScale*game.mobDamage;
                        if (dmg < 0.05) dmg = 0.05;
                        mech.hitMob(k, dmg);
                        //add dmg to draw queue
                        const hit = pairs[i].activeContacts[0].vertex
                        hit.radius = dmg * 400
                        hit.color = '#f00';
                        game.drawList.push(hit);
                    }
                    //mob hitting bullet check
                    if (pairs[i].bodyB.classType === "bullet" && pairs[i].bodyB.speed > pairs[i].bodyB.minDmgSpeed) {
                        mob[k].locatePlayer();
                        let dmg = pairs[i].bodyB.dmg + 0.05 * pairs[i].bodyB.mass * Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity));
                        mob[k].damage(dmg);
                        pairs[i].bodyB.onDmg(); //some bullets do actions when they hits things, like despawn
                        //add dmg to draw queue
                        const hit = pairs[i].activeContacts[0].vertex
                        hit.radius = dmg * 40;
                        if (hit.radius < 10) hit.radius = 10;
                        hit.color = '#000';
                        game.drawList.push(hit);
                    }
                    break;
                } else if (pairs[i].bodyB === mob[k]) {
                    if (pairs[i].bodyA === playerBody || pairs[i].bodyA === playerHead) { //mob hitting player check
                        mob[k].locatePlayer();
                        let dmg = Math.sqrt(mob[k].mass) * game.dmgScale*game.mobDamage;
                        if (dmg < 0.05) dmg = 0.05;
                        mech.hitMob(k, dmg);
                        //add dmg to draw queue
                        const hit = pairs[i].activeContacts[0].vertex
                        hit.radius = dmg * 400
                        hit.color = '#f00';
                        game.drawList.push(hit);
                    }
                    //mob hitting bullet check
                    if (pairs[i].bodyA.classType === "bullet" && pairs[i].bodyA.speed > pairs[i].bodyA.minDmgSpeed) {
                        mob[k].locatePlayer();
                        let dmg = pairs[i].bodyA.dmg * Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity))
                        if (dmg < pairs[i].bodyA.minDmg) dmg = pairs[i].bodyA.minDmg;
                        mob[k].damage(dmg);
                        pairs[i].bodyA.onDmg(); //some bullets do actions when they hits things, like despawn
                        //add dmg to draw queue
                        const hit = pairs[i].activeContacts[0].vertex
                        hit.radius = dmg * 40;
                        if (hit.radius < 10) hit.radius = 10;
                        hit.color = '#000';
                        game.drawList.push(hit);
                    }
                    break;
                }
            }
        }
    }
}

function mobBulletCollisionCheck(event) {
    const pairs = event.pairs;
    for (let i = 0, j = pairs.length; i != j; i++) {
        for (let k = 0; k < mobBullet.length; k++) {
            if (pairs[i].bodyA === mobBullet[k] && pairs[i].bodyA.speed > 10 && (pairs[i].bodyB === playerBody || pairs[i].bodyB === playerHead)) {
				const dmg = game.dmgScale * game.mobBulletDamage;
                mech.damage(dmg);
                mobBullet[k].endCycle = game.cycle;
                //add dmg to draw queue
                const hit = pairs[i].activeContacts[0].vertex;
                hit.radius = dmg*200;
                hit.color = '#f00';
                game.drawList.push(hit);
                continue;
            } else if (pairs[i].bodyB === mobBullet[k] && pairs[i].bodyB.speed > 10 && (pairs[i].bodyA === playerBody || pairs[i].bodyA === playerHead)) {
				const dmg = game.dmgScale * game.mobBulletDamage;
                mech.damage(dmg);
                mobBullet[k].endCycle = game.cycle;
                //add dmg to draw queue
                const hit = pairs[i].activeContacts[0].vertex;
                hit.radius = dmg*200;
                hit.color = '#f00';
                game.drawList.push(hit);
                continue;
            }
        }
    }
}


Events.on(engine, "beforeUpdate", function(event) {
    //reset thes values each cycle
    mech.numTouching = 0;
    mech.onBody = {
        id: null,
        index: null,
        type: "none"
    };
    //gravity
    function addGravity(bodies, magnitude) {
        for (var i = 0; i < bodies.length; i++) {
            //if (body.isStatic || body.isSleeping) continue;
            bodies[i].force.y += bodies[i].mass * magnitude;
        }
    }
    //addGravity(Composite.allBodies(engine.world));
    //addGravity(mob, game.g/2);
	addGravity(powerUp, game.g);
    addGravity(body, game.g);
    addGravity(bullet, bullets.gravity);
    // addGravity(mobBullet, game.g);
    player.force.y += player.mass * game.g;
});

//determine if player is on the ground
Events.on(engine, "collisionStart", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
    mobCollisionCheck(event);
    mobBulletCollisionCheck(event)
});
Events.on(engine, "collisionActive", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
});
Events.on(engine, 'collisionEnd', function(event) {
    playerOffGroundCheck(event);
});
