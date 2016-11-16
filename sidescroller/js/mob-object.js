function drawNPC() {
    for (let i = 0; i < mob.length; i++) {
        ctx.beginPath();
        mob[i].seePlayerCheck();
        mob[i].attraction();
        let vertices = mob[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        ctx.fillStyle = 'rgba(0,255,255,' + mob[i].health + ')';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }
}

const mob = [];

function spawnNPC(x, y) {
    let i = mob.length;
    mob[i] = Matter.Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 4), Math.random() * 30 + 20, {
        density: 0.001,
        //friction: 0,
        frictionAir: 0.002,
        //frictionStatic: 0,
        restitution: 0.6,
    });
    World.add(engine.world, mob[i]); //add bullet to world
    mob[i].spawnPos = {
      x: mob[i].position.x,
      y: mob[i].position.y
    }
    mob[i].index = i; //so it can find it's self later
    mob[i].health = 1;  // range: 1 to 0
    mob[i].color = 'rgba(0,255,255,' + mob[i].health + ')';
    mob[i].seePlayer = {
        yes: 0,
        position: {
            x: 0,
            y: 0
        }
    };
    mob[i].seePlayerCheck = function() {
        //check if the mob can see the player, but array map blocks view
        let collision = Matter.Query.ray(map, mob[i].position, player.position)
        if (collision.length === 0) {
            //if (!Matter.Query.ray(map, mob[i].position, player.position)) {
            this.seePlayer.yes = 180; //180/60=3seconds before mob falls a sleep
            this.seePlayer.position.x = player.position.x;
            this.seePlayer.position.y = player.position.y;
            //draw ray query vector for mostly debug purposes
            ctx.moveTo(this.seePlayer.position.x, this.seePlayer.position.y);
            ctx.lineTo(this.position.x, this.position.y);
        } else if (this.seePlayer.yes) {
            this.seePlayer.yes--;
            //draw ray query vector for mostly debug purposes
            ctx.moveTo(this.seePlayer.position.x, this.seePlayer.position.y);
            ctx.lineTo(this.position.x, this.position.y);
        }

    }
    mob[i].attraction = function() {
        //this.force.y -= 0.0005 * this.mass; //antigravity
        let dx = this.seePlayer.position.x - mob[i].position.x;
        let dy = this.seePlayer.position.y - mob[i].position.y;
        if (this.seePlayer.yes && dx * dx + dy * dy < 2000000) {
            const forceMag = 0.0005 * this.mass;
            let angle = Math.atan2(dy, dx);
            this.force.x += forceMag * Math.cos(angle);
            this.force.y += forceMag * Math.sin(angle) - 0.0007 * this.mass; //antigravity
        }
    }
    mob[i].damage = function(dmg) {
        this.health -= dmg;
        if (this.health < 0) {
          this.death();
        }
    }
    mob[i].death = function(){
      this.health = 1;
      this.seePlayer.yes = 0;
      Matter.Body.setPosition(this, this.spawnPos);
      Matter.Body.setVelocity(this, {
          x: 0,
          y: 0
      });
      //Matter.Sleeping.set(mob[k], true);
      //Matter.World.remove(engine.world, mob[k]);
      //mob.splice(k, 1); //doesn't work b/c of reference in draw bullet function
      //MobSetIndex();
    }
}

function MobSetIndex() {
    for (let i = 0; i < mob.length; i++) {
        mob[i].index = i;
    }
}
