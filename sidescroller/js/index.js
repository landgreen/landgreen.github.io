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
         category    mask
player:  0x 001000   0x 010001
bullet:  0x 000100   0x 000001
ghost:   0x 000010   0x 000001
map:     0x 000001   0x 011111
body:    0x 000001   0x 011101
holding: 0x 000001   0x 000001
mob:     0x 000001   0x 001101
mobBull: 0x 010000   0x 001001

*/

const stats = new Stats(); //setup stats library to show FPS
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//stats.domElement.style.opacity   = '0.5'

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
    mech.gun = (mech.gunOptions)[e.keyCode] || mech.gun; //checks for keypress to get a new gun (1-8)
    if (keys[84]) { //t = testing mode
        if (game.testing) {
            game.testing = false;
        } else {
            game.zoomReset();
            game.testing = true;
        }
    }
});

function playSound(id) { //play sound
	if (document.getElementById(id)){
		var sound = document.getElementById(id); //setup audio
	    sound.currentTime = 0; //reset position of playback to zero  //sound.load();
	    sound.play();
	}
}

// const foreground_img = new Image(); // Create new img element
// foreground_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/circle3390.png'; // Set source path

// const background_img = new Image(); // Create new img element
// background_img.src = 'background.png'; // Set source path


//main loop ************************************************************
//**********************************************************************
function cycle() {
    stats.begin();
    game.timing();
    game.wipe();
    mech.keyMove();
    mech.standingOnActions();
    mech.regen();
    //mech.keyHold();
    game.keyZoom();
    //game.volume();
    //game.pause();
    if (game.testing) {
        mech.testingMoveLook();
        mech.deathCheck();
        ctx.save();
        game.scaleZoom();
        mech.draw();
        game.draw.wireFrame();
        game.draw.testing();
        ctx.restore();
        game.output();
    } else {
        mech.move();
        game.speedZoom();
        mech.deathCheck();
        mech.look();
        ctx.save();
        game.scaleZoom();
		//ctx.drawImage(background_img, 400, -400);
        mobs.loop();
        mobs.draw();
        game.draw.cons();
        game.draw.body();
        mech.draw();
        //mech.eat();
		//ctx.drawImage(foreground_img, -700, -1500);
        game.draw.map();
        bullets.loop();
        bullets.mobLoop();
        game.drawCircle();
        mech.drawHealth();
        ctx.restore();
    }
    //svg graphics , just here until I convert svg to png in inkscape and run as a canvas png
    document.getElementById(game.levels[game.onLevel].background).setAttribute('transform',
        'translate(' + (canvas.width / 2) + ',' + (canvas.height / 2) + ')' +
        'scale(' + game.zoom + ')' +
        'translate(' + (mech.transX - canvas.width / 2) + ',' + (mech.transY - canvas.height / 2) + ')');
    document.getElementById(game.levels[game.onLevel].foreground).setAttribute('transform',
        'translate(' + (canvas.width / 2) + ',' + (canvas.height / 2) + ')' +
        'scale(' + game.zoom + ')' +
        'translate(' + (mech.transX - canvas.width / 2) + ',' + (mech.transY - canvas.height / 2) + ')');

    stats.end();
    requestAnimationFrame(cycle);
}

function run(el) { // onclick from the splash screen
	console.log(el);
    el.onclick = null; //removes the onclick effect so the function only runs once
    el.style.display = 'none'; //hides the element that spawned the function
	mech.spawn(); //spawns the player
	if ( localStorage.getItem('onLevel') ){ //uses local storage to goto the stored level
		game.onLevel = localStorage.getItem('onLevel');
	} else { //this option onyl occurs on first time running a new session with local storage
		game.onLevel = 'skyscrapers'
		localStorage.setItem('onLevel', game.onLevel);
	}

    level[game.levels[game.onLevel].name]();
    level.addToWorld(); //add map to world



	document.getElementById(game.levels[game.onLevel].background).style.display = "inline"; //show SVGs for level
	document.getElementById(game.levels[game.onLevel].foreground).style.display = "inline"; //show SVGs for level
	playSound(game.levels[game.onLevel].ambient);//play ambient audio for level

	//document.getElementById("keysright").innerHTML = ''; //remove html from intro
	//document.getElementById("keysleft").innerHTML = '';
    document.body.appendChild(stats.dom); //show stats.js FPS tracker
    Engine.run(engine); //starts game engine
    requestAnimationFrame(cycle); //starts game loop
}

//skips splash screen on map switch
if ( localStorage.getItem('skipSplash') === '1' ){
	localStorage.setItem('skipSplash', '0');
	run(document.getElementById('splash'))
} else {
	document.getElementById('splash').style.display = "inline"; //show splash SVG
}
