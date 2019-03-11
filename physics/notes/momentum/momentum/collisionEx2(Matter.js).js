(() => {
  let width = 580;
  let height = 180;

  const canvas = document.getElementById("canvas3");
  const ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function resizeCanvas() {
    //fit canvas to window and fix issues with canvas blur on zoom
    if (document.body.clientWidth > width) {
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const scale = window.devicePixelRatio;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
    }
  }

  function intro() {
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = 1;
    const cx = width / 2;
    const cy = height / 2;
    let scale
    if (width > height) {
      scale = height / 10 + 7
    } else {
      scale = width / 10 + 7
    }
    ctx.strokeStyle = "#012";
    ctx.beginPath()
    ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
    ctx.moveTo(cx - scale * 0.8, cy - scale);
    ctx.lineTo(cx + scale * 1.2, cy);
    ctx.lineTo(cx - scale * 0.8, cy + scale);
    ctx.lineTo(cx - scale * 0.8, cy - scale);
    ctx.stroke();
    ctx.lineJoin = "miter"
    ctx.lineCap = "butt"
    ctx.lineWidth = 1;
  }
  window.addEventListener("load", intro);
  window.addEventListener("resize", intro);
  canvas.addEventListener("click", collisionSim);

  function collisionSim() {
    canvas.removeEventListener('click', collisionSim);
    window.removeEventListener("resize", intro);
    // module aliases
    var Engine = Matter.Engine,
      World = Matter.World,
      Body = Matter.Body,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

    // create an engine
    var engine = Engine.create();
    var scale = 1;
    //adjust gravity to fit simulation
    engine.world.gravity.scale = 0.000001 * scale;
    engine.world.gravity.y = 0;

    var mass = [];

    canvas.addEventListener("mousedown", function () {
      World.clear(engine.world, true); //clear matter engine, leave static
      mass = []; //clear mass array
      spawnList();
    });
    spawnList();

    function spawnList() {
      var Ypos = height / 2;
      spawnMass(-100, Ypos, 120, 0, 44.72135955, "pink", 6, 0.1);
      spawnMass(500, Ypos - 50, -60, -20, 30, "cyan", 3, 1.5);
    }

    function spawnMass(xIn, yIn, VxIn, VyIn, length, color, sides, angle) {
      //spawn mass
      var i = mass.length;
      mass.push();
      mass[i] = Bodies.polygon(xIn * scale, yIn * scale, sides, length * scale, {
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 0.988,
        length: length,
        color: color
      });

      Body.setVelocity(mass[i], {
        x: (VxIn / 60) * scale,
        y: (-VyIn / 60) * scale
      });
      Matter.Body.setAngle(mass[i], angle);
      Matter.Body.setAngularVelocity(mass[i], -0.004);
      World.add(engine.world, mass[i]);
    }

    //add walls flush with the edges of the canvas
    // var offset = 25;
    // World.add(engine.world, [
    //   Bodies.rectangle(width*0.5, -offset-1, width * 2 + 2 * offset, 50, { //top
    //     isStatic: true,
    //     friction: 1,
    //     frictionStatic: 1,
    //   }),
    //   Bodies.rectangle(width * 0.5, height + offset + 1, width * 2 + 2 * offset, 50, { //bottom
    //     isStatic: true,
    //     friction: 1,
    //     frictionStatic: 1,
    //   }),
    //   Bodies.rectangle(width + offset + 1, height * 0.5, 50, height * 2 + 2 * offset, { //right
    //     isStatic: true,
    //     friction: 1,
    //     frictionStatic: 1,
    //   }),
    //   Bodies.rectangle(-offset-1, height*0.5, 50, height * 2 + 2 * offset, {  //left
    //     isStatic: true,
    //     friction: 1,
    //     frictionStatic: 1,
    //   })
    // ]);

    function edgeBounce() {
      for (var k = 0, length = mass.length; k < length; k++) {
        if (mass[k].position.x - mass[k].length / 2 < 0) {
          Matter.Body.setPosition(mass[k], {
            x: mass[k].length / 2,
            y: mass[k].position.y
          });
          Matter.Body.setVelocity(mass[k], {
            x: Math.abs(mass[k].velocity.x),
            y: 0
          });
        }
        if (mass[k].position.x + mass[k].length / 2 > width) {
          Matter.Body.setPosition(mass[k], {
            x: width - mass[k].length / 2,
            y: mass[k].position.y
          });
          Matter.Body.setVelocity(mass[k], {
            x: -Math.abs(mass[k].velocity.x),
            y: 0
          });
        }
      }
    }

    // run the engine
    Engine.run(engine);

    //render
    (function render() {
      var bodies = Composite.allBodies(engine.world);
      window.requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);
      // ctx.fillStyle = 'rgba(255,255,255,0.4)';  //trails
      // ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      for (var i = 0; i < bodies.length; i += 1) {
        var vertices = bodies[i].vertices;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (var j = 1; j < vertices.length; j += 1) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        if (bodies[i].color) {
          ctx.fillStyle = bodies[i].color;
        } else {
          ctx.fillStyle = "#ccc";
        }
        ctx.fill();
        ctx.stroke();
      }

      //draw lines
      // ctx.beginPath();
      // for (var k = 0, length = mass.length; k<length; k++){
      //   ctx.moveTo(mass[k].position.x,mass[k].position.y);
      //   ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
      // }
      // ctx.stroke();
      //labels
      ctx.textAlign = "center";
      ctx.textAlign = "center";
      ctx.font = "17px Arial";
      ctx.fillStyle = "#000";
      var p = 0;
      for (var k = 0, length = mass.length; k < length; k++) {
        ctx.fillText(mass[k].mass.toFixed(2) + " kg", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 22);
        ctx.fillText(mass[k].velocity.x.toFixed(2) + " m/s", mass[k].position.x, mass[k].position.y - mass[k].length / 2 - 2);
        p += mass[k].mass * mass[k].velocity.x;
      }
      ctx.textAlign = "left";
      ctx.fillText("mv  +  mv  + mv  =  total momentum", 5, height - 5);
      ctx.fillText("(" + mass[0].mass.toFixed(2) + ")(" + mass[0].velocity.x.toFixed(2) + ") + (" + mass[1].mass.toFixed(2) + ") (" + mass[1].velocity.x.toFixed(2) + ") + (" + mass[0].mass.toFixed(2) + ")(" + mass[0].velocity.x.toFixed(2) + ") = " + p.toFixed(2), 5, 22);
    })();
  }
})();