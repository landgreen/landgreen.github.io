Charge.clickStart("charge0")

function charges0(el) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Charge.physicsAll(q);
    Charge.drawAll(q);
    Charge.bounds(q);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}