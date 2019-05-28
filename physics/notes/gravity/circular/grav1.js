grav1();

function grav1() {
  var canvas = document.getElementById("grav1");
  var ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", function (event) {

    Particle.repulse(q, {
      x: (event.offsetX * canvas.width) / canvas.clientWidth,
      y: (event.offsetY * canvas.height) / canvas.clientHeight
    }, 0.1);

  });

  const q = []; //holds the Particles

  q[q.length] = new Particle({
      x: 125,
      y: 125
    },
    500,
    0, {
      x: 0,
      y: 0.016
    },
    "#ff0"
  );

  q[q.length] = new Particle({
      x: 225,
      y: 125
    },
    15,
    0, {
      x: 0,
      y: -0.5
    },
    "#0df"
  );

  q[q.length] = new Particle({
      x: 235,
      y: 125
    },
    1,
    0, {
      x: 0,
      y: -0.75
    },
    "#fff"
  );

  // if (who[i].position.x > canvas.width + range) {
  //   who[i].velocity.x = 0; //-Math.abs(who[i].velocity.x)
  //   who[i].position.x = canvas.width + range;
  // } else if (who[i].position.x < -range) {
  //   who[i].velocity.x = 0; //Math.abs(who[i].velocity.x)
  //   who[i].position.x = -range;
  // }
  // if (who[i].position.y > canvas.height + range) {
  //   who[i].velocity.y = 0; //-Math.abs(who[i].velocity.y)
  //   who[i].position.y = canvas.height + range;
  // } else if (who[i].position.y < -range) {
  //   who[i].velocity.y = 0; //Math.abs(who[i].velocity.y)
  //   who[i].position.y = -range;
  // }



  //doesn't work 
  function circularBounds() {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius2 = centerX * centerX * 2
    for (let i = 0, len = q.length; i < len; ++i) {
      // calculate distance from center of canvas
      const dx = q[i].position.x - centerX
      const dy = q[i].position.y - centerY
      const dist2 = dx * dx + dy * dy
      if (dist2 > radius2) {
        const angle = Math.atan2(q[i].velocity.y, q[i].velocity.x)
        const mag = Math.sqrt(q[i].velocity.x * q[i].velocity.x + q[i].velocity.y * q[i].velocity.y)
        q[i].velocity.x = -mag * Math.cos(angle)
        q[i].velocity.y = -mag * Math.sin(angle)
      }
    }
  }

  function cycle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    Particle.integration(q);
    Particle.drawAll(q, ctx);
    // Particle.bounds(q, canvas);
    // circularBounds()
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}