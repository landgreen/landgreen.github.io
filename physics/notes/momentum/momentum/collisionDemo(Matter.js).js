(() => {
  let width = 580;
  let height = 320;

  const canvas = document.getElementById("canvas0");
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
    spawnMass(-50, 150, 100, 0);
    spawnMass(650, 150, -100, 0);

    canvas.addEventListener("mousedown", function () {
      World.clear(engine.world, true); //clear matter engine, leave static
      mass = []; //clear mass array
      spawnMass(0, 150, 150, 0);
      spawnMass(700, 150, -150, 0);
    });

    function spawnMass(xIn, yIn, VxIn, VyIn, length = 40 + Math.round(Math.random() * 25), rest = Math.random()) {
      var i = mass.length;
      mass.push();
      mass[i] = Bodies.polygon(xIn * scale, yIn * scale, 3 + Math.floor(Math.random() * 3), length * scale, {
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: rest,
        angle: Math.random() * Math.PI,
        length: length,
        color: randomColor({
          luminosity: "light"
        })
      });
      Matter.Body.setAngularVelocity(mass[i], 0.05 * (Math.random() - 0.5));
      Body.setVelocity(mass[i], {
        x: (VxIn / 60) * scale,
        y: (-VyIn / 60) * scale
      });
      World.add(engine.world, mass[i]);
    }

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

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";
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
        // ctx.stroke();
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
      // ctx.font = "300 20px Roboto";
      ctx.font = "20px Arial";
      ctx.fillStyle = "#222";
      var p = 0;
      for (var k = 0, length = mass.length; k < length; k++) {
        // ctx.fillText(mass[k].mass.toFixed(2) + "kg", mass[k].position.x, mass[k].position.y - 12);
        // ctx.fillText(mass[k].velocity.x.toFixed(2) + "m/s", mass[k].position.x, mass[k].position.y + 12);
        p += mass[k].mass * mass[k].velocity.x;
      }
      ctx.textAlign = "left";
      // ctx.fillText("    m      v     +     m      v       =  total momentum", 5, height - 5);
      // ctx.fillText("mv  +  mv  =  total momentum", 70, height - 5);

      let space0 = " ";
      if (mass[0].velocity.x < 0) space0 = "";
      let space1 = " ";
      if (mass[1].velocity.x < 0) space1 = "";

      ctx.fillText("(" + mass[0].mass.toFixed(2) + " kg)(" + space0 + mass[0].velocity.x.toFixed(2) + " m/s) + (" + mass[1].mass.toFixed(2) + " kg)(" + space1 + mass[1].velocity.x.toFixed(2) + " m/s) = " + p.toFixed(2), 65, 22);
      //color underlines
      ctx.fillStyle = mass[0].color;
      ctx.fillRect(67, 30, 170, 10);
      ctx.fillStyle = mass[1].color;
      ctx.fillRect(265, 30, 170, 10);
    })();
  }
})();