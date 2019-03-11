Charge.clickStart("charge10", false)


(function (id, color = "#012", colorBG = "#f5f7f8") {
  let canvas = document.getElementById(id);
  let ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = 1;

  ctx.fillStyle = colorBG;
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let scale
  if (canvas.width > canvas.height) {
    scale = canvas.height / 10 + 7
  } else {
    scale = canvas.width / 10 + 7
  }

  ctx.strokeStyle = color;
  ctx.beginPath()
  ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
  // ctx.fill();

  // ctx.fillStyle = colorBG;
  // ctx.beginPath()
  ctx.moveTo(cx - scale * 0.8, cy - scale);
  ctx.lineTo(cx + scale * 1.2, cy);
  ctx.lineTo(cx - scale * 0.8, cy + scale);
  ctx.lineTo(cx - scale * 0.8, cy - scale);
  ctx.stroke();

  ctx.lineJoin = "miter"
  ctx.lineCap = "butt"
  ctx.lineWidth = 1;
})


function charges10(el) {

  const q = []; //holds the charges
  Charge.setup(el, q);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = "16px Arial";

  let pause = false;
  el.addEventListener("mouseleave", function () {
    pause = true;
  });
  el.addEventListener("mouseenter", function () {
    pause = false;
    Charge.setCanvas(el);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = "16px Arial";
    if (!pause) requestAnimationFrame(cycle);
  });

  //spawn p before e to avoid a bug in the class method allPhysics
  const separation = 10;
  let lenX = 17;
  let lenY = 35;
  const offx = canvas.width / 2 - ((lenX - 1) * separation) / 2;
  const offy = canvas.height / 2 - ((lenY - 1) * separation) / 2;
  const v = 1.8;

  for (let i = 0; i < lenX; ++i) {
    q[q.length] = new Charge("p", {
      x: offx + i * separation,
      y: offy
    });
    q[q.length] = new Charge("p", {
      x: offx + i * separation,
      y: canvas.height - offy
    });
  }
  for (let i = 0; i < lenY; ++i) {
    q[q.length] = new Charge("p", {
      x: offx,
      y: offy + i * separation
    });
    //q[q.length] = new Charge('p', {x: canvas.width-offx,y: offy + i*separation})
  }
  for (let i = 0; i < lenX; ++i) {
    q[q.length] = new Charge("e", {
      x: offx + i * separation,
      y: offy
    }, {
      x: -v,
      y: 0
    });
    q[q.length] = new Charge("e", {
      x: offx + i * separation,
      y: canvas.height - offy
    }, {
      x: v,
      y: 0
    });
  }
  for (let i = 0; i < lenY; ++i) {
    q[q.length] = new Charge("e", {
      x: offx,
      y: offy + i * separation
    }, {
      x: 0,
      y: v
    });
    //q[q.length] = new Charge('e', {x: canvas.width-offx,y: offy + i*separation}, {x:0,y:-v})
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
    // ctx.globalCompositeOperation = 'difference' // 'color-burn';
    ctx.fillText("V1 = " + (p1.value * 100).toFixed(2), p1.x, p1.y);
    ctx.fillText("V2 = " + (p2.value * 100).toFixed(2), p2.x, p2.y);
    ctx.fillText("ΔV = " + ((p1.value - p2.value) * 100).toFixed(2), p2.x, 200);
    // ctx.globalCompositeOperation = 'source-over';
  }

  function cycle() {
    if (!pause) {
      requestAnimationFrame(cycle);
      Charge.physicsAll(q);
      Charge.bounds(q, 50);
      Charge.scalarField(q);
      Charge.pushZone(q, offx);
      voltmeter();
    }
  }
  requestAnimationFrame(cycle);
}