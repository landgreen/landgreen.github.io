/*  todo
click on body to control
change body radius??? how?

add motion?
add in vector field on/off button
extend to electrostatic
output some html everycycle that gives data on each mass
each mass could be a div with a boarder
a for loop could write the innerhtml
make colors determined by mass
red-yellow-white-blue  (adding more blue as mass increases)
cap force vectorsfields lines at the size of the spacing
make it so you can only move one body at a time
make force vectors reduced if one star is inside the radius of another?
*/
"use strict";

(function setup() {  //writes a message onload
    var canvas = document.getElementById('gravity');
    var ctx = canvas.getContext("2d");
    ctx.font = "25px Arial";
    ctx.fillStyle = '#aaa';
    ctx.textAlign = "center";
    ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
})()

function gravityDiagram(button) {
  button.onclick = null; //stops the function from running after first run
var canvas = document.getElementById("gravity");
var ctx = canvas.getContext("2d");

(function setupCanvas() {
  canvas.width = window.innerWidth - 40;
  ctx.font = '15px Arial';
  ctx.lineCap = "round";
  ctx.lineJoin = "miter";
  ctx.miterLimit = 10;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  //ctx.lineWidth = 2;
})();
window.onresize = function() {
  setupCanvas();
};

var mouse = {
  down: false,
  pos: {
    x: 0,
    y: 0
  }
};

// waits for mouse move and then updates position
document.addEventListener('mousemove', function(e) {
  var rect = canvas.getBoundingClientRect();
  mouse.pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  cycle();
}, false);

//track if mouse is up or down
window.onmousedown = function() {
  mouse.down = true;
  for (var i = 0; i < body.length; i++) {
    body[i].isMouseOver = body[i].mouseOverCheck();
    if (body[i].isMouseOver) body[i].setMouseOffset();
  }
  if (mouse.pos.y > canvas.height-settings.bar) {
    var len = body.length;
    body[len] = new bodyProto(len + 1, mouse.pos.x, mouse.pos.y, 5 + Math.random() * 80);
    body[len].isMouseOver = true;
  }
  cycle();
};
window.onmouseup = function() {
  mouse.down = false;
  if (mouse.pos.y > canvas.height-settings.bar) {
    for (var i = 0; i < body.length; i++) {
    if (body[i].isMouseOver) {
      body.splice(i, 1);
      break;
    }
  }
  cycle();
  }

};
var settings = {
  g: 0.00004,
  fieldSpacing: 25,
  fieldGravity: 0.25,
  bar: 40,
}
const body = [];
var bodyProto = function(name, x, y, radius) {
  this.name = name;
  this.color = randomColor({
    hue: 'red'
  });
  this.r = radius; //radius is also used as mass for force calculations
  this.calcMass = function() {
    return 4 / 3 * Math.PI * this.r * this.r * this.r;
  }
  this.mass = this.calcMass();
  this.pos = {
    x: x,
    y: y
  };
  this.force = {
    x: 0,
    y: 0
  };
  this.distanceTo = function(pos) {
    var dx = this.pos.x - pos.x;
    var dy = this.pos.y - pos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  this.isMouseOver = false;
  this.mouseOverCheck = function() {
    if (this.distanceTo(mouse.pos) < this.r) {
      return true;
    } else {
      return false;
    }
  }
  this.mouseMove = function() {
    if (this.isMouseOver && mouse.down) {
      this.pos.x = mouse.pos.x + this.mouseOffset.x
      this.pos.y = mouse.pos.y + this.mouseOffset.y
    }
  }
  this.mouseOffset = {
    x: 0,
    y: 0
  }
  this.setMouseOffset = function() {
    this.mouseOffset.x = this.pos.x - mouse.pos.x;
    this.mouseOffset.y = this.pos.y - mouse.pos.y;
  }

  this.calcForce = function(j) {
    this.force.x = 0;
    this.force.y = 0;
    var f = 0;
    var dx = 0;
    var dy = 0;
    var a = 0;
    for (var i = 0; i < body.length; i++) {
      if (i != j) {
        dx = (body[i].pos.x - this.pos.x);
        dy = (body[i].pos.y - this.pos.y);
        f = settings.g * body[i].mass * this.mass / (dx * dx + dy * dy);
        a = Math.atan2(dy, dx);
        this.force.x += f * Math.cos(a);
        this.force.y += f * Math.sin(a);
      }
    }
  }
  this.drawOutline = function() {
    ctx.font = '15px Arial';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r + 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#000";
    var y = this.pos.y - this.r - 15;
    var x = this.pos.x;

    ctx.fillText("mass: " + this.mass.toFixed(0), x, y);
    y -= 15;
    // ctx.fillText("id: " + this.name, x, y);
    // y -= 15;
    ctx.fillText("force: " + (Math.sqrt(this.force.x * this.force.x + this.force.y * this.force.y).toFixed(0)), x, y);
    //
  }

  this.drawForce = function() {
    var mag = Math.sqrt(this.force.x * this.force.x + this.force.y * this.force.y)
    if (mag > 1) {
      var a = Math.atan2(this.force.y, this.force.x);
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(a);

      ctx.beginPath(); //vector line
      ctx.moveTo(0, 0);
      ctx.lineTo(mag, 0);
      ctx.strokeStyle = "#033";
      ctx.stroke();

      ctx.beginPath(); //arrows
      ctx.moveTo(mag + 8, 0);
      ctx.lineTo(mag, -5);
      ctx.lineTo(mag, 5);
      ctx.fillStyle = "#033";
      ctx.fill();

      ctx.restore();
    }
  };
  this.drawFill = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
  };
};

function drawBar(){
  ctx.fillStyle = "#cdd";
  ctx.fillRect(0,canvas.height-settings.bar,canvas.width,canvas.height);
  ctx.fillStyle = "#033";
  ctx.font = '25px Arial';
  ctx.fillText("add / remove",canvas.width/2,canvas.height-settings.bar/2);
}


function gravityVectorField() {

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#033"
  var lenX = Math.floor(canvas.width / settings.fieldSpacing);
  var lenY = Math.floor(canvas.height / settings.fieldSpacing);
  var gravity = settings.fieldGravity;
  var x, y, dist, draw;
  for (var k = 0; k < lenY; k++) {
    for (var j = 0; j < lenX; j++) {
      draw = true;
      x = canvas.width * (j + 0.5) / lenX;
      y = (canvas.height-settings.bar) * (k + 0.5) / lenY;
      //calc Forces
      var dx, dy, f, a;
      var fx = 0;
      var fy = 0;
      for (var i = 0; i < body.length; i++) {
        dx = (body[i].pos.x - x);
        dy = (body[i].pos.y - y);
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < body[i].r) {
          draw = false; //don't draw in inside a body
          break;  //exit the forloop
        }
          f = gravity * body[i].mass / (dist * dist);
          a = Math.atan2(dy, dx);
          fx += f * Math.cos(a);
          fy += f * Math.sin(a);
      }
      if (draw) {
        //make small vectors more transparent
        var alpha = 1;
        var fmag = Math.sqrt(fx*fx+fy*fy);
        if (fmag < 1) alpha = fmag;
        ctx.globalAlpha=alpha;
        //draw
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + fx, y + fy);
        ctx.stroke();
      }
    }

  }
  ctx.globalAlpha=1;
}

