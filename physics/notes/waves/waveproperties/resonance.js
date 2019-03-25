function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

(() => {
  //set up matter.js physics engine
  const Engine = Matter.Engine,
    Constraint = Matter.Constraint,
    World = Matter.World

  // create an engine
  const engine = Engine.create();
  engine.world.gravity.scale = 0; //turn off gravity

  const pendulum = Matter.Bodies.polygon(300, 0, 0, 10, {
    length: 120,
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
      x: 300,
      y: 0
    },
    bodyB: pendulum,
    stiffness: 1,
    length: pendulum.length

  });

  World.add(engine.world, constraint);

  let frequency = 0;
  let count = 0;
  let mag = 0;
  let viewBoxY = 150;

  document.getElementById("res-freq").addEventListener("input", () => {
    frequency = document.getElementById("res-freq").value;
    document.getElementById("res-freq-slider").value = frequency
  });
  document.getElementById("res-freq-slider").addEventListener("input", () => {
    frequency = document.getElementById("res-freq-slider").value;
    document.getElementById("res-freq").value = frequency
  });


  // document.getElementById("res-length").addEventListener("input", () => {
  //   pendulum.length = Number(document.getElementById("res-length").value);
  //   document.getElementById("res-length-slider").value = pendulum.length
  //   constraint.length = pendulum.length
  //   viewBox = Math.max(150, pendulum.length + pendulum.radius + 10)
  //   document.getElementById("res").setAttribute("viewBox", "0 0 600 " + viewBox);
  // });
  document.getElementById("res-length-slider").addEventListener("input", () => {
    pendulum.length = Number(document.getElementById("res-length-slider").value);
    // document.getElementById("res-length").value = pendulum.length
    constraint.length = pendulum.length
    viewBoxY = Math.max(150, pendulum.length + pendulum.radius + 10)
    document.getElementById("res").setAttribute("viewBox", "0 0 600 " + viewBoxY);
  });

  // document.getElementById("res-mass-slider").addEventListener("input", () => {
  //   Matter.Body.setMass(pendulum, document.getElementById("res-mass-slider").value)
  //   console.log(pendulum.mass)
  // });

  // function cycle() {
  //   if (checkVisible(document.getElementById("res"))) {
  //     Engine.update(engine, 16.666);
  //     pendulum.force.y += 0.0001 //gravity down
  //     //draw
  //     document.getElementById("res-ball").setAttribute("transform", `translate(${pendulum.position.x} ${pendulum.position.y})`);
  //     document.getElementById("res-string").setAttribute("d", `M300 0 L${pendulum.position.x} ${pendulum.position.y}`);
  //     //apply force
  //     if (frequency > 0) count += 1 * frequency
  //     mag = 0.00001 * Math.sin(count / 60 * 2 * Math.PI)
  //     pendulum.force.x += mag
  //     document.getElementById("res-arrow").setAttribute("transform", `translate(${10000000 * mag} ${viewBoxY-150})`);
  //   }
  //   requestAnimationFrame(cycle);
  // }
  // requestAnimationFrame(cycle);


  const fpsCap = 60;
  const fpsInterval = 1000 / fpsCap;
  let then = Date.now();
  requestAnimationFrame(cycle); //starts game loop

  function cycle() {
    requestAnimationFrame(cycle);
    const now = Date.now();
    const elapsed = now - then; // calc elapsed time since last loop
    if (elapsed > fpsInterval) { // if enough time has elapsed, draw the next frame
      then = now - (elapsed % fpsInterval); // Get ready for next frame by setting then=now.   Also, adjust for fpsInterval not being multiple of 16.67

      //frame capped code here
      if (checkVisible(document.getElementById("res"))) {
        Engine.update(engine, 16.666);
        pendulum.force.y += 0.0001 //gravity down
        //draw
        document.getElementById("res-ball").setAttribute("transform", `translate(${pendulum.position.x} ${pendulum.position.y})`);
        document.getElementById("res-string").setAttribute("d", `M300 0 L${pendulum.position.x} ${pendulum.position.y}`);
        //apply force
        if (frequency > 0) count += 1 * frequency
        mag = 0.00001 * Math.sin(count / 60 * 2 * Math.PI)
        pendulum.force.x += mag
        document.getElementById("res-arrow").setAttribute("transform", `translate(${10000000 * mag} ${viewBoxY-150})`);
      }
    }
  }
})()