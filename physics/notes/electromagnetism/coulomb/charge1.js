Charge.clickStart("charge1")

function charges1(el) {
  const q = []; //holds the charges
  Charge.setup(el, q);

  const q2 = []; //holds the charges
  Charge.setup(el, q2);

  let pause = false;
  document.getElementById("charge1-div").addEventListener("mouseleave", () => {
    pause = true;
  });
  document.getElementById("charge1-div").addEventListener("mouseenter", () => {
    Charge.setCanvas(el);
    if (pause) requestAnimationFrame(cycle);
    pause = false;
  });


  document.getElementById("charge1-reset").addEventListener("click", () => {
    q.length = 0;
    q2.length = 0;
    spawn()
  })

  spawn()

  function spawn() {
    const separation = 30;
    const len = 18
    for (let i = 2; i < len; ++i) {
      q2[q2.length] = new Charge("p", {
        x: i * separation + separation / 2,
        y: 3 * canvas.height / 4
      });
      q2[q2.length] = new Charge("e", {
        x: i * separation + separation / 2,
        y: 3 * canvas.height / 4
      });
    }

    document.getElementById("add-charge")
    q2[q2.length] = new Charge("e", {
      x: 0.3 * separation,
      y: 3 * canvas.height / 4
    });

    q2[q2.length] = new Charge("p", {
      x: (len + 1) * separation + separation / 2,
      y: 3 * canvas.height / 4
    });

    document.getElementById("add-charge")
    q[q.length] = new Charge("e", {
      x: 0.3 * separation,
      y: canvas.height / 4
    });

    q[q.length] = new Charge("p", {
      x: (len + 1) * separation + separation / 2,
      y: canvas.height / 4
    });
  }



  function bounds(who, x1, y1, x2, y2) {
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
  }



  function cycle() {
    if (!pause) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      Charge.physicsAll(q);
      Charge.physicsAll(q2);
      Charge.drawAll(q);
      Charge.drawAll(q2);
      bounds(q, 7, 7, canvas.width - 7, canvas.height / 2 - 7);
      bounds(q2, 7, canvas.height / 2 + 7, canvas.width - 7, canvas.height - 7);
      requestAnimationFrame(cycle);
    }
  }
  requestAnimationFrame(cycle);
}