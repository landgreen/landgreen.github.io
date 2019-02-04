let powerUp = [];

const powerUps = {
  heal: {
    name: "heal",
    color: "#0f9",
    size: function () {
      return 40 * Math.sqrt(0.1 + Math.random() * 0.5);
    },
    effect: function () {
      let heal = this.size / 40;
      mech.addHealth(heal * heal);
      //game.makeTextLog('heal for '+(heal*100).toFixed(0)+'%',80)
    }
  },
  field: {
    name: "field",
    color: "#f9f",
    size: function () {
      return 40;
    },
    effect: function () {
      let mode = player.fieldMode
      while (mode === player.fieldMode) {
        mode = Math.ceil(Math.random() * (mech.fieldUpgrades.length - 1))
      }
      mech.fieldUpgrades[mode]();
      // mech.fieldUpgrades[2]();
    }
  },
  ammo: {
    name: "ammo",
    color: "#467",
    size: function () {
      return 17;
    },
    effect: function () {
      //only get ammo for guns player has
      let target;
      if (b.inventory.length > 1) {
        //add ammo to a gun in inventory
        target = b.guns[b.inventory[Math.floor(Math.random() * (b.inventory.length))]];
      } else {
        //if you don't have a gun just add ammo to a random gun
        target = b.guns[Math.floor(Math.random() * b.guns.length)];
      }
      //ammo given scales as mobs take more hits to kill
      const ammo = Math.ceil((target.ammoPack * (0.60 + 0.5 * Math.random())) / b.dmgScale);
      target.ammo += ammo;
      game.updateGunHUD();
      game.makeTextLog("+" + ammo + " ammo: " + target.name, 180);
    }
  },
  gun: {
    name: "gun",
    color: "#0cf",
    size: function () {
      return 30;
    },
    effect: function () {
      //find what guns I don't have
      let options = [];
      for (let i = 0; i < b.guns.length; ++i) {
        if (!b.guns[i].have) options.push(i);
      }
      //give player a gun they don't already have if possible
      if (options.length > 0) {
        let newGun = options[Math.floor(Math.random() * options.length)];
        // newGun = 4; //makes every gun you pick up this type  //enable for testing one gun
        if (b.activeGun === null) {
          b.activeGun = newGun //if no active gun switch to new gun
          game.makeTextLog(
            "<br><br><div class='wrapper'> <div class = 'grid-box'><strong>left mouse</strong>: fire weapon</div> <div class = 'grid-box'> <span class = 'mouse'>️<span class='mouse-line'></span></span> </div></div>",
            Infinity
          );
        } else {
          game.makeTextLog(
            "<div style='font-size:120%;' >new gun: " + b.guns[newGun].name + "</div><span class = 'box'>E</span> / <span class = 'box'>Q</span>",
            360
          );
        }
        b.guns[newGun].have = true;
        b.inventory.push(newGun);
        b.guns[newGun].ammo += b.guns[newGun].ammoPack * 2;
        game.makeGunHUD();
      } else {
        //if you have all guns then get ammo
        const ammoTarget = Math.floor(Math.random() * (b.guns.length));
        const ammo = Math.ceil(b.guns[ammoTarget].ammoPack * 2);
        b.guns[ammoTarget].ammo += ammo;
        game.updateGunHUD();
        game.makeTextLog("+" + ammo + " ammo: " + b.guns[ammoTarget].name, 180);
      }
    }
  },
  //power ups also come from spawn.debris
  spawnRandomPowerUp: function (x, y) {
    //a chance to drop a power up
    //mostly used after mob dies
    //spawn heal chance is higher at low health
    if (Math.random() * Math.random() - 0.25 > Math.sqrt(mech.health) || Math.random() < 0.03) {
      powerUps.spawn(x, y, "heal");
      return;
    }

    if (Math.random() < 0.16) {
      if (b.inventory.length > 1) powerUps.spawn(x, y, "ammo");
      return;
    }

    //a new gun has a low chance for each not acquired gun to drop
    if (Math.random() < 0.006 * (b.guns.length - b.inventory.length)) {
      powerUps.spawn(x, y, "gun");
      return;
    }
    if (Math.random() < 0.01) {
      powerUps.spawn(x, y, "field");
      return;
    }
  },
  chooseRandomPowerUp: function (x, y) {
    //100% chance to drop a random power up
    //this is mostly used for making power up drops in debris
    if (Math.random() < 0.5) {
      powerUps.spawn(x, y, "heal", false);
    } else {
      powerUps.spawn(x, y, "ammo", false);
    }
    // if (Math.random() < 0.33) {
    //   powerUps.spawn(x, y, "heal", false);
    // } else if (Math.random() < 0.5) {
    //   powerUps.spawn(x, y, "ammo", false);
    // }else {
    //   powerUps.spawn(x, y, "shield", false);
    // }
  },
  spawnStartingPowerUps: function (x, y) {
    if (b.inventory.length < 3) {
      powerUps.spawn(x, y, "gun", false); //starting gun
    } else if (mech.fieldMode === 0) {
      powerUps.spawn(x, y, "field");
    } else {
      powerUps.spawnRandomPowerUp(x, y);
      powerUps.spawnRandomPowerUp(x, y);
      powerUps.spawnRandomPowerUp(x, y);
    }
  },
  spawn: function (x, y, target, moving = true) {
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
        x: (Math.random() - 0.5) * 15,
        y: Math.random() * -9 - 3
      });
    }
    World.add(engine.world, powerUp[i]); //add to world
  },
  attractionLoop: function () {
    for (let i = 0, len = powerUp.length; i < len; ++i) {
      const dxP = player.position.x - powerUp[i].position.x;
      const dyP = player.position.y - powerUp[i].position.y;
      const dist2 = dxP * dxP + dyP * dyP;
      //gravitation for pickup
      if (dist2 < 100000 && (powerUp[i].name != "heal" || mech.health < 1)) {
        if (dist2 < 2000) {
          //knock back from grabbing power up
          Matter.Body.setVelocity(player, {
            x: player.velocity.x + ((powerUp[i].velocity.x * powerUp[i].mass) / player.mass) * 0.25,
            y: player.velocity.y + ((powerUp[i].velocity.y * powerUp[i].mass) / player.mass) * 0.25
          });
          mech.usePowerUp(i);
          break;
        }
        //power up needs to be able to see player to gravitate
        if (Matter.Query.ray(map, powerUp[i].position, player.position).length === 0) { // && Matter.Query.ray(body, powerUp[i].position, player.position).length === 0
          //extra friction
          Matter.Body.setVelocity(powerUp[i], {
            x: powerUp[i].velocity.x * 0.97,
            y: powerUp[i].velocity.y * 0.97
          });
          //float towards player
          powerUp[i].force.x += (dxP / dist2) * powerUp[i].mass * 1.6;
          powerUp[i].force.y += (dyP / dist2) * powerUp[i].mass * 1.6 - powerUp[i].mass * game.g; //negate gravity
          //draw the pulling effect
          ctx.globalAlpha = 0.2;
          mech.drawHold(powerUp[i], false);
          ctx.globalAlpha = 1;
        }
      }
    }
  }
};