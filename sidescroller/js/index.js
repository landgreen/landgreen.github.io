"use strict";
/* TODO:  *******************************************
*****************************************************
make a graphics that looks like the player has a tail
  (loose wires / a tail / a rope)
  to indicate player motion

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

physics puzzle mechanics
	move a block over and jump on it to get over a wall
	drop some weight on a suspended nonrotating block to lower it and remove a blockage
	knock over a very tall plank to clear a wide gap

power ups  (rogue-like patterned after binding of issac with mostly stacking power ups)
	should power ups automaticaly active or should player have to pick them up?

gun power ups:
one at a time: shape, restitution, airfriction, sound, gravity??
	bullet = default bullet shape	zero restitution, medium airfraction
	needle = long needle 			low restitution, zero air friction
	square = large	 				high resitituion, high air friction

one at a time: number, accuracy, size, lifespan, collision, gravity
	'sniper = 1 bullet, perfect accuracy, larger size, long life, can collide with other bullets
	'multi = 3 bullets, good accuracy in 3 different directions, medium lifespan, medium size, can't collide with other bullets
	'spray = many bullets, very bad accuracy, small size, short life, can't collide with other bullets
overlapping and	progressive:
	`faster = higher starting bullet speed
	'larger = +increase size and while keeping speed constant
	`rapid = reduce cooldown to fire
	'dmg = lower damage threshhold and base dmg is also higher
	`frictionAir = lower airfriction
	????bullets can pass through body or map, but hit mobs

player power ups:
	heal: heals player
	higher jump?
	higher speed?
	double jump?
	shield?
		could regen slowly
	reduce dmg?

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


FIX************************************************************
***************************************************************
***************************************************************
sometimes the player falls off a ledge and stays crouched in mid air

the jump height control by holding down jump  can also control any upward motion (like from a block that throws player up)
*/

/*collision info:
         category    mask
player:  0x 001000   0x 110001
bullet:  0x 000100   0x 000001
ghost:   0x 000010   0x 000001
map:     0x 000001   0x 111111
body:    0x 000001   0x 111101
mob:     0x 000001   0x 001101
mobBull: 0x 010000   0x 001001
powerUp: 0x 100000   0x 001001

//holding: 0x 000001   0x 000001
*/

//const stats = new Stats(); //setup stats library to show FPS
//stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//stats.domElement.style.opacity   = '0.5'

//setup random title
const titles = [
    "physics phobia",
    "physics frenzy",
    "impulse city",
    "velocity city",
    "isogonal",
    "isogon impulse",
    "isogon invasion",
    "isogon towers!",
    "isogon invasion!",
    "bird robot!",
    "ostrichbot",
    "pewpew",
	'shoot the baddies',
	'get to the door',
];
document.getElementById("title").textContent = document.title = titles[Math.floor(titles.length * Math.random())];



//set up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.width2 = canvas.width / 2; //precalculated because I use this often (in mouse look)
    canvas.height2 = canvas.height / 2;
    canvas.diagonal = Math.sqrt(canvas.width2 * canvas.width2 + canvas.height2 * canvas.height2);
    ctx.font = "15px Arial";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    game.setTracking();
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
    game.mouseDown = true;
};
window.onmouseup = function(e) {
    game.mouseDown = false;
};
//mouse click events for building maps:  replace with the normal events below when not building maps
// window.onmousedown = function(e) {
// 	if (!game.mouseDown){
// 		game.getCoords.pos1.x = Math.round(game.mouseInGame.x / 25) * 25;
// 		game.getCoords.pos1.y = Math.round(game.mouseInGame.y / 25) * 25;
// 	}
//     game.mouseDown = true;
// };
// window.onmouseup = function(e) {
// 	if (game.mouseDown){
// 		game.getCoords.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
// 		game.getCoords.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
//
// 		//body rect mode
// 		//document.getElementById("copy-this").innerHTML = `spawn.mapRect(${game.getCoords.pos1.x}, ${game.getCoords.pos1.y}, ${game.getCoords.pos2.x-game.getCoords.pos1.x}, ${game.getCoords.pos2.y-game.getCoords.pos1.y}); //`;
// 		//draw foreground
// 		//document.getElementById("copy-this").innerHTML = `level.fill.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "rgba(0,0,0,0.1)"});`;
//
// 		//draw background fill
// 		document.getElementById("copy-this").innerHTML = `level.fillBG.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "#ccc"});`;
//
// 		//svg mode
// 		//document.getElementById("copy-this").innerHTML = 'rect x="'+game.getCoords.pos1.x+'" y="'+ game.getCoords.pos1.y+'" width="'+(game.getCoords.pos2.x-game.getCoords.pos1.x)+'" height="'+(game.getCoords.pos2.y-game.getCoords.pos1.y)+'"';
//
// 		window.getSelection().removeAllRanges();
// 		var range = document.createRange();
// 		range.selectNode(document.getElementById('copy-this'));
// 		window.getSelection().addRange(range);
// 		document.execCommand('copy')
// 		window.getSelection().removeAllRanges();
// 	}
//     game.mouseDown = false;
// };

//keyboard input
const keys = [];
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    game.keyPress(); //tracking, testing, zoom
});
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
    game.keyUp();
});

function playSound(id) {
    //play sound
    if (document.getElementById(id)) {
        var sound = document.getElementById(id); //setup audio
        sound.currentTime = 0; //reset position of playback to zero  //sound.load();
        sound.play();
    }
}

// const foreground_img = new Image(); // Create new img element
// foreground_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/circle3390.png'; // Set source path

// const background_img = new Image(); // Create new img element
// background_img.src = 'background.png'; // Set source path

function run(el) {
    // onclick from the splash screen
    el.onclick = null; //removes the onclick effect so the function only runs once
    el.style.display = "none"; //hides the element that spawned the function
    mech.spawn(); //spawns the player
    game.reset();
    Engine.run(engine); //starts game engine
    requestAnimationFrame(cycle); //starts game loop
	game.lastLogTime = game.cycle+360;
}

//main loop ************************************************************
//**********************************************************************
function cycle() {
    game.timing();
    game.wipe();
	game.textLog();
    //powerUps.loop();
    mech.keyMove();
    level.checkZones();
    //mech.standingOnActions();
    //mech.regen();
    mech.move();
    if (game.track) {
        mech.look();
    } else {
        mech.staticLook();
    }
    mech.deathCheck();
    //mech.look();
    ctx.save();
    game.camera();
    //ctx.drawImage(background_img, 400, -400);
    if (game.testing) {
        mech.draw();
        game.draw.wireFrame();
        game.draw.cons();
        game.draw.testing();
        //bulletLoop();
        game.drawCircle();
        mech.drawHealth();
        ctx.restore();
        game.getCoords.out();
        game.testingOutput();
    } else {
		level.drawFillBGs()
		level.exit.draw();
        mobs.loop();
        game.draw.mobBullet();
        mobs.draw();
        game.draw.cons();
        game.draw.body();
        mech.draw();
		level.drawFills()

        //ctx.drawImage(foreground_img, -700, -1500);
        game.draw.map();
        b.fire(); //fires bullets
        b.draw(); //draw bullets
        game.drawCircle(); //draws circles, like explosions
        game.draw.powerUp();
        //mech.drawHealth();
        powerUps.loop();
        ctx.restore();
        //game.output();
    }
    if(!game.paused) requestAnimationFrame(cycle);
}
