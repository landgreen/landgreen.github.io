"use strict";
/* TODO:  *******************************************
*****************************************************

fieldMeter
  repulse uses up field
    no more cool down on repulse
  throw uses up field relative to mass and speed
  holing and activation field inhibit field regen
    holding very large masses 6+ slowly drains field


bugs:
  set colors for each field type
  use global composting


mutators (as a power up)
  infinite ammo
    or just more ammo from drops?
    or 50% chance to not use up a bullet?
  increased fire rate for guns
    how to make laser fire faster?
  orbiting orb fires at random targets
    missiles at random targets

  low gravity
  double jumps
  higher horizontal run speed?

  vampire damage
  shield (recharges fast, but only upto 10% of life)

Active use abilities (can get ideas from spacetime)
  blink (short distance teleport)
    would reverse if they end up in solid wall
  beacon teleport
  push (push blocks, mobs, and bullets away from player)
  invulnerability (force field that stops mobs and bullets)
  burst of speed
  intangible (can move through bodies, bullets, and mobs.  Not map elements)
  
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


add power ups for the field generator  (use L and R mouse at same time for active abilities)
  slow time aura when field is active.
    passive: player can jump higher and move faster

  add ability to fire blocks harder, with no charge up
    passive: field damages mobs

  add ability to eat blocks to heal
    passive: allow player to hold and fire heavier blocks with less weight penalty

  push everything away from player
    passive: increase field radius, radius pulses in and out, increase arc to full

unused ideas
passive: walk through blocks  (difficult to implement)



//collision info:
         category    mask
powerUp: 0x 100000   0x 100001
mobBull: 0x 010000   0x 001001
player:  0x 001000   0x 010011
bullet:  0x 000100   0x 000011
mob:     0x 000010   0x 001101
map:     0x 000001   0x 111111
body:    0x 000001   0x 011111

? hold:  0x 000001   0x 000001


*/

//set up canvas
var canvas = document.getElementById("canvas");
//using "const" causes problems in safari when an ID shares the same name.
const ctx = canvas.getContext("2d");
document.body.style.backgroundColor = "#fff";

//disable pop up menu on right click
document.oncontextmenu = function () {
  return false;
}

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
window.onresize = () => {
  setupCanvas();
};

//mouse move input
window.onmousemove = (e) => {
  game.mouse.x = e.clientX;
  game.mouse.y = e.clientY;
};

//normal mouse click events
window.onmousedown = (e) => {
  //mouse down gets reset in game.startGame
  //don't make changes here
  game.mouseDown = true;
  game.mouse.x = e.clientX;
  game.mouse.y = e.clientY;
};
window.onmouseup = (e) => {
  // game.buildingUp(e); //uncomment when building levels
  game.mouseDown = false;
  // console.log(e)
  if (e.which === 3) {
    game.mouseDownRight = false;
  } else {
    game.mouseDown = false;
  }
};

//keyboard input
const keys = [];
document.body.addEventListener("keydown", (e) => {
  keys[e.keyCode] = true;
  game.keyPress();
});

document.body.addEventListener("keyup", (e) => {
  keys[e.keyCode] = false;
});

document.body.addEventListener("wheel", (e) => {
  if (e.deltaY > 0) {
    game.nextGun();
  } else {
    game.previousGun();
  }
}, {
  passive: true
});


// function playSound(id) {
//   //play sound
//   if (false) {
//     //sounds are turned off for now
//     // if (document.getElementById(id)) {
//     var sound = document.getElementById(id); //setup audio
//     sound.currentTime = 0; //reset position of playback to zero  //sound.load();
//     sound.play();
//   }
// }

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
  game.cycle++; //tracks game cycles
  if (game.clearNow) {
    game.clearNow = false;
    game.clearMap();
    level.start();
  }
  game.gravity();
  Engine.update(engine, game.delta);
  game.wipe();
  game.textLog();
  mech.keyMove();
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
    mobs.loop();
    b.draw();
    b.fire();
    game.drawCircle();
    ctx.restore();
  }
  game.drawCursor();
  if (!game.paused) requestAnimationFrame(cycle);
}