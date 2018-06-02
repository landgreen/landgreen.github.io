const setup2 = function() {
  var canvas = document.getElementById("grav2");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Arial, Helvetica, sans-serif";
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
    // setTimeout(function() {
    //   Particle.scalarField(q, 1, fMag);
    // }, 100);
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    if (!pause) requestAnimationFrame(cycle);
  });

  let q = []; //holds the Particles

  document.getElementById("num2").addEventListener(
    "input",
    function() {
      reset();
    },
    false
  );

  let fMag;
  const reset = function() {
    q = [];
    if (document.getElementById("num2").value > 500) {
      document.getElementById("num2").value = 500;
    }
    Particle.spawnRandom(q, canvas, Math.floor(document.getElementById("num2").value));
    fMag = -20000 / Particle.totalMass(q);
  };
  reset();

  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Particle.integration(q);
    Particle.scalarField(q, ctx, canvas, 3, fMag);
    Particle.bounds(q, canvas, -10);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
