//bullets**************************************************************
//*********************************************************************
//*********************************************************************
//*********************************************************************

const bullet = [];

function fireBullet() {
  const len = bullet.length;
  //bullet[len] = Bodies.polygon(e.x - mech.transX, e.y- mech.transY, 5, 5);
  const dist = 15 //radial distance mech head
  const dir = (Math.random() - 0.5) * 0.1 + mech.angle
    //spawn as a rectangle
  bullet[len] = Bodies.rectangle(mech.x + dist * Math.cos(mech.angle), mech.y + dist * Math.sin(mech.angle), 10, 3, {
    angle: dir,
    //density: 0.001,
    //friction: 0.05,
    frictionAir: 0,
    //frictionStatic: 0.2,
    restitution: 0.25,
    //sleepThreshold: 30, //bullets despawn on sleep after __ cycles
    collisionFilter: {
      group: -2 //can't collide with player (at first)
    }
  });
  //fire polygons
  // bullet[len] = Bodies.polygon(mech.x + dist*Math.cos(mech.angle), mech.y + dist*Math.sin(mech.angle),5, 5,{
  //   angle: Math.random(),
  //   collisionFilter: {group: -2 }
  //   );
  //fire circles
  //bullet[len] = Bodies.circle(mech.x + dist*Math.cos(mech.angle), mech.y + dist*Math.sin(mech.angle), 3,{ restitution: 0.5, sleepThreshold: 15, collisionFilter: { group: -2 }});
  bullet[len].birthCycle = game.cycle;
  bullet[len].classType = 'bullet';
//  bullet[len].index = len;
  bullet[len].blankfunc = function() { //blank functino for later
    }
    //bullet velocity in direction of player plus player velocity
    // Matter.Body.setVelocity(bullet[len], {
    //   x: mech.Vx + vel * Math.cos(dir),
    //   y: mech.Vy + vel * Math.sin(dir)
    // });
  Matter.Body.setVelocity(bullet[len], {
    x: mech.Vx,
    y: mech.Vy
  });
  //add force to fire bullets
  const vel = 0.0025;
  const f = {
    x: vel * Math.cos(dir) / game.delta,
    y: vel * Math.sin(dir) / game.delta
  }
  bullet[len].force = f;
  //equal but opposite force on player
  player.force.x -= f.x;
  player.force.y -= f.y;

  World.add(engine.world, bullet[len]); //add bullet to world
}

let fireBulletCD = 0;

function bulletLoop() {
  //fire check
  //if (game.mouseDown && !(game.cycle % 2) && !game.isPaused) {
  if (mech.canFire && game.mouseDown && fireBulletCD < game.cycle && !game.isPaused) {
    fireBulletCD = game.cycle + 5;
    fireBullet();
  }
  //all bullet loop
  let i = bullet.length;
  while (i--) {
    //soon after spawn bullets can collide with player
    //this may need to be removed
    if (bullet[i].collisionFilter.group != 1 && bullet[i].birthCycle + 5 < game.cycle) {
      bullet[i].collisionFilter.group = 1;
    }

    //bullet[i].force.y -= engine.world.gravity.scale*0.01; //make bullets have less wieght

    //bullets despawn
    //if (bullet[i].isSleeping || bullet[i].birthCycle + 360 < game.cycle) {
    if (bullet[i].birthCycle + 200 < game.cycle && !game.isPaused) {
      Matter.World.remove(engine.world, bullet[i]);
      bullet.splice(i, 1);
    }
  }
}
