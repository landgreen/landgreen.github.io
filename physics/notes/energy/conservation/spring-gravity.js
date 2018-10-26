var springGravity = function () {
  var pause = true;
  var physics = {
    rate: 60,
    gravX: 0,
    gravY: 9.8,
    width: 330,
    height: 400,
    y: 350,
    equilibrium: 400 / 2,
    restitution: 0,
    airFriction: 1, //0.99,
    k: 10,
    turns: 3 + 4 * Math.sqrt(10)
  };

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = x;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = r
    this.mass = Math.PI * this.r * this.r * 0.01;
    this.energy =
      0.5 * physics.k * (this.y - physics.equilibrium) * (this.y - physics.equilibrium) +
      this.mass * physics.gravY * (physics.height - this.y) +
      0.5 * this.mass * this.Vy * this.Vy;
    this.ke = 0;
    this.Us = 0;
    this.Ug = 0;
    this.fillColor = fillColor;
    this.draw = function () {
      document.getElementById("spring-ball-2").setAttribute("r", this.r);
      document.getElementById("spring-ball-2").setAttribute("cx", this.x);
      document.getElementById("spring-ball-2").setAttribute("cy", this.y);
    };

    this.drawSpring = function () {
      let d = `M ${box.x} ${box.y-box.r}`;
      for (var i = 1; i < physics.turns + 1; i++) {
        d += `L ${box.x + (i % 2 === 0 ? 10 : -10)} ${ (box.y - this.r) * (1 - i / physics.turns)}`;
      }
      document.getElementById("spring-wire-2").setAttribute("d", d);
    };
    this.move2 = function () {
      this.y += this.Vy / physics.rate;
      this.Vy *= physics.airFriction;
    };
    this.edge = function () {
      // if (this.y > physics.height - this.r) {
      //   this.Vy *= -physics.restitution;
      //   this.y = physics.height - this.r;
      // } 
      if (this.y < this.r) {
        this.Vy *= -physics.restitution;
        this.y = this.r;
      }
    };
    this.gravity = function () {
      this.Vy += physics.gravY / physics.rate; //mass cancels out from F=mg, f=ma, ma=mg, a=g, v+=g
    };
    this.spring = function () {
      this.Vy += (physics.k * (physics.equilibrium - this.y)) / this.mass / physics.rate;
    };
    this.springInfo = function () {
      var height = physics.height - this.r - this.y;
      this.Us = 0.5 * physics.k * (this.y - physics.equilibrium) * (this.y - physics.equilibrium);
      this.Ug = this.mass * physics.gravY * height;
      this.ke = 0.5 * this.mass * this.Vy * this.Vy;
      this.energy = this.Us + this.Ug + this.ke;

      document.getElementById("x-2").textContent = "x = " + (this.y - physics.equilibrium).toFixed(0) + " m";
      document.getElementById("h-2").textContent = "h = " + (physics.y - this.y).toFixed(0) + " m";

      document.getElementById("spring-KE-bar2").setAttribute("y", physics.height - 400 * (this.ke / this.energy));
      document.getElementById("spring-Us-bar2").setAttribute("y", physics.height - 400 * (this.Us / this.energy));
      document.getElementById("spring-Ug-bar2").setAttribute("y", physics.height - 400 * (this.Ug / this.energy));

      document.getElementById("spring-KE-text2").textContent = "KE = ½mv² = " + (this.ke / 1000).toFixed(0) + " kJ"
      document.getElementById("spring-Us-text2").textContent = "Us = ½ky² = " + (this.Us / 1000).toFixed(0) + " kJ"
      document.getElementById("spring-Ug-text2").textContent = "Ug = mgh = " + (this.Ug / 1000).toFixed(0) + " kJ"

      // document.getElementById("E-2").textContent = "E = " + (this.energy / 1000).toFixed(0) + " kJ"

      // document.getElementById("spring-KE-bar2").setAttribute("height", "400");

      // document.getElementById("spring-KE-bar2").style.width = 100 * (this.ke / this.energy) + "%"
      // document.getElementById("spring-Us-bar2").style.width = 100 * (this.Us / this.energy) + "%"
      // document.getElementById("spring-Ug-bar2").style.width = 100 * (this.Ug / this.energy) + "%"
      // document.getElementById("spring-KE2").innerHTML = " KE = ½mv² = " + (this.ke / 1000).toFixed(0) + " kJ"
      // document.getElementById("spring-Us2").innerHTML = " Us = ½ky² = " + (this.Us / 1000).toFixed(0) + " kJ"
      // document.getElementById("spring-Ug2").innerHTML = " Ug = mgh = " + (this.Ug / 1000).toFixed(0) + " kJ"
      // document.getElementById("spring-E2").innerHTML = "E = " + (this.energy / 1000).toFixed(0) + " kJ"
      // document.getElementById("spring-h2").innerHTML = "h = " + height.toFixed(0) + " m"
      // document.getElementById("spring-y2").innerHTML = "y = " + (this.y - physics.equilibrium).toFixed(0) + " m"
      // document.getElementById("spring-v2").innerHTML = "v = " + this.Vy.toFixed(0) + " m/s"
    };
  }

  var box = new mass(physics.width / 2, 350, 0, 0, 20, "#bbb");
  physics.y = box.y
  document.getElementById("spring-m2").value = Math.round(box.mass);
  document.getElementById("spring-k2").value = physics.k;
  document.getElementById("h-2").setAttribute("y", physics.y - 5);
  document.getElementById("h-2").textContent = "h = " + (physics.y - box.y).toFixed(0) + " m";
  document.getElementById("h-line-2").setAttribute("y1", physics.y);
  document.getElementById("h-line-2").setAttribute("y2", physics.y);


  document.getElementById("pause2").addEventListener("click", () => {
    pauseIt()
  });
  document.getElementById("pause2-text").addEventListener("click", () => {
    pauseIt()
  });

  function pauseIt() {
    if (pause) {
      pause = false;
      document.getElementById("pause2-text").textContent = "pause";
      render();
    } else {
      pause = true;
      document.getElementById("pause2-text").textContent = "play";
    }
  }

  //on click move to mouse
  document.getElementById("spring-SVG-2").addEventListener("mousedown", (event) => {
    const x = event.offsetX //* physics.width / cWidth;
    const y = event.offsetY //* physics.height / cHeight;
    if (x > 80 && y > 40) {
      box.x = x;
      box.y = y;
      box.Vy = 0;
      cycle();
      // physics.y = box.y
      // document.getElementById("h-2").setAttribute("y", physics.y);
    } else if (y > 40) {
      physics.y = y
      document.getElementById("h-2").setAttribute("y", physics.y - 5);
      document.getElementById("h-2").textContent = "h = " + (physics.y - box.y).toFixed(0) + " m";
      document.getElementById("h-line-2").setAttribute("y1", physics.y);
      document.getElementById("h-line-2").setAttribute("y2", physics.y);
    }
  });

  //get values for spring constant
  document.getElementById("spring-k2").addEventListener("input", () => {
    physics.k = document.getElementById("spring-k2").value;
    document.getElementById("spring-k-slider2").value = physics.k;
    box.Vx = 0;
    physics.turns = 3 + 4 * Math.sqrt(physics.k);
    box.drawSpring();
    box.draw();
  });
  document.getElementById("spring-k-slider2").addEventListener("input", () => {
    physics.k = document.getElementById("spring-k-slider2").value;
    document.getElementById("spring-k2").value = physics.k;
    box.Vx = 0;
    physics.turns = 3 + 4 * Math.sqrt(physics.k);
    box.drawSpring();
    box.draw();
  });

  //gets values for mass
  document.getElementById("spring-m2").addEventListener("input", () => {
    box.mass = document.getElementById("spring-m2").value;
    document.getElementById("spring-m-slider2").value = Math.log10(box.mass);
    box.r = Math.sqrt(box.mass / Math.PI / 0.01);
    box.drawSpring();
    box.draw();
  });
  document.getElementById("spring-m-slider2").addEventListener("input", () => {
    box.mass = Math.pow(10, document.getElementById("spring-m-slider2").value);
    document.getElementById("spring-m2").value = Math.floor(box.mass);
    box.r = Math.sqrt(box.mass / Math.PI / 0.01);
    box.drawSpring();
    box.draw();
  });

  function cycle() {
    box.spring();
    box.gravity();
    box.move2();
    box.edge();
    box.springInfo();
    box.drawSpring();
    box.draw();
  }
  cycle()


  function render() {
    //repeating animation function
    if (!pause) {
      window.requestAnimationFrame(render);
      cycle();
    }
  }
  window.requestAnimationFrame(render);
};
springGravity();