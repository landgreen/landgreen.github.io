Charge.clickStart("charge7")

function charges7(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  ctx.textAlign = "right";

  let pause = false;
  el.addEventListener("mouseleave", function () {
    pause = true;
  });
  el.addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  let current = 1 / 60;

  function ammeter() {
    current = current * 0.99 + Charge.teleport(q, 200) * 0.01;
    // console.log((current*60).toFixed(2))
    ctx.fillStyle = "#000";
    ctx.fillText((current * 60).toFixed(1) + " e⁻/s", canvas.width - 3, canvas.height - 3);
  }

  //spawn p before e to avoid a bug in the class method allPhysics
  //spawn p before e to avoid a bug in the class method allPhysics
  const separation = 40;
  const off = 250;

  for (let i = 0; i < Math.ceil((canvas.width + off * 2) / separation); ++i) {
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: canvas.height / 2 + separation
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: canvas.height / 2
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: canvas.height / 2 - separation
    });
  }

  for (let i = 0; i < Math.ceil((canvas.width + off * 2) / separation); ++i) {
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2 + separation
      }, {
        x: 2,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2
      }, {
        x: 2,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2 - separation
      }, {
        x: 2,
        y: 0
      }
    );
  }

  function cycle() {
    Charge.physicsAll(q);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Charge.drawAll(q);
    ammeter();
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}