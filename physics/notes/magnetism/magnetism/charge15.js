// https://www.nuledo.com/en/cloud-chambers/
//  https://www.symmetrymagazine.org/article/january-2015/how-to-build-your-own-particle-detector

const setup0 = function() {
  var canvas = document.getElementById("cloud-chamber");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Roboto";

  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup0();

function charges15(el) {
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);
  // var canvas = el
  // var ctx = canvas.getContext("2d");

  //switch between draw modes
  let drawMode = 4;
  document.addEventListener("keypress", event => {
    if (!pause) {
      if (event.charCode === 49) {
        drawMode = 1; //particle
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 50) {
        drawMode = 2; //particles + electric vector field
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 51) {
        drawMode = 3; //electric potential scalar field
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 52) {
        drawMode = 4; //cloud chamber
        el.style.background = "#000";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  });

  //___________________get mouse input___________________
  var mouse = {
    down: false,
    x: 0,
    y: 0
  };
  canvas.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  canvas.onmousedown = function() {
    mouse.down = true;
    if (q.length) Charge.repulse(q, mouse);
  };
  canvas.onmouseup = function() {
    mouse.down = false;
  };

  let B = -0.02;
  document.getElementById("B").addEventListener(
    "input",
    function() {
      B = Number(document.getElementById("B").value);
    },
    false
  );

  let isRadiation = true;
  document.getElementById("radiation").addEventListener(
    "input",
    function() {
      if (this.checked) {
        isRadiation = true;
      } else {
        isRadiation = false;
      }
    },
    false
  );

  let pause = false;
  el.addEventListener("mouseleave", function() {
    pause = true;
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    Charge.setCanvas(el);
    if (!pause) requestAnimationFrame(cycle);
  });

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics
  // Charge.spawnCharges(q, 20, "p");
  Charge.spawnCharges(q, 1, "e");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function addRemove() {
    // chance to add particles   //0.03 in total chance is good
    c = 6; //c = speed of light
    spawnRate = 0.005;
    if (Math.random() < spawnRate) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.height - 60);
      const Vx = (c * (Math.random() - 0.5)) / 5;
      const Vy = (c * (Math.random() - 0.5)) / 5;
      const VxBaseline = c * (Math.random() - 0.5);
      const VyBaseline = c * (Math.random() - 0.5);
      q[q.length] = new Charge(
        "e",
        {
          //position
          x: x,
          y: y
        },
        {
          //velocity
          x: Vx + VxBaseline,
          y: Vy + VxBaseline
        }
      );

      q[q.length] = new Charge(
        "positron",
        {
          //position
          x: x - (Vx + VxBaseline) * 20,
          y: y - (Vx + VxBaseline) * 20
        },
        {
          //velocity
          x: -Vx + VxBaseline,
          y: -Vy + VxBaseline
        }
      );
    }
    if (Math.random() < spawnRate) {
      q[q.length] = new Charge(
        "e",
        {
          //position
          x: 30 + Math.random() * (canvas.width - 60),
          y: 30 + Math.random() * (canvas.height - 60)
        },
        {
          //velocity
          x: c * (Math.random() - 0.5),
          y: c * (Math.random() - 0.5)
        }
      );
    }
    if (Math.random() < spawnRate) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);

      q[q.length] = new Charge(
        "alpha",
        {
          //position
          x: x,
          y: y
        },
        {
          //velocity
          x: (c * (Math.random() - 0.5)) / 2,
          y: (c * (Math.random() - 0.5)) / 2
        }
      );
      //sometimes spawn two alpha particles in the same location
      if (Math.random() < 0.2) {
        q[q.length] = new Charge(
          "alpha",
          {
            //position
            x: x,
            y: y
          },
          {
            //velocity
            x: (c * (Math.random() - 0.5)) / 2,
            y: (c * (Math.random() - 0.5)) / 2
          }
        );
      }
    }

    if (Math.random() < spawnRate) {
      q[q.length] = new Charge(
        "proton",
        {
          //position
          x: 30 + Math.random() * (canvas.width - 60),
          y: 30 + Math.random() * (canvas.height - 60)
        },
        {
          //velocity
          x: c * (Math.random() - 0.5),
          y: c * (Math.random() - 0.5)
        }
      );
    }
    if (Math.random() < spawnRate * 0.1) {
      q[q.length] = new Charge(
        "positron",
        {
          //position
          x: 30 + Math.random() * (canvas.width - 60),
          y: 30 + Math.random() * (canvas.height - 60)
        },
        {
          //velocity
          x: c * (Math.random() - 0.5),
          y: c * (Math.random() - 0.5)
        }
      );
    }
    if (Math.random() < spawnRate * 0.2) {
      q[q.length] = new Charge(
        "muon",
        {
          //position
          x: 30 + Math.random() * (canvas.width - 60),
          y: 30 + Math.random() * (canvas.height - 60)
        },
        {
          //velocity
          x: c * (Math.random() - 0.5),
          y: c * (Math.random() - 0.5)
        }
      );
    }

    // chance to remove particles
    //remove particle if they are slow
    let i = q.length;
    while (--i) {
      q[i].life--;
      // const velocity2 = q[i].velocity.x * q[i].velocity.x + q[i].velocity.y * q[i].velocity.y;
      // || (velocity2 < 0.01 && q[i].canMove)
      if (q[i].life < 0) q.splice(i, 1);
    }
    // if (Math.random() < 0.01) q.splice(0, 1);
  }

  time = 0;
  function cycle() {
    time++;
    if (isRadiation) addRemove();
    for (let i = 0; i < 3; ++i) {
      Charge.physicsAll(q, 0.997, 0.1, 7);
      Charge.physicsMagneticField(q, B);

      if (drawMode === 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Charge.drawMagneticField(B);
        Charge.drawAll(q);
      } else if (drawMode === 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Charge.vectorField(q);
        ctx.globalAlpha = 0.5;
        Charge.drawAll(q);
        ctx.globalAlpha = 1;
      } else if (drawMode === 3) {
        Charge.scalarField(q);
      } else if (drawMode === 4) {
        Charge.drawCloudChamber(q, false);
      }
      Charge.boundsRemove(q, 0);
    }
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
