Charge.clickStart("charge4")

function charges4(el) {
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
  const len = 7;
  const offx = canvas.width / 2 - ((len - 1) * separation) / 2;
  const offy = canvas.height / 2 - ((len - 1) * separation) / 2;
  for (let i = 0; i < len; ++i) {
    for (let j = 0; j < len; ++j) {
      q[q.length] = new Charge("p", {
        x: i * separation + offx,
        y: j * separation + offy
      });
    }
  }
  for (let i = 0; i < len; ++i) {
    for (let j = 0; j < len; ++j) {
      q[q.length] = new Charge("e", {
        x: i * separation + offx,
        y: j * separation + offy
      });
    }
  }

  function cycle() {
    if (!pause) {
      Charge.physicsAll(q);
      Charge.bounds(q);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.vectorField(q);
      ctx.globalAlpha = 0.5;
      Charge.drawAll(q);
      ctx.globalAlpha = 1;
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}