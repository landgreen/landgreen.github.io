Charge.clickStart("charge1")

function charges1(el) {
  let pause = false;
  document.getElementById("charge1-div").addEventListener("mouseleave", () => {
    pause = true;
  });
  document.getElementById("charge1-div").addEventListener("mouseenter", () => {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });



  const q = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ]; //holds the charges
  for (let i = 0, len = q.length; i < len - 1; ++i) {
    Charge.setup(el, q[i]);
    spawnLine(q[i], 20 + i * 3, canvas.height * (i + 0.5) / len)
  }

  Charge.setup(el, q[q.length - 1]);

  q[q.length - 1][q[q.length - 1].length] = new Charge("e", {
    x: 10,
    y: canvas.height * (q.length - 0.5) / q.length
  });

  q[q.length - 1][q[q.length - 1].length] = new Charge("p", {
    x: canvas.width - 10,
    y: canvas.height * (q.length - 0.5) / q.length
  });






  document.getElementById("charge1-reset").addEventListener("click", () => {
    for (let i = 0, len = q.length; i < len - 1; ++i) {
      q[i].length = 0
      spawnLine(q[i], 20 + i * 3, canvas.height * (i + 0.5) / len)
    }
    q[q.length - 1].length = 0
    q[q.length - 1][q[q.length - 1].length] = new Charge("e", {
      x: 10,
      y: canvas.height * (q.length - 0.5) / q.length
    });

    q[q.length - 1][q[q.length - 1].length] = new Charge("p", {
      x: canvas.width - 10,
      y: canvas.height * (q.length - 0.5) / q.length
    });
  })


  function spawnLine(who, separation, height) {
    // const len = Math.ceil((canvas.width - 150 + separation / 2 - 15) / separation)
    const len = Math.ceil((canvas.width - 150 + separation / 2 - 15) / separation)
    for (let i = 0; i < len; ++i) {
      who[who.length] = new Charge("p", {
        x: i * separation + 80,
        y: height
      });
      who[who.length] = new Charge("e", {
        x: i * separation + 80,
        y: height
      });
    }
    who[who.length] = new Charge("p", {
      x: canvas.width - 10,
      y: height
    });

    who[who.length] = new Charge("e", {
      x: 10,
      y: height
    });
  }



  function bounds(who, x1, y1, x2, y2) {
    x1 += 7
    y1 += 7
    x2 -= 7
    y2 -= 7
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].canMove) {
        if (who[i].position.x > x2) {
          who[i].velocity.x = 0; //-Math.abs(who[i].velocity.x)
          who[i].position.x = x2
        } else if (who[i].position.x < x1) {
          who[i].velocity.x = 0; //Math.abs(who[i].velocity.x)
          who[i].position.x = x1;
        }
        if (who[i].position.y > y2) {
          who[i].velocity.y = 0; //-Math.abs(who[i].velocity.y)
          who[i].position.y = y2;
        } else if (who[i].position.y < y1) {
          who[i].velocity.y = 0; //Math.abs(who[i].velocity.y)
          who[i].position.y = y1;
        }
      }
    }
    ctx.beginPath();
    ctx.moveTo(x1 - 7.5, y1 - 8.5);
    ctx.lineTo(x2 + 7.5, y1 - 8.5);
    ctx.strokeStyle = "#678"
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function teleportCharges() {
    let count = 0
    for (let i = 0, len = q.length; i < len; ++i) {
      for (let j = 0, jen = q[i].length; j < jen; ++j) {
        if (q[i][j].canMove && q[i][j].position.x > canvas.width - 11) count++
      }
    }
    if (count > 8) {
      for (let i = 0, len = q.length; i < len; ++i) {
        for (let j = 0, jen = q[i].length; j < jen; ++j) {
          if (q[i][j].canMove && q[i][j].position.x > canvas.width - 30) {
            q[i][j].position.x = 10;
            q[i][j].velocity.x = 0;
          }
        }
      }

    }
  }


  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0, len = q.length; i < len; ++i) {
        Charge.physicsAll(q[i], 0.995);
        Charge.drawAll(q[i]);
        // teleportCharges()
        bounds(q[i], 0, canvas.height * i / len, canvas.width, canvas.height * (i + 1) / len);
      }
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}