var spring = function () {
  var pause = true;

  var physics = {
    gravX: 0,
    gravY: 0,
    restitution: 0,
    airFriction: 1,
    equalibrium: 400,
    height: 100,
    k: 0.1, //document.getElementById("spring-k").value,
    turns: 3 + 25 * Math.sqrt(0.1)
  };

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = x;
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
    this.draw = function () {
      //SVG draw
      document.getElementById("spring-ball").setAttribute("r", this.r);
      document.getElementById("spring-ball").setAttribute("cx", this.x);
      document.getElementById("spring-ball").setAttribute("cy", this.y);
    };
    this.drawSpring = function () {
      let d = `M ${box.x-this.r} 50`;
      for (var i = 1; i < physics.turns + 1; i++) {
        d += `L ${(box.x - this.r) * (1 - i / physics.turns)} ${ box.y + (i % 2 === 0 ? 10 : -10)}`;
      }
      document.getElementById("spring-wire").setAttribute("d", d);

    };
    this.move = function () {
      this.x += this.Vx;
      this.y += this.Vy;
      this.Vx *= physics.airFriction;
      this.Vy *= physics.airFriction;
    };
    this.edges = function () {
      if (this.x < this.r) {
        this.Vx *= -physics.restitution;
        this.x = this.r;
      }
    };
    this.gravity = function () {
      this.Vx += physics.gravX;
      this.Vy += physics.gravY;
    };
    this.spring = function () {
      this.Vx += (physics.k * (physics.equalibrium - this.x)) / 60 / this.mass;
    };

    this.calcEnergy = function () {
      var speed2 = this.Vx * this.Vx + this.Vy * this.Vy;
      this.ke = 0.5 * this.mass * speed2;
      var height = physics.height - this.r - this.y;
      this.pe = this.mass * physics.gravY * height;
    };
    this.springInfo = function () {
      this.calcEnergy();
      // var F = -physics.k * (this.x - physics.equalibrium);
      this.u = 0.5 * physics.k * (this.x - physics.equalibrium) * (this.x - physics.equalibrium);
      this.ke = 0.5 * this.mass * this.Vx * this.Vx * 60;
      var E = this.ke + this.u;
      //draw energy bars
      document.getElementById("spring-KE-bar").style.width = 100 * (this.ke / E) + "%"
      document.getElementById("spring-Us-bar").style.width = 100 * (this.u / E) + "%"
      document.getElementById("spring-KE").innerHTML = " KE = ½mv² = " + (this.ke / 1000).toFixed(1) + " kJ"
      document.getElementById("spring-Us").innerHTML = " Us = ½kx² = " + (this.u / 1000).toFixed(1) + " kJ"
      document.getElementById("spring-x").innerHTML = "x = " + (this.x - physics.equalibrium).toFixed(0) + " m"
    };
  }

  var box = new mass(230, physics.height / 2, 1, 0, 20, "#bbb");
  document.getElementById("spring-m").value = Math.round(box.mass);
  document.getElementById("spring-k").value = physics.k;

  const pauseID = document.getElementById("pause1")
  pauseID.addEventListener("click", function () {
    if (pause) {
      pause = false;
      pauseID.innerText = "pause"
      render();
    } else {
      pause = true;
      pauseID.innerText = "play"
    }
  });

  //on click move to mouse
  const SVGID = document.getElementById("spring-SVG");
  SVGID.addEventListener("mousedown", function (event) {
    //gets mouse position, even when scaled by CSS
    box.x = event.offsetX * 590 / SVGID.clientWidth;
    box.Vx = 0;
    cycle();
  });

  //get values for spring constant
  document.getElementById("spring-k").addEventListener("input", function () {
    physics.k = document.getElementById("spring-k").value;
    // box.Vx = 0;
    physics.turns = 3 + 25 * Math.sqrt(physics.k);
  });

  //gets values for mass
  document.getElementById("spring-m").addEventListener("input", function () {
    box.mass = document.getElementById("spring-m").value;
    box.r = Math.sqrt(box.mass / Math.PI / 0.01);
  });

  function cycle() {
    box.edges();
    box.spring();
    box.move();
    box.springInfo();
    box.drawSpring();
    box.draw();
  }
  cycle()
  window.requestAnimationFrame(render);

  function render() {
    //repeating animation function
    if (!pause) {
      window.requestAnimationFrame(render);
      cycle();
    }
  }
};
spring()