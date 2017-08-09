var canvas, ctx
class Particle { //Particle class
    constructor(position, mass = 50, charge = 0, velocity = {
        x: 0,
        y: 0
    }, color = randomColor({
        luminosity: 'bright'
    })) {
        this.position = position;
        this.velocity = velocity;
        this.mass = mass;
        this.charge = charge;
        this.color = color;
        this.radius = Math.sqrt(mass);
    }

    static spawnRandom(who, len = 1) {
        for (let i = 0; i < len; ++i) {
            who[who.length] = new Particle({
                x: 30 + Math.random() * (canvas.width - 60),
                y: 30 + Math.random() * (canvas.height - 60)
            }, 5 + Math.floor(Math.random() * Math.random() * 300), 0, {
                x: Math.random() - 0.5,
                y: Math.random() - 0.5
            })
        }
    }

    get move() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    get applyFriction() {
        this.velocity.x *= 0.999
        this.velocity.y *= 0.999
    }

    static applyGravity(who) {
        for (let i = 0, len = who.length; i < len; ++i) {
            //gravity force
            for (let j = 0, len = who.length; j < len; ++j) {
                if (i != j) {
                    const dx = who[i].position.x - who[j].position.x
                    const dy = who[i].position.y - who[j].position.y
                    const a = Math.atan2(dy, dx);
                    //the +4000 keeps r from being zero / adds stability
                    const r = (dx * dx + dy * dy) + 100
                    const mag = -3 / r / who[i].mass * who[j].mass;
                    who[i].velocity.x += mag * Math.cos(a)
                    who[i].velocity.y += mag * Math.sin(a)
                }
            }
        }
    }

