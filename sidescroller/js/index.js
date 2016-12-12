"use strict";
/* TODO:  *******************************************
*****************************************************
make a graphics that looks like the player has a tail
  (loose wires / a tail / a rope)
  to indicate player motion

draw images on top of bodies
  make an svg in html, export to png, add to canvas
  add a background layer
  add a foreground layer for shadows, lights, stuff in front of player

add more methods of player interaction
  portals
    need to find a way to fire the portals at locations
      use raycasting in matter.js
      they could only interact with statics
  gun
    you'd have to add bad guys too of course...
  flipping rotating gravity
    also rotate the canvas around

game mechanics
  mechanics that support the physics engine
    add rope/constraint
  store/spawn bodies in player (like starfall)
  get ideas from game: limbo / inside
  environmental hazards
    laser
    lava
  button / switch
  door
  fizzler
  moving platform
  map zones
    water
    low friction ground
    bouncy ground
  NPC polygons could corrupt normal polygons and make them alive
    triggers on touch

 give each foot a sensor to check for ground collisions
  feet with not go into the ground even on slanted ground
  this might be not worth it, but it might look really cool

track foot positions with velocity better as the player walks/crouch/runs

track what body the player is standing on
  get id from jump sensor collisions, find the body with the id.
  when player jumps/moves apply an opposite force on that body
  leg animation should be relative to the velocity of the body player is on

brief forced crouch after landing at a high speed
  you could just set the crouch keys[] to true for a few cycles if velocity.y is large

give grab a method of interaction with bullets, while paused

 physics puzzle mechanics
  move a block over and jump on it to get over a wall
  drop some weight on a suspended nonrotating block to lower it and remove a blockage
  knock over a very tall plank to clear a wide gap


when holding something
redraw the bodies stroke with the same color as the constaint stroke
  it looks cool!

give mobs vision of player
  use raytracing to see if a line can be drawn directly to the player

do somethign about blocks and NPCs that fall off the map
  remove them from the physics engine
  reset them
  figure out how to delete them

bullet type: bomb
	make a bullet that after a few seconds gets very big and hits mobs to do damage
		make the bullet go noncollide with map after explode

NPC-mob laser
	mob does damage by looking at player with the query ray
		require the mob to hold the player as a target for a couple seconds to fire
			draw the query targeting ray

NPC-mob jumper
	jumps in player's direction when it can see player
		only jumps when mob is moving very slowly
			make friction very high
		only jump when touching map
			is it worth adding a collide event?

regen health by eating things you can pick up
	use the r button?

make bullet damage linked to each bullet

make bullet damamge scale with relative velocity difference between bullet and mob

make a goal for each map
	use a map ground property for the end of a map
		similar to portal
FIX************************************************************
***************************************************************
***************************************************************

holding a body with a constraint pushes on other bodies too easily
  mostly fixed by capping the mass of what player can hold

on testing mode read out mouse postion isn't accurate when zoomed
  not sure how to fix this, need to figure out the math for size changes when zoomed
  try drawing a picture

find a way to delete mobs
  splice doesn't work for some reason...  ugggg

mouse look doesn't work with the smooth vertical camera tracking
  makes firing bullets strange

sometimes the player falls off a ledge and stays crouched in mid air

the jump height control by holding down jump  can also control any upward motion
*/

/*collision info:
        category  mask
player:  0x1000  0x0001
bullet:  0x0100  0x0001
ghost:   0x0010  0x0001
map:     0x0001  0x1111
body:    0x0001  0x1101
holding: 0x0001  0x0001
mob:     0x0001  0x1101

*/

//set up canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.font = "15px Arial";
    ctx.lineJoin = 'round';
    ctx.lineCap = "round";
}

setupCanvas();
window.onresize = function() {
    setupCanvas();
};

//mouse move input
window.onmousemove = function(e) {
    mech.getMousePos(e.clientX, e.clientY);
};
//mouse click events
window.onmousedown = function(e) {
    game.mouseDown = true;
};
window.onmouseup = function(e) {
    game.mouseDown = false;
};

//keyboard input
const keys = [];
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    if (keys[84]) { //t = testing mode
        if (game.testing) {
            game.testing = false;
        } else {
            game.testing = true;
        }
    }
});

