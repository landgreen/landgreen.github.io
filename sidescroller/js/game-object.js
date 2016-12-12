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
  this.timing = function() {
    this.cycle++; //tracks game cycles
    //delta is used to adjust forces on game slow down;
    this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
    this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
  }
  this.zoom = 1 / 300;
  this.scaleZoom = function() {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.translate(mech.transX, mech.transY);
  }
  this.keyZoom = function() {
    if (keys[187]) { //plus
      this.showHeight *= 0.99;
      this.setZoomGoal();
      this.zoom = this.zoomGoal
    } else if (keys[189]) { //minus
      this.showHeight *= 1.01;
      this.setZoomGoal();
      this.zoom = this.zoomGoal
    } else if (keys[48]) { //zero   reset
      this.showHeight = canvas.height;
      this.setZoomGoal();
      this.zoom = this.zoomGoal
    }
  }
  this.zoomGoal = 1;
  this.showHeight = 1000;  //controls the resting zoomheight set to higher to see more of the map
  this.setZoomGoal = function(){
      this.zoomGoal = (canvas.height/this.showHeight)/(1+player.speed*player.speed*0.005); //calculates zoom goal
  }
  this.speedZoom = function() {
    //const showHeight = 1500;
    this.setZoomGoal();
    this.zoom = 0.005 * this.zoomGoal  + 0.995 * this.zoom; //smooths changes to zoom
  }
  this.wipe = function() {
    // if (this.isPaused) {
    //   ctx.fillStyle = "rgba(221,221,221,0.1)";
    //   ctx.fillRect(0, 0, canvas.width, canvas.height);
    // } else {
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // }
    if (mech.health < 1) {
      ctx.fillStyle = "rgba(221,221,221,"+(0.05+mech.health*mech.health)+")";
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
    ctx.fillText("mXr: " + (mech.mouse.x + (mech.mouse.x-canvas.width/2)*game.zoom +mech.transX).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("mYr: " + (mech.mouse.y - mech.transY).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("mX: " + (mech.mouse.x - mech.canvasX + mech.pos.x).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("mY: " + (mech.mouse.y - mech.transY).toFixed(2), 5, line);
    line += 20;
    ctx.fillText("x: " + mech.pos.x.toFixed(0), 5, line);
    line += 20;
    ctx.fillText("y: " + mech.pos.y.toFixed(0), 5, line);
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
