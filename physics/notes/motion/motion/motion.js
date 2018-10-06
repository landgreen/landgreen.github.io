var motion = function (canvasID, showPos, showTime, showVel, showAccel, position, velocity, acceleration, edges) {
  var canvas = document.getElementById(canvasID);
  canvas.onclick = null; //stops the function from running on button click
  var ctx = canvas.getContext("2d");
  ctx.font = "20px Arial";
  ctx.textAlign = "start";
  ctx.lineWidth = 2;

  let pause = true;
  canvas.addEventListener("mouseleave", function () {
    pause = true;
  });
  canvas.addEventListener("mouseenter", function () {
    pause = false;
    if (!pause) requestAnimationFrame(render);
  });

  var mousePos = {
    x: position,
    y: canvas.height / 2
  };

  document.getElementById(canvasID).addEventListener("mousedown", function (evt) {
    mousePos = {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    };
    spawn();
    physics.startTime = new Date().getTime();
  });

  var physics = {
    gravX: 0,
    gravY: 0,
    restitution: 1,
    equalibrium: 400
  };
  if (acceleration) {
    physics.gravX = acceleration;
  }

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = x;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = r;
    this.t = 0;
    this.mass = Math.PI * this.r * this.r * 0.01; //pi r squared * density
    this.fillColor = fillColor;
    this.draw = function () {
      ctx.fillStyle = this.fillColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      //ctx.stroke();
      ctx.fill();
    };
    this.move = function () {
      this.t += 1 / 60;
      this.x += this.Vx / 60;
      this.y += this.Vy / 60;
    };
    this.timeCycle = function () {
      if (showTime) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.r, -Math.PI / 2, (this.t % 60) / 3 / Math.PI - Math.PI / 2);
        //ctx.stroke();
        ctx.fill();
      }
    };
    this.edges = function () {
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
    this.gravity = function () {
      this.Vx += physics.gravX / 60;
      this.Vy += physics.gravY / 60;
    };
    this.distance = function () {
      const edge = this.x - this.r - 3
      const leftX = 3;
      if (showPos && edge > leftX) {
        const length = 7
        const centerY = canvas.height / 2
        ctx.beginPath();
        ctx.moveTo(leftX, centerY - length);
        ctx.lineTo(leftX, centerY + length);
        ctx.moveTo(leftX, centerY);
        ctx.lineTo(edge, centerY);
        ctx.moveTo(edge, centerY - length);
        ctx.lineTo(edge, centerY + length);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#666";
        ctx.stroke();
      }
    };
    this.info = function () {
      //text
      ctx.fillStyle = "#000";
      ctx.textAlign = "end";
      var lineHeight = 26;
      var line = 0;
      if (showPos) {
        line += lineHeight;
        ctx.fillText("x = " + (this.x - this.r).toFixed(0) + " m", canvas.width - 5, line);
      }
      if (showTime) {
        line += lineHeight;
        ctx.fillText("t = " + this.t.toFixed(1) + " s", canvas.width - 5, line);
      }
      if (showVel) {
        line += lineHeight;
        ctx.fillText("v = " + this.Vx.toFixed(0) + " m/s", canvas.width - 5, line);
      }
      if (showAccel) {
        line += lineHeight;
        ctx.fillText("a = " + physics.gravX.toFixed(1) + " m/s²", canvas.width - 5, line);
      }
    };
  }

  var box;

  function spawn() {
    //mass(x, y, Vx, Vy ,r, fillColor)
    // box = new mass(canvas.width / 2, canvas.height / 2, velocity, 0, 50, randomColor() );
    box = new mass(mousePos.x, canvas.height / 2, velocity, 0, 50, "#abc");
  }
  spawn();

  window.requestAnimationFrame(render);

  function render() {
    //repeating animation function
    if (!pause) window.requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (edges) box.edges();
    box.move();
    box.gravity();
    box.distance();
    box.draw();
    box.timeCycle();
    box.info();

  }
};
motion("canvas1", true, false, false, false, 300, 0, 0, false);
motion("canvas2", true, true, false, false, 300, 0, 0, false);
motion("canvas3", true, true, true, false, 300, -80, 0, true);
motion("canvas5", true, true, true, false, 50, 20, 0, false);
motion("canvas4", true, true, true, true, 300, 0, -9.8, true);
motion("canvas0", false, true, true, true, 300, 0, 4.5, true);