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
    length: 120

  });

  World.add(engine.world, constraint);

  let frequency = 0;
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

  function cycle() {
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
      document.getElementById("res-arrow").setAttribute("transform", `translate(${10000000 * mag} 0)`);
    }
    requestAnimationFrame(cycle);
  }
  requestAnimationFrame(cycle);
})()