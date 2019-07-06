Charge.clickStart("charge-wave")

function chargeWave(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  canvas.addEventListener("mouseleave", function () {
    pause = true;
  });
  canvas.addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  // Charge.spawnCharges(q, 2, "p");
  Charge.spawnCharges(q, 1, "e");

  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Charge.physicsAll(q);
      // Charge.bounds(q, 10);
      Charge.physicsWave(q);
      Charge.drawAll(q);

      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}