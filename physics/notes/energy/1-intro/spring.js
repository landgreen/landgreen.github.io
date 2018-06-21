(function setup() {
  //writes a message onload
  var canvas = document.getElementById("canvas1");
  var ctx = canvas.getContext("2d");
  ctx.font = "25px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

var spring = function(button) {
  button.onclick = null; //stops the function from running after first run
  var canvasID = "canvas1";
  var canvas = document.getElementById(canvasID);
  var ctx = canvas.getContext("2d");
  ctx.font = "18px Arial";
  ctx.textAlign = "start";
  ctx.miterLimit = 1;
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  var pause = false;

  var physics = {
    gravX: 0,
    gravY: 0,
    restitution: 0,
    airFriction: 1,
    equalibrium: 400,
    k: 0.1 //document.getElementById("spring-k").value,
  };

  function drawEqualibrium() {
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(physics.equalibrium, 0);
    ctx.lineTo(physics.equalibrium, canvas.height);
    ctx.stroke();
  }

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = canvas.width;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = r;
    this.mass = Math.PI * this.r * this.r * 0.01; //pi r squared * density
    this.energy = 0;
    this.ke = 0;
    this.pe = 0;
    this.u = 0;
    this.fillColor = fillColor;
    this.draw = function() {
      ctx.fillStyle = this.fillColor;
      ctx.shadowColor = "#ccc";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      // ctx.stroke();
      ctx.fill();
      ctx.shadowColor = "transparent";
    };
    this.drawSpring = function() {
      ctx.strokeStyle = "black";
      ctx.shadowColor = "#ccc";
      ctx.beginPath();
      ctx.moveTo(box.x - this.r, box.y);
      var turns = 21;
      var add = 5;
      for (var i = 1; i < turns + 1; i++) {
        ctx.lineTo((box.x - this.r) * (1 - i / turns), box.y + (i % 2 === 0 ? 10 : -10));
        // ctx.lineTo(box.x + (i % 2 === 0 ? 10 : -10), (box.y - this.r) * (1 - i / turns));
      }
      ctx.stroke();
      ctx.shadowColor = "transparent";
    };
    this.move = function() {
      this.x += this.Vx;
      this.y += this.Vy;
      this.Vx *= physics.airFriction;
      this.Vy *= physics.airFriction;
    };
    this.edges = function() {
      if (this.x > canvas.width - this.r) {
        this.Vx *= -physics.restitution;
        this.x = canvas.width - this.r;
      } else if (this.x < this.r) {
        this.Vx *= -physics.restitution;
        this.x = this.r;
      }
      if (this.y > canvas.height - this.r) {
        this.Vy *= -physics.restitution;
        this.y = canvas.height - this.r;
      } else if (this.y < this.r) {
        this.Vy *= -physics.restitution;
        this.y = this.r;
      }
    };
    this.gravity = function() {
      this.Vx += physics.gravX;
      this.Vy += physics.gravY;
    };
    this.spring = function() {
      this.Vx += (physics.k * (physics.equalibrium - this.x)) / 60 / this.mass;
    };

    this.calcEnergy = function() {
      var speed2 = this.Vx * this.Vx + this.Vy * this.Vy;
      this.ke = 0.5 * this.mass * speed2;
      var height = canvas.height - this.r - this.y;
      this.pe = this.mass * physics.gravY * height;
    };
    this.info = function() {
      this.calcEnergy();
      //bars
      ctx.fillStyle = "violet";
      ctx.fillRect(0, 0, canvas.width * (this.ke / this.energy), 20);
      ctx.fillStyle = "cyan";
      ctx.fillRect(0, 20, canvas.width * (this.pe / this.energy), 20);
      //heat bar
      if (physics.restitution != 1) {
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(canvas.width, 0, -canvas.width * (1 - (this.pe + this.ke) / this.energy), 40);
      }
      //text
      ctx.fillStyle = "#000";
      ctx.fillText("KE = ½mv² = " + this.ke.toFixed(0) + " J", 5, 15);
      ctx.fillText("PE = mgh = " + this.pe.toFixed(0) + " J", 5, 35);
      //ctx.fillText('PE + KE = ' + (PE + KE).toFixed(0) + 'J', 5, 55);
      //ctx.fillText('Vx = ' + (this.Vx).toFixed(0) + 'm/s', 5, 30);
      //ctx.fillText('Vy = ' + this.Vy.toFixed(1) + 'm/s', 5, 75);
    };
    this.springInfo = function() {
      var F = -physics.k * (this.x - physics.equalibrium);
      this.u = 0.5 * physics.k * (this.x - physics.equalibrium) * (this.x - physics.equalibrium);
      this.ke = 0.5 * this.mass * this.Vx * this.Vx * 60;
      var E = this.ke + this.u;
      //draw energy bars
      // ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
      // ctx.fillRect(0, 0, canvas.width * (this.ke / E), 25);
      ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
      ctx.fillRect(0, 0, canvas.width * (this.u / E), 25);
      //draw energy text
      ctx.fillStyle = "#000";
      // ctx.fillText("KE = ½mv² = " + this.ke.toFixed(0) + "J", 5, 20);
      ctx.fillText("U = ½kx² = " + this.u.toFixed(0) + " J", 5, 20);
      ctx.fillText("F = -kx = " + F.toFixed(0) + " N", 5, canvas.height - 5);
      //ctx.fillText('k = ' + (physics.k), 5, canvas.height - 25);
      ctx.fillText("x = " + (this.x - physics.equalibrium).toFixed(0) + " m", 5, canvas.height - 25);
      //force vector
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.beginPath();
      var y = box.y + box.r + 5;
      var x = box.x + F;
      ctx.moveTo(box.x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      //Force arrow
      ctx.beginPath();
      ctx.lineTo(x, y + 5);
      //if F is negative times 5 else times -5
      ctx.lineTo(x + (F > 0 ? 8 : -8), y);
      ctx.lineTo(x, y - 5);
      ctx.lineTo(x, y);
      ctx.fill();
    };
  }

  var box;

  function spawn() {
    box = new mass(130, canvas.height / 2, 1, 0, 20, randomColor());
    document.getElementById("spring-m").value = Math.round(box.mass);
  }
  spawn();

  document.getElementById("pause1").addEventListener("click", function() {
    if (pause) {
      pause = false;
      render();
    } else {
      pause = true;
    }
  });

  //mouse controls
  var mousePos = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5
  };

  //gets mouse position
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  //on click move to mouse
  document.getElementById(canvasID).addEventListener("mousedown", function(evt) {
    mousePos = getMousePos(canvas, evt);
    box.x = mousePos.x;
    box.Vx = 0;
  });
  //get values for spring constant

  document.getElementById("spring-k").addEventListener("change", function() {
    physics.k = document.getElementById("spring-k").value;
    box.Vx = 0;
  });

  //gets values for mass
  document.getElementById("spring-m").addEventListener("change", function() {
    box.mass = document.getElementById("spring-m").value;
    box.r = Math.sqrt(box.mass / Math.PI / 0.01);
  });

  window.requestAnimationFrame(render);

  function render() {
    //repeating animation function
    if (!pause) {
      window.requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      box.edges();
      box.spring();
      box.move();
      drawEqualibrium();
      box.drawSpring();
      box.draw();
      box.springInfo();
    }
  }
};
