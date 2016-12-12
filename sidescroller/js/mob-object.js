function drawMob() {
    ctx.lineWidth = 2;
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
        ctx.fill();
        ctx.stroke();
    }
}

function mobLoop() {
    let i = mob.length
    while (i--) {
        if (mob[i].alive) {
            mob[i].fallCheck();
            mob[i].seePlayerCheck();
            mob[i].attraction();
        } else {
            mob[i].deadCounting(i); //pass i to know what array index to delete on death
        }
    }
}

const mob = [];

function spawnNPC(x, y) {
    let i = mob.length;
    mob[i] = Matter.Bodies.polygon(x, y, 3 + Math.floor(Math.random() * 4), Math.random() * 60 + 20, {
        density: 0.001,
        //friction: 0,
        frictionAir: 0.005,
        //frictionStatic: 0,
        restitution: 0.6,
        collisionFilter: {
            group: 0,
            category: 0x0001,
            mask: 0x1101,
        },
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
        let collisionM = Matter.Query.ray(map, this.position, player.position)
        let collisionB = Matter.Query.ray(body, this.position, player.position)
        if (collisionM.length === 0 && collisionB.length === 0) {
            this.locatePlayer();
        } else if (this.seePlayer.yes) {
            this.seePlayer.yes--;
            this.stroke = '#555'
        }
    }
    mob[i].locatePlayer = function() {
        this.seePlayer.yes = 180; //180/60=3seconds before mob falls a sleep
        this.seePlayer.position.x = player.position.x;
        this.seePlayer.position.y = player.position.y;
        this.stroke = '#000'
    }

    mob[i].attraction = function() {
        //this.force.y -= 0.0005 * this.mass; //antigravity
        let dx = this.seePlayer.position.x - this.position.x;
        let dy = this.seePlayer.position.y - this.position.y;
        if (this.seePlayer.yes && dx * dx + dy * dy < 2000000) {
            const forceMag = 0.001 * this.mass;
            let angle = Math.atan2(dy, dx);
            this.force.x += forceMag * Math.cos(angle);
            this.force.y += forceMag * Math.sin(angle); // - 0.0007 * this.mass; //antigravity
        }
    }
    mob[i].fallCheck = function() {
        if (this.position.y > game.fallHeight) {
            Matter.Body.setPosition(this, this.spawnPos);
            Matter.Body.setVelocity(this, {
                x: 0,
                y: 0
            });
        }
    }
    mob[i].alive = true;
    mob[i].damage = function(dmg) {
        this.health -= dmg / (Math.sqrt(this.mass));
        this.fill = 'rgba(0,255,255,' + this.health + ')';
        //this.fill = 'rgba(255,0,0,' + this.health + ')';
        //Matter.Body.setDensity(this, 0.001*this.health);
        //this.restitution = 0.6*this.health;
        if (this.health < 0.1) {
            this.death();
        }
    }
    mob[i].deadCount = 0.2;
    mob[i].death = function() {
        this.alive = false;
        this.health = 1;
        this.seePlayer.yes = 0;
        this.fill = 'rgba(0,0,0,0)';
        //this.stroke = 'rgba(0,0,0,0.1)';
        //Matter.Body.setDensity(this, 0.0002);
        //this.restitution = 0;
        this.collisionFilter.category = 0x0010;
        this.collisionFilter.mask = 0x0001;
        //this.friction= 0;
        //this.frictionAir= 0.02;
        //this.frictionStatic= 0;
        //Matter.Body.setPosition(this, this.spawnPos);
        // Matter.Body.setVelocity(this, {
        //     x: 0,
        //     y: 0
        // });
    }
    mob[i].deadCounting = function(i) {
        this.deadCount -= 0.0002;
        this.stroke = 'rgba(0,0,0,' + this.deadCount + ')'; //fade away
        if (this.deadCount < 0) {
            Matter.World.remove(engine.world, this);
            mob.splice(i, 1); //doesn't work b/c of reference in draw bullet function
        }
    }

}
