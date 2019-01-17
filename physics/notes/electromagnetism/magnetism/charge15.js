// https://www.nuledo.com/en/cloud-chambers/
//  https://www.symmetrymagazine.org/article/january-2015/how-to-build-your-own-particle-detector

function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

const setup0 = function () {
  var canvas = document.getElementById("cloud-chamber");
  var ctx = canvas.getContext("2d");
  ctx.font = "26px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2 + 5);
};
setup0();

function charges15(el) {
  //disable pop up menu on right click
  el.oncontextmenu = function () {
    return false;
  }
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);
  canvas.height = 400;

  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", function (event) {
    if (event.which === 3) {
      Charge.mouseCharge(q, {
        x: (event.offsetX * canvas.width) / canvas.clientWidth,
        y: (event.offsetY * canvas.height) / canvas.clientHeight
      });
    } else {
      Charge.repulse(q, {
        x: (event.offsetX * canvas.width) / canvas.clientWidth,
        y: (event.offsetY * canvas.height) / canvas.clientHeight
      });
    }
  });

  const q = []; //holds the charges
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  function addRemove() {
    // chance to add particles   //0.03 in total chance is good
    c = 30; //c = speed of light
    spawnRate = 0.002 * settings.radiation;
    if (settings.alpha && Math.random() < spawnRate) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);
      const mag = (0.08 + 0.01 * (Math.random() - 0.5)) * c;
      const angle = Math.random() * Math.PI * 2;
      q[q.length] = new Charge("alpha", {
        x: x,
        y: y
      }, {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
      });
      //sometimes spawn two alpha particles in the same location
      if (Math.random() < 0.1) {
        const off = Math.PI / 6 + (Math.random() * Math.PI) / 2;
        q[q.length] = new Charge("alpha", {
          x: x,
          y: y
        }, {
          x: mag * Math.cos(angle + off),
          y: mag * Math.sin(angle + off)
        });
      }
    }

    if (settings.beta && Math.random() < spawnRate * 2) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);
      const mag = (0.16 + 0.8 * (Math.random() - 0.5)) * c;
      const angle = Math.random() * Math.PI * 2;
      if (Math.random() < 0.8) q[q.length] = new Charge("e", {
        x: x,
        y: y
      }, {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
      });
      if (Math.random() < 0.05) {
        const magOff = mag * 6 * Math.random();
        q[q.length] = new Charge("e", {
          x: x,
          y: y
        }, {
          x: magOff * Math.cos(angle),
          y: magOff * Math.sin(angle)
        });
      }
      // if (Math.random() < 0.2) {
      //   const angleOff = angle + Math.random();
      //   const magOff = mag + (Math.random() - 0.5) * c * 0.7;
      //   q[q.length] = new Charge("positron", { x: x, y: y }, { x: magOff * Math.cos(angleOff), y: magOff * Math.sin(angleOff) });
      // }
    }

    if (settings.gamma && Math.random() < spawnRate * 0.5) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);
      const mag = (0.16 + 0.8 * (Math.random() - 0.5)) * c;
      const angle = Math.random() * Math.PI * 2;
      q[q.length] = new Charge("e", {
        x: x,
        y: y
      }, {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
      });
      const angleOff = angle + 3 * (Math.random() - 0.5);
      const magOff = mag + (Math.random() - 0.5) * c * 0.7;
      q[q.length] = new Charge("positron", {
        x: x,
        y: y
      }, {
        x: magOff * Math.cos(angleOff),
        y: magOff * Math.sin(angleOff)
      });
    }

    if (settings.proton && Math.random() < spawnRate) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);
      const mag = (0.43 + 0.1 * (Math.random() - 0.5)) * c;
      const angle = Math.random() * Math.PI * 2;
      q[q.length] = new Charge("proton", {
        x: x,
        y: y
      }, {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
      });
    }

    if (settings.muon && Math.random() < spawnRate) {
      const x = 30 + Math.random() * (canvas.width - 60);
      const y = 30 + Math.random() * (canvas.width - 60);
      const mag = 0.99 * c;
      const angle = Math.random() * Math.PI * 2;
      q[q.length] = new Charge("muon", {
        x: x,
        y: y
      }, {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
      });
    }
    //add decays and additions spawned by active particles
    //    https://www.nuledo.com/en/cloud-chambers/#alfa-castice
    //muon decay into electron
    //high speed protons produce electrons
    //positron electron annihilation?

    //remove particles after life is zero
    for (let i = 0, len = q.length; i < len; ++i) {
      if (q[i]) {
        q[i].life--;
        if (q[i].life < 0) q.splice(i, 1);
      }
    }
  }

  document.getElementById("settings").style.display = "inline";
  document.getElementById("observations").style.display = "inline";
  const settings = {
    timeRate: document.getElementById("cloud-timerate-slider").value,
    alpha: document.getElementById("cloud-alpha-checkbox").checked,
    beta: document.getElementById("cloud-beta-checkbox").checked,
    gamma: document.getElementById("cloud-gamma-checkbox").checked,
    muon: document.getElementById("cloud-muon-checkbox").checked,
    proton: document.getElementById("cloud-proton-checkbox").checked,
    magneticField: document.getElementById("cloud-magfield-slider").value,
    radiation: document.getElementById("cloud-radiation-slider").value,
    display: 4
  };

  document.getElementById("cloud-radiation-slider").addEventListener("input", event => {
    settings.radiation = document.getElementById("cloud-radiation-slider").value;
    document.getElementById("cloud-radiation-text").innerHTML = settings.radiation;
  });

  document.getElementById("cloud-timerate-slider").addEventListener("input", event => {
    settings.timeRate = document.getElementById("cloud-timerate-slider").value;
    document.getElementById("cloud-timerate-text").innerHTML = settings.timeRate;
  });

  document.getElementById("cloud-magfield-slider").addEventListener("input", event => {
    settings.magneticField = document.getElementById("cloud-magfield-slider").value;
    document.getElementById("cloud-magfield-text").innerHTML = settings.magneticField;
  });

  document.getElementById("cloud-alpha-checkbox").addEventListener("input", event => {
    settings.alpha = document.getElementById("cloud-alpha-checkbox").checked;
  });
  document.getElementById("cloud-beta-checkbox").addEventListener("input", event => {
    settings.beta = document.getElementById("cloud-beta-checkbox").checked;
  });
  document.getElementById("cloud-gamma-checkbox").addEventListener("input", event => {
    settings.gamma = document.getElementById("cloud-gamma-checkbox").checked;
  });
  document.getElementById("cloud-proton-checkbox").addEventListener("input", event => {
    settings.proton = document.getElementById("cloud-proton-checkbox").checked;
  });
  document.getElementById("cloud-muon-checkbox").addEventListener("input", event => {
    settings.muon = document.getElementById("cloud-muon-checkbox").checked;
  });

  //switch between draw modes
  document.addEventListener("keypress", event => {
    if (checkVisible(el)) {
      if (event.charCode === 49) {
        settings.display = 1; //particle
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 50) {
        settings.display = 2; //particles + electric vector field
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 51) {
        settings.display = 3; //electric potential scalar field
        el.style.background = "#fff";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (event.charCode === 52) {
        settings.display = 4; //cloud chamber
        el.style.background = "#000";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  });

  function cycle() {
    if (checkVisible(el)) {
      for (let i = 0; i < settings.timeRate; ++i) {
        addRemove();
        Charge.physicsAll(q, 0.99, 1, 2);
        Charge.physicsMagneticField(q, settings.magneticField);
        if (settings.display === 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          Charge.drawMagneticField(settings.magneticField);
          Charge.drawAll(q);
        } else if (settings.display === 2) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          Charge.vectorField(q);
          ctx.globalAlpha = 0.5;
          Charge.drawAll(q);
          ctx.globalAlpha = 1;
        } else if (settings.display === 3) {
          Charge.scalarField(q);
        } else if (settings.display === 4) {
          Charge.drawCloudChamber(q, false);
        }
        // Charge.boundsRemove(q, 0);
      }
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}