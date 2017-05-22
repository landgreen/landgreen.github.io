let powerUp = [];

const powerUps = {
    heal: {
        name: "heal",
        color: "#0f9",
        size: function() {
            return 40 * Math.sqrt(0.1 + Math.random() * 0.9);
        },
        effect: function() {
            let heal = this.size / 40;
            heal = heal * heal;
            mech.addHealth(heal);
            //game.makeTextLog('heal for '+(heal*100).toFixed(0)+'%',80)
            playSound("powerup");
        }
    },
    ammo: {
        name: "ammo",
        color: "#023",
        size: function() {
            return 17;
        },
        effect: function() {
            //only get ammo for guns player has
            if (b.inventory.length > 1) {
                const target = b.guns[b.inventory[Math.ceil(Math.random() * (b.inventory.length - 1))]];
                //ammo given scales as mobs take more hits to kill
                const ammo = Math.ceil(target.ammoPack * (0.5 + Math.random()) / b.dmgScale);
                target.ammo += ammo;
                game.updateGunHUD();
                game.makeTextLog("+" + ammo + " ammo: " + target.name, 180);
                playSound("ammo");
            }
        }
    },
    gun: {
        name: "gun",
        color: "#0ff",
        size: function() {
            return 38;
        },
        effect: function() {
            //find what guns I don't have
            let options = [];
            for (let i = 1; i < b.guns.length; ++i) {
                if (!b.guns[i].have) options.push(i);
            }
            if (options.length > 0) {
                //give player a gun they don't already have if possible
                b.activeGun = options[Math.floor(Math.random() * options.length)];
                //b.activeGun = 4;   //makes every gun you pick up this type  //enable for testing mostly
                b.guns[b.activeGun].have = true;
                b.inventory.push(b.activeGun);
                b.inventory.sort();
                b.guns[b.activeGun].ammo += b.guns[b.activeGun].ammoPack * 2;
                game.makeGunHUD();
                game.makeTextLog("<div style='font-size:150%;' >new gun: " + b.guns[b.activeGun].name + '</div>', 240);
                playSound("powerup");
            } else {
                b.guns[b.activeGun].ammo += b.guns[b.activeGun].ammoPack * 2;
                game.updateGunHUD();
                playSound("ammo");
            }
        }
    },
    spawnRandomPowerUp: function(x, y) {
        //a chance to drop a power up
        //spawn heal chance is higher at low health
        if (Math.random() * Math.random() + 0.14 > Math.sqrt(mech.health)) {
            powerUps.spawn(x, y, "heal");
            return;
        }
        //bonus ammo chance if using the default gun
        if (Math.random() < 0.25 || (b.activeGun === 0 && Math.random() < 0.2)) {
            if (b.inventory.length > 1) powerUps.spawn(x, y, "ammo");
            return;
        }
        //new gun has a chance for each unaquired gun to drop
        if (Math.random() < 0.011 * (b.guns.length - b.inventory.length)) {
            powerUps.spawn(x, y, "gun");
            return;
        }
    },
    chooseRandomPowerUp: function(x, y) {
        //100% chance to drop a random power up
        if (Math.random() < 0.4) {
            powerUps.spawn(x, y, "heal", false);
        } else if (Math.random() < 0.93) {
            powerUps.spawn(x, y, "ammo", false);
        } else {
            powerUps.spawn(x, y, "gun", false);
        }
    },
    spawn: function(x, y, target, moving = true) {
        let i = powerUp.length;
        target = powerUps[target];
        size = target.size();
        powerUp[i] = Matter.Bodies.polygon(x, y, 0, size, {
            density: 0.001,
            //friction: 0,
            frictionAir: 0.01,
            //frictionStatic: 0,
            restitution: 0.8,
            collisionFilter: {
                group: 0,
                category: 0x100000,
                mask: 0x100001
            },
            endCycle: game.cycle + 1080, //if change time also update color fade out
            color: target.color,
            sat: 1,
            effect: target.effect,
            name: target.name,
            size: size
        });
        if (moving) {
            Matter.Body.setVelocity(powerUp[i], {
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * -7 - 3
            });
        }
        World.add(engine.world, powerUp[i]); //add to world
    },
    loop: function() {
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            const dxP = player.position.x - powerUp[i].position.x;
            const dyP = player.position.y - powerUp[i].position.y;
            const dist2 = dxP * dxP + dyP * dyP;
            //gravitation for pickup
            if (dist2 < 200000) {
                // && mech.health < 1) { //powerUp[i].name === 'heal' &&
                if (dist2 < 2000) {
                    mech.usePowerUp(i);
                    break;
                }
                //power up needs to be able to see player to gravitated
                if (
                    Matter.Query.ray(map, powerUp[i].position, player.position).length === 0 &&
                    Matter.Query.ray(body, powerUp[i].position, player.position).length === 0
                ) {
                    Matter.Body.setVelocity(powerUp[i], {
                        //extra friction
                        x: powerUp[i].velocity.x * 0.94,
                        y: powerUp[i].velocity.y * 0.94
                    });
                    powerUp[i].force.x += dxP / dist2 * powerUp[i].mass * 0.7;
                    powerUp[i].force.y += dyP / dist2 * powerUp[i].mass * 0.7 - powerUp[i].mass * game.g; //negate gravity
                }
            }
        }
    }
};
