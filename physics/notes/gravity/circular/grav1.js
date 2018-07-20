grav1();
function grav1(el = document.getElementById("grav1")) {
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
  let pause = true;
  el.addEventListener("mouseleave", function() {
    pause = true;
  });
  el.addEventListener("mouseenter", function() {
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  const q = []; //holds the Particles

  q[q.length] = new Particle(
    {
      x: 125,
      y: 125
    },
    500,
    0,
    { x: 0, y: 0.016 },
    "#ff0"
  );

  q[q.length] = new Particle(
    {
      x: 225,
      y: 125
    },
    15,
    0,
    { x: 0, y: -0.5 },
    "#0df"
  );

  q[q.length] = new Particle(
    {
      x: 235,
      y: 125
    },
    1,
    0,
    { x: -0.02, y: -0.5 },
    "#fff"
  );

  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    Particle.integration(q);
    Particle.drawAll(q, ctx);
    Particle.bounds(q, canvas);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
