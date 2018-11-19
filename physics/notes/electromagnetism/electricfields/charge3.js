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

  //spawn p before e to avoid a bug in the class method allPhysics
  Charge.spawnCharges(q, 25, "p");
  Charge.spawnCharges(q, 25, "e");

  function cycle() {
    Charge.physicsAll(q);
    Charge.bounds(q);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Charge.vectorField(q);
    ctx.globalAlpha = 0.5;
    Charge.drawAll(q);
    ctx.globalAlpha = 1;

    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}