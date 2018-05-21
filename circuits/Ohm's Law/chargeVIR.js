(function() {
  var canvas = document.getElementById("chargeVIR");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 24px Roboto";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

function chargesVIR(el) {
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
    // setTimeout(function() {
    //   Charge.scalarField(q, 1);
    //   voltmeter();
    //   Charge.pushZone(q, bat.x, bat.y, 440, bat.push);
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

  let q = []; //holds the charges

  //charge spawning
  const separation = 13;
  let lenX = 30;
  let lenY = 35;
  const offx = 75;
  const endx = canvas.width % separation;
  const offy = 50;
  const v = 2;
  let bottom = 0;
  let wiggleMag = 35;
  let electronArrayIndex = 0;
  let redraw = false;
  function addProtons() {
    for (let i = offy; i < canvas.height - offy; i += separation) {
      const wiggle = wiggleMag * Math.sin(i * 0.057 + 0.3) - 5;
      q.unshift(new Charge("p", { x: canvas.width - offx - wiggle, y: i }));
    }
    for (let i = offy; i < canvas.height - offy; i += separation) {
      q.unshift(new Charge("p", { x: offx, y: i }));
      bottom = i;
    }
    for (let i = offx + separation; i < canvas.width - offx; i += separation) {
      q.unshift(new Charge("p", { x: i, y: offy }));
      q.unshift(new Charge("p", { x: i, y: bottom }));
    }
  }
  addProtons();

  function AddElectrons() {
    electronArrayIndex = q.length;
    for (let i = offx + separation; i < canvas.width - offx; i += separation) {
      q[q.length] = new Charge("e", { x: i, y: offy }, { x: -v, y: 0 });
      // if (Math.random() < 0.5) {
      q[q.length] = new Charge("e", { x: i, y: bottom }, { x: v, y: 0 });
      // }
    }
    for (let i = offy; i < canvas.height - offy; i += separation) {
      q[q.length] = new Charge("e", { x: offx, y: i }, { x: 0, y: v });
      const wiggle = wiggleMag * Math.sin(i * 0.057);
      q[q.length] = new Charge("e", { x: canvas.width - offx - wiggle, y: i }, { x: 0, y: 0 });
    }
  }
  AddElectrons();

  document.getElementById("wiggle").addEventListener(
    "input",
    function() {
      wiggleMag = document.getElementById("wiggle").value;
      redraw = true;
    },
    false
  );
  document.getElementById("push").addEventListener(
    "input",
    function() {
      bat.push = Number(document.getElementById("push").value);
    },
    false
  );

  const bat = { x: 75, y: 75, push: 0.15 };
  //voltmeter
  const p1 = {
    dV: 0,
    value: 0,
    x: bat.x + 55,
    y: bat.y + 25
  };
  const p2 = {
    value: 0,
    x: bat.x + 55,
    y: bat.y + 410
  };
  function voltmeter() {
    p1.value = p1.value * 0.995 + Charge.potential(q, p1) * 0.005;
    p2.value = p2.value * 0.995 + Charge.potential(q, p2) * 0.005;
    // *100 to scale the numbers up past the decimal
    ctx.fillStyle = "#000";
    const x = p1.x - 87;
    ctx.fillText("V1 = " + (p1.value * 100).toFixed(1), x, p1.y);
    ctx.fillText("V2 = " + (p2.value * 100).toFixed(1), x, p2.y);
    p1.dV = (p1.value - p2.value) * 100;
    ctx.fillText("ΔV = " + p1.dV.toFixed(1), x, bat.y + 225);
    // if (v > 9) {
    //   bat.push -= 0.0001;
    // } else {
    //   bat.push += 0.0001;
    // }
  }

  const a = {
    x: 275,
    y: 450,
    width: 60,
    height: 150,
    current: 0,
    inRegion: []
  };
  function ammeter() {
    //check for electrons in region
    let inRegionNow = [];
    for (let i = 0, len = q.length; i < len; i++) {
      if (q[i].electron && q[i].position.x > a.x && q[i].position.x < a.x + a.width && q[i].position.y > a.y && q[i].position.y < a.y + a.height) {
        inRegionNow.push(i);
      }
    }
    //find changes from a.inRegion and inRegionNow
    let count = 0;
    for (let i = 0, len = inRegionNow.length; i < len; ++i) {
      let found = false;
      for (let j = 0, len = a.inRegion.length; j < len; ++j) {
        if (inRegionNow[i] === a.inRegion[j]) {
          found = true;
        }
      }
      if (!found && q[inRegionNow[i]].velocity.x > 0) count++;
    }
    a.inRegion = inRegionNow;
    //smooth current
    a.current = 0.995 * a.current + 0.005 * (count * 60);

    //output
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.rect(a.x, a.y, a.width, a.height);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.fillText("I = " + a.current.toFixed(1), a.x + 5, a.y + 15);
  }

  ohmsLawOut = function() {
    document.getElementById("voltage-a").innerHTML = p1.dV.toFixed(1);
    document.getElementById("current-a").innerHTML = a.current.toFixed(1);
    document.getElementById("resistance-a").innerHTML = (p1.dV / a.current).toFixed(1);
  };

  let inZone = [];
  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Charge.physicsAll(q);
    Charge.bounds(q);
    // Charge.teleport(q)
    // Charge.vectorField(q);
    Charge.scalarField(q, 6);
    // Charge.drawAll(q);
    Charge.pushZone(q, bat.x, bat.y, 440, bat.push);
    voltmeter();
    ammeter();
    ohmsLawOut();
    if (redraw) {
      redraw = false;
      q.splice(0, electronArrayIndex);
      //   q = [];
      addProtons();
    }
    if (!pause) requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}
