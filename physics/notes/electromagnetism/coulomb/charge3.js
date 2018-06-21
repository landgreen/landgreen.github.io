const setup3 = function() {
  var canvas = document.getElementById("charge3");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup3();

c = {
  separation: 25,
  off: 250,
  gap: 4,
  rows: 2,
  pause: false
};

document.getElementById("gap").addEventListener(
  "input",
  function() {
    const element = document.getElementById("charge3");
    var clone = element.cloneNode();
    while (element.firstChild) {
      clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);

    c.gap = parseInt(document.getElementById("gap").value);
    c.pause = true;
    charges3(document.getElementById("charge3"));
  },
  false
);

document.getElementById("separation").addEventListener(
  "input",
  function() {
    const element = document.getElementById("charge3");
    var clone = element.cloneNode();
    while (element.firstChild) {
      clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);

    c.separation = parseInt(document.getElementById("separation").value);
    c.pause = true;
    charges3(document.getElementById("charge3"));
  },
  false
);

document.getElementById("rows").addEventListener(
  "input",
  function() {
    const element = document.getElementById("charge3");
    var clone = element.cloneNode();
    while (element.firstChild) {
      clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);

    c.rows = parseInt(document.getElementById("rows").value);
    c.pause = true;
    charges3(document.getElementById("charge3"));
  },
  false
);

function charges3(el) {
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);
  // var canvas = el
  // var ctx = canvas.getContext("2d");
  ctx.textAlign = "right";

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
    Charge.repulse(q, mouse);
  };
  canvas.onmouseup = function() {
    mouse.down = false;
  };

  el.addEventListener("mouseleave", function() {
    c.pause = true;
  });
  el.addEventListener("mouseenter", function() {
    c.pause = false;
    Charge.setCanvas(el);
    if (!c.pause) requestAnimationFrame(cycle);
  });

  //switch between draw modes
  let drawMode = 1;
  document.addEventListener("keypress", event => {
    if (!c.pause) {
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

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics
  for (let i = 0, len = Math.ceil((canvas.width + c.off * 2) / c.separation); i < len; ++i) {
    if (i < len / 2 - c.gap || i > len / 2 + c.gap) {
      q[q.length] = new Charge("p", {
        x: c.separation * i - c.off,
        y: canvas.height / 2
      });
      const rows = (c.rows - 1) / 2 + 1;
      for (let j = 1; j < rows; ++j) {
        q[q.length] = new Charge("p", {
          x: c.separation * i - c.off,
          y: canvas.height / 2 + c.separation * j
        });
        q[q.length] = new Charge("p", {
          x: c.separation * i - c.off,
          y: canvas.height / 2 - c.separation * j
        });
      }
    }
  }

  const Vx = 0;
  for (let i = 0, len = Math.ceil((canvas.width + c.off * 2) / c.separation); i < len; ++i) {
    if (i < len / 2 - c.gap || i > len / 2 + c.gap) {
      q[q.length] = new Charge(
        "e",
        {
          x: c.separation * i - c.off,
          y: canvas.height / 2
        },
        { x: Vx, y: 0 }
      );
      const rows = (c.rows - 1) / 2 + 1;
      for (let j = 1; j < rows; ++j) {
        q[q.length] = new Charge(
          "e",
          {
            x: c.separation * i - c.off,
            y: canvas.height / 2 - c.separation * j
          },
          { x: Vx, y: 0 }
        );
        q[q.length] = new Charge(
          "e",
          {
            x: c.separation * i - c.off,
            y: canvas.height / 2 + c.separation * j
          },
          { x: Vx, y: 0 }
        );
      }
    }
  }
  let current = 0;
  function ammeter() {
    current = current * 0.995 + Charge.teleport(q, 200) * 0.005;
    ctx.fillStyle = "#000";
    ctx.fillText((current * 60).toFixed(1) + " e⁻/s", canvas.width - 5, canvas.height - 3);
  }

  function cycle() {
    Charge.physicsAll(q);
    //choose a draw mode
    if (drawMode === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.drawAll(q);
    } else if (drawMode === 2) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.vectorField(q, 33);
      ctx.globalAlpha = 0.5;
      Charge.drawAll(q);
      ctx.globalAlpha = 1;
    } else if (drawMode === 3) {
      Charge.scalarField(q);
    } else if (drawMode === 4) {
      Charge.drawCloudChamber(q);
    }
    ammeter();
    if (!c.pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
