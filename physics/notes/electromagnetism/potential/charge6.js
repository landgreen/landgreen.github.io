Charge.clickStart("charge6")

function charges6(el) {
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

  //spawn p before e to avoid a bug in the class method allPhysics
  const separation = 30;
  const len = 5;
  const offx = canvas.width / 2 - ((len - 1) * separation) / 2;
  const offy = canvas.height / 2 - ((len - 1) * separation) / 2;
  for (let i = 0; i < len; ++i) {
    for (let j = 0; j < len; ++j) {
      q[q.length] = new Charge("p", {
        x: i * separation + offx,
        y: j * separation + offy
      });
      q[q.length] = new Charge("e", {
        x: i * separation + offx + 15 * (Math.random() - 0.5),
        y: j * separation + offy + 15 * (Math.random() - 0.5)
      });
    }
  }

  function cycle() {
    if (!pause) {
      Charge.physicsAll(q);
      Charge.bounds(q);
      Charge.scalarField(q, true);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}