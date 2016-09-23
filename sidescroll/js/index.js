/* TODO:
head sensor as a part of player body
  like foot sensor to detect uncrouch

make a graphics that looks like the player has (loose wires / a tail / a rope) to indicate player motion

draw images on top of bodies
  make an svg convert to png and add it to canvas
  add a foreground layer for shadows and lights stuff in front of player

add more methods of player interaction
  portals
    need to find a way to fire the portals at locations
      use raycasting in matter.js
      they could only interact with statics
  gun
    you'd have to add bad guys too of course...
    
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

BUGS************************************************************

sensor triggers sometimes off of the box of a triangle or hexagon or nonrectangle vertex defined body
  not occuring after adding sensor to player body composite (no idea why that worked...)

pause in matter isn't working/possible??
  slowing time down makes all the bodies bounce around.

holding a body with a constaint pushes on other bodies too easily
  mostly fixed by capping the mass of what player can hold

*/
//set up canvas
var canvasID = "mechcanvas";
var canvas = document.getElementById(canvasID);
var ctx = canvas.getContext("2d");

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //ctx.textAlign = "center";
  ctx.font = "17px Arial";
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
//mouse click input
// window.onclick = function(e) {
// };
//keyboard input
var keys = [];
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
  if (keys[84]) { //t = testing mode
    if (mech.testing) {
      mech.testing = false;
    } else {
      mech.testing = true;
    }
  }
});

