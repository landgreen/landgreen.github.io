Charge.clickStart("charge2")

function charges2(el) {
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

  const separation = 47;
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

  const Vx = 1.5;
  for (let i = 0; i < Math.ceil((canvas.width + off * 2) / separation); ++i) {
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2 + separation
      }, {
        x: Vx,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2
      }, {
        x: Vx,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: canvas.height / 2 - separation
      }, {
        x: Vx,
        y: 0
      }
    );
  }
  // Charge.spawnCharges(q, 25, 'e')
  // Charge.spawnCharges(q, 25, 'p')
  let current = 8.2 / 60;

  function ammeter() {
    current = current * 0.995 + Charge.teleport(q, 200) * 0.005;
    // console.log((current*60).toFixed(2))
    ctx.fillStyle = "#000";
    ctx.fillText((current * 60).toFixed(1) + " e⁻/s", canvas.width - 5, canvas.height - 3);
  }

  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q);
      Charge.drawAll(q);
      ammeter();
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}