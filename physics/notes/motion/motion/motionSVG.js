var motion = function (idNum, showPos, showTime, showVel, showAccel, position, velocity, acceleration, edges) {
  const settings = {
    target: document.getElementById("motion-" + idNum),
    circle: document.getElementById("circle-" + idNum),
    distance: document.getElementById("distance-" + idNum),
    arc: document.getElementById("arc-" + idNum),
    text: {
      x: document.getElementById("x-" + idNum),
      t: document.getElementById("t-" + idNum),
      v: document.getElementById("v-" + idNum),
      a: document.getElementById("a-" + idNum),
    },
    height: 100,
    width: 580,
    pause: true,
    gravX: 0,
    gravY: 0,
  }

  settings.target.addEventListener("mouseleave", function () {
    settings.pause = true;
  });
  settings.target.addEventListener("mouseenter", function () {
    settings.pause = false;
    if (!settings.pause) requestAnimationFrame(render);
  });

  var mousePos = {
    x: position,
    y: settings.target.height / 2
  };

  settings.target.addEventListener("mousedown", (event) => {
    //gets mouse position, even when scaled by CSS
    const cWidth = settings.target.clientWidth || settings.target.parentNode.clientWidth
    const cHeight = settings.target.clientHeight || settings.target.parentNode.clientHeight
    mousePos = {
      x: event.offsetX * settings.width / cWidth,
      y: event.offsetY * settings.height / cHeight
    };
    spawn();
    // physics.startTime = new Date().getTime();
  });


  // settings.target.addEventListener("mousedown", function (evt) {
  //   mousePos = {
  //     x: (event.offsetX * settings.width) / canvas.clientWidth,
  //     y: (event.offsetY * settings.height) / canvas.clientHeight
  //   };
  //   spawn();
  //   physics.startTime = new Date().getTime();
  // });


  if (acceleration) {
    settings.gravX = acceleration;
  }

  function mass(x, y, Vx, Vy, r, fillColor) {
    //constructor function that determines how masses work
    this.x = x;
    this.y = y;
    this.Vx = Vx;
    this.Vy = Vy;
    this.r = r;
    this.t = 0;
    this.draw = function () {
      settings.circle.setAttribute("cx", this.x);
    };
    this.physics = function () {
      this.t += 1 / 60;
      this.x += this.Vx / 60;
      this.y += this.Vy / 60;
    };
    this.timeCycle = function () {
      if (showTime) {
        const arcAngle = (this.t % 60) / 3 / Math.PI
        if (arcAngle < Math.PI * 2) {
          const radius = this.r - 3
          const arc = {
            x: this.x + (radius * Math.cos(arcAngle - Math.PI / 2)),
            y: this.y + (radius * Math.sin(arcAngle - Math.PI / 2))
          }
          const largeArcFlag = arcAngle < Math.PI + 0.01 ? "0" : "1";
          const path = `M${this.x} ${this.y} v${-radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arc.x} ${arc.y} `
          settings.arc.setAttribute("d", path);
          settings.arc.setAttribute("fill", "rgba(255,255,255,0.6)");
        } else {
          settings.arc.setAttribute("fill", "none");
        }
      }
    };
    this.edges = function () {
      if (edges) {
        if (this.x > settings.width - this.r) {
          this.Vx = -Math.abs(this.Vx);
          this.x = settings.width - this.r;
        } else if (this.x < this.r) {
          this.Vx = Math.abs(this.Vx);
          this.x = this.r;
        }
      }
    };
    this.gravity = function () {
      this.Vx += settings.gravX / 60;
      this.Vy += settings.gravY / 60;
    };
    this.distance = function () {
      const edge = this.x - this.r - 6
      const leftX = 3;
      if (showPos && edge > 2) {
        const length = 5
        settings.distance.setAttribute("d", `M${leftX} ${(settings.height / 2 - length)} v${length*2} v${-length-0.5} h${edge} v${length+0.5} v${-length*2}`);
        settings.distance.setAttribute("stroke", "#666");
      } else {
        settings.distance.setAttribute("stroke", "none");

      }
    };
    this.info = function () {
      var lineHeight = 25;
      var line = 20;
      if (showPos) {
        settings.text.x.setAttribute("y", line);
        settings.text.x.textContent = ((this.x - this.r) / 10).toFixed(0) + " m = Δx"
        line += lineHeight;
        // ctx.fillText(((this.x - this.r) / 10).toFixed(0) + " m = Δx", canvas.width - 5, line);
      }
      if (showTime) {
        settings.text.t.setAttribute("y", line);
        settings.text.t.textContent = this.t.toFixed(0) + " s = Δt"
        line += lineHeight;
        // ctx.fillText(this.t.toFixed(0) + " s = Δt", canvas.width - 5, line);
      }
      if (showVel) {
        settings.text.v.setAttribute("y", line);
        settings.text.v.textContent = (this.Vx / 10).toFixed(0) + " m/s = v"
        line += lineHeight;
        // ctx.fillText((this.Vx / 10).toFixed(0) + " m/s = v", canvas.width - 5, line);
      }
      if (showAccel) {
        settings.text.a.setAttribute("y", line);
        settings.text.a.textContent = (settings.gravX / 10).toFixed(1) + " m/s² = a"
        line += lineHeight;
        // ctx.fillText((settings.gravX / 10).toFixed(1) + " m/s² = a", canvas.width - 5, line);
      }
    };
  }

  var box;

  function spawn() {
    box = new mass(mousePos.x, settings.height / 2, velocity, 0, 40, "#f65");
  }
  spawn();

  //setup
  if (!showPos) settings.text.x.setAttribute("fill", "none");
  if (!showTime) settings.text.t.setAttribute("fill", "none");
  if (!showVel) settings.text.v.setAttribute("fill", "none");
  if (!showAccel) settings.text.a.setAttribute("fill", "none");

  window.requestAnimationFrame(render);

  function render() {
    //repeating animation function
    if (!settings.pause) window.requestAnimationFrame(render);
    box.physics();
    box.edges();
    box.gravity();
    box.distance();
    box.draw();
    box.timeCycle();
    box.info();
  }
};
motion("1", true, false, false, false, 300, 0, 0, false);
motion("2", false, true, false, false, 300, 0, 0, false);
motion("3", true, true, true, false, 300, -80, 0, true);
motion("5", true, true, true, false, 50, 20, 0, false);
motion("4", true, true, true, true, 300, 0, -98, true);
motion("0", false, true, true, true, 50, 0, 118, true);