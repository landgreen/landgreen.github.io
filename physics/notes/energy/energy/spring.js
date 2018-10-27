var spring = function () {
  var canvas = document.getElementById("canvas1");
  var ctx = canvas.getContext("2d");
  ctx.font = "18px Arial";
  ctx.textAlign = "start";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  var pause = true; //start paused

  var physics = {
    gravX: 0,
    gravY: 0,
    restitution: 0,
    airFriction: 1,
    equalibrium: 300,
    k: document.getElementById("spring-k").value,
    turns: 40 //3 + 25 * Math.sqrt(0.1)
  };

  function drawEqualibrium() {
    ctx.strokeStyle = "#bbb";
    ctx.beginPath();
    ctx.moveTo(physics.equalibrium, 0);
    ctx.lineTo(physics.equalibrium, canvas.height);
    ctx.stroke();
  }

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = 500;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = r;
    this.mass = Math.PI * this.r * this.r * 0.01; //pi r squared * density
    this.energy = 0;
    this.ke = 0;
    this.pe = 0;
    this.u = 0;
    this.lineWidth = 0.5 + Math.sqrt(physics.k) / 3;
    this.fillColor = fillColor;
    this.draw = function () {
      ctx.fillStyle = this.fillColor;
      ctx.shadowColor = "#ccc";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      // ctx.stroke();
      ctx.fill();
      ctx.shadowColor = "transparent";
    };
    this.drawSpring = function () {
      ctx.lineWidth = box.lineWidth;
      ctx.strokeStyle = "black";
      ctx.shadowColor = "#ccc";
      ctx.beginPath();
      ctx.moveTo(box.x - this.r, box.y);
      for (var i = 1; i < physics.turns + 1; i++) {
        ctx.lineTo((box.x - this.r) * (1 - i / physics.turns), box.y + (i % 2 === 0 ? 10 : -10));
      }
      ctx.stroke();
      ctx.shadowColor = "transparent";
    };
    this.move = function () {
      this.x += this.Vx;
      this.y += this.Vy;
      this.Vx *= physics.airFriction;
      this.Vy *= physics.airFriction;
    };
    this.edges = function () {
      // if (this.x > canvas.width - this.r) {
      //   this.Vx *= -physics.restitution;
      //   this.x = canvas.width - this.r;
      // }
      if (this.x < this.r) {
        this.Vx *= -physics.restitution;
        this.x = this.r;
      }
      // if (this.y > canvas.height - this.r) {
      //   this.Vy *= -physics.restitution;
      //   this.y = canvas.height - this.r;
      // } else if (this.y < this.r) {
      //   this.Vy *= -physics.restitution;
      //   this.y = this.r;
      // }
    };
    this.gravity = function () {
      this.Vx += physics.gravX;
      this.Vy += physics.gravY;
    };
    this.spring = function () {
      const displacement = (physics.equalibrium - this.x) / 50;
      this.Vx += (physics.k * displacement) / this.mass / 60;
    };

    this.calcEnergy = function () {
      var speed2 = this.Vx * this.Vx + this.Vy * this.Vy;
      this.ke = 0.5 * this.mass * speed2;
      var height = canvas.height - this.r - this.y;
      this.pe = this.mass * physics.gravY * height;
    };
    this.info = function () {
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
    this.springInfo = function () {
      const xScaled = (this.x - 300) / 50;
      var F = -physics.k * xScaled;
      this.u = 0.5 * physics.k * xScaled * xScaled;
      this.ke = 0.5 * this.mass * this.Vx * this.Vx;
      var E = this.ke + this.u;
      //draw energy bars
      // ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
      // ctx.fillRect(0, 0, canvas.width * (this.ke / E), 25);
      ctx.fillStyle = "rgba(255, 102, 85,0.25)";
      ctx.fillRect(0, 0, canvas.width * (this.u / E), 25);
      //draw energy text
      ctx.fillStyle = "#000";
      // ctx.fillText("KE = ½mv² = " + this.ke.toFixed(0) + "J", 5, 20);
      ctx.fillText("U = " + this.u.toFixed(0) + " J", 5, 20);
      ctx.fillText("F = " + F.toFixed(0) + " N", 5, canvas.height - 5);
      //ctx.fillText('k = ' + (physics.k), 5, canvas.height - 25);
      ctx.fillText("x = " + xScaled.toFixed(1) + " m", 270, canvas.height - 5);
    };
    this.forceArrow = function () {
      //force vector
      var F = (-physics.k * (this.x - physics.equalibrium)) / 50;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#000";
      ctx.beginPath();
      var y = box.y + box.r + 5;
      var x = box.x + F / 2;
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
    box = new mass(130, canvas.height / 2, 0, 0, 20, "rgb(255, 102, 85)");
    document.getElementById("spring-m").value = Math.round(box.mass);
  }
  spawn();

  document.getElementById("pause1").addEventListener("click", function () {
    if (pause) {
      pause = false;
      document.getElementById("pause1").innerHTML = "pause";
      render();
    } else {
      pause = true;
      document.getElementById("pause1").innerHTML = "play";
    }
  });

  //on click move to mouse
  canvas.addEventListener("mousedown", function (event) {
    (box.x = (event.offsetX * canvas.width) / canvas.clientWidth), (box.Vx = 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawEqualibrium();
    box.drawSpring();
    box.draw();
    graphingOnSVG();
  });
  //get values for spring constant

  document.getElementById("spring-k").addEventListener("input", function () {
    physics.k = document.getElementById("spring-k").value;
    box.lineWidth = 0.5 + Math.sqrt(physics.k) / 3;
    // box.Vx = 0;
    // physics.turns = 3 + 25 * Math.sqrt(physics.k);
    if (pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      box.drawSpring();
      box.draw();
      graphingOnSVG();
    }
  });

  document.getElementById("spring-k-slider").addEventListener("input", function () {
    physics.k = document.getElementById("spring-k-slider").value;
    box.lineWidth = 0.5 + Math.sqrt(physics.k) / 3;
    // box.Vx = 0;
    // physics.turns = 3 + 25 * Math.sqrt(physics.k);
    if (pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      box.drawSpring();
      box.draw();
      graphingOnSVG();
    }
  });

  function newMass() {
    box.mass = document.getElementById("spring-m").value;
    box.r = Math.sqrt(box.mass / Math.PI / 0.01);
    //adjust radius for tracking circle on SVG graph
    document.getElementById("graphing-position").setAttribute("r", box.r);
    if (pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      box.drawSpring();
      box.draw();
      graphingOnSVG();
    }
  }
  //gets values for mass
  document.getElementById("spring-m").addEventListener("input", function () {
    document.getElementById("spring-m-slider").value = document.getElementById("spring-m").value;
    newMass();
  });
  document.getElementById("spring-m-slider").addEventListener("input", event => {
    document.getElementById("spring-m").value = document.getElementById("spring-m-slider").value;
    newMass();
  });

  //graphing position on the SVG
  document.getElementById("graphing-position").style.display = "block"; //makes hidden circle visible
  document.getElementById("graphing-position").setAttribute("r", box.r); //set radius
  //bring circle to front layer
  const parent = document.getElementById("SVG-graph-0");
  const shouldBeLast = document.getElementById("graphing-position");
  const last = document.getElementById("");
  parent.insertBefore(parent.removeChild(shouldBeLast), last);
  // circle moves on the graph
  function graphingOnSVG() {
    document.getElementById("graphing-position").setAttribute("cx", box.x);
    const x = box.x - 299;

    document.getElementById("graphing-position").setAttribute("cy", 280 - ((physics.k / 2) * x * x) / 50 / 50);
  }

  function render() {
    //repeating animation function
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    box.edges();
    box.spring();
    box.move();
    // drawEqualibrium();
    box.drawSpring();
    box.draw();
    box.forceArrow();
    // box.springInfo();
    graphingOnSVG();
    if (!pause) window.requestAnimationFrame(render);
  }
  window.requestAnimationFrame(render);
};
spring();