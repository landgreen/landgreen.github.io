Charge.clickStart("charge0")

function charges0(el) {
  const spread = 10;
  let mode = "random"
  let boundsRange = -7;
  const q = []; //holds the charges
  Charge.setup(el, q);

  let pause = false;
  document.getElementById("charge0-example").addEventListener("mouseleave", function () {
    pause = true;
  });
  document.getElementById("charge0-example").addEventListener("mouseenter", function () {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });

  function chooseMode() {
    q.length = 0; //reset charges
    mode = presetEl.value
    switch (mode) {
      case 'random':
        boundsRange = -7;
        Charge.spawnCharges(q, 25, "p");
        Charge.spawnCharges(q, 25, "e");
        break;
      case 'square':
        boundsRange = -7;
        square()
        break;
      case 'triangle':
        boundsRange = 150;
        triangle()
        break;
      case 'hexagon':
        boundsRange = 150;
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
    const rows = 16; // y
    const columns = 16; // x
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
          x: hexLeft + (x + xOff) * side + spread * (Math.random() - 0.5),
          y: hexTop + y * apothem + spread * (Math.random() - 0.5)
        });
      }
    }
  }

  function triangle() {
    const separationX = 41 //32;
    const separationY = separationX * 0.84 //27;
    const lenX = canvas.width / separationX + 2;
    const lenY = canvas.height / separationY + 2;
    for (let j = 0; j < lenY; ++j) {
      for (let i = 0; i < lenX; ++i) {
        const offX = (j % 2 - 1) * separationX / 2;
        const offY = -separationY;
        q[q.length] = new Charge("p", {
          x: i * separationX + offX,
          y: j * separationY + offY
        });
        q[q.length] = new Charge("e", {
          x: i * separationX + offX + spread * (Math.random() - 0.5),
          y: j * separationY + offY + spread * (Math.random() - 0.5)
        });
      }
    }
  }
  // function triangle() {
  //   const lenY = 10;
  //   const separationX = 47 //32;
  //   const separationY = 40 //27;
  //   for (let j = 0; j < lenY; ++j) {
  //     for (let i = 0; i < j; ++i) {
  //       const offX = canvas.width / 2 - (j - 1) * separationX / 2;
  //       const offY = canvas.height / 2 - lenY * separationY / 2;
  //       q[q.length] = new Charge("p", {
  //         x: i * separationX + offX,
  //         y: j * separationY + offY
  //       });
  //       q[q.length] = new Charge("e", {
  //         x: i * separationX + offX + spread * (Math.random() - 0.5),
  //         y: j * separationY + offY + spread * (Math.random() - 0.5)
  //       });
  //     }
  //   }
  // }

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
          x: i * separation + offX + spread * (Math.random() - 0.5),
          y: j * separation + offY + spread * (Math.random() - 0.5)
        });
      }
    }
  }

  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Charge.physicsAll(q);
      Charge.drawAll(q);
      Charge.bounds(q, boundsRange);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}