function spawn() {
  // body[0] = new bodyProto(1, 500, canvas.height * 0.1, 50);
  // body[1] = new bodyProto(2, 30, canvas.height * 0.6, 70);
  // body[2] = new bodyProto(3, 670, canvas.height * 0.8, 40);
  // body[2] = new bodyProto(4, 400, canvas.height * 0.8, 30);
  for (var i = 0; i < 2; i++) {
    body[i] = new bodyProto(i + 1, canvas.width*0.1 + Math.random() * canvas.width*0.8,
    canvas.height*0.1 - settings.bar + Math.random() * canvas.height*0.8, 10 + Math.random() * 50);
  }

}
spawn();

function cycle() { //runs each time the mouse moves
  //mouse over anything?
  for (var i = 0; i < body.length; i++) {
    body[i].mouseMove();
  }
  //clear canvas
  //ctx.fillStyle = "#222";
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //draw
  gravityVectorField();
  drawBar();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#399";
  //ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < body.length; i++) {
    body[i].calcForce(i);
    body[i].drawFill();
  }
  for (var i = 0; i < body.length; i++) {
    if (body[i].mouseOverCheck()) {
      body[i].drawOutline();
      body[i].drawForce();
    }
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#033";
  //ctx.globalCompositeOperation = 'source-over';
  // for (var i = 0; i < body.length; i++) {
  //   body[i].drawForce();
  // }
}
cycle() //run once at start
}
gravityDiagram();
