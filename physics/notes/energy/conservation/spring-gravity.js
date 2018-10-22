(function setup() {
  //writes a message onload
  var canvas = document.getElementById("canvas2");
  var ctx = canvas.getContext("2d");
  ctx.font = "25px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start", canvas.width / 2, canvas.height / 2);
})();

var springGravity = function (button) {
  button.onclick = null; //stops the function from running after first run
  var canvasID = "canvas2";
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
    rate: 10000,
    gravX: 0,
    gravY: 9.8,
    restitution: 0,
    airFriction: 1,
    equalibrium: canvas.height / 2,
    k: 3, //document.getElementById("spring-k").value,
    turns: 1 + 5 * Math.sqrt(3)
  };

  function drawEqualibrium() {
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, physics.equalibrium);
    ctx.lineTo(canvas.width, physics.equalibrium);
    ctx.stroke();
  }

  function mass(x, y, Vx, Vy, mass, fillColor) {
    //constructor function that determines how masses work
    this.massFromRadius = function (radius) {
      return Math.PI * radius * radius * 0.001;
    };
    this.radiusFromMass = function (mass) {
      return Math.sqrt(mass / Math.PI / 0.001);
    };
    this.x = x;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = this.radiusFromMass(mass);
    this.mass = mass; //pi r squared * density
    this.energy =
      0.5 * physics.k * (this.y - physics.equalibrium) * (this.y - physics.equalibrium) +
      this.mass * physics.gravY * (canvas.height - this.y) +
      0.5 * this.mass * this.Vy * this.Vy;
    this.ke = 0;
    this.Us = 0;
    this.Ug = 0;
    this.fillColor = fillColor;
    this.draw = function () {
      ctx.shadowColor = "#ccc";
      ctx.fillStyle = this.fillColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = "transparent";
    };

    this.drawSpring = function () {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "black";
      ctx.shadowColor = "#999";
      ctx.beginPath();
      ctx.moveTo(box.x, box.y - this.r);
      for (var i = 1; i < physics.turns + 1; i++) {
        ctx.lineTo(box.x + (i % 2 === 0 ? 10 : -10), (box.y - this.r) * (1 - i / physics.turns));
      }
      ctx.stroke();
      ctx.shadowColor = "transparent";
    };
    this.move = function () {
      //this.x += this.Vx;
      this.y += this.Vy / physics.rate;
      //this.Vx *= physics.airFriction;
      this.Vy *= physics.airFriction;
    };
    this.edges = function () {
      // if (this.x > canvas.width - this.r) {
      //   this.Vx *= -physics.restitution;
      //   this.x = canvas.width - this.r;
      // } else if (this.x < this.r) {
      //   this.Vx *= -physics.restitution;
      //   this.x = this.r;
      // }
      if (this.y > canvas.height - this.r) {
        this.Vy *= -physics.restitution;
        this.y = canvas.height - this.r;
      } else if (this.y < this.r) {
        this.Vy *= -physics.restitution;
        this.y = this.r;
      }
    };
    this.gravity = function () {
      this.Vy += physics.gravY / physics.rate; //mass cancels out from F=mg, f=ma, ma=mg, a=g, v+=g
    };
    this.spring = function () {
      this.Vy += (physics.k * (physics.equalibrium - this.y)) / this.mass / physics.rate;
    };
    this.springInfo = function () {
      var height = canvas.height - this.r - this.y;
      this.Us = 0.5 * physics.k * (this.y - physics.equalibrium) * (this.y - physics.equalibrium);
      this.Ug = this.mass * physics.gravY * height;
      this.ke = 0.5 * this.mass * this.Vy * this.Vy;
      this.energy = this.Us + this.Ug + this.ke;
      //draw energy bars

      // // ctx.fillStyle = "rgba(255, 0, 255, 0.4)";
      // ctx.fillStyle = "rgba(255, 102, 85, 0.8)" //"#f65" //"rgba(255, 0, 255, 0.3)";
      // ctx.fillRect(0, 0, canvas.width * (this.ke / this.energy), 25);
      // // ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
      // ctx.fillStyle = "rgba(85, 204, 204, 0.8)" //"#5cc" //"rgba(0, 255, 255, 0.3)";
      // ctx.fillRect(0, 25, canvas.width * (this.Us / this.energy), 25);
      // // ctx.fillStyle = "rgba(0, 255, 70, 0.4)";
      // ctx.fillStyle = "rgba(0,0,0,0.2)";
      // ctx.fillRect(0, 50, canvas.width * (this.Ug / this.energy), 25);
      // //draw energy text
      // ctx.fillStyle = "#000";
      // ctx.fillText("KE = ½mv² = " + (this.ke / 1000).toFixed(0) + "kJ", 5, 20);
      // ctx.fillText("Us = ½ky² = " + (this.Us / 1000).toFixed(0) + "kJ", 5, 44);
      // ctx.fillText("Ug = mgh = " + (this.Ug / 1000).toFixed(0) + "kJ", 5, 69);
      // ctx.fillText("E = " + (this.energy / 1000).toFixed(0) + "kJ", 5, 92); //total energy doesn't stay still, probably because of onyl calculating 60 times a second?
      // ctx.fillText("g = " + physics.gravY.toFixed(1) + "m/s²", 5, canvas.height - 5);
      // ctx.fillText("h = " + height.toFixed(0) + "m", 5, canvas.height - 30);
      // ctx.fillText("y = " + (this.y - physics.equalibrium).toFixed(0) + "m", 5, canvas.height - 55);
      // ctx.fillText("v = " + this.Vy.toFixed(0) + "m/s", 5, canvas.height - 80);

      document.getElementById("spring-KE-bar2").style.width = 100 * (this.ke / this.energy) + "%"
      document.getElementById("spring-Us-bar2").style.width = 100 * (this.Us / this.energy) + "%"
      document.getElementById("spring-Ug-bar2").style.width = 100 * (this.Ug / this.energy) + "%"

      document.getElementById("spring-KE2").innerHTML = " KE = ½mv² = " + (this.ke / 1000).toFixed(1) + " kJ"
      document.getElementById("spring-Us2").innerHTML = " Us = ½ky² = " + (this.Us / 1000).toFixed(0) + " kJ"
      document.getElementById("spring-Ug2").innerHTML = " Ug = mgh = " + (this.Ug / 1000).toFixed(0) + " kJ"
      document.getElementById("spring-E2").innerHTML = "E = " + (this.energy / 1000).toFixed(0) + " kJ"
      // document.getElementById("spring-g2").innerHTML =
      document.getElementById("spring-h2").innerHTML = "h = " + height.toFixed(0) + " m"
      document.getElementById("spring-y2").innerHTML = "y = " + (this.y - physics.equalibrium).toFixed(0) + " m"
      document.getElementById("spring-v2").innerHTML = "v = " + this.Vy.toFixed(0) + " m/s"


      // //force vector
      // ctx.lineWidth = 2;
      // ctx.strokeStyle = 'black';
      // ctx.fillStyle = 'black';
      // ctx.beginPath();
      // var y = box.y+F
      // var x = box.x + box.r + 5
      // ctx.moveTo(x, box.y);
      // ctx.lineTo(x, y);
      // ctx.stroke();
      // //Force arrow
      // ctx.beginPath();
      // ctx.lineTo(x+5, y);
      // //if F is negative times 5 else times -5
      // ctx.lineTo(x, y+(F > 0 ? 8 : -8));
      // ctx.lineTo(x-5, y);
      // ctx.lineTo(x, y);
      // ctx.fill();
    };
  }

  var box;

  function spawn() {
    box = new mass(canvas.width / 2, 80, 0, 0, 5, "#bbb");
    document.getElementById("spring-m2").value = box.mass;
    document.getElementById("spring-k2").value = physics.k;
  }
  spawn();

  document.getElementById("pause2").addEventListener("click", function () {
    if (pause) {
      pause = false;
      render();
    } else {
      pause = true;
    }
  });

  let mouse = {
    x: 0,
    y: 0
  };
  document.getElementById(canvasID).addEventListener("mousedown", function (event) {
    //gets mouse position, even when canvas is scaled by CSS
    box.x = mouse.x = event.offsetX * canvas.width / canvas.clientWidth;
    box.y = mouse.y = event.offsetY * canvas.height / canvas.clientHeight;
    box.Vx = 0;
    box.Vy = 0;
  });


  //mouse controls
  // let mousePos = {
  //   x: window.innerWidth * 0.5,
  //   y: window.innerHeight * 0.5
  // };

  // //gets mouse position, even when canvas is scaled by CSS
  // function getMousePos(canvas, event) {
  //   const mouse = {
  //     x: event.clientX - ctx.canvas.offsetLeft,
  //     y: event.clientY - ctx.canvas.offsetTop
  //   };
  //   return {
  //     x: (mouse.x * canvas.width) / canvas.clientWidth,
  //     y: (mouse.y * canvas.height) / canvas.clientHeight
  //   };
  // }
  //on click move to mouse
  // document.getElementById(canvasID).addEventListener("mousedown", function (evt) {
  //   mousePos = getMousePos(canvas, evt);
  //   box.x = mousePos.x;
  //   box.y = mousePos.y;
  //   box.Vx = 0;
  //   box.Vy = 0;
  // });
  //get values for spring constant
  document.getElementById("spring-k2").addEventListener("input", function () {
    physics.k = document.getElementById("spring-k2").value;
    box.Vx = 0;
    physics.turns = 1 + 5 * Math.sqrt(physics.k);
  });

  //gets values for mass
  document.getElementById("spring-m2").addEventListener("input", function () {
    box.mass = document.getElementById("spring-m2").value;
    box.r = box.radiusFromMass(box.mass);
  });

  window.requestAnimationFrame(render);

  let cycle = 0;

  function render() {
    //repeating animation function
    if (!pause) {
      cycle++;
      window.requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < physics.rate / 60; i++) {
        box.move();
        box.edges();
        box.spring();
        box.gravity();
      }

      box.springInfo();
      drawEqualibrium();
      box.drawSpring();
      box.draw();
    }
  }
};