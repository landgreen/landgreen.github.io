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
  let currentOut = current;

  function ammeter() {
    current = current * 0.99 + Charge.teleport(q, 200) * 0.01;
    // console.log((current*60).toFixed(2))
    ctx.fillStyle = "#000";
    if (!(count % 60)) currentOut = current
    ctx.fillText((currentOut * 60).toFixed(1) + " e⁻/s", canvas.width - 3, canvas.height - 3);
  }

  const separation = 40;
  const off = 250;

  function wiggle(mag = 10) {
    return (Math.random() - 0.5) * mag
  }

  for (let i = 0; i < Math.ceil((canvas.width + off * 2) / separation); ++i) {
    q[q.length] = new Charge("p", {
      x: separation * i - off + wiggle(),
      y: canvas.height / 2 + separation + wiggle()
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off + wiggle(),
      y: canvas.height / 2 + wiggle()
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off + wiggle(),
      y: canvas.height / 2 - separation + wiggle()
    });

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

  let count = 0

  function cycle() {
    if (!pause) {
      count++
      Charge.physicsAll(q);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.drawAll(q);
      ammeter();
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}