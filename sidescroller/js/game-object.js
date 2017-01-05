// game Object Prototype *********************************************
//*********************************************************************
const game = {
	g: 0.001,
	dmgScale: 0.01,
    testing: false, //testing mode: shows wireframe and some variables
    //time related vars and methods
    cycle: 0, //total cycles, 60 per second
    cyclePaused: 0,
    fallHeight: 4000,
    lastTimeStamp: 0, //tracks time stamps for measuing delta
    delta: 0, //measures how slow the engine is running compared to 60fps
    buttonCD: 0,
	drawList: [], //so you can draw a first frame of explosions.. I know this is bad
	drawList2: [], //so you can draw a second frame of explosions.. I know this is bad
	drawCircle: function() {
		let len = this.drawList.length
		for (let i = 0; i < len; i++){
			//draw circle
			ctx.fillStyle = this.drawList[i].color;
			ctx.beginPath();
			ctx.arc(this.drawList[i].x,this.drawList[i].y,this.drawList[i].radius,0,2*Math.PI);
			ctx.fill();
		}
		len = this.drawList2.length
		for (let i = 0; i < len; i++){ //so you can draw a second frame of explosions.. I know this is bad
			//draw circle
			ctx.fillStyle = this.drawList2[i].color;
			ctx.beginPath();
			ctx.arc(this.drawList2[i].x,this.drawList2[i].y,this.drawList2[i].radius,0,2*Math.PI);
			ctx.fill();
		}
		this.drawList2 = this.drawList;
		this.drawList = [];
	},
    timing: function() {
        this.cycle++; //tracks game cycles
        //delta is used to adjust forces on game slow down;
        this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
        this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
    },
    zoom: 0.000001,//1,
    scaleZoom: function() {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.translate(mech.transX, mech.transY);
    },
    keyZoom: function() {
        if (keys[187]) { //plus
            this.showHeight *= 0.98;
            this.setZoomGoal();
            this.zoom = 0.1 * this.zoomGoal + 0.9 * this.zoom; //smooths changes to zoom
            //this.zoom = this.zoomGoal
        } else if (keys[189]) { //minus
            this.showHeight *= 1.02;
            this.setZoomGoal();
            this.zoom = 0.1 * this.zoomGoal + 0.9 * this.zoom; //smooths changes to zoom
            //this.zoom = this.zoomGoal
        } else if (keys[48]) { //zero   reset
			this.zoomReset();
        }
    },
	zoomReset: function(){
		this.showHeight = canvas.height;
		this.setZoomGoal();
		this.zoom = this.zoomGoal
	},
    zoomGoal: 1,
    showHeight: 1500, //controls the resting zoomheight set to higher to see more of the map   //1000 seems normal
    setZoomGoal: function() {
        this.zoomGoal = (canvas.height / this.showHeight) / (1 + player.speed * player.speed * 0.005); //calculates zoom goal
    },
    speedZoom: function() {
        //const showHeight = 1500;
        this.setZoomGoal();
        this.zoom = 0.005 * this.zoomGoal + 0.995 * this.zoom; //smooths changes to zoom
    },
    wipe: function() {
        // if (this.isPaused) {
        //   ctx.fillStyle = "rgba(221,221,221,0.1)";
        //   ctx.fillRect(0, 0, canvas.width, canvas.height);
        // } else {
        //   ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }
        // if (mech.health < 1) {
        //     ctx.fillStyle = "rgba(255,255,255," + (0.05 + mech.health * mech.health) + ")";
        // 	ctx.fillRect(0, 0, canvas.width, canvas.height);
        // } else {
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }
		ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    isPaused: false,
    pause: function() {
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
    },
    output: function() {
        let line = 80;
        ctx.fillStyle = "#000";
        ctx.fillText("Press T to exit testing mode", 5, line);
        line += 30;
        ctx.fillText("cycle: " + game.cycle, 5, line);
        line += 20;
        ctx.fillText("delta: " + game.delta.toFixed(6), 5, line);
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
    },
}