// player Object Prototype *********************************************
//*********************************************************************
var mechProto = function() {
  this.cycle = 0;
  this.testing = false; //testing mode: shows wireframe and some variables
  this.width = 50;
  this.height = 115;
  this.heightPlayer = 168;
  this.heightAlign = 17;
  this.radius = 30;
  this.stroke = "#333";
  this.fill = "#eee";
  this.restHeight = 95;
  this.heightGoal = 115;
  this.onGround = false; //checks if on ground or in air
  this.crouch = false;
  this.isHeadClear = true;
  this.spawnPos = {
    x: 700,
    y: 0
  };
  this.spawnVel = {
    x: 0,
    y: 0
  };
  this.x = this.spawnPos.x;
  this.y = this.spawnPos.y;
  this.Sy = this.y; //adds a smoothing effect to vertical only
  this.Vx = 0;
  this.VxMax = 6;
  this.Vy = 0;
  this.mass = 5;
  this.Fx = 0.004 * this.mass; //run Force on ground
  this.FxAir = 0.0006 * this.mass; //run Force in Air
  this.Fy = -0.04 * this.mass; //jump Force
  this.angle = 0;
  this.walk_cycle = 0;
  this.stepSize = 0;
  this.flipLegs = -1;
  this.hip = {
    x: 12,
    y: 24,
  };
  this.knee = {
    x: 0,
    y: 0,
    x2: 0,
    y2: 0
  };
  this.foot = {
    x: 0,
    y: 0
  };
  this.legLength1 = 55;
  this.legLength2 = 45;
  this.canvasX = canvas.width / 2;
  this.canvasY = canvas.height / 2;
  this.transX = this.canvasX - this.x;
  this.transY = this.canvasX - this.x;
  this.mouse = {
    x: canvas.width / 3,
    y: canvas.height
  };
  this.getMousePos = function(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  };
  this.move = function() {
    Matter.Body.setAngularVelocity(player, 0); //keep player from rotating
    this.x = player.position.x;
    //this.y = player.position.y - (this.height + 30) / 2 + 30;
    //looking at player body, to ignore the other parts of the player composite
    this.y = playerBody.position.y - this.height / 2 + this.heightAlign;
    this.Vx = player.velocity.x;
    this.Vy = player.velocity.y;
  };
  this.look = function() {
    //this.angle = Math.atan2(this.mouse.y - this.y, this.mouse.x - this.x);
    //set a max on mouse look
    var mX = this.mouse.x;
    if (mX > canvas.width * 0.8) {
      mX = canvas.width * 0.8;
    } else if (mX < canvas.width * 0.2) {
      mX = canvas.width * 0.2;
    }
    var mY = this.mouse.y;
    if (mY > canvas.height * 0.8) {
      mY = canvas.height * 0.8;
    } else if (mY < canvas.height * 0.2) {
      mY = canvas.height * 0.2;
    }
    //set mouse look
    this.canvasX = this.canvasX * 0.94 + (canvas.width - mX) * 0.06;
    this.canvasY = this.canvasY * 0.94 + (canvas.height - mY) * 0.06;
    //set translate values
    this.transX = this.canvasX - this.x;
    this.Sy = 0.99 * this.Sy + 0.01 * (this.y);
    this.transY = this.canvasY - this.Sy;
    //rapid smoothing if player goes off window
    // if (this.transY > -300 || this.transY < -canvas.height+300){
    //   this.Sy = 0.96 * this.Sy + 0.04 * (this.y);
    //   this.transY = this.canvasY - this.Sy;
    // }
    //make player head angled at mouse
    this.angle = Math.atan2(this.mouse.y - this.canvasY, this.mouse.x - this.canvasX);
  };
  this.buttonCD_jump = 0; //cooldown for player buttons
  this.keyMove = function() {
    if (this.onGround) { //on ground **********************
      if (keys[40] || keys[83]) { //down / s
        if (!this.crouch) { //on first crouch cycle shorten the player body 
          this.crouch = true;
          Matter.Body.scale(playerBody, 1, 0.769);
          Matter.Body.setMass(playerBody, this.mass);
          Matter.Body.translate(player, {
            x: 0,
            y: 7
          });
        }
      } else if (this.crouch) { //on first NOT crouch cycle lengthen the player body 
        var playerHeadQuery = Matter.Query.region(map, {
          max: {
            x: this.x + this.width / 2 - 2,
            y: this.y - 30
          },
          min: {
            x: this.x - this.width / 2 + 2,
            y: this.y - 60
          }
        }); //check region above player's head for map bodies
        //if (playerHeadQuery.length < 1) {
        if (this.isHeadClear) {
          Matter.Body.scale(playerBody, 1, 1.3);
          Matter.Body.setMass(playerBody, this.mass);
          this.crouch = false;
        }
      } else if ((keys[32] || keys[38] || keys[87]) && this.buttonCD_jump + 20 < this.cycle) { //jump up/w/space
        this.buttonCD_jump = this.cycle; //can't jump until 20 cycles pass
        Matter.Body.setVelocity(player, { //zero player velocity for consistant jumps
          x: player.velocity.x,
          y: 0
        });
        player.force.y = this.Fy; //jump force
      }
      //set correct hieght and friction
      if (this.crouch) {
        player.frictionAir = 0.5;
        this.heightGoal = 70;
      } else if (this.onGround) {
        this.heightGoal = 100;
        player.frictionAir = 0.12;
      } else {
        this.heightGoal = 115;
        player.frictionAir = 0.001;
      }
      //horizontal move on ground
      if (keys[37] || keys[65]) { //left / a
        if (player.velocity.x > -this.VxMax) {
          player.force.x = -this.Fx;
        }
      } else if (keys[39] || keys[68]) { //right / d
        if (player.velocity.x < this.VxMax) {
          player.force.x = this.Fx;
        }
      }

    } else { // in air **********************************
      //if (!this.crouch) this.heightGoal = 115; //extend legs while jumping (but not while courch is pressed)
      this.heightGoal = 115;
      player.frictionAir = 0.001;
      //check for short jumps
      if (this.buttonCD_jump + 60 > this.cycle && //just pressed jump
        !(keys[32] || keys[38] || keys[87]) && //but not pressing jump key
        this.Vy < 0) { // and velocity is up
        Matter.Body.setVelocity(player, { //reduce player velocity every cycle until not true
          x: player.velocity.x,
          y: player.velocity.y * 0.94
        });
      }
      if (keys[37] || keys[65]) { //left / a
        if (player.velocity.x > -this.VxMax + 2) {
          player.force.x = -this.FxAir;
        }
      } else if (keys[39] || keys[68]) { //right / d
        if (player.velocity.x < this.VxMax - 2) {
          player.force.x = this.FxAir;
        }
      }
    }
    //smoothly move height towards height goal ************
    if (Math.abs(this.height - this.heightGoal) > 1) {
      this.height = this.height * 0.7 + this.heightGoal * 0.3;
    }
  };
  this.deathCheck = function() {
    if (this.y > 5000) { // if player is 5000px deep reset to spawn Position/Velocity
      Matter.Body.setPosition(player, this.spawnPos);
      Matter.Body.setVelocity(player, this.spawnVel);
      this.dropBody();
    }
  };
  this.holdKeyDown = 0;
  this.buttonCD_hold = 0; //cooldown for player buttons
  this.keyHold = function() { //checks for holding/dropping/picking up bodies
    if (this.isHolding) {
      //give the constaint more length and less stiffness if it is pulled out of position
      var Dx = body[this.holdingBody].position.x - holdConstraint.pointA.x;
      var Dy = body[this.holdingBody].position.y - holdConstraint.pointA.y;
      holdConstraint.length = Math.sqrt(Dx * Dx + Dy * Dy) * 0.95;
      holdConstraint.stiffness = -0.01 * holdConstraint.length + 1;
      if (holdConstraint.length > 100) this.dropBody(); //drop it if the constraint gets too long
      holdConstraint.pointA = { //set constraint position
        x: this.x + 50 * Math.cos(this.angle), //just in front of player nose
        y: this.y + 50 * Math.sin(this.angle)
      };
      if (keys[81]) { // q = rotate the body
        Matter.Body.rotate(body[this.holdingBody], 0.03);
        //Matter.Body.setAngularVelocity(body[this.holdingBody], 0.1)
      }
      //look for dropping held body
      if (this.buttonCD_hold < this.cycle) {
        if (keys[69]) { //if holding e drops
          this.holdKeyDown++;
        } else if (this.holdKeyDown && !keys[69]) {
          this.dropBody(); //if you hold down e long enough the body is thrown
          this.throwBody();
        }
      }
    } else if (keys[69]) { //when not holding  e = pick up body
      this.findClosestBody();
      if (this.closest.dist2 < 10000) { //pick up if distance closer then 100*100
        this.isHolding = true;
        this.holdKeyDown = 0;
        this.buttonCD_hold = this.cycle + 20;
        this.holdingBody = this.closest.index;
        //body[this.closest.index].isSensor = true; //sensor seems a bit inconsistant
        body[this.holdingBody].collisionFilter.group = -1; //don't collide with player
        body[this.holdingBody].frictionAir = 0.2; //makes the holding body less jittery
        holdConstraint.bodyB = body[this.holdingBody];
        holdConstraint.length = 0;
        holdConstraint.pointA = {
          x: this.x + 50 * Math.cos(this.angle),
          y: this.y + 50 * Math.sin(this.angle)
        };
      }
    }
  };
  this.dropBody = function() {
    this.isHolding = false;
    body[this.holdingBody].collisionFilter.group = 1; //can collide with player
    body[this.holdingBody].frictionAir = 0.001;
    holdConstraint.bodyB = jumpSensor; //set on sensor to get the constaint on somethign else
  };
  this.throwMax = 150;
  this.throwBody = function() {
    var throwMag = 0;
    if (this.holdKeyDown > 20) {
      if (this.holdKeyDown > this.throwMax) this.holdKeyDown = this.throwMax;
      //scale fire with mass and with holdKeyDown time
      throwMag = body[this.holdingBody].mass * this.holdKeyDown * 0.001;
    }
    body[this.holdingBody].force.x = throwMag * Math.cos(this.angle);
    body[this.holdingBody].force.y = throwMag * Math.sin(this.angle);
  };
  this.isHolding = false;
  this.holdingBody = 0;
  this.closest = {
    dist2: 1000000,
    index: 0
  };
  this.findClosestBody = function() {
    this.closest.dist2 = 100000;
    for (var i = 0; i < body.length; i++) {
      var Px = body[i].position.x - (this.x + 50 * Math.cos(this.angle));
      var Py = body[i].position.y - (this.y + 50 * Math.sin(this.angle));
      if (body[i].mass < player.mass && Px * Px + Py * Py < this.closest.dist2) {
        this.closest.dist2 = Px * Px + Py * Py;
        this.closest.index = i;
      }
    }
  };
  /*   this.forcePoke = function() {
      for (var i = 0; i < body.length; i++) {
        var Dx = body[i].position.x - (this.mouse.x - this.transX);
        var Dy = body[i].position.y - (this.mouse.y - this.transY);
        var accel = 0.2 / Math.sqrt(Dx * Dx + Dy * Dy);
        if (accel > 0.01) accel = 0.01; //cap accel
        accel = accel * body[i].mass //scale with mass
        var angle = Math.atan2(Dy, Dx);
        body[i].force.x -= accel * Math.cos(angle);
        body[i].force.y -= accel * Math.sin(angle);
      }
    }; */
  this.drawLeg = function(stroke) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.flipLegs, 1);
    //leg lines
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(this.hip.x, this.hip.y);
    ctx.lineTo(this.knee.x, this.knee.y);
    ctx.lineTo(this.foot.x, this.foot.y);
    ctx.stroke();
    //toe lines
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x - 15, this.foot.y + 5);
    ctx.moveTo(this.foot.x, this.foot.y);
    ctx.lineTo(this.foot.x + 15, this.foot.y + 5);
    ctx.stroke();
    //hip joint
    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.fill;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.hip.x, this.hip.y, 11, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    //knee joint
    ctx.beginPath();
    ctx.arc(this.knee.x, this.knee.y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    //foot joint
    ctx.beginPath();
    ctx.arc(this.foot.x, this.foot.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  this.calcLeg = function(cycle_offset, offset) {
    this.hip.x = 12 + offset;
    this.hip.y = 24 + offset;
    //stepSize goes to zero if Vx is zero or not on ground (make this transition cleaner)
    //changes to stepsize are smoothed by adding only a percent of the new value each cycle
    this.stepSize = 0.9 * this.stepSize + 0.1 * (8 * Math.sqrt(Math.abs(this.Vx)) * this.onGround);
    var stepAngle = 0.037 * this.walk_cycle + cycle_offset;
    this.foot.x = 2 * this.stepSize * Math.cos(stepAngle) + offset;
    this.foot.y = offset + this.stepSize * Math.sin(stepAngle) + this.height - 5;
    var Ymax = this.height - 5;
    if (this.foot.y > Ymax && this.onGround) this.foot.y = Ymax;

    //calculate knee position as intersection of circle from hip and foot
    var d = Math.sqrt((this.hip.x - this.foot.x) * (this.hip.x - this.foot.x) +
      (this.hip.y - this.foot.y) * (this.hip.y - this.foot.y));
    var l = (this.legLength1 * this.legLength1 - this.legLength2 * this.legLength2 + d * d) / (2 * d);
    var h = Math.sqrt(this.legLength1 * this.legLength1 - l * l);
    this.knee.x = l / d * (this.foot.x - this.hip.x) - h / d * (this.foot.y - this.hip.y) + this.hip.x + offset;
    this.knee.y = l / d * (this.foot.y - this.hip.y) + h / d * (this.foot.x - this.hip.x) + this.hip.y;
  };
  this.draw = function() {
    ctx.fillStyle = this.fill;
    if (this.mouse.x > canvas.width / 2) {
      this.flipLegs = 1;
    } else {
      this.flipLegs = -1;
    }
    this.walk_cycle += this.flipLegs * this.Vx;
    this.calcLeg(Math.PI, -3);
    this.drawLeg('#444');
    this.calcLeg(0, 0);
    this.drawLeg('#333');
    //draw body
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 2;
    //ctx.fillStyle = this.fill;
    var grd = ctx.createLinearGradient(-30, 0, 30, 0);
    grd.addColorStop(0, "#bbb");
    grd.addColorStop(1, "#fff");
    ctx.fillStyle = grd;
    ctx.beginPath();
    //ctx.moveTo(0, 0);
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.arc(15, 0, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    //draw holding graphics
    if (this.isHolding) {
      console.log(this.holdKeyDown);
      if (this.holdKeyDown > 20) {
        if (this.holdKeyDown > this.throwMax) {
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
        } else {
          ctx.strokeStyle = 'rgba(255, 0, 255, ' + (0.2 + 0.4 * this.holdKeyDown / this.throwMax) + ')';
        }
      } else {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      }
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(holdConstraint.bodyB.position.x + Math.random() * 2,
        holdConstraint.bodyB.position.y + Math.random() * 2);
      ctx.lineTo(this.x + 15 * Math.cos(this.angle), this.y + 15 * Math.sin(this.angle));
      //ctx.lineTo(holdConstraint.pointA.x,holdConstraint.pointA.y);
      ctx.stroke();
    }

  };
  this.info = function() {
    var line = 20;
    ctx.fillStyle = "#000";
    ctx.fillText("Press T to exit testing mode", 5, line);
    line += 30;
    ctx.fillText("cycle = " + this.cycle, 5, line);
    line += 20;
    ctx.fillText("mX = " + (this.mouse.x - this.transX).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("mY = " + (this.mouse.y - this.transY).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("x = " + this.x.toFixed(0), 5, line);
    line += 20;
    ctx.fillText("y = " + this.y.toFixed(0), 5, line);
    line += 20;
    ctx.fillText("Vx = " + this.Vx.toFixed(2), 5, line);
    line += 20;
    ctx.fillText("Vy = " + this.Vy.toFixed(2), 5, line);
    line += 20;
    ctx.fillText("Fx = " + player.force.x.toFixed(3), 5, line);
    line += 20;
    ctx.fillText("Fy = " + player.force.y.toFixed(3), 5, line);
    line += 20;
    ctx.fillText("height = " + this.height.toFixed(1), 5, line);
    line += 20;
    ctx.fillText("mass = " + player.mass.toFixed(1), 5, line);
    line += 20;
    ctx.fillText("onGround = " + this.onGround, 5, line);
    line += 20;
    ctx.fillText("crouch = " + this.crouch, 5, line);
    line += 20;
    ctx.fillText("isHeadClear = " + this.isHeadClear, 5, line);
    line += 20;
    ctx.fillText("frictionAir = " + player.frictionAir.toFixed(3), 5, line);

    line += 20;
    ctx.fillText("stepSize = " + this.stepSize.toFixed(2), 5, line);
  };
};
var mech = new mechProto();

//matter.js ***********************************************************
//*********************************************************************
//*********************************************************************
// module aliases
var Engine = Matter.Engine,
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
var engine = Engine.create();

//define player__________________________________________
// var playerBody = Bodies.rectangle(0, 0, 40, 130);
//player as a series of vertices
//var playerVector = Vertices.fromPath('0 0 0 130 50 130 50 0');
var playerVector = Vertices.fromPath('0 0  0 115  20 130  30 130  50 115  50 0');
var playerBody = Matter.Bodies.fromVertices(0, 0, playerVector);
//this sensor check if the player is on the ground to enable jumping
var jumpSensor = Bodies.rectangle(0, 65, 40, 10, {
  isSensor: true,
});

var headSensor = Bodies.rectangle(0, -62, 46, 30, {
  isSensor: true,
});

var player = Body.create({ //combine jumpSensor and playerBody
  parts: [playerBody, jumpSensor, headSensor],
  friction: 0,
  frictionStatic: 0,
  restitution: 0.3,
  collisionFilter: {
    group: -1
  },
});

Matter.Body.setPosition(player, mech.spawnPos);
Matter.Body.setVelocity(player, mech.spawnVel);
Matter.Body.setMass(player, mech.mass);
World.add(engine.world, [player]);
//holding body constraint
var holdConstraint = Constraint.create({
  pointA: {
    x: 0,
    y: 0
  },
  //setting constaint to jump sensor because it has to be on something until the player picks up things
  bodyB: jumpSensor,
  stiffness: 0.4,
});
World.add(engine.world, holdConstraint);

//array that holds all the elements that are drawn by the renderer___
var body = []; //non static bodies
var map = []; //all static bodies
var h = 0; //height for new body 
var w = 0; //width for new body 
function spawn() {
      for(var i = 0; i < 10; i++){  //random bouncy circles
        body[body.length] = Bodies.circle(-800+(0.5-Math.random())*200, 600+(0.5-Math.random())*200, 4+Math.ceil(Math.random()*40),{
          restitution: 0.8,
        })   
      }

  /*   for (var i = 0; i < 30; i++) { //stack of medium hexagons
      body[body.length] = Bodies.polygon(-1900, 385 - i * 70, 6, 40, {
        angle: Math.PI / 2,
      });
    } */

  for (var i = 0; i < 5; i++) { //stairs of boxes taller on left
    for (var j = 0; j < 5 - i; j++) {
      var r = 40;
      body[body.length] = Bodies.rectangle(50 + r / 2 + i * r, 900 - r / 2 - i * r, r, r, {
        restitution: 0.8,
      });
    }
  }
  for (var i = 0; i < 10; i++) { //stairs of boxes taller on right
    for (var j = 0; j < i; j++) {
      var r = 120;
      body[body.length] = Bodies.rectangle(2639 + r / 2 + i * r, 900 + r - i * r, r, r, {
        restitution: 0.6,
        friction: 0.3,
        frictionStatic: 0.9,
      });
    }
  }
  for (var i = 0; i < 12; i++) { //a stack of boxes
    body[body.length] = Bodies.rectangle(937, 700 + i * 21, 25, 21);
  }

  // body[body.length] = Bodies.circle(350, 780, 20,{
  //   friction: 0,
  //   frictionAir: 0,
  //   frictionStatic: 0,
  //   restitution: 0,
  // }) //medium circle
  // constraint1 = Constraint.create({
  //   pointA: {
  //     x: 350,
  //     y: 780
  //   },
  //   bodyB: body[body.length - 1],
  //   stiffness: 0.1,
  // })
  // World.add(engine.world, constraint1);

  //body[body.length] = Bodies.rectangle(1000, 550, 500, 10); //long box
  body[body.length] = Bodies.rectangle(700, 550, 200, 10); //long box
  //body[body.length] = Bodies.rectangle(1600, 100, 150, 100); //large box

  /* var long = Bodies.rectangle(800, 700, 200, 50); //small box  
  var tall = Bodies.rectangle(800, 700, 50, 100); //small box
  body[body.length] = Body.create({
    parts: [long, tall]
  }); */

  for (var i = 0; i < body.length; i++) {
    World.add(engine.world, body[i]); //add to world
  }
  //map statics ____________________________________________________
  function MapRect(x, y, width, height) { //addes reactangles to map array
    map[map.length] = Bodies.rectangle(x + width / 2, y + height / 2, width, height);
  }

  map[map.length] = Bodies.rectangle(700, 650, 500, 30); //platform 1
  map[map.length] = Bodies.rectangle(700, 400, 300, 30); //platform 2
  //map[map.length] = Bodies.rectangle(700, 150, 100, 30); //platform 3
  MapRect(650, 133, 100, 30); //platform 3
  MapRect(1150, 888, 45, 20);
  map[map.length] = Bodies.rectangle(0, 800, 100, 280); //left side wall
  map[map.length] = Bodies.rectangle(1500, 850, 300, 100); //ground bump
  map[map.length] = Bodies.rectangle(0, 1000, 4000, 200); //ground
  map[map.length] = Bodies.rectangle(4600, 1000, 4000, 200); //far right ground
  map[map.length] = Bodies.rectangle(2300, 1050, 600, 100); //lower ground level
  //map[map.length] = Bodies.polygon(-200, 1000, 6, 500); //large hexagon
  map[map.length] = Matter.Bodies.fromVertices(-1700, 700, Vertices.fromPath(
    '0 0 0 -500 500 -500 1000 -400 1500 0')); //large ramp
  map[map.length] = Bodies.rectangle(-400, 295, 400, 1000); //cave

  //add all of array:map to the world and set to static
  for (var i = 0; i < map.length; i++) {
    Matter.Body.setStatic(map[i], true); //make static
    World.add(engine.world, map[i]); //add to world
  }
}
// matter events *********************************************************
//************************************************************************
function playerGroundCheck(event, ground) { //runs on collisions events
  var pairs = event.pairs;
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA === jumpSensor) {
      mech.onGround = ground;
    } else if (pair.bodyB === jumpSensor) {
      mech.onGround = ground;
    }
  }
}

function playerHeadCheck(event, ground) { //runs on collisions events
  if (mech.crouch) {
    var pairs = event.pairs;
    for (var i = 0, j = pairs.length; i != j; ++i) {
      var pair = pairs[i];
      if (pair.bodyA === headSensor) {
        mech.isHeadClear = ground;
      } else if (pair.bodyB === headSensor) {
        mech.isHeadClear = ground;
      }
    }
  }
}
// function holdingCheck(event, ground) { //runs on collisions events
//   var pairs = event.pairs
//   for (var i = 0, j = pairs.length; i != j; ++i) {
//     var pair = pairs[i];
//     if (pair.bodyA === body[mech.holdingBody]) {
//       mech.dropBody();
//     } else if (pair.bodyB === body[mech.holdingBody]) {
//       mech.dropBody();
//     }
//   }
// }

//determine if player is on the ground
Events.on(engine, "collisionStart", function(event) {
  playerGroundCheck(event, true);
  playerHeadCheck(event, false);

  //if (mech.isHolding) holdingCheck(event, true)
});
Events.on(engine, "collisionActive", function(event) {
  playerGroundCheck(event, true);
  playerHeadCheck(event, false);
});
Events.on(engine, 'collisionEnd', function(event) {
  playerGroundCheck(event, false);
  playerHeadCheck(event, true);
});

Events.on(engine, "afterTick", function(event) {
  // //set sensor velocity to zero so it collides properly
  // Matter.Body.setVelocity(jumpSensor, {
  //     x: 0,
  //     y: 0
  //   })
  //   //move sensor to below the player
  // Body.setPosition(jumpSensor, {
  //   x: player.position.x,
  //   y: player.position.y + 65
  // });
});

// render ***********************************************************
//*******************************************************************
function drawMatterWireFrames() {
  var bodies = Composite.allBodies(engine.world);
  ctx.beginPath();
  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    //ctx.moveTo(bodies[i].position.x, bodies[i].position.y);
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
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
  for (var i = 0; i < map.length; i += 1) {
    var vertices = map[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
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
  for (var i = 0; i < body.length; i += 1) {
    var vertices = body[i].vertices;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
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

function drawPlayerBodyTesting() {
  //draw one body
  ctx.beginPath();
  var bodyDraw = jumpSensor.vertices;
  ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
  for (var j = 1; j < bodyDraw.length; j += 1) {
    ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
  }
  ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  //draw one body
  ctx.beginPath();
  bodyDraw = playerBody.vertices;
  ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
  for (var j = 1; j < bodyDraw.length; j += 1) {
    ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
  }
  ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
  ctx.fillStyle = 'rgba(0, 255, 0, 0.06)';
  ctx.fill();
  ctx.stroke();
  //draw one body
  ctx.beginPath();
  bodyDraw = headSensor.vertices;
  ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
  for (var j = 1; j < bodyDraw.length; j += 1) {
    ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
  }
  ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
  ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
  ctx.fill();
  ctx.stroke();
}

//main loop ************************************************************
//**********************************************************************
function cycle() {
  mech.cycle++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mech.keyMove();
  mech.keyHold();
  mech.move();
  mech.deathCheck();
  mech.look();
  //svg graphics
  document.getElementById('background').setAttribute(
    'transform', 'translate(' + (mech.transX) + ',' + (mech.transY) + ')');
  document.getElementById('foreground').setAttribute(
    'transform', 'translate(' + (mech.transX) + ',' + (mech.transY) + ')');
  ctx.save();
  ctx.translate(mech.transX, mech.transY);
  if (mech.testing) {
    mech.draw();
    drawMatterWireFrames();
    drawPlayerBodyTesting();
    ctx.restore();
    mech.info();
  } else {
    //ctx.drawImage(space_img,1800,0);
    //ctx.drawImage(bmo_img,-300,200);
    //ctx.drawImage(bgtest_img,-300,200);
    drawBody();
    drawMap();
    mech.draw();
    ctx.restore();
  }

  requestAnimationFrame(cycle);
}

// var bmo_img = new Image();   // Create new img element
// bmo_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/Bmo.png'; // Set source path

// var bgtest_img = new Image();   // Create new img element
// bgtest_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/backgroundtest.png'; // Set source path

// var space_img = new Image();   // Create new img element
// space_img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/Space.jpg'; // Set source path

function runPlatformer(el) {
  el.onclick = null; //removes the onclick effect so the function only runs once
  el.style.display = 'none'; //hides the element that spawned the function
  spawn();
  Engine.run(engine);
  requestAnimationFrame(cycle);
}