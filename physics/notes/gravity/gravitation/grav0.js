(function grav0() {
  const canvas = document.getElementById("grav0");
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "lighter";

  let height, width;

  function setupCanvas() {
    // canvas.width = window.innerWidth;
    canvas.width = document.body.clientWidth; //window.innerWidth; //document.body.scrollWidth;
    canvas.height = document.getElementById("myHeader").clientHeight;
    width = canvas.width;
    height = canvas.height;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.7;
  }
  setupCanvas();
  window.onresize = function() {
    setupCanvas();
  };

  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", function(event) {
    Particle.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    });
  });

  document.getElementById("num").addEventListener(
    "input",
    function() {
      reset();
    },
    false
  );

  let q = []; //holds the Particles
  const reset = function() {
    // q = [];
    const numberRequested = Math.floor(Math.min(document.getElementById("num").value, 1000));
    const diff = numberRequested - q.length;
    if (diff > 0) {
      //add
      Particle.spawnRandom(q, canvas, diff);
    } else {
      //remove
      q.length = q.length + diff;
    }
  };
  reset();

  function cycle() {
    if (window.pageYOffset < height) {
      ctx.clearRect(0, 0, width, height);
      Particle.integration(q, 0.1);
      Particle.drawAll(q, ctx);
      Particle.bounds(q, canvas);
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
})();
