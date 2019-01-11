Charge.clickStart("charge3")

function charges3(el) {
  let q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  document.getElementById("charge3-example").addEventListener("mouseleave", () => {
    pause = true;
  });
  document.getElementById("charge3-example").addEventListener("mouseenter", () => {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  function chooseMode() {
    q.length = 0; //reset charges
    mode = presetEl.value
    switch (mode) {
      case 'random':
        Charge.spawnCharges(q, 25, "p");
        Charge.spawnCharges(q, 25, "e");
        break;
      case 'square':
        square()
        break;
      case 'triangle':
        triangle()
        break;
      case 'hexagon':
        hexagon();
        break;
    }
  }
  const presetEl = document.getElementById("charge-preset")
  chooseMode()
  presetEl.addEventListener("change", () => {
    chooseMode()
  });

  function hexagon() {
    const side = 30;
    const apothem = side * 0.866; //vertical distance between rows
    const rows = 8; // y
    const columns = 8; // x
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
        q[q.length] = new Charge("e", {
          x: hexLeft + (x + xOff) * side,
          y: hexTop + y * apothem
        });
      }
    }
  }

  function triangle() {
    // const lenX = 12
    const lenY = 10;
    const separationX = 32;
    const separationY = 27;
    for (let j = 0; j < lenY; ++j) {
      for (let i = 0; i < j; ++i) {
        const offX = canvas.width / 2 - (j - 1) * separationX / 2;
        const offY = canvas.height / 2 - lenY * separationY / 2;
        q[q.length] = new Charge("p", {
          x: i * separationX + offX,
          y: j * separationY + offY
        });
        q[q.length] = new Charge("e", {
          x: i * separationX + offX,
          y: j * separationY + offY
        });
      }
    }
  }

  function square() {
    const separation = 30;
    const len = 7;
    const offX = canvas.width / 2 - ((len - 1) * separation) / 2;
    const offY = canvas.height / 2 - ((len - 1) * separation) / 2;
    for (let i = 0; i < len; ++i) {
      for (let j = 0; j < len; ++j) {
        q[q.length] = new Charge("p", {
          x: i * separation + offX,
          y: j * separation + offY
        });
        q[q.length] = new Charge("e", {
          x: i * separation + offX,
          y: j * separation + offY
        });
      }
    }
  }


  function cycle() {
    if (!pause) {
      Charge.physicsAll(q);
      Charge.bounds(q);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.vectorField(q);
      ctx.globalAlpha = 0.5;
      Charge.drawAll(q);
      ctx.globalAlpha = 1;
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}