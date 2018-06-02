const setup1 = function() {
  var canvas = document.getElementById("grav1");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup1();

function grav1(el) {
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");

  //___________________get mouse input___________________
  var mouse = {
    down: false,
    x: 0,
    y: 0
  };
  canvas.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  canvas.onmousedown = function() {
    mouse.down = true;
    Particle.repulse(q, mouse);
  };
  canvas.onmouseup = function() {
    mouse.down = false;
  };
  let pause = false;
  el.addEventListener("mouseleave", function() {
    pause = true;
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    if (!pause) requestAnimationFrame(cycle);
  });

  document.getElementById("num1").addEventListener(
    "input",
    function() {
      reset();
    },
    false
  );

  let vMag;
  let q = []; //holds the Particles
  const reset = function() {
    q = [];
    if (document.getElementById("num1").value > 100) {
      document.getElementById("num1").value = 100;
    }
    Particle.spawnRandom(q, canvas, Math.floor(document.getElementById("num1").value));
    // Particle.spawnRandom(q, canvas, Math.min(Math.floor(document.getElementById("num1").value), 200))
    vMag = 170000 / Particle.totalMass(q); //scales the vector field intensity
  };
  reset();

  function cycle() {
    Particle.integration(q);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Particle.vectorField(q, ctx, canvas, vMag);
    Particle.drawAll(q, ctx);
    Particle.bounds(q, canvas, -10);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
