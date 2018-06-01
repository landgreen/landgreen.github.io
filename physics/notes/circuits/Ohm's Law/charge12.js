(function() {
  var canvas = document.getElementById("charge12");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 24px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

function charges12(el) {
  el.onclick = null; //stops the function from running on button click
  Charge.setCanvas(el);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = "300 18px Roboto";

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
  let pause = false;
  el.addEventListener("mouseleave", function() {
    pause = true;
    // setTimeout(function(){
    // 	Charge.scalarField(q,1)
    // 	voltmeter()
    // 	Charge.pushZone(q,offx)
    // }, 100);
  });
  el.addEventListener("mouseenter", function() {
    pause = false;
    Charge.setCanvas(el);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = "300 18px Roboto";
    if (!pause) requestAnimationFrame(cycle);
  });

  const q = []; //holds the charges
  //spawn p before e to avoid a bug in the class method allPhysics
  const separation = 10;
  let lenX = 17;
  let lenY = 35;
  const offx = canvas.width / 2 - (lenX - 1) * separation / 2;
  const offy = canvas.height / 2 - (lenY - 1) * separation / 2;
  const v = 1.8;

  for (let i = 0; i < lenX; ++i) {
    q[q.length] = new Charge("p", { x: offx + i * separation, y: offy });
    q[q.length] = new Charge("p", { x: offx + i * separation, y: canvas.height - offy });
  }
  for (let i = 0; i < lenY; ++i) {
    q[q.length] = new Charge("p", { x: offx, y: offy + i * separation });
    q[q.length] = new Charge("p", { x: canvas.width - offx, y: offy + i * separation });
  }
  for (let i = 0; i < lenX; ++i) {
    q[q.length] = new Charge("e", { x: offx + i * separation, y: offy }, { x: -v, y: 0 });
    q[q.length] = new Charge("e", { x: offx + i * separation, y: canvas.height - offy }, { x: v, y: 0 });
  }
  for (let i = 0; i < lenY; ++i) {
    q[q.length] = new Charge("e", { x: offx, y: offy + i * separation }, { x: 0, y: v });
    q[q.length] = new Charge("e", { x: canvas.width - offx, y: offy + i * separation }, { x: 0, y: -v });
  }

  //voltmeter
  const p1 = {
    value: 0,
    x: 110,
    y: 75
  };
  const p2 = {
    value: 0,
    x: 110,
    y: 325
  };
  function voltmeter() {
    p1.value = p1.value * 0.995 + Charge.potential(q, p1) * 0.005;
    p2.value = p2.value * 0.995 + Charge.potential(q, p2) * 0.005;
    // *100 to scale the numbers up past the decimal
    ctx.fillStyle = "#000";
    ctx.fillText("V1 = " + (p1.value * 100).toFixed(2), p1.x, p1.y);
    ctx.fillText("V2 = " + (p2.value * 100).toFixed(2), p2.x, p2.y);
    ctx.fillText("ΔV = " + ((p1.value - p2.value) * 100).toFixed(2), p2.x, 200);
  }

  let inZone = [];
  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Charge.physicsAll(q);
    Charge.bounds(q);
    // Charge.teleport(q)
    // Charge.vectorField(q)
    Charge.scalarField(q, 3);
    voltmeter();
    // Charge.drawAll(q)
    Charge.pushZone(q, offx);
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
