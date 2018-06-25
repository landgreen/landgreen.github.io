const setup2 = function() {
  var canvas = document.getElementById("grav2");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 25px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup2();

function grav2(el) {
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");
  // ctx.globalCompositeOperation = 'lighter'
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBounds();
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

  let speed = Math.floor(document.getElementById("speed").value);
  document.getElementById("speed").addEventListener(
    "input",
    function() {
      speed = Math.floor(document.getElementById("speed").value);
    },
    false
  );

  const q1 = []; //holds the Particles
  vyOff = 0.0001;

  q1[q1.length] = new Particle(
    {
      x: 150,
      y: 150
    },
    500,
    0,
    { x: 0, y: vyOff },
    "#f00"
  );

  q1[q1.length] = new Particle(
    {
      x: 250,
      y: 150
    },
    0.1,
    0,
    { x: 0, y: -0.33 },
    "#f39"
  );

  const q2 = []; //holds the Particles
  q2[q2.length] = new Particle(
    {
      x: 450,
      y: 150
    },
    500,
    0,
    { x: 0, y: vyOff },
    "#30f"
  );
  q2[q2.length] = new Particle(
    {
      x: 350,
      y: 150
    },
    0.1,
    0,
    { x: 0, y: -0.4 },
    "#0af"
  );

  const q3 = []; //holds the Particles
  q3[q3.length] = new Particle(
    {
      x: 150,
      y: 450
    },
    500,
    0,
    { x: 0, y: vyOff },
    "#bbb"
  );
  q3[q3.length] = new Particle(
    {
      x: 250,
      y: 450
    },
    0.1,
    0,
    { x: 0, y: -0.5 },
    "#fff"
  );

  const q4 = []; //holds the Particles
  q4[q4.length] = new Particle(
    {
      x: 450,
      y: 450
    },
    500,
    0,
    { x: 0, y: vyOff },
    "#0b0"
  );
  q4[q4.length] = new Particle(
    {
      x: 350,
      y: 450
    },
    0.1,
    0,
    { x: 0, y: -0.58 },
    "#0fb"
  );

  q1[q1.length - 1].radius *= 4; // large radius for visibility
  q2[q2.length - 1].radius *= 4; // large radius for visibility
  q3[q3.length - 1].radius *= 4; // large radius for visibility
  q4[q4.length - 1].radius *= 4; // large radius for visibility

  function drawBounds() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  drawBounds();

  function cycle() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < speed; ++i) {
      Particle.integration(q1);
      Particle.drawAll(q1, ctx);
      Particle.integration(q2);
      Particle.drawAll(q2, ctx);
      Particle.integration(q3);
      Particle.drawAll(q3, ctx);
      Particle.integration(q4);
      Particle.drawAll(q4, ctx);
    }
    drawBounds();
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
