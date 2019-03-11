Charge.clickStart("charge9")

function charges9(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  el.addEventListener("mouseleave", function () {
    pause = true;
  });
  el.addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  ctx.textAlign = "right";

  const side = 30;
  const apothem = side * 0.866; //vertical distance between rows
  const rows = 7; // y
  const columns = 20; // x

  const hexLeft = canvas.width / 2 - side * ((columns * 3) / 4) - 60;
  const hexTop = canvas.height / 2 - apothem * (rows / 2);

  for (let y = 1; y < rows; ++y) {
    let xOff = 0;
    if (y % 2) {} else {
      xOff = 0.5; //odd
    }
    for (let x = 0, i = 0; i < columns; ++i) {
      if (i % 2) {
        //even
        x++;
        xOff = Math.abs(xOff);
      } else {
        //odd
        x += 2;
        xOff = -Math.abs(xOff);
      }

      q[q.length] = new Charge("p", {
        x: hexLeft + (x + xOff) * side,
        y: hexTop + y * apothem
      });
    }
  }
  const Vx = 0;
  for (let y = 1; y < rows; ++y) {
    let xOff = 0;
    if (y % 2) {} else {
      xOff = 0.5; //odd
    }
    for (let x = 0, i = 0; i < columns; ++i) {
      if (i % 2) {
        //even
        x++;
        xOff = Math.abs(xOff);
      } else {
        //odd
        x += 2;
        xOff = -Math.abs(xOff);
      }
      if (!(y === 3 && (x % 2 || x === 11))) {
        // if (!(y === 3 && x === 8) && !(y === 5 && x === 14) && !(y === 1 && x === 17) && !(y === 6 && x === 21)) {
        q[q.length] = new Charge(
          "e-small", {
            x: hexLeft + (x + xOff) * side + 5,
            y: hexTop + y * apothem
          }, {
            x: Vx,
            y: 0
          }
        );
      }
    }
  }

  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q, 0.93, 217, 110);
      Charge.uniformField(q, {
        x: 0.076,
        y: 0
      });
      Charge.drawAll(q);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}