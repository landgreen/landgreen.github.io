  Charge.clickStart("charge6")

  function charges6(el) {
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

    //spawn p before e to avoid a bug in the class method allPhysics
    const side = 30;
    const apothem = side * 0.866; //vertical distance between rows
    const rows = 22; // y
    const columns = 14; // x

    const hexLeft = canvas.width / 2 - side * ((columns * 3) / 4);
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

        q[q.length] = new Charge("e-small", {
          x: hexLeft + (x + xOff) * side,
          y: hexTop + y * apothem
        });
      }
    }

    function cycle() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q);
      Charge.drawAll(q);
      Charge.bounds(q);
      if (!pause) requestAnimationFrame(cycle);
    }
    requestAnimationFrame(cycle);
  }