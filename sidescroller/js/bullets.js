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
            onDmg: function() {} //this.endCycle = 0  //triggers despawn
        };
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
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].frictionAir = 0.01;
                b.fireProps(20, 36, dir, me); //cd , speed
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
                bullet[me].endCycle = game.cycle + 60;
                bullet[me].frictionAir = 0.01;
                b.fireProps(5, 38, dir, me); //cd , speed
            }
        },
        {
            name: "spray",
            ammo: 0,
            ammoPack: 6,
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
                    bullet[me].endCycle = game.cycle + 60;
                    bullet[me].frictionAir = 0.02;
                    b.fireProps(35, 36 + Math.random() * 11, dir, me); //cd , speed
                }
            }
        },
        {
            name: "needles",
            ammo: 0,
            ammoPack: 9,
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
                bullet[me].endCycle = game.cycle + 180;
                bullet[me].dmg = 0.8;
                b.fireProps(25, 45, dir, me); //cd , speed
            }
        },
        {
            name: "barrage",
            ammo: 0,
            ammoPack: 5,
            have: false,
            fire: function() {
                let dir = mech.angle - 0.05;
                for (let i = 0; i < 3; i++) {
                    dir += 0.05;
                    const me = bullet.length;
                    bullet[me] = Bodies.circle(
                        mech.pos.x + 30 * Math.cos(mech.angle),
                        mech.pos.y + 30 * Math.sin(mech.angle),
                        6,
                        b.fireAttributes(dir)
                    );
                    bullet[me].endCycle = game.cycle + 160;
                    bullet[me].restitution = 0.9;
                    bullet[me].friction = 0;
                    b.fireProps(25, 35, dir, me); //cd , speed
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
                bullet[me].endCycle = game.cycle + 180;
				//bullet[me].dmg = 1;
                b.fireProps(60, 52, dir, me); //cd , speed
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
                this.updateHUD();
            }
            this.updateHUD();
        }
    },
    // updateAmmoHUD: function() {
	// 	document.getElementById("ammo").textContent = b.guns[b.activeGun].ammo;
    // },
    updateHUD: function() {
        document.getElementById("gun").textContent = b.guns[b.activeGun].name + ' - ' + b.guns[b.activeGun].ammo;
		// document.getElementById("ammo").textContent = b.guns[b.activeGun].ammo;
        // document.getElementById("ammo").textContent = (b.guns[b.activeGun].ammo === Infinity)
        //     ? "∞"
        //     : b.guns[b.activeGun].ammo;
		//
        // if (b.inventory.length > 1) {
        //     const location = b.findGunInInventory();
        //     let next = location + 1;
        //     if (next > b.inventory.length - 1) next = 0;
        //     let previous = location - 1;
        //     if (previous < 0) previous = b.inventory.length - 1;
        //     //∞
        //     document.getElementById("previous-gun").textContent = b.guns[b.inventory[previous]].name;
        //     document.getElementById("previous-ammo").textContent = (b.guns[b.inventory[previous]].ammo === Infinity)
        //         ? "∞"
        //         : b.guns[b.inventory[previous]].ammo;
        //     //b.guns[b.inventory[previous]].ammo;
        //     document.getElementById("next-gun").textContent = b.guns[b.inventory[next]].name;
        //     document.getElementById("next-ammo").textContent = (b.guns[b.inventory[next]].ammo === Infinity)
        //         ? "∞"
        //         : b.guns[b.inventory[next]].ammo;
        // } else {
        //     document.getElementById("previous-gun").textContent = "";
        //     document.getElementById("previous-ammo").textContent = "";
        //     document.getElementById("next-gun").textContent = "";
        //     document.getElementById("next-ammo").textContent = "";
        // }
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
            if (bullet[i].endCycle < game.cycle) {
                Matter.World.remove(engine.world, bullet[i]);
                bullet.splice(i, 1);
            }
        }
        ctx.fillStyle = "#000";
        ctx.fill();
    }
};
