const setup2 = function () {
  var canvas = document.getElementById("grav2");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup2();

function grav2(el) {
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");

  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", function (event) {
    Particle.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    });
  });

  document.getElementById("num2").addEventListener("input", () => {
      const number = Math.floor(Math.min(document.getElementById("num2").value, 999))
      document.getElementById("num2-slider").value = Math.log10(number)
      reset(number);
    },
    false
  );

  document.getElementById("num2-slider").addEventListener("input", () => {
      const convertLog = Math.pow(10, document.getElementById("num2-slider").value)
      const number = Math.floor(Math.min(convertLog, 999))
      document.getElementById("num2").value = number
      reset(number);
    },
    false
  );

  // document.getElementById("num2").addEventListener("input", () => reset(), false);

  let q = []; //holds the Particles
  let fMag;

  const reset = function () {
    // q = [];
    const numberRequested = Math.floor(Math.min(document.getElementById("num2").value, 100));
    const diff = numberRequested - q.length;
    if (diff > 0) {
      //add
      Particle.spawnRandom(q, canvas, diff);
    } else {
      //remove
      q.length = q.length + diff;
    }
    fMag = -15000 / Particle.totalMass(q); //calibrate color magnitude.
  };

  reset(Math.floor(Math.min(document.getElementById("num2").value, 99)));


  function cycle() {
    if (checkVisible(canvas)) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Particle.integration(q, 0.1);
      Particle.scalarField(q, ctx, canvas, fMag);
      // Particle.vectorColorField(q, ctx, canvas, fMag);
      Particle.bounds(q, canvas);
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}