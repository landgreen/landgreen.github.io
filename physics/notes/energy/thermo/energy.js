var particles = () => {
  var physics = {
    gravX: 0,
    gravY: 0.01,
    restitution: 1,
    airFriction: 1,
    height: 445,
    width: 250
  };

  document.getElementById("energy").addEventListener("click", () => {
    if (physics.restitution === 1) {
      physics.restitution = 0.6;
      physics.airFriction = 0.9995;
      document.getElementById("energy").innerHTML = "friction: ON";
    } else {
      physics.restitution = 1;
      physics.airFriction = 1;
      document.getElementById("energy").innerHTML = "friction: OFF";
    }
  });

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
    this.Ug = 0;
    this.fillColor = fillColor;
    this.draw = () => {
      document.getElementById("ball").setAttribute("r", this.r);
      document.getElementById("ball").setAttribute("cx", this.x);
      document.getElementById("ball").setAttribute("cy", this.y);
    };
    this.move = () => {
      this.x += this.Vx;
      this.y += this.Vy;
      this.Vx *= physics.airFriction;
      this.Vy *= physics.airFriction;
    };
    this.edges = () => {
      if (this.x > physics.width - this.r) {
        this.Vx *= -physics.restitution;
        this.x = physics.width - this.r;
      } else if (this.x < this.r) {
        this.Vx *= -physics.restitution;
        this.x = this.r;
      }
      if (this.y > physics.height - this.r) {
        this.Vy *= -physics.restitution;
        this.y = physics.height - this.r;
      } else if (this.y < this.r) {
        this.Vy *= -physics.restitution;
        this.y = this.r;
      }
    };
    this.gravity = () => {
      this.Vx += physics.gravX;
      this.Vy += physics.gravY;
    };
    this.calcEnergy = function () {
      var speed2 = this.Vx * this.Vx + this.Vy * this.Vy;
      this.ke = 0.5 * this.mass * speed2;
      var height = physics.height - this.y;
      this.Ug = this.mass * physics.gravY * height;
    };
    this.info = function () {
      this.calcEnergy();

      //heat bar
      if (physics.restitution != 1) {
        document.getElementById("heat-bar").setAttribute("height", Math.max(0, physics.height * (1 - (this.Ug + this.ke) / this.energy)));
      } else {
        document.getElementById("heat-bar").setAttribute("height", 0);
      }
      document.getElementById("KE-bar").setAttribute("y", physics.height * (1 - this.ke / this.energy));
      document.getElementById("Ug-bar").setAttribute("y", physics.height * (1 - this.Ug / this.energy));
      document.getElementById("KE-text").textContent = "K = " + (this.ke).toFixed(0).padStart(2, "0") + " J"
      document.getElementById("Ug-text").textContent = "Ug = " + (this.Ug).toFixed(0).padStart(2, "0") + " J"
    };
  }

  document.getElementById("energy-SVG").addEventListener("mousedown", (event) => {
    const x = event.offsetX
    const y = event.offsetY
    box.x = x;
    box.y = y;

    box.Vx = 1;
    box.Vy = 0;
    box.calcEnergy();
    box.info();
    box.draw();
  });

  let pause = true;
  const pauseID = document.getElementById("pause")
  pauseID.addEventListener("click", () => {
    if (pause) {
      pause = false;
      pauseID.innerHTML = "pause"
      render();
    } else {
      pause = true;
      pauseID.innerHTML = "play"
    }
  });

  var box;

  function spawn() {
    box = new mass(50, 50, 1, 0, 20, "#bbb");
    box.calcEnergy();
    box.energy = box.Ug + box.ke;
  }
  spawn();
  window.requestAnimationFrame(render);

  function render() {
    //repeating animation function
    if (!pause) {
      window.requestAnimationFrame(render);
      box.edges();
      box.gravity();
      box.move();
    }
    box.info();
    box.draw();
  }
};
particles();