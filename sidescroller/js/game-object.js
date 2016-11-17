// game Object Prototype *********************************************
//*********************************************************************
const gameProto = function() {
  this.testing = false; //testing mode: shows wireframe and some variables
  //time related vars and methods
  this.cycle = 0; //total cycles, 60 per second
  this.cyclePaused = 0;
  this.fallHeight = 4000;
  this.lastTimeStamp = 0; //tracks time stamps for measuing delta
  this.delta = 0; //measures how slow the engine is running compared to 60fps
  this.buttonCD = 0
  this.gravityDir = 0;
  this.gravityFlip = function() {
    if (keys[82] && this.buttonCD < this.cycle) {
      this.buttonCD = this.cycle + 30;

      //engine.world.gravity.scale = -engine.world.gravity.scale
      if (this.gravityDir) {
        this.gravityDir = 0;
      } else {
        this.gravityDir = 1;
      }

      Matter.Body.setPosition(player, {
        x: player.position.x,
        y: -player.position.y
      })
      Matter.Body.setVelocity(player, {
        x: player.velocity.x,
        y: -player.velocity.y
      })
      mech.testingMoveLook();
      mech.Sy = mech.y
      for (let i = 0; i < bullet.length; i++) {
        Matter.Body.setPosition(bullet[i], {
          x: bullet[i].position.x,
          y: -bullet[i].position.y
        })
        Matter.Body.setVelocity(bullet[i], {
          x: bullet[i].velocity.x,
          y: -bullet[i].velocity.y
        })
      }
      for (let i = 0; i < body.length; i++) {
        Matter.Body.setPosition(body[i], {
          x: body[i].position.x,
          y: -body[i].position.y
        })
        Matter.Body.setVelocity(body[i], {
          x: body[i].velocity.x,
          y: -body[i].velocity.y
        })
      }
      for (let i = 0; i < map.length; i++) {
        Matter.Body.setPosition(map[i], {
            x: map[i].position.x,
            y: -map[i].position.y
          })
          //Matter.Body.rotate(map[i], Math.PI)
      }
      for (let i = 0; i < cons.length; i++) {
        cons[i].pointA = {
          x: cons[i].pointA.x,
          y: -cons[i].pointA.y
        }
      }

      //ctx.rotate(this.gravityDir);

      //engine.world.gravity.scale = -engine.world.gravity.scale
      //this.gravityDir = (this.gravityDir + Math.PI)%(Math.PI*2);
      //Matter.Body.setAngle(player, this.gravityDir)

      //Matter.Body.rotate(player, Math.PI);
    }
  };
  this.timing = function() {
    this.cycle++; //tracks game cycles
    //delta is used to adjust forces on game slow down;
    this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
    this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
  }
  this.zoom = 1 / 300;
  this.scaleZoom = function() {
    if (this.zoom != 1) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
  }
  this.keyZoom = function() {
    if (keys[187]) { //plus
      this.zoom *= 1.02;
    } else if (keys[189]) { //minus
      this.zoom *= 0.95;
    } else if (keys[48]) {
      this.zoom = 1;
    }
  }
  this.zoomGoal = 1;
  this.speedZoom = function() {
    this.zoomGoal = (canvas.height/1000)/(1+player.speed*player.speed*0.005); //calculates zoom goal
    this.zoom = 0.005 * this.zoomGoal  + 0.995 * this.zoom; //smooths changes to zoom
  }
  this.wipe = function() {
    if (this.isPaused) {
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  this.isPaused = false;
  this.pause = function() {
    if (keys[70] && mech.buttonCD < this.cycle) {
      mech.buttonCD = this.cycle + 20;
      if (!this.isPaused) {
        this.cyclePaused = this.cycle;
        this.isPaused = true;
        for (let i = 0; i < body.length; i++) {
          body[i].pausedVelocity = body[i].velocity; //sleep wipes velocity, so we need to keep track
          body[i].pausedVelocityA = body[i].angularVelocity; //sleep wipes velocity, so we need to keep track
          Matter.Sleeping.set(body[i], true);
        }
        for (let i = 0; i < bullet.length; i++) {
          bullet[i].pausedVelocity = bullet[i].velocity; //sleep wipes velocity, so we need to keep track
          bullet[i].pausedVelocityA = bullet[i].angularVelocity; //sleep wipes velocity, so we need to keep track
          Matter.Sleeping.set(bullet[i], true);
        }
      } else {
        this.isPaused = false;
        for (let i = 0; i < body.length; i++) {
          Matter.Sleeping.set(body[i], false);
          Matter.Body.setVelocity(body[i], body[i].pausedVelocity); //return old velocity before pause
          Matter.Body.setAngularVelocity(body[i], body[i].angularVelocity)
        }
        for (let i = 0; i < bullet.length; i++) {
          bullet[i].birthCycle += this.cycle - this.cyclePaused; //extends the lifespan of a bullet
          Matter.Sleeping.set(bullet[i], false);
          if (bullet[i].pausedVelocity) {
            Matter.Body.setVelocity(bullet[i], bullet[i].pausedVelocity); //return old velocity before pause
            Matter.Body.setAngularVelocity(bullet[i], bullet[i].angularVelocity)
          }

        }
      }
    }
  }
  this.output = function() {
    let line = 80;
    ctx.fillStyle = "#000";
    ctx.fillText("Press T to exit testing mode", 5, line);
    line += 30;
    ctx.fillText("cycle: " + game.cycle, 5, line);
    line += 20;
    ctx.fillText("delta: " + game.delta.toFixed(6), 5, line);
    line += 20;
    ctx.fillText("mX: " + (mech.mouse.x - mech.transX*game.zoom).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("mY: " + (mech.mouse.y - mech.transY*game.zoom).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("x: " + mech.x.toFixed(0), 5, line);
    line += 20;
    ctx.fillText("y: " + mech.y.toFixed(0), 5, line);
    line += 20;
    ctx.fillText("Vx: " + mech.Vx.toFixed(2), 5, line);
    line += 20;
    ctx.fillText("Vy: " + mech.Vy.toFixed(2), 5, line);
    line += 20;
    ctx.fillText("Fx: " + player.force.x.toFixed(3), 5, line);
    line += 20;
    ctx.fillText("Fy: " + player.force.y.toFixed(3), 5, line);
    line += 20;
    ctx.fillText("yOff: " + mech.yOff.toFixed(1), 5, line);
    line += 20;
    ctx.fillText("mass: " + player.mass.toFixed(1), 5, line);
    line += 20;
    ctx.fillText("onGround: " + mech.onGround, 5, line);
    line += 20;
    ctx.fillText("crouch: " + mech.crouch, 5, line);
    line += 20;
    ctx.fillText("isHeadClear: " + mech.isHeadClear, 5, line);
    line += 20;
    ctx.fillText("HeadIsSensor: " + headSensor.isSensor, 5, line);
    line += 20;
    ctx.fillText("frictionAir: " + player.frictionAir.toFixed(3), 5, line);
    line += 20;
    ctx.fillText("stepSize: " + mech.stepSize.toFixed(2), 5, line);
    line += 20;
    ctx.fillText("zoom: " + game.zoom.toFixed(4), 5, line);
    line += 20;
    ctx.fillText("on " + mech.onBody.type + " id: " + mech.onBody.id + ", index: " + mech.onBody.index, 5, line);
    line += 20;
    ctx.fillText('action: ' + mech.onBody.action, 5, line);

  }
}



//makes the game object based on gameprototype
const game = new gameProto();
