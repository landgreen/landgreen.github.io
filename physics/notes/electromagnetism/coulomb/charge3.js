Charge.clickStart("charge3")

function charges3(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  el.addEventListener("mouseleave", function () {
    pause = true;
  });
  el.addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  const separation = 30;
  const len = 18
  for (let i = 2; i < len; ++i) {
    q[q.length] = new Charge("p", {
      x: i * separation + separation / 2,
      y: canvas.height / 2
    });
    q[q.length] = new Charge("e", {
      x: i * separation + separation / 2,
      y: canvas.height / 2
    });
  }

  document.getElementById("add-charge")
  q[q.length] = new Charge("e", {
    x: 0.3 * separation,
    y: canvas.height / 2
  });

  q[q.length] = new Charge("p", {
    x: (len + 1) * separation + separation / 2,
    y: canvas.height / 2
  });


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