Charge.clickStart("charge1")

function charges1(el) {
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q);
      Charge.drawAll(q);
      Charge.bounds(q);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}