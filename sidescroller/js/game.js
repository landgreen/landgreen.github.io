// game Object ********************************************************
//*********************************************************************
const game = {
    mouse: {
        x: 0,
        y: 0
    },
    mouseInGame: {
        x: 0,
        y: 0
    },
	level: 0,
    g: 0.001,
    dmgScale: 1,
    mobDamage: 0.02,
    mobBulletDamage: 0.1,
    testing: false, //testing mode: shows wireframe and some variables
    cycle: 0, //total cycles, 60 per second
    cyclePaused: 0,
    fallHeight: 4000,
    lastTimeStamp: 0, //tracks time stamps for measuing delta
    delta: 0, //measures how slow the engine is running compared to 60fps
    buttonCD: 0,
    drawList: [], //so you can draw a first frame of explosions.. I know this is bad
    drawList2: [], //so you can draw a second frame of explosions.. I know this is bad
    drawCircle: function() { //draws a circle for two cycles, used for showing damage mostly
        let len = this.drawList.length
        for (let i = 0; i < len; i++) {
            //draw circle
            ctx.fillStyle = this.drawList[i].color;
            ctx.beginPath();
            ctx.arc(this.drawList[i].x, this.drawList[i].y, this.drawList[i].radius, 0, 2 * Math.PI);
            ctx.fill();
        }
        len = this.drawList2.length
        for (let i = 0; i < len; i++) { //so you can draw a second frame of explosions.. I know this is bad
            //draw circle
            ctx.fillStyle = this.drawList2[i].color;
            ctx.beginPath();
            ctx.arc(this.drawList2[i].x, this.drawList2[i].y, this.drawList2[i].radius, 0, 2 * Math.PI);
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
    track: true,
    setTracking: function() { //use in window resize in index.js
        this.track = true;
        this.zoom = canvas.height / 2000; //sets starting zoom scale
    },
    keyPress: function() { //runs on key press event
		if (keys[57]){
			powerUps.spawnRandomPowerUp(game.mouseInGame.x,game.mouseInGame.y,0,0);
		}

        if (keys[90]) { // 69 = e  90 = z
            if (this.track) {
                this.track = false;
                this.zoom = canvas.height / 3000; //sets starting zoom scale
            } else {
                this.setTracking();
            }
        } else if (keys[84]) { // 84 = t
            if (this.testing) {
                this.testing = false;
            } else {
                this.testing = true;
            }
        } else if (keys[48]) { // 48 = 0
            this.zoom = 1;
        } else if (keys[187]) { // 187 = +
            this.zoom *= 1.1;
        } else if (keys[189]) { // 189 = -
            this.zoom *= 0.9;
        }
    },
    zoom: 1,
    camera: function() {
        ctx.translate(canvas.width2, canvas.height2); //center
        ctx.scale(this.zoom, this.zoom); //zoom in once centered
        ctx.translate(-canvas.width2 + mech.transX, -canvas.height2 + mech.transY); //uncenter, translate
        //calculate in game mouse position by undoing the zoom and translations
        this.mouseInGame.x = (this.mouse.x - canvas.width2) / this.zoom + canvas.width2 - mech.transX;
        this.mouseInGame.y = (this.mouse.y - canvas.height2) / this.zoom + canvas.height2 - mech.transY;
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
	testingOutput: function() {
		ctx.textAlign = 'left';
		ctx.fillStyle = "#000";
        let line = 20;
        ctx.fillText("Press T to exit testing mode", 5, line);
        line += 30;
        ctx.fillText("cycle: " + game.cycle, 5, line);
        line += 20;
        ctx.fillText("delta: " + game.delta.toFixed(6), 5, line);
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
        ctx.fillText("zoom: " + this.zoom.toFixed(4), 5, line);
        line += 20;
        ctx.fillText("on " + mech.onBody.type + " id: " + mech.onBody.id + ", index: " + mech.onBody.index, 5, line);
        line += 20;
        ctx.fillText('action: ' + mech.onBody.action, 5, line);
		ctx.textAlign = 'center';
		ctx.fillText(`(${this.mouseInGame.x.toFixed(1)}, ${this.mouseInGame.y.toFixed(1)})`, this.mouse.x, this.mouse.y-20);

    },
    output: function() {
        let line = 80;
        ctx.fillStyle = "#000";
        ctx.fillText(`fireCD: ${bullets.fireCD}`, 5, line);
        line += 20;
		ctx.fillText(`restitution: ${bullets.restitution.toFixed(2)}`, 5, line);
		line += 20;
		ctx.fillText(`speed: ${bullets.speed.toFixed(2)}`, 5, line);
		line += 20;
		ctx.fillText(`frictionAir: ${bullets.frictionAir.toFixed(4)}`, 5, line);
		line += 20;
		ctx.fillText(`size: ${bullets.size.toFixed(4)}`, 5, line);
		line += 20;
		ctx.fillText(`dmg: ${bullets.dmg.toFixed(2)}`, 5, line);
		line += 20;
		ctx.fillText(`gravity: ${bullets.gravity.toFixed(2)}`, 5, line);
		line += 20;
		ctx.fillText(`endCycle: ${bullets.endCycle.toFixed(2)}`, 5, line);
		line += 20;
    },
    draw: {
        powerUp: function() {
			ctx.lineWidth = 5
            for (let i = 0, len = powerUp.length; i < len; ++i) {
                let vertices = powerUp[i].vertices;
				ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
				ctx.globalAlpha = powerUp[i].alpha;
				// ctx.fillStyle = powerUp[i].color;
				// ctx.fill();
				ctx.strokeStyle = powerUp[i].color;
				ctx.stroke();
            }
			ctx.globalAlpha = 1;
        },
        map: function() {
            ctx.beginPath();
            for (let i = 0, len = map.length; i < len; ++i) {
                let vertices = map[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.fillStyle = '#444';
            ctx.fill();
        },
        body: function() {
            ctx.beginPath();
            for (let i = 0, len = body.length; i < len; ++i) {
                let vertices = body[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.lineWidth = 1.5;
            ctx.fillStyle = '#777';
            ctx.fill();
            ctx.strokeStyle = '#222';
            ctx.stroke();
        },
        cons: function() {
            ctx.beginPath();
			for (let i = 0, len = cons.length; i < len; ++i) {
                ctx.moveTo(cons[i].pointA.x, cons[i].pointA.y);
                ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
            }
			for (let i = 0, len = consBB.length; i < len; ++i) {
                ctx.moveTo(consBB[i].bodyA.position.x, consBB[i].bodyA.position.y);
                ctx.lineTo(consBB[i].bodyB.position.x, consBB[i].bodyB.position.y);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#999';
            ctx.stroke();
        },
        wireFrame: function() {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#999";
            const bodies = Composite.allBodies(engine.world);
            ctx.beginPath();
            for (let i = 0; i < bodies.length; ++i) {
                //ctx.fillText(bodies[i].id,bodies[i].position.x,bodies[i].position.y);  //shows the id of every body
                let vertices = bodies[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#000';
            ctx.stroke();
        },
        testing: function() {
            //jump
            ctx.beginPath();
            let bodyDraw = jumpSensor.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            //main body
            ctx.beginPath();
            bodyDraw = playerBody.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fill();
            ctx.stroke();
            //head
            ctx.beginPath();
            bodyDraw = playerHead.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fill();
            ctx.stroke();
            //head sensor
            ctx.beginPath();
            bodyDraw = headSensor.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
            ctx.fill();
            ctx.stroke();
        },
    },
}
