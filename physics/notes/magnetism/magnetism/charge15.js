// https://www.nuledo.com/en/cloud-chambers/
//  https://www.symmetrymagazine.org/article/january-2015/how-to-build-your-own-particle-detector

function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

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
  // let drawMode = 4;
  // document.addEventListener("keypress", event => {
  //   if (checkVisible(el)) {
  //     if (event.charCode === 49) {
  //       drawMode = 1; //particle
  //       el.style.background = "#fff";
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     } else if (event.charCode === 50) {
  //       drawMode = 2; //particles + electric vector field
  //       el.style.background = "#fff";
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     } else if (event.charCode === 51) {
  //       drawMode = 3; //electric potential scalar field
  //       el.style.background = "#fff";
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     } else if (event.charCode === 52) {
  //       drawMode = 4; //cloud chamber
  //       el.style.background = "#000";
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     }
  //   }
  // });

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

  // let pause = false;
  // el.addEventListener("mouseleave", function() {
  //   pause = true;
  // });
  // el.addEventListener("mouseenter", function() {
  //   pause = false;
  //   Charge.setCanvas(el);
  //   if (!pause) requestAnimationFrame(cycle);
  // });

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics
  // Charge.spawnCharges(q, 20, "p");
  Charge.spawnCharges(q, 1, "e");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function addRemove() {
    // chance to add particles   //0.03 in total chance is good
    c = 6; //c = speed of light
    spawnRate = 0.001 * settings.radiation;
    if (settings.alpha) {
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
    }

    if (settings.electron) {
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
    }

    if (settings.proton) {
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
            x: 2 * c * (Math.random() - 0.5),
            y: 2 * c * (Math.random() - 0.5)
          }
        );
      }
    }

    if (settings.muon) {
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
            x: 1.5 * c * (Math.random() - 0.5),
            y: 1.5 * c * (Math.random() - 0.5)
          }
        );
      }
    }

    //remove particles after life is zero
    for (let i = 0, len = q.length; i < len; ++i) {
      if (q[i]) {
        q[i].life--;
        if (q[i].life < 0) q.splice(i, 1);
      }
    }

    // let i = q.length;
    // while (--i) {
    //   q[i].life--;
    //   // const velocity2 = q[i].velocity.x * q[i].velocity.x + q[i].velocity.y * q[i].velocity.y;
    //   // || (velocity2 < 0.01 && q[i].canMove)
    //   if (q[i].life < 0) q.splice(i, 1);
    // }
    // if (Math.random() < 0.01) q.splice(0, 1);
  }
  const settings = {
    pause: false,
    timeRate: 3,
    alpha: true,
    electron: true,
    muon: true,
    proton: true,
    magneticField: 0.02,
    radiation: 1,
    falling: false,
    display: "cloud chamber"
  };

  let gui = new dat.GUI();
  gui.add(settings, "radiation", 0, 10).step(0.1);
  gui.add(settings, "alpha");
  gui.add(settings, "electron");
  gui.add(settings, "proton");
  gui.add(settings, "muon");

  let gui2 = new dat.GUI();
  let displayController = gui2.add(settings, "display", ["magnetic field", "electric field", "electric potential", "cloud chamber"]);
  displayController.onChange(function(value) {
    if (value === "cloud chamber") {
      el.style.background = "#000";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      el.style.background = "#fff";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
  gui2.add(settings, "falling");
  gui2.add(settings, "magneticField", -0.1, 0.1).step(0.01);
  gui2.add(settings, "timeRate", 0, 10).step(1);
  gui2.add(settings, "pause");

  var customContainer = document.getElementById("gui-container");
  customContainer.appendChild(gui2.domElement);
  customContainer.appendChild(gui.domElement);

  // let gui2 = new dat.GUI({ autoPlace: false });
  // customContainer.appendChild(gui2.domElement);
  // gui2.add(settings, "magneticField", -1, 1).step(0.01);

  function cycle() {
    if (checkVisible(el) && !settings.pause) {
      for (let i = 0; i < settings.timeRate; ++i) {
        addRemove();
        Charge.physicsAll(q, 0.997, 1, 7);
        Charge.physicsMagneticField(q, settings.magneticField);
        if (settings.display === "magnetic field") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          Charge.drawMagneticField(settings.magneticField);
          Charge.drawAll(q);
        } else if (settings.display === "electric field") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          Charge.vectorField(q);
          ctx.globalAlpha = 0.5;
          Charge.drawAll(q);
          ctx.globalAlpha = 1;
        } else if (settings.display === "electric potential") {
          Charge.scalarField(q);
        } else if (settings.display === "cloud chamber") {
          Charge.drawCloudChamber(q, settings.falling);
        }
        Charge.boundsRemove(q, 0);
      }
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
