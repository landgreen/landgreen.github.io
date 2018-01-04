"use strict";
/* TODO:  *******************************************
*****************************************************
mutators (as a power up)
  infinite ammo
    or just more ammo from drops?
    or 50% chance to not use up a bullet?
  flying
  low gravity
  more damage done and taken
  larger bullets
  vampire damage
  double jumps
  higher speed?
  shield

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

 give each foot a sensor to check for ground collisions
  	feet with not go into the ground even on slanted ground
 	this might be not worth it, but it might look really cool

track foot positions with velocity better as the player walks/crouch/runs

brief forced crouch after landing at a high speed
 	you could just set the crouch keys[] to true for a few cycles if velocity.y is large

add bullet on damage effects
	effects could:
		add to the array mod.do new mob behaviors
			add a damage over time
			add a freeze
		change mob traits
			mass
			friction
			damage done
		change things about the bullet
			bounce the bullet again in a new direction
			fire several bullets as shrapnel
			increase the bullet size to do AOE dmg?? (how)
				just run a for loop over all mobs, and do damage to the one that are close
			bullets return to player
				use a constraint? does bullet just start with a constraint or is it added on damage?
		change the player
			vampire bullets heal for the damage done
				or give the player a shield??
				or only heal if the mob dies (might be tricky)
		remove standing on player actions
			replace with check if player feet are in an area.


//collision info:
         category    mask
powerUp: 0x 100000   0x 001001
mobBull: 0x 010000   0x 001001
player:  0x 001000   0x 110011
bullet:  0x 000100   0x 000011
mob:     0x 000010   0x 001101
map:     0x 000001   0x 111111
body:    0x 000001   0x 011111
// ? holding: 0x 000001   0x 000001


//makes the SVG title screen tripy
(function() {
    document.getElementById("turb").setAttribute('seed', Math.floor(Math.random() * 1000)) //randomize the turbulence seed
    document.getElementById("turb").setAttribute('baseFrequency', 0.015 + Math.random() * Math.random() * 0.4)
    let f = 400;
    const turb = function() {
        const end = 0.05
        if (f > end) {
            f = f * 0.98 - 0.02
            document.getElementById('turbulence').setAttribute('scale', f) //randomize the noise
            requestAnimationFrame(turb);
        } else {
            document.getElementById('turbulence').setAttribute('scale', 0) //randomize the noise
        }
    }
    requestAnimationFrame(turb);
})()

*/

//set up canvas
var canvas = document.getElementById("canvas");
//using "const" causes problems in safari when an ID shares the same name.
const ctx = canvas.getContext("2d");
document.body.style.backgroundColor = "#fff";

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.width2 = canvas.width / 2; //precalculated because I use this often (in mouse look)
  canvas.height2 = canvas.height / 2;
  canvas.diagonal = Math.sqrt(canvas.width2 * canvas.width2 + canvas.height2 * canvas.height2);
  ctx.font = "15px Arial";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // ctx.lineCap='square';
  game.setZoom();
}
setupCanvas();
window.onresize = function() {
  setupCanvas();
};

//mouse move input
window.onmousemove = function(e) {
  game.mouse.x = e.clientX;
  game.mouse.y = e.clientY;
};

//normal mouse click events
window.onmousedown = function(e) {
  //mouse down gets reset in the run function below
  game.mouseDown = true;
  game.mouse.x = e.clientX;
  game.mouse.y = e.clientY;
};
window.onmouseup = function(e) {
  // game.buildingUp(e); //uncomment when building levels
  game.mouseDown = false;
};

//keyboard input
const keys = [];
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
  game.keyPress();
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

function playSound(id) {
  //play sound
  if (false) {
    //sounds are turned off for now
    // if (document.getElementById(id)) {
    var sound = document.getElementById(id); //setup audio
    sound.currentTime = 0; //reset position of playback to zero  //sound.load();
    sound.play();
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

//main loop ************************************************************
//**********************************************************************
function cycle() {
  game.timing();
  game.wipe();
  game.textLog();
  mech.keyMove();
  powerUps.attractionLoop();
  level.checkZones();
  level.checkQuery();
  mech.move();
  mech.look();
  mech.deathCheck();
  game.fallChecks();
  ctx.save();
  game.camera();
  if (game.testing) {
    mech.draw();
    game.draw.wireFrame();
    game.draw.cons();
    game.draw.testing();
    game.drawCircle();
    ctx.restore();
    game.getCoords.out();
    game.testingOutput();
  } else {
    level.drawFillBGs();
    level.exit.draw();
    level.enter.draw();
    game.draw.powerUp();
    mobs.draw();
    game.draw.cons();
    game.draw.body();
    mech.draw();
    mech.hold();
    level.drawFills();
    game.draw.drawMapPath();
    // mech.drawHealth();
    mobs.loop();
    b.fire();
    b.draw();
    game.drawCircle();
    ctx.restore();
  }
  game.drawCursor();
  if (!game.paused) requestAnimationFrame(cycle);
}
