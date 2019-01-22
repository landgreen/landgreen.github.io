Charge.clickStart("charge5")

function charges5(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  const elZone = document.getElementById("charge5-zone");
  elZone.addEventListener("mouseleave", function () {
    pause = true;
  });
  elZone.addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  let addPath = false;
  document.getElementById("add-path").addEventListener("click", event => {
    if (!addPath) {
      addPath = true;
      const y = canvas.height / 2;
      const x = 15 + 7 * 30;
      for (let i = 0; i < 8; ++i)
        q[q.length] = new Charge("p", {
          x: x + i * 30,
          y: y
        });
    }
  });

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
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q);
      Charge.drawAll(q);
      Charge.bounds(q);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}