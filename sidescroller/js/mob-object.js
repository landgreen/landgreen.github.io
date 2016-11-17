function drawNPC() {
    let i = mob.length
    while (i--) {
        ctx.beginPath();
        let vertices = mob[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        ctx.fillStyle = mob[i].fill;
        ctx.strokeStyle = mob[i].stroke;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }
}

function mobLoop() {
  let i = mob.length
  while(i--){
      mob[i].fallCheck();
      if (mob[i].alive){
        mob[i].seePlayerCheck();
        mob[i].attraction();
      }
    }
}

const mob = [];

function spawnNPC(x, y) {
    let i = mob.length;
    mob[i] = Matter.Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 4), Math.random() * 30 + 20, {
        density: 0.001,
        //friction: 0,
        frictionAir: 0.01,
        //frictionStatic: 0,
        restitution: 0.6,
    });
    World.add(engine.world, mob[i]); //add bullet to world
    mob[i].spawnPos = {
        x: mob[i].position.x,
        y: mob[i].position.y
    }
    mob[i].index = i; //so it can find it's self later
    mob[i].health = 1; // range: 1 to 0
    mob[i].fill = 'rgba(0,255,255,' + mob[i].health + ')';
    mob[i].stroke = '#999'
    mob[i].seePlayer = {
        yes: 0,
        position: {
            x: 0,
            y: 0
        }
    };
    mob[i].seePlayerCheck = function() {
        //check if the mob can see the player, but array map blocks view
        this.stroke = '#999'
        let collisionM = Matter.Query.ray(map, mob[i].position, player.position)
        let collisionB = Matter.Query.ray(body, mob[i].position, player.position)
        if (collisionM.length === 0 && collisionB.length === 0) {
          this.locatePlayer();
        } else if (this.seePlayer.yes) {
            this.seePlayer.yes--;
            this.stroke = '#555'
        }
    }
    mob[i].locatePlayer = function(){
      this.seePlayer.yes = 180; //180/60=3seconds before mob falls a sleep
      this.seePlayer.position.x = player.position.x;
      this.seePlayer.position.y = player.position.y;
      this.stroke = '#000'
    }

    mob[i].attraction = function() {
        //this.force.y -= 0.0005 * this.mass; //antigravity
        let dx = this.seePlayer.position.x - mob[i].position.x;
        let dy = this.seePlayer.position.y - mob[i].position.y;
        if (this.seePlayer.yes && dx * dx + dy * dy < 2000000) {
            const forceMag = 0.001 * this.mass;
            let angle = Math.atan2(dy, dx);
            this.force.x += forceMag * Math.cos(angle);
            this.force.y += forceMag * Math.sin(angle) - 0.0007 * this.mass; //antigravity
        }
    }
    mob[i].fallCheck = function(){
      if (this.position.y > game.fallHeight){
          Matter.Body.setPosition(this, this.spawnPos);
          Matter.Body.setVelocity(this, {
              x: 0,
              y: 0
          });
      }
    }
    mob[i].alive = true;
    mob[i].damage = function(dmg) {
        this.health -= dmg;
        this.fill = 'rgba(0,255,255,' + this.health + ')';
        if (this.health < 0.1) {
            this.death();
        }
    }
    mob[i].death = function() {
        this.alive = false;
        this.health = 1;
        this.seePlayer.yes = 0;
        this.fill = 'rgba(0,255,255,0)';
        this.stroke = '#999';
        //Matter.Body.setPosition(this, this.spawnPos);
        // Matter.Body.setVelocity(this, {
        //     x: 0,
        //     y: 0
        // });

        //Matter.Sleeping.set(mob[k], true);
        //Matter.World.remove(engine.world, mob[k]);
        //mob.splice(k, 1); //doesn't work b/c of reference in draw bullet function
    }
    mob[i].deadCheck = function(i) {
        if (!mob[i].alive) {
            //Matter.Sleeping.set(this, true);
            //Matter.World.remove(engine.world, mob[i]);
            //mob.splice(i,1); //doesn't work b/c of references??
        }
    }

}
