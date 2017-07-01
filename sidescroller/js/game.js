// game Object ********************************************************
//*********************************************************************
const game = {
    mouse: {
        x: canvas.width / 2,
        y: canvas.height / 2
    },
    mouseInGame: {
        x: 0,
        y: 0
    },
    levelsCleared: 0,
    g: 0.001,
    dmgScale: 1,
    paused: false,
    testing: false, //testing mode: shows wireframe and some variables
    cycle: 0, //total cycles, 60 per second
    cyclePaused: 0,
    fallHeight: 4000, //below this y position the player dies
    lastTimeStamp: 0, //tracks time stamps for measuing delta
    delta: 0, //measures how slow the engine is running compared to 60fps
    buttonCD: 0,
    drawCursor: function() {
        const size = 10;
        ctx.beginPath();
        ctx.moveTo(game.mouse.x - size, game.mouse.y);
        ctx.lineTo(game.mouse.x + size, game.mouse.y);
        ctx.moveTo(game.mouse.x, game.mouse.y - size);
        ctx.lineTo(game.mouse.x, game.mouse.y + size);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000"; //'rgba(0,0,0,0.4)'
        ctx.stroke(); // Draw it
    },
    drawList: [], //so you can draw a first frame of explosions.. I know this is bad
    drawTime: 8, //how long circles are drawn.  use to push into drawlist.time
    mobDmgColor: "rgba(255,0,0,0.7)", //used top push into drawList.color
    playerDmgColor: "rgba(0,0,0,0.7)", //used top push into drawList.color
    drawCircle: function() {
        //draws a circle for two cycles, used for showing damage mostly
        let i = this.drawList.length;
        while (i--) {
            ctx.beginPath(); //draw circle
            ctx.arc(this.drawList[i].x, this.drawList[i].y, this.drawList[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.drawList[i].color;
            ctx.fill();
            if (this.drawList[i].time) {
                //remove when timer runs out
                this.drawList[i].time--;
            } else {
                this.drawList.splice(i, 1);
            }
        }
    },
    lastLogTime: 0,
    lastLogTimeBig: 0,
    boldActiveGunHUD: function() {
        for (let i = 0, len = b.inventory.length; i < len; ++i) {
            // document.getElementById(b.inventory[i]).style.color = '#ccc'
            document.getElementById(b.inventory[i]).style.opacity = "0.3";
        }
        // document.getElementById(b.activeGun).style.color = '#333'
        document.getElementById(b.activeGun).style.opacity = "1";
    },
    updateGunHUD: function() {
        for (let i = 0, len = b.inventory.length; i < len; ++i) {
            if (b.guns[b.inventory[i]].ammo === Infinity) {
                document.getElementById(b.inventory[i]).innerHTML = b.guns[b.inventory[i]].name;
            } else {
                document.getElementById(b.inventory[i]).innerHTML = b.guns[b.inventory[i]].name +
                    " - " +
                    b.guns[b.inventory[i]].ammo;
            }
        }
    },
    makeGunHUD: function() {
        //remove all nodes
        const myNode = document.getElementById("guns");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        //add nodes
        for (let i = 0, len = b.inventory.length; i < len; ++i) {
            const node = document.createElement("div");
            node.setAttribute("id", b.inventory[i]);
            let textnode;
            if (b.guns[b.inventory[i]].ammo === Infinity) {
                textnode = document.createTextNode(b.guns[b.inventory[i]].name);
            } else {
                textnode = document.createTextNode(b.guns[b.inventory[i]].name + " - " + b.guns[b.inventory[i]].ammo);
            }
            node.appendChild(textnode);
            document.getElementById("guns").appendChild(node);
        }
        game.boldActiveGunHUD();
    },
    makeTextLog: function(text, time = 180) {
        document.getElementById("text-log").innerHTML = text;
        document.getElementById("text-log").style.opacity = 1;
        game.lastLogTime = game.cycle + time;
    },
    textLog: function() {
        if (game.lastLogTime && game.lastLogTime < game.cycle) {
            game.lastLogTime = 0;
            // document.getElementById("text-log").innerHTML = " ";
            document.getElementById("text-log").style.opacity = 0;
        }
    },
    timing: function() {
        this.cycle++; //tracks game cycles
        //delta is used to adjust forces on game slow down;
        this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
        this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
    },
    keyPress: function() {
        //runs on key press event
        if (keys[189]) {
            // -
            game.zoomScale /= 0.9;
            game.setZoom();
        } else if (keys[187]) {
            // -
            game.zoomScale *= 0.9;
            game.setZoom();
        }
        if (keys[69]) {
            // e    swap to next active gun
            const next = function() {
                b.activeGun++;
                if (b.activeGun > b.guns.length - 1) b.activeGun = 0;
                if (b.guns[b.activeGun].have === false || b.guns[b.activeGun].ammo < 1) next();
            };
            next();
            game.updateGunHUD();
            game.boldActiveGunHUD();
            mech.drop();
            playSound("click");
        } else if (keys[81]) {
            //q    swap to previous active gun
            const previous = function() {
                b.activeGun--;
                if (b.activeGun < 0) b.activeGun = b.guns.length - 1;
                if (b.guns[b.activeGun].have === false || b.guns[b.activeGun].ammo < 1) previous();
            };
            previous();
            game.updateGunHUD();
            game.boldActiveGunHUD();
            mech.drop();
            playSound("click");
        }
        if (keys[84]) {
            // 84 = t
            if (this.testing) {
                this.testing = false;
            } else {
                this.testing = true;
            }
        } else if (this.testing) {
            if (keys[57]) {
                //9
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
            }
            if (keys[79]) {
                //o
                Matter.Body.setPosition(player, this.mouseInGame);
                Matter.Body.setVelocity(player, { x: 0, y: 0 });
            }
            if (keys[80]) {
                //p
                if (game.paused) {
                    game.paused = false;
                    engine.timing.timeScale = 1;
                    requestAnimationFrame(cycle);
                } else {
                    engine.timing.timeScale = 0.001;
                    game.paused = true;
                }
            }
        }
    },
    zoom: null,
    zoomScale: 1400,
    setZoom: function() {
        //use in window resize in index.js
        this.zoom = canvas.height / game.zoomScale; //sets starting zoom scale
    },
    camera: function() {
        ctx.translate(canvas.width2, canvas.height2); //center
        ctx.scale(this.zoom, this.zoom); //zoom in once centered
        ctx.translate(-canvas.width2 + mech.transX, -canvas.height2 + mech.transY); //uncenter, translate
        //calculate in game mouse position by undoing the zoom and translations
        this.mouseInGame.x = (this.mouse.x - canvas.width2) / this.zoom + canvas.width2 - mech.transX;
        this.mouseInGame.y = (this.mouse.y - canvas.height2) / this.zoom + canvas.height2 - mech.transY;
    },
    startZoomIn: function(time = 300) {
        game.zoom = 0;
        let count = 0;
        function zLoop() {
            game.zoom += canvas.height / game.zoomScale / time;
            count++;
            if (count < time) {
                requestAnimationFrame(zLoop);
            }
        }
        requestAnimationFrame(zLoop);
    },
    wipe: function() {
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.globalAlpha = (mech.health < 0.7) ? (mech.health+0.3)*(mech.health+0.3) : 1
        ctx.fillStyle = document.body.style.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // if (mech.health < 0.7) {
        // 	ctx.globalAlpha= 0.3 + mech.health
        // 	ctx.fillStyle = document.body.style.backgroundColor
        // 	ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 	ctx.globalAlpha=1;
        // } else {
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }
        //ctx.fillStyle = "rgba(255,255,255," + (1 - Math.sqrt(player.speed)*0.1) + ")";
        //ctx.fillStyle = "rgba(255,255,255,0.4)";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    reset: function() {
        //removes guns and ammo
        b.inventory = [];
        for (let i = 0, len = b.guns.length; i < len; ++i) {
            if (b.guns[i].ammo != Infinity) {
                b.guns[i].ammo = 0;
                b.guns[i].have = false;
            } else {
                b.inventory.push(i);
            }
        }
        game.dmgScale = 1;
        b.dmgScale = 1;
        b.activeGun = 0;
        game.makeGunHUD();
        mech.drop();
        mech.addHealth(1);
        mech.alive = true;
        game.levelsCleared = 0;
        level.onLevel = Math.floor(Math.random() * level.levels.length); //picks a random starting level
        game.clearNow = true;
        document.getElementById("text-log").style.opacity = 0;
        document.getElementById("fade-out").style.opacity = 0;
        game.startZoomIn();
    },
    clearNow: false,
    clearMap: function() {
        mech.drop();
        level.fill = [];
        level.fillBG = [];
        level.zones = [];
        level.queryList = [];
        this.drawList = [];
        function removeAll(array) {
            for (let i = 0; i < array.length; ++i)
                Matter.World.remove(engine.world, array[i]);
        }
        removeAll(map);
        map = [];
        removeAll(body);
        body = [];
        removeAll(mob);
        mob = [];
        removeAll(powerUp);
        powerUp = [];
        removeAll(cons);
        cons = [];
        removeAll(consBB);
        consBB = [];
        removeAll(bullet);
        bullet = [];
    },
    getCoords: {
        //used when building maps, outputs a draw rect command to console, only works in testing mode
        pos1: {
            x: 0,
            y: 0
        },
        pos2: {
            x: 0,
            y: 0
        },
        out: function() {
            if (keys[49]) {
                this.pos1.x = Math.round(game.mouseInGame.x / 25) * 25;
                this.pos1.y = Math.round(game.mouseInGame.y / 25) * 25;
            }
            if (keys[50]) {
                //press 1 in the top left; press 2 in the bottom right;copy command from console
                this.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
                this.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
                window.getSelection().removeAllRanges();
                var range = document.createRange();
                range.selectNode(document.getElementById("test"));
                window.getSelection().addRange(range);
                document.execCommand("copy");
                window.getSelection().removeAllRanges();
                console.log(
                    `spawn.mapRect(${this.pos1.x}, ${this.pos1.y}, ${this.pos2.x - this.pos1.x}, ${this.pos2.y - this.pos1.y}); //`
                );
            }
        }
    },
    testingOutput: function() {
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        let line = 100;
        const x = canvas.width - 5;
        ctx.fillText("Press T to exit testing mode", x, line);
        line += 30;
        ctx.fillText("cycle: " + game.cycle, x, line);
        line += 20;
        ctx.fillText("delta: " + game.delta.toFixed(6), x, line);
        line += 20;
        ctx.fillText("x: " + player.position.x.toFixed(0), x, line);
        line += 20;
        ctx.fillText("y: " + player.position.y.toFixed(0), x, line);
        line += 20;
        ctx.fillText("Vx: " + mech.Vx.toFixed(2), x, line);
        line += 20;
        ctx.fillText("Vy: " + mech.Vy.toFixed(2), x, line);
        line += 20;
        ctx.fillText("Fx: " + player.force.x.toFixed(3), x, line);
        line += 20;
        ctx.fillText("Fy: " + player.force.y.toFixed(3), x, line);
        line += 20;
        ctx.fillText("yOff: " + mech.yOff.toFixed(1), x, line);
        line += 20;
        ctx.fillText("mass: " + player.mass.toFixed(1), x, line);
        line += 20;
        ctx.fillText("onGround: " + mech.onGround, x, line);
        line += 20;
        ctx.fillText("crouch: " + mech.crouch, x, line);
        line += 20;
        ctx.fillText("isHeadClear: " + mech.isHeadClear, x, line);
        line += 20;
        ctx.fillText("HeadIsSensor: " + headSensor.isSensor, x, line);
        line += 20;
        ctx.fillText("frictionAir: " + player.frictionAir.toFixed(3), x, line);
        line += 20;
        ctx.fillText("stepSize: " + mech.stepSize.toFixed(2), x, line);
        line += 20;
        ctx.fillText("zoom: " + this.zoom.toFixed(4), x, line);
        line += 20;
        ctx.textAlign = "center";
        ctx.fillText(`(${this.mouseInGame.x.toFixed(1)}, ${this.mouseInGame.y.toFixed(1)})`, this.mouse.x, this.mouse.y - 20);
    },
    draw: {
        powerUp: function() {
            // ctx.lineWidth = 5
            // for (let i = 0, len = powerUp.length; i < len; ++i) {
            //     let vertices = powerUp[i].vertices;
            //     ctx.beginPath();
            //     ctx.moveTo(vertices[0].x, vertices[0].y);
            //     for (let j = 1; j < vertices.length; j += 1) {
            //         ctx.lineTo(vertices[j].x, vertices[j].y);
            //     }
            //     ctx.lineTo(vertices[0].x, vertices[0].y);
            // 	ctx.globalAlpha = powerUp[i].alpha;
            //     ctx.strokeStyle = powerUp[i].color
            //     ctx.stroke()
            // }
            // ctx.globalAlpha = 1;
            ctx.globalAlpha = 0.4 * Math.sin(game.cycle * 0.15) + 0.6;
            for (let i = 0, len = powerUp.length; i < len; ++i) {
                let vertices = powerUp[i].vertices;
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
                ctx.fillStyle = powerUp[i].color;
                ctx.fill();
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
            ctx.fillStyle = "#444";
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
            ctx.lineWidth = 2;
            ctx.fillStyle = "#777";
            ctx.fill();
            ctx.strokeStyle = "#333";
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
            ctx.lineWidth = 2;
            // ctx.strokeStyle = "#999";
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
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
            ctx.strokeStyle = "#000";
            ctx.stroke();
        },
        testing: function() {
            //zones
            ctx.beginPath();
            for (let i = 0, len = level.zones.length; i < len; ++i) {
                ctx.rect(
                    level.zones[i].x1,
                    level.zones[i].y1 + 70,
                    level.zones[i].x2 - level.zones[i].x1,
                    level.zones[i].y2 - level.zones[i].y1
                );
            }
            ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
            ctx.fill();
            //query zones
            ctx.beginPath();
            for (let i = 0, len = level.queryList.length; i < len; ++i) {
                ctx.rect(
                    level.queryList[i].bounds.max.x,
                    level.queryList[i].bounds.max.y,
                    level.queryList[i].bounds.min.x - level.queryList[i].bounds.max.x,
                    level.queryList[i].bounds.min.y - level.queryList[i].bounds.max.y
                );
            }
            ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
            ctx.fill();
            //jump
            ctx.beginPath();
            let bodyDraw = jumpSensor.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
            //main body
            ctx.beginPath();
            bodyDraw = playerBody.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
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
            ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
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
            ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
            ctx.fill();
            ctx.stroke();
        }
    },
    checkLineIntersection(v1, v1End, v2, v2End) {
        // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
        let denominator, a, b, numerator1, numerator2;
        let result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = (v2End.y - v2.y) * (v1End.x - v1.x) - (v2End.x - v2.x) * (v1End.y - v1.y);
        if (denominator == 0) {
            return result;
        }
        a = v1.y - v2.y;
        b = v1.x - v2.x;
        numerator1 = (v2End.x - v2.x) * a - (v2End.y - v2.y) * b;
        numerator2 = (v1End.x - v1.x) * a - (v1End.y - v1.y) * b;
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = v1.x + a * (v1End.x - v1.x);
        result.y = v1.y + a * (v1End.y - v1.y);
        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a > 0 && a < 1) result.onLine1 = true;
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) result.onLine2 = true;
        // if line1 and line2 are segments, they intersect if both of the above are true
        return result;
    },
    buildingUp: function(e) {
        if (game.mouseDown) {
            game.getCoords.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
            game.getCoords.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
            let out;

            //body rect mode
            out = `spawn.mapRect(${game.getCoords.pos1.x}, ${game.getCoords.pos1.y}, ${game.getCoords.pos2.x - game.getCoords.pos1.x}, ${game.getCoords.pos2.y - game.getCoords.pos1.y});`;

            //mob spawn
            //out = `spawn.randomMob(${game.getCoords.pos1.x}, ${game.getCoords.pos1.y}, 0.3);`

            //draw foreground
            //out = `level.fill.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "rgba(0,0,0,0.1)"});`;

            //draw background fill
            //out = `level.fillBG.push({ x: ${game.getCoords.pos1.x}, y: ${game.getCoords.pos1.y}, width: ${game.getCoords.pos2.x-game.getCoords.pos1.x}, height: ${game.getCoords.pos2.y-game.getCoords.pos1.y}, color: "#ccc"});`;

            //svg mode
            //out = 'rect x="'+game.getCoords.pos1.x+'" y="'+ game.getCoords.pos1.y+'" width="'+(game.getCoords.pos2.x-game.getCoords.pos1.x)+'" height="'+(game.getCoords.pos2.y-game.getCoords.pos1.y)+'"';

            console.log(out);
            // document.getElementById("copy-this").innerHTML = out
            //
            // window.getSelection().removeAllRanges();
            // var range = document.createRange();
            // range.selectNode(document.getElementById('copy-this'));
            // window.getSelection().addRange(range);
            // document.execCommand('copy')
            // window.getSelection().removeAllRanges();
        }
    }
};
