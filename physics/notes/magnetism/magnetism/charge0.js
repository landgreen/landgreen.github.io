const setup0 = function() {
  var canvas = document.getElementById("charge0");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Roboto";

  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
};
setup0();

function charges0(el) {
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);
  // var canvas = el
  // var ctx = canvas.getContext("2d");

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
    Charge.repulse(q, mouse);
  };
  canvas.onmouseup = function() {
    mouse.down = false;
  };

  let B = -0.03;
  document.getElementById("B").addEventListener(
    "input",
    function() {
      B = Number(document.getElementById("B").value);
    },
    false
  );

  let pause = false;
  el.addEventListener("mouseleave", function() {
    pause = true;
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    Charge.setCanvas(el);
    if (!pause) requestAnimationFrame(cycle);
  });

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics
  // Charge.spawnCharges(q, 12, "p");
  Charge.spawnCharges(q, 1, "e");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function cycle() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.05) {
      q[q.length] = new Charge(
        "e",
        {
          //position
          x: 30 + Math.random() * (canvas.width - 60),
          y: 30 + Math.random() * (canvas.height - 60)
        },
        {
          //velocity
          x: 12 * (Math.random() - 0.5),
          y: 12 * (Math.random() - 0.5)
        }
      );
    }

    Charge.physicsAll(q, 0.998, 1);
    Charge.physicsMagneticField(q, B);
    // Charge.drawMagneticField(B);
    // Charge.vectorField()
    // Charge.scalarField(q);
    Charge.drawCloudChamber(q);
    // Charge.drawAll(q);
    // Charge.bounds(q);
    Charge.boundsRemove(q, 0);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
