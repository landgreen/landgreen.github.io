(() => {
  var canvas = document.getElementById("grav1");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()


function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function grav1(el) {
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");

  let height, width;

  function setupCanvas() {
    // canvas.width = window.innerWidth;
    // canvas.width = Math.min(document.body.clientWidth, 1200); //window.innerWidth; //document.body.scrollWidth;
    // canvas.height = 400;
    width = canvas.width;
    height = canvas.height;
    // ctx.globalCompositeOperation = "lighter";
    // ctx.globalAlpha = 0.7;
  }
  setupCanvas();
  window.onresize = function () {
    setupCanvas();
  };

  //___________________get mouse input___________________
  canvas.addEventListener("mousedown", function (event) {
    Particle.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    });
  });

  document.getElementById("num1").addEventListener("input", () => {
      const number = Math.floor(Math.min(document.getElementById("num1").value, 99))
      document.getElementById("num1-slider").value = Math.log10(number)
      reset(number);
    },
    false
  );

  document.getElementById("num1-slider").addEventListener("input", () => {
      const convertLog = Math.pow(10, document.getElementById("num1-slider").value)
      const number = Math.floor(Math.min(convertLog, 99))
      document.getElementById("num1").value = number
      reset(number);
    },
    false
  );

  document.getElementById("num1").addEventListener("input", () => reset(), false);

  let vMag;
  let q = []; //holds the Particles

  // const reset = function () {
  //   // q = [];
  //   const numberRequested = Math.floor(Math.min(document.getElementById("num1").value, 1000));
  //   const diff = numberRequested - q.length;
  //   if (diff > 0) {
  //     //add
  //     Particle.spawnRandom(q, canvas, diff);
  //   } else {
  //     //remove
  //     q.length = q.length + diff;
  //   }
  //   vMag = 170000 / Particle.totalMass(q); //scales the vector field intensity
  // };
  // reset();


  const reset = (numberRequested) => {
    const diff = numberRequested - q.length;
    if (diff > 0) {
      //add
      Particle.spawnRandom(q, canvas, diff);
    } else {
      //remove
      q.length = q.length + diff;
    }
    vMag = 170000 / Particle.totalMass(q); //scales the vector field intensity
  };
  reset(Math.floor(Math.min(document.getElementById("num1").value, 99)));


  function cycle() {
    if (checkVisible(canvas)) {
      Particle.integration(q, 0.1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Particle.vectorField(q, ctx, canvas, vMag);
      Particle.drawAll(q, ctx);
      Particle.bounds(q, canvas);
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}