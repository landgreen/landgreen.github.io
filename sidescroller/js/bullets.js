let mobBullet = [];
let bullet = [];

const b = {
    dmgScale: 1, //scales all gun damage from momentum, but not raw .dmg
    gravity: 0.0006, //most other bodies have   gravity = 0.001
    activeGun: 0,
    inventory: [0], //list of what guns player has  // 0 starts with basic gun
    findGunInInventory: function() {
        for (let i = 0, len = b.inventory.length; i < len; ++i) {
            if (b.inventory[i] === b.activeGun) return i;
        }
    },
    fireProps: function(cd, speed, dir, me) {
        mech.fireCDcycle = game.cycle + cd; //cooldown
        Matter.Body.setVelocity(bullet[me], {
            x: mech.Vx / 2 + speed * Math.cos(dir),
            y: mech.Vy / 2 + speed * Math.sin(dir)
        });
        World.add(engine.world, bullet[me]); //add bullet to world
    },
    fireAttributes: function(dir) {
        return {
            // density: 0.0015,			//frictionAir: 0.01,			//restitution: 0,
            angle: dir,
            friction: 0.5,
            frictionAir: 0,
            dmg: 0, //damage done in addition to the damage from momentum
            classType: "bullet",
            collisionFilter: {
                category: 0x000100,
                mask: 0x000001 //mask: 0x000101,  //for self collision
            },
            minDmgSpeed: 10,
            onDmg: function() {}, //this.endCycle = 0  //triggers despawn
            onEnd: function() {}
        };
    },
    explode: function(me) {
        game.drawList.push({
            //add dmg to draw queue
            x: bullet[me].position.x,
            y: bullet[me].position.y,
            radius: bullet[me].explodeRad,
            color: "rgba(255,0,0,0.4)",
            time: game.drawTime
        });
        let dist, sub, knock;
        const dmg = b.dmgScale * bullet[me].explodeDmg;
		//damage and knock back mobs in range
        for (let i = 0, len = mob.length; i < len; ++i) {
            if (mob[i].alive) {
                sub = Matter.Vector.sub(bullet[me].position, mob[i].position);
                dist = Matter.Vector.magnitude(sub);
                if (dist < bullet[me].explodeRad) {
                    mob[i].damage(dmg);
                    mob[i].locatePlayer();
                    //add knockback for mobs
                    knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -dmg * mob[i].mass / 10);
                    mob[i].force.x += knock.x;
                    mob[i].force.y += knock.y;
                }
            }
        }
		//damage and knock back player in range
		sub = Matter.Vector.sub(bullet[me].position, player.position);
		dist = Matter.Vector.magnitude(sub);
		if (dist < bullet[me].explodeRad) {
			mech.damage(dmg*0.1)
			knock = Matter.Vector.mult(Matter.Vector.normalise(sub), -dmg * player.mass / 20);
			player.force.x += knock.x;
			player.force.y += knock.y;
		}
    },

    guns: [
        {
            name: "basic gun",
            ammo: Infinity,
            ammoPack: Infinity,
            have: true,
            fire: function() {
                const me = bullet.length;
                const dir = (Math.random() - 0.5) * 0.09 + mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 30 * Math.cos(mech.angle),
                    mech.pos.y + 30 * Math.sin(mech.angle),
                    18,
                    6,
                    b.fireAttributes(dir)
                );
                b.fireProps(20, 36, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].frictionAir = 0.01;
            }
        },
        {
            name: "rapid fire",
            ammo: 0,
            ammoPack: 40,
            have: false,
            fire: function() {
                const me = bullet.length;
                const dir = (Math.random() - 0.5) * 0.15 + mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 30 * Math.cos(mech.angle),
                    mech.pos.y + 30 * Math.sin(mech.angle),
                    17,
                    5,
                    b.fireAttributes(dir)
                );
                b.fireProps(5, 38, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 60;
                bullet[me].frictionAir = 0.01;
            }
        },
        {
            name: "spray",
            ammo: 0,
            ammoPack: 4,
            have: false,
            fire: function() {
                for (let i = 0; i < 9; i++) {
                    const me = bullet.length;
                    const dir = (Math.random() - 0.5) * 0.6 + mech.angle;
                    bullet[me] = Bodies.rectangle(
                        mech.pos.x + 30 * Math.cos(mech.angle),
                        mech.pos.y + 30 * Math.sin(mech.angle),
                        11,
                        11,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(35, 36 + Math.random() * 11, dir, me); //cd , speed
                    bullet[me].endCycle = game.cycle + 60;
                    bullet[me].frictionAir = 0.02;
                }
            }
        },
        {
            name: "needles",
            ammo: 0,
            ammoPack: 7,
            have: false,
            fire: function() {
                const me = bullet.length;
                const dir = mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 40 * Math.cos(mech.angle),
                    mech.pos.y + 40 * Math.sin(mech.angle),
                    31,
                    2,
                    b.fireAttributes(dir)
                );
                b.fireProps(25, 45, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].dmg = 0.8;
            }
        },
        {
            name: "missiles",
            ammo: 0,
            ammoPack: 5,
            have: false,
            fire: function() {
                let dir = mech.angle - 0.1;
                for (let i = 0; i < 5; i++) {
                    dir += 0.05 + (Math.random() - 0.5) * 0.04;
                    const me = bullet.length;
                    bullet[me] = Bodies.rectangle(
                        mech.pos.x + 50 * Math.cos(mech.angle),
                        mech.pos.y + 50 * Math.sin(mech.angle),
                        15,
                        3,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(30, 34 + (Math.random() - 0.5) * 8, dir, me); //cd , speed
                    //Matter.Body.setDensity(bullet[me], 0.00001);
                    bullet[me].endCycle = game.cycle + 24 + Math.floor(Math.random() * 12);
                    // bullet[me].restitution = 0.2;
                    bullet[me].explodeRad = 120 + (Math.random() - 0.5) * 40;
                    bullet[me].explodeDmg = 0.8;
                    bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
                    bullet[me].onDmg = function() {
                        this.endCycle = 0; //bullet ends cycle after doing damage  //this triggers explosion
                    };
                }
            }
        },
        {
            name: "grenade",
            ammo: 0,
            ammoPack: 3,
            have: false,
            fire: function() {
                const me = bullet.length;
                const dir = mech.angle;
                bullet[me] = Bodies.circle(
                    mech.pos.x + 30 * Math.cos(mech.angle),
                    mech.pos.y + 30 * Math.sin(mech.angle),
                    17,
                    b.fireAttributes(dir)
                );
                b.fireProps(50, 25, dir, me); //cd , speed
                Matter.Body.setDensity(bullet[me], 0.000001);
                bullet[me].endCycle = game.cycle + 100;
                bullet[me].restitution = 0.5;
                bullet[me].frictionAir = 0.01;
                bullet[me].explodeRad = 350;
                bullet[me].explodeDmg = 3.5;
                bullet[me].onEnd = b.explode; //makes bullet do explosive damage before despawn
                bullet[me].minDmgSpeed = 1;
                bullet[me].onDmg = function() {
                    this.endCycle = 0; //bullet ends cycle after doing damage  //this triggers explosion
                };
            }
        },
        {
            name: "barrage",
            ammo: 0,
            ammoPack: 6,
            have: false,
            fire: function() {
                let dir = mech.angle - 0.05;
                for (let i = 0; i < 3; i++) {
                    dir += 0.05;
                    const me = bullet.length;
                    bullet[me] = Bodies.circle(
                        mech.pos.x + 30 * Math.cos(mech.angle),
                        mech.pos.y + 30 * Math.sin(mech.angle),
                        5,
                        b.fireAttributes(dir)
                    );
                    b.fireProps(25, 35, dir, me); //cd , speed
                    bullet[me].endCycle = game.cycle + 160;
                    bullet[me].restitution = 0.9;
                    bullet[me].friction = 0;
                }
            }
        },
        {
            name: "one shot",
            ammo: 0,
            ammoPack: 2,
            have: false,
            fire: function() {
                const me = bullet.length;
                const dir = mech.angle;
                bullet[me] = Bodies.rectangle(
                    mech.pos.x + 50 * Math.cos(mech.angle),
                    mech.pos.y + 50 * Math.sin(mech.angle),
                    45,
                    15,
                    b.fireAttributes(dir)
                );
                b.fireProps(60, 52, dir, me); //cd , speed
                bullet[me].endCycle = game.cycle + 180;
            }
        }
    ],
    fire: function() {
        if (game.mouseDown && mech.fireCDcycle < game.cycle && b.guns[this.activeGun].ammo > 0) {
            playSound("snare2");
            b.guns[this.activeGun].fire();
            b.guns[this.activeGun].ammo--;
            //if out of ammo go back to default gun
            if (b.guns[this.activeGun].ammo < 1) {
                this.activeGun = 0;
            }
            this.updateHUD();
        }
    },
    // updateAmmoHUD: function() {
    // 	document.getElementById("ammo").textContent = b.guns[b.activeGun].ammo;
    // },
    updateHUD: function() {
        document.getElementById("gun").textContent = b.guns[b.activeGun].name + " - " + b.guns[b.activeGun].ammo;
    },
    draw: function() {
        ctx.beginPath();
        let i = bullet.length;
        while (i--) {
            //draw
            let vertices = bullet[i].vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j += 1) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            //remove bullet if at endcycle for that bullet
            if (bullet[i].endCycle < game.cycle) {
                bullet[i].onEnd(i); //some bullets do stuff on end
                if (bullet[i]) {
					Matter.World.remove(engine.world, bullet[i]);
                	bullet.splice(i, 1);
				} else {
					break //if bullet[i] doesn't exist don't complete the for loop, because the game probably reset
				}
            }
        }
        ctx.fillStyle = "#000";
        ctx.fill();
    }
};
