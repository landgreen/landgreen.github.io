
function drawNPC() {
    ctx.beginPath();
    for (let i = 0; i < mob.length; i++) {
      mob[i].attraction();
      let vertices = mob[i].vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.fillStyle = '#5ff';
    ctx.strokeStyle = '#222';
    ctx.lineWidth=2;
    ctx.fill();
    ctx.stroke();
}

const mob = [];

function spawnNPC(x,y){
  let len = mob.length
  mob[len] = Matter.Bodies.polygon(x, y, 3 + Math.floor(Math.random()*4),Math.random()*30 + 20,{
    density: 0.01,
    //friction: 0.05,
    frictionAir: 0.001,
    //frictionStatic: 0.2,
    restitution: 0.5,
  });
  World.add(engine.world, mob[len]); //add bullet to world
  mob[len].forceMag = 0.0002*mob[len].mass;
  mob[len].index = len; //so it can find it's self later
  mob[len].attraction = function() {
      var dx = player.position.x - mob[len].position.x;
      var dy = player.position.y - mob[len].position.y;
      if (dx*dx+dy*dy < 1000000){ //if distance to player < sqrt(1000000)
        var angle = Math.atan2(dy, dx);
        mob[len].force.x += mob[len].forceMag * Math.cos(angle);
        mob[len].force.y += mob[len].forceMag * Math.sin(angle) - 0.001*mob[len].mass; //antigravity
      }
  }
}

function MobSetIndex(){
    for (let i = 0; i < mob.length; i++) {
        mob[i].index = i;
    }
}
