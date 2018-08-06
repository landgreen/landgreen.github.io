const setup5 = function() {
  var canvas = document.getElementById("charge5");
  var ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.font = "30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup5();

function charges5(el) {
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);

  //switch between draw modes
  let drawMode = 1;
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
  canvas.addEventListener("mousedown", function(event) {
    Charge.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    });
  });

  let pause = false;
  const elZone = document.getElementById("charge5-zone");
  elZone.addEventListener("mouseleave", function() {
    pause = true;
  });
  elZone.addEventListener("mouseenter", function() {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  let addPath = false;
  document.getElementById("add-path").addEventListener("click", event => {
    if (!addPath) {
      addPath = true;

      //unpause
      // Charge.setCanvas(el);
      // if (pause) requestAnimationFrame(cycle);
      // pause = false;

      const y = canvas.height / 2;
      const x = 15 + 7 * 30;
      for (let i = 0; i < 8; ++i)
        q[q.length] = new Charge("p", {
          x: x + i * 30,
          y: y
        });
    }
  });

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics

  //grouping of positive on left
  let rows = 9;
  let separation = 30;
  let offx = 15;
  let offy = canvas.height / 2 - ((rows - 1) * separation) / 2;
  for (let i = 0; i < 7; ++i) {
    for (let j = 0; j < rows; ++j) {
      q[q.length] = new Charge("p", {
        x: i * separation + offx,
        y: j * separation + offy
      });
    }
  }

  //grouping of negative and positive on right
  separation = 30;
  const columns = 5;
  offx = canvas.width - 30 * columns + 15;
  offy = canvas.height / 2 - ((rows - 1) * separation) / 2;
  for (let i = 0; i < columns; ++i) {
    for (let j = 0; j < rows; ++j) {
      q[q.length] = new Charge("p", {
        x: i * separation + offx,
        y: j * separation + offy
      });
    }
  }
  for (let i = 0; i < columns; ++i) {
    for (let j = 0; j < rows; ++j) {
      q[q.length] = new Charge("e-small", {
        x: i * separation + offx,
        y: j * separation + offy
      });
    }
  }

  function cycle() {
    Charge.physicsAll(q, 0.99, 500, 200);
    //choose a draw mode
    if (drawMode === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      Charge.drawCloudChamber(q);
    }
    Charge.bounds(q);
    // Charge.mouseCharge(q, mouse, 2);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
