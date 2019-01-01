(() => {
  var canvas = document.getElementById("resonance");
  var ctx = canvas.getContext("2d");
  ctx.font = "300 30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()


function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function resonance(el) {
  el.onclick = null; //stops the function from running on button click
  var canvas = el;
  var ctx = canvas.getContext("2d");

  //set up matter.js physics engine
  const Engine = Matter.Engine,
    Constraint = Matter.Constraint,
    World = Matter.World

  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity

  const pendulum = Matter.Bodies.polygon(canvas.width / 2, 0, 0, 10, {
    radius: 20,
    friction: 0,
    frictionAir: 0.001,
    frictionStatic: 0,
    restitution: 1,
    inertia: Infinity //no rotation
  });
  World.add(engine.world, pendulum);
  constraint = Constraint.create({
    pointA: {
      x: canvas.width / 2,
      y: 0
    },
    bodyB: pendulum,
    stiffness: 1,
    length: canvas.height - pendulum.radius - 10,

  });

  World.add(engine.world, constraint);

  let frequency = 1;
  let count = 0;
  let mag = 0;

  document.getElementById("charge-in").addEventListener("input", () => {
    frequency = document.getElementById("charge-in").value;
    document.getElementById("charge-in-slider").value = frequency
  });
  document.getElementById("charge-in-slider").addEventListener("input", () => {
    frequency = document.getElementById("charge-in-slider").value;
    document.getElementById("charge-in").value = frequency
  });


  function microwave() {
    if (frequency > 0) {
      count += 1 * frequency
      mag = 0.00001 * Math.sin(count / 60 * 2 * Math.PI)
      pendulum.force.x += mag


      //draw microwaves
      const wide = Math.abs(8000000 * mag)
      const size = 15
      const step = canvas.height / 5
      ctx.strokeStyle = "#f58";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#f58";

      if (mag > 0) {
        for (let i = 0; i < 5; i++) {
          const h = canvas.height - i * step - step / 2
          //line
          ctx.beginPath();
          ctx.moveTo(0, h);
          ctx.lineTo(wide, h);
          ctx.stroke();
          //arrow
          ctx.beginPath();
          ctx.moveTo(wide + size, h);
          ctx.lineTo(wide - 1, h - size * 0.4);
          ctx.lineTo(wide, h);
          ctx.lineTo(wide - 1, h + size * 0.4);
          ctx.fill();
        }
      } else {
        for (let i = 0; i < 5; i++) {
          const h = canvas.height - i * step - step / 2
          //line
          ctx.beginPath();
          ctx.moveTo(canvas.width, h);
          ctx.lineTo(canvas.width - wide, h);
          ctx.stroke();
          //arrow
          ctx.beginPath();
          ctx.moveTo(canvas.width - wide - size, h);
          ctx.lineTo(canvas.width - wide + 1, h - size * 0.4);
          ctx.lineTo(canvas.width - wide, h);
          ctx.lineTo(canvas.width - wide + 1, h + size * 0.4);
          ctx.fill();
        }

      }
      // ctx.fillStyle = "#f58"
      // const wide = Math.abs(5000000 * mag)
      // if (mag > 0) {
      //   ctx.fillRect(0, 0, wide, canvas.height)
      // } else {
      //   ctx.fillRect(canvas.width - wide, 0, wide, canvas.height)
      // }
    }
  }


  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ball
    ctx.beginPath();
    ctx.fillStyle = "#abc";
    ctx.moveTo(pendulum.position.x, pendulum.position.y);
    ctx.arc(pendulum.position.x, pendulum.position.y, pendulum.radius, 0, 2 * Math.PI);
    ctx.fill();

    //string constraint
    ctx.beginPath();
    ctx.moveTo(constraint.pointA.x, constraint.pointA.y);
    ctx.lineTo(pendulum.position.x, pendulum.position.y, );
    ctx.strokeStyle = "#345";
    ctx.lineWidth = 2;
    ctx.stroke();

    //end points
    ctx.beginPath();
    ctx.arc(pendulum.position.x, pendulum.position.y, 3, 0, 2 * Math.PI);
    ctx.arc(constraint.pointA.x, constraint.pointA.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#345";
    ctx.fill();

  }

  function cycle() {
    if (checkVisible(el)) {
      Engine.update(engine, 16.666);
      pendulum.force.y += 0.0001 //gravity down
      draw()
      microwave();
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
}