const stats = new Stats(); //setup stats library to show FPS
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//stats.domElement.style.opacity   = '0.5'







//matter.js ***********************************************************
//*********************************************************************
//*********************************************************************
//*********************************************************************
//*********************************************************************

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

//define player *************************************************************
//***************************************************************************
//player as a series of vertices
let vector = Vertices.fromPath('0 40  0 115  20 130  30 130  50 115  50 40');
const playerBody = Matter.Bodies.fromVertices(0, 0, vector);
//this sensor check if the player is on the ground to enable jumping
var jumpSensor = Bodies.rectangle(0, 46, 36, 6, {
    sleepThreshold: 99999999999,
    isSensor: true,
});
//this part of the player lowers on crouch
vector = Vertices.fromPath('0 -66 18 -82  0 -37 50 -37 50 -66 32 -82');
const playerHead = Matter.Bodies.fromVertices(0, -55, vector);
//a part of player that senses if the player's head is empty and can return after crouching
const headSensor = Bodies.rectangle(0, -57, 48, 45, {
    sleepThreshold: 99999999999,
    isSensor: true,
});

const player = Body.create({ //combine jumpSensor and playerBody
    parts: [playerBody, playerHead, jumpSensor, headSensor],
    inertia: Infinity, //prevents player rotation
    friction: 0.002,
    //frictionStatic: 0.5,
    restitution: 0.3,
    sleepThreshold: Infinity,
    collisionFilter: {
        group: 0,
        category: 0x1000,
        mask: 0x0001
    },
});
//Matter.Body.setPosition(player, mech.spawnPos);
//Matter.Body.setVelocity(player, mech.spawnVel);
mech.setPosToSpawn();
Matter.Body.setMass(player, mech.mass);
World.add(engine.world, [player]);
//holding body constraint
const holdConstraint = Constraint.create({
    pointA: {
        x: 0,
        y: 0
    },
    //setting constaint to jump sensor because it has to be on something until the player picks up things
    bodyB: jumpSensor,
    stiffness: 0.4,
});

World.add(engine.world, holdConstraint);
//spawn map function is in maps.js
spawn();

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
                    if (pairs[i].bodyB === playerBody || pairs[i].bodyB === playerHead) mech.hitMob(k);
                    if (pairs[i].bodyB.classType === "bullet" && pairs[i].bodyB.speed > 10) {
                        mob[k].locatePlayer();
                        mob[k].damage(guns[mech.gun].dmg*Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity)));
                    }
                    break;
                } else if (pairs[i].bodyB === mob[k]) {
                    if (pairs[i].bodyA === playerBody || pairs[i].bodyA === playerHead) mech.hitMob(k);
                    if (pairs[i].bodyA.classType === "bullet" && pairs[i].bodyA.speed > 10) {
                        mob[k].locatePlayer();
                        mob[k].damage(guns[mech.gun].dmg*Matter.Vector.magnitude(Matter.Vector.sub(pairs[i].bodyA.velocity, pairs[i].bodyB.velocity)));
                    }
                    break;
                }
            }
        }
    }
}


Events.on(engine, "beforeUpdate", function(event) {
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
    addGravity(mob, 0.0005);
    addGravity(body, 0.001);
    addGravity(bullet, 0.001);
    player.force.y += player.mass * 0.001;

});

//determine if player is on the ground
Events.on(engine, "collisionStart", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
    mobCollisionCheck(event);
});
Events.on(engine, "collisionActive", function(event) {
    playerOnGroundCheck(event);
    playerHeadCheck(event);
});
Events.on(engine, 'collisionEnd', function(event) {
    playerOffGroundCheck(event);
});

// render ***********************************************************
//*******************************************************************
//*******************************************************************
//*******************************************************************

