Charge.clickStart("charge8")

function charges8(el) {
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

  //spawn p before e to avoid a bug in the class method allPhysics
  const side = 30;
  const apothem = side * 0.866; //vertical distance between rows
  const rows = 7; // y
  const columns = 26; // x

  const hexLeft = canvas.width / 2 - side * ((columns * 3) / 4) - 60;
  const hexTop = canvas.height / 2 - apothem * (rows / 2);

  for (let y = 1; y < rows; ++y) {
    let xOff = 0;
    if (y % 2) {} else {
      xOff = 0.5; //odd
    }
    for (let x = -1, i = 0; i < columns; ++i) {
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
    for (let x = -1, i = 0; i < columns + 1; ++i) {
      if (i % 2) {
        //even
        x++;
        xOff = Math.abs(xOff);
      } else {
        //odd
        x += 2;
        xOff = -Math.abs(xOff);
      }

      q[q.length] = new Charge(
        "e-small", {
          x: hexLeft + (x + xOff) * side,
          y: hexTop + y * apothem
        }, {
          x: Vx,
          y: 0
        }
      );
    }
  }
  /////////////////////////////////////////
  // teleport
  /////////////////////////////////////////
  function teleport(who) {
    const off = 100
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].canMove && who[i].position.x > settings.width - off) {
        who[i].position.x = -settings.width;
      }
    }
  }


  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q, 0.95, 150, 110);
      Charge.uniformField(q);
      Charge.teleport(q);
      Charge.drawAll(q);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}