    static physicsAll(who) {
        for (let i = 0, len = who.length; i < len; ++i) {
            who[i].move
                // who[i].applyFriction
        }
        Particle.applyGravity(who)
    }
    static totalMass(who) {
        let mass = 0
        for (let i = 0, len = who.length; i < len; ++i) {
            mass += who[i].mass
        }
        return mass
    }
    static setCanvas(el) {
        canvas = el;
        ctx = canvas.getContext("2d");
        ctx.font = "300 20px Roboto";
    }
    static drawAll(who) {
        for (let i = 0, len = who.length; i < len; ++i) {
            ctx.fillStyle = who[i].color;
            ctx.beginPath();
            ctx.arc(who[i].position.x, who[i].position.y, who[i].radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    static teleport(who, off = 200) {
        let count = 0
        for (let i = 0, len = who.length; i < len; ++i) {
            if (who[i].position.x > canvas.width + off) {
                count++
                who[i].position.x = -off;
            }
        }
        return count
    }
    static bounds(who, range = 50) {
        //range = how far outside of canvas,  0 is at canvs edge
        const restitution = 0.5
        for (let i = 0, len = who.length; i < len; ++i) {
            if (who[i].position.x > canvas.width + range) {
                who[i].velocity.x = -Math.abs(who[i].velocity.x) * restitution
                who[i].position.x = canvas.width + range
            } else if (who[i].position.x < -range) {
                who[i].velocity.x = Math.abs(who[i].velocity.x) * restitution
                who[i].position.x = -range
            }
            if (who[i].position.y > canvas.height + range) {
                who[i].velocity.y = -Math.abs(who[i].velocity.y) * restitution
                who[i].position.y = canvas.height + range
            } else if (who[i].position.y < -range) {
                who[i].velocity.y = Math.abs(who[i].velocity.y) * restitution
                who[i].position.y = -range
            }
        }
    }

    static repulse(who, pos) {
        for (let i = 0, len = who.length; i < len; ++i) {
            const dx = who[i].position.x - pos.x
            const dy = who[i].position.y - pos.y
            const a = Math.atan2(dy, dx);
            //the +4000 keeps r from being zero
            const r = (dx * dx + dy * dy) + 2000
            const mag = 400000 / r / who[i].mass;
            who[i].velocity.x += mag * Math.cos(a)
            who[i].velocity.y += mag * Math.sin(a)
        }
    }

    static potential(who, position) {
        let v = 0
        for (let i = 0, len = who.length; i < len; ++i) {
            const dx = who[i].position.x - position.x
            const dy = who[i].position.y - position.y
                // const a = Math.atan2(dy, dx);
                // //the +4000 keeps r from being zero / adds stability
                // const r = (dx * dx + dy * dy) + 4000
                // v += 200 * who[i].charge / r;

            v += who[i].mass / Math.sqrt((dx * dx + dy * dy) + 4000);

        }
        return v
    }

    static vectorField(who, mag = 100, spacing = 15, opacityThreshold = Math.round(spacing / 2)) {
        var lenX = Math.floor(canvas.width / spacing);
        var lenY = Math.floor(canvas.height / spacing);
        var x, y, dist, draw;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#033"
        for (var k = 0; k < lenY; k++) {
            for (var j = 0; j < lenX; j++) {
                draw = true;
                x = canvas.width * (j + 0.5) / lenX;
                y = canvas.height * (k + 0.5) / lenY;
                //calc Forces
                var f, a;
                var fx = 0;
                var fy = 0;
                for (var i = 0; i < who.length; i++) {
                    var dx = (who[i].position.x - x);
                    var dy = (who[i].position.y - y);
                    dist = Math.sqrt(dx * dx + dy * dy) + spacing * 2;
                    if (dist < who[i].r) {
                        draw = false; //don't draw in inside a body
                        break; //exit the forloop
                    }
                    f = who[i].mass * mag / (dist * dist);
                    a = Math.atan2(dy, dx);
                    fx += f * Math.cos(a);
                    fy += f * Math.sin(a);
                }
                if (draw) {
                    f = Math.sqrt(fx * fx + fy * fy)
                    if (f > spacing - opacityThreshold) f = spacing - opacityThreshold;
                    a = Math.atan2(fy, fx);
                    var alpha = 1;
                    if (f < opacityThreshold) alpha = f / opacityThreshold;
                    ctx.globalAlpha = alpha * alpha;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(a);
                    //vector line
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.abs(f), 0);
                    ctx.stroke();
                    //arrows
                    ctx.beginPath();
                    ctx.moveTo(f + 4, 0);
                    ctx.lineTo(f, -2);
                    ctx.lineTo(f, 2);
                    ctx.fillStyle = "#033";
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
        ctx.globalAlpha = 1;
    }
    static scalarField(who, fieldSpacing = 3, fieldMag = 10) {
        const lenX = Math.floor(canvas.width / fieldSpacing);
        const lenY = Math.floor(canvas.height / fieldSpacing);
        const offset = Math.floor(fieldSpacing / 2)
        const squareRadius = fieldSpacing + 1
        const yHeight = Math.floor(canvas.height / lenY)
        const xheight = Math.floor(canvas.width / lenX);
        for (let k = 0; k < lenY + 1; k++) {
            for (let j = 0; j < lenX + 1; j++) {
                const x = xheight * j
                const y = yHeight * k;
                let mag = 0;
                for (let i = 0, len = who.length; i < len; i++) {
                    const dx = (who[i].position.x - x);
                    const dy = (who[i].position.y - y);
                    mag -= who[i].mass / (Math.sqrt(dx * dx + dy * dy) + 2);
                }

                ctx.fillStyle = 'hsl(' +
                    (Math.min(Math.max(Math.round(mag * fieldMag), 110), 290) + 130) % 360 +
                    ', 100%, 50%)'
                    // ctx.fillStyle = 'hsl('+
                    // Math.min(Math.max(Math.round(3000*mag*mag * fieldMag), 0), 359)
                    //  +', 100%, ' +
                    // Math.min(Math.max(Math.round(mag * fieldMag), 0), 100)
                    // + '%)'
                ctx.fillRect(x - offset, y - offset, squareRadius, squareRadius);
            }
        }
    }
}