function drawMatterWireFrames() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#999";
    const bodies = Composite.allBodies(engine.world);
    ctx.beginPath();
    for (let i = 0; i < bodies.length; i += 1) {
        //ctx.fillText(bodies[i].id,bodies[i].position.x,bodies[i].position.y);  //shows the id of every body
        let vertices = bodies[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

function drawMap() {
    //draw map
    ctx.beginPath();
    for (let i = 0; i < map.length; i += 1) {
        let vertices = map[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = '#444';
    ctx.fill();
}

function drawBody() {
    //draw body
    ctx.beginPath();
    for (let i = 0; i < body.length; i += 1) {
        let vertices = body[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#777';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.stroke();
}

function drawCons() {
    //draw body
    ctx.beginPath();
    for (let i = 0; i < cons.length; i += 1) {
        ctx.moveTo(cons[i].pointA.x, cons[i].pointA.y);
        ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#999';
    ctx.stroke();
}

function drawPlayerBodyTesting() { //shows the different parts of the player body for testing
    //jump
    ctx.beginPath();
    let bodyDraw = jumpSensor.vertices;
    ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
    for (let j = 1; j < bodyDraw.length; j += 1) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
    }
    ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    //main body
    ctx.beginPath();
    bodyDraw = playerBody.vertices;
    ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
    for (let j = 1; j < bodyDraw.length; j += 1) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
    }
    ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fill();
    ctx.stroke();
    //head
    ctx.beginPath();
    bodyDraw = playerHead.vertices;
    ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
    for (let j = 1; j < bodyDraw.length; j += 1) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
    }
    ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.fill();
    ctx.stroke();
    //head sensor
    ctx.beginPath();
    bodyDraw = headSensor.vertices;
    ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
    for (let j = 1; j < bodyDraw.length; j += 1) {
        ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
    }
    ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fill();
    ctx.stroke();
}

//main loop ************************************************************
//**********************************************************************
//**********************************************************************
//**********************************************************************

function cycle() {
    stats.begin();
    game.timing();
    game.wipe();
    mech.keyMove();
	mech.switchGun();
    mech.standingOnActions();
    mech.regen();
    //mech.keyHold();
    game.keyZoom();
    //game.gravityFlip();
    //game.pause();
    if (game.testing) {
        mech.testingMoveLook();
        mech.deathCheck();
        bulletLoop();
        ctx.save();
        game.scaleZoom();
        mech.draw();
        drawMatterWireFrames();
        drawPlayerBodyTesting();
        ctx.restore();
        game.output();
    } else {
        mobLoop();
        mech.move();
        game.speedZoom();
        mech.deathCheck();
        mech.look();
        ctx.save();
        game.scaleZoom();
        ctx.drawImage(background_img, 400, -400);
        drawMob();
        drawCons();
        drawBody();
        mech.draw();
		bulletLoop();
		//mech.eat();
        //ctx.drawImage(foreground_img, -700, -1500);
        drawMap();
        mech.drawHealth();
        ctx.restore();
    }
    //svg graphics , just here until I convert svg to png in inkscape
    // document.getElementById('background').setAttribute('transform',
    //     'translate(' + (canvas.width / 2) + ',' + (canvas.height / 2) + ')' +
    //     'scale(' + game.zoom + ')' +
    //     'translate(' + (mech.transX - canvas.width / 2) + ',' + (mech.transY - canvas.height / 2) + ')');
    document.getElementById('foreground').setAttribute('transform',
        'translate(' + (canvas.width / 2) + ',' + (canvas.height / 2) + ')' +
        'scale(' + game.zoom + ')' +
        'translate(' + (mech.transX - canvas.width / 2) + ',' + (mech.transY - canvas.height / 2) + ')');

    stats.end();
    requestAnimationFrame(cycle);
}

// const bmo_img = new Image(); // Create new img element
// bmo_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/Bmo.png'; // Set source path

// const foreground_img = new Image(); // Create new img element
// foreground_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/circle3390.png'; // Set source path

const background_img = new Image(); // Create new img element
background_img.src = 'background.png'; // Set source path

function runPlatformer(el) {
    el.onclick = null; //removes the onclick effect so the function only runs once
    el.style.display = 'none'; //hides the element that spawned the function
    document.getElementById("keysright").innerHTML = ''; //remove html from intro
    document.getElementById("keysleft").innerHTML = '';
    document.body.appendChild(stats.dom); //show stats.js FPS tracker
    Engine.run(engine); //starts game engine
    //console.clear(); //gets rid of annoying console message about vertecies not working
    requestAnimationFrame(cycle); //starts game loop
}
