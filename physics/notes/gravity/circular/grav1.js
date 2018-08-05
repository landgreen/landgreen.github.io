grav1();
function grav1() {
  var canvas = document.getElementById("grav1");
  var ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", function(event) {
    Particle.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    });
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
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
