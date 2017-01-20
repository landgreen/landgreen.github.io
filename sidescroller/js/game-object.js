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
    onLevel: null, //is set later to localStorage.getItem('onLevel'),
    nextLevel: function() {
        localStorage.setItem('skipSplash', '1');
        if (this.onLevel === 'buildings') {
            localStorage.setItem('onLevel', 'skyscrapers');
        } else {
            localStorage.setItem('onLevel', 'buildings');
        }
    },
    levels: { //lets the game know what sound and graphics to use on each level load
        buildings: {
            name: 'buildings',
            background: "background_buildings",
            foreground: "foreground_buildings",
            ambient: "ambient_crickets",
        },
        skyscrapers: {
            name: 'skyscrapers',
            background: "background_skyscrapers",
            foreground: "foreground_skyscrapers",
            ambient: "ambient_wind",
        },
        testing: {
            name: 'testing',
            background: "background_testing",
            foreground: "foreground_testing",
            ambient: null,
        },
    },
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
    volume: function() { //wind backgorund sound on loop gets louder when the player is higher
        if (!(game.cycle % 3)) { //make for skyscrapers map
            if (player.position.y > -500) { //100 is min
                document.getElementById("wind").volume = 0.2; // volume between 0 and 1
            } else if (player.position.y < -2500) { //2500 is max volume
                document.getElementById("wind").volume = 1; // volume between 0 and 1
            } else {
                document.getElementById("wind").volume = -player.position.y * 0.0004; // volume between 0 and 1
            }
        }
    },
    timing: function() {
        this.cycle++; //tracks game cycles
        //delta is used to adjust forces on game slow down;
        this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
        this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
    },
    track: true,
    keyToggle: function() {  //runs on key press event
		if (keys[69]) { // 69 = e
			if (this.track) {
				this.track = false;
				this.showHeight = 3000;
				this.zoom = canvas.height / this.showHeight; //sets starting zoom scale
			} else {
				this.track = true;
				this.showHeight = 1500;
				this.zoom = canvas.height / this.showHeight; //sets starting zoom scale
			}
		};
		if (keys[84]) { // 84 = t
			if (this.testing) {
				this.testing = false;
			} else {
				this.testing = true;
			}
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
    showHeight: 2000, //controls the resting zoomheight set to higher to see more of the map   //1000 seems normal
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
        ctx.fillText("mX: " + (this.mouseInGame.x).toFixed(2), 5, line);
        line += 20;
        ctx.fillText("mY: " + (this.mouseInGame.y).toFixed(2), 5, line);
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
    draw: {
        map: function() {
            ctx.beginPath();
            for (let i = 0; i < map.length; i += 1) {
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
            for (let i = 0; i < body.length; i += 1) {
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
            for (let i = 0; i < cons.length; i += 1) {
                ctx.moveTo(cons[i].pointA.x, cons[i].pointA.y);
                ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
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
            for (let i = 0; i < bodies.length; i += 1) {
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
            for (let j = 1; j < bodyDraw.length; j += 1) {
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
            for (let j = 1; j < bodyDraw.length; j += 1) {
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
            for (let j = 1; j < bodyDraw.length; j += 1) {
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
            for (let j = 1; j < bodyDraw.length; j += 1) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
            ctx.fill();
            ctx.stroke();
        },
    },
}
