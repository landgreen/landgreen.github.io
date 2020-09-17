tanks()

function tanks() {
    const SVG_PATH = document.getElementById("tanks")
    const MOUSE_PATH = document.getElementById("mouse")
    const WIDTH = 600;
    const HEIGHT = 350;
    const GRAVITY = -9.8;
    const SPEED_SCALE = 0.45;
    const TIME_STEP = 4 * 1 / 60;
    const TURRET_RADIUS = 25;
    const MAX_VELOCITY = 197; // so it can almost touch to top of the SVG
    const MIN_VELOCITY = 30;
    let isFiring = false;
    let whoseTurn = 1; //toggles to 1 or 2
    let time = 0;
    let isPaused = true;

    const mouse = {
        x: 0,
        y: 0
    }

    const b = {
        path: document.getElementById("bullet"),
        d: "M0 0 ",
        position: {
            x: 0,
            y: 0
        },
        initialPosition: {
            x: 0,
            y: 0
        },
        velocity: {
            x: 0,
            y: 0
        },
    }

    const p1 = {
        pathTank: document.getElementById("player-1"),
        path: document.getElementById("player-turret-1"),
        isAlive: true,
        position: {
            x: 50,
            y: HEIGHT
        },
        turretRelativePosition: {
            x: 0,
            y: 0
        },
        angle: 0
    }

    const p2 = {
        pathTank: document.getElementById("player-2"),
        path: document.getElementById("player-turret-2"),
        isAlive: true,
        position: {
            x: 550,
            y: HEIGHT
        },
        turretRelativePosition: {
            x: 0,
            y: 0
        },
        angle: 0
    }

    SVG_PATH.addEventListener("mousemove", (event) => {
        if (!isFiring && (p1.isAlive || p2.isAlive)) {
            mouse.x = event.offsetX * WIDTH / SVG_PATH.clientWidth
            mouse.y = event.offsetY * HEIGHT / SVG_PATH.clientHeight
            getTrajectory();
            document.getElementById("bullet-ux").innerHTML = "u = " + b.velocity.x.toPrecision(3) + " m/s"
            document.getElementById("bullet-uy").innerHTML = "u = " + b.velocity.y.toPrecision(3) + " m/s"
            document.getElementById("bullet-vx").innerHTML = "v = ";
            document.getElementById("bullet-vy").innerHTML = "v = "
            document.getElementById("bullet-t").innerHTML = "Δt = "
            document.getElementById("bullet-y").innerHTML = "Δy = "
            document.getElementById("bullet-x").innerHTML = "Δx = "
        }
    });
    SVG_PATH.addEventListener("mousedown", (event) => {
        if (!isFiring && (p1.isAlive || p2.isAlive)) {
            mouse.x = event.offsetX * WIDTH / SVG_PATH.clientWidth
            mouse.y = event.offsetY * HEIGHT / SVG_PATH.clientHeight
            getTrajectory();
            document.getElementById("bullet-ux").innerHTML = "u = " + b.velocity.x.toPrecision(3) + " m/s"
            document.getElementById("bullet-uy").innerHTML = "u = " + b.velocity.y.toPrecision(3) + " m/s"
            document.getElementById("bullet-vx").innerHTML = "v = ";
            document.getElementById("bullet-vy").innerHTML = "v = "
            document.getElementById("bullet-t").innerHTML = "Δt = "
            document.getElementById("bullet-y").innerHTML = "Δy = "
            document.getElementById("bullet-x").innerHTML = "Δx = "
        }
    })

    SVG_PATH.addEventListener("mouseup", (event) => {
        if (!isFiring && (p1.isAlive || p2.isAlive)) {
            isFiring = true;
            isPaused = false;
            time = 0;
            mouse.x = event.offsetX * WIDTH / SVG_PATH.clientWidth
            mouse.y = event.offsetY * HEIGHT / SVG_PATH.clientHeight
            // MOUSE_PATH.style.display = "none";

            getTrajectory();
            if (whoseTurn === 1) {
                b.position.x = p1.position.x + p1.turretRelativePosition.x
                b.position.y = p1.position.y + p1.turretRelativePosition.y
                document.getElementById("bullet-trajectory-1").style.display = "block";
                document.getElementById("bullet-trajectory-2").style.display = "none";
            } else {
                b.position.x = p2.position.x + p2.turretRelativePosition.x
                b.position.y = p2.position.y + p2.turretRelativePosition.y
                document.getElementById("bullet-trajectory-2").style.display = "block";
                document.getElementById("bullet-trajectory-1").style.display = "none";
            }
            b.d = `M ${b.position.x} ${b.position.y} `;

            // output values that don't change
            document.getElementById("bullet-vx").innerHTML = "v = " + b.velocity.x.toPrecision(3) + " m/s"
            draw();
            cycle();
        } else {
            if (isPaused) {
                isPaused = false
                if (p1.isAlive || p2.isAlive) cycle();
            } else {
                isPaused = true
            }
        }
    });

    function getTrajectory() {
        // aim turret
        let dx, dy, angle, distance
        if (whoseTurn === 1) {
            dx = p1.position.x - mouse.x
            dy = HEIGHT - mouse.y
            angle = Math.PI + Math.atan2(dy, dx)
            p1.turretRelativePosition = {
                x: TURRET_RADIUS * Math.cos(angle),
                y: TURRET_RADIUS * Math.sin(angle)
            }
            p1.path.setAttribute("d", `M 0 0 L${p1.turretRelativePosition.x} ${p1.turretRelativePosition.y}`);

            // get trajectory
            dx = p1.position.x + p1.turretRelativePosition.x - mouse.x
            dy = HEIGHT - mouse.y + p1.turretRelativePosition.y
        } else {
            dx = p2.position.x - mouse.x
            dy = HEIGHT - mouse.y
            angle = Math.PI + Math.atan2(dy, dx)
            p2.turretRelativePosition = {
                x: TURRET_RADIUS * Math.cos(angle),
                y: TURRET_RADIUS * Math.sin(angle)
            }
            p2.path.setAttribute("d", `M 0 0 L${p2.turretRelativePosition.x} ${p2.turretRelativePosition.y}`);

            // get trajectory
            dx = p2.position.x + p2.turretRelativePosition.x - mouse.x
            dy = HEIGHT - mouse.y + p2.turretRelativePosition.y
        }

        angle = Math.PI - Math.atan2(dy, dx)
        distance = Math.sqrt(dx * dx + dy * dy)
        distance = Math.max(Math.min(distance, MAX_VELOCITY), MIN_VELOCITY)
        b.velocity.x = distance * Math.cos(angle) * SPEED_SCALE
        b.velocity.y = distance * Math.sin(angle) * SPEED_SCALE


        //setup path from tank to mouse
        if (whoseTurn === 1) {
            const Tx = p1.position.x + p1.turretRelativePosition.x
            const Ty = HEIGHT + p1.turretRelativePosition.y
            const x = Tx + distance * Math.cos(angle)
            const y = Ty - distance * Math.sin(angle)
            MOUSE_PATH.setAttribute("d", `M${Tx} ${Ty} L${x} ${y}`);
        } else {
            const Tx = p2.position.x + p2.turretRelativePosition.x
            const Ty = HEIGHT + p2.turretRelativePosition.y
            const x = Tx + distance * Math.cos(angle)
            const y = Ty - distance * Math.sin(angle)
            MOUSE_PATH.setAttribute("d", `M${Tx} ${Ty} L${x} ${y}`);
        }
    }

    function physics(step) {
        time += step;
        b.position.x += b.velocity.x * step
        b.position.y -= b.velocity.y * step
        b.velocity.y += GRAVITY * step
    }

    function checkForCollision() {
        if (b.position.y > HEIGHT - 4 || b.position.x > WIDTH - 4 || b.position.x < 4) {
            //back up until clear of bounds
            for (let i = 0; i < 10; i++) {
                if (b.position.y > HEIGHT - 4 || b.position.x > WIDTH - 4 || b.position.x < 4) {
                    b.velocity.y -= GRAVITY * TIME_STEP * 0.1
                    b.position.y += b.velocity.y * TIME_STEP * 0.1
                    b.position.x -= b.velocity.x * TIME_STEP * 0.1
                    time += TIME_STEP * 0.1;
                } else {
                    break;
                }
            }

            //check for collision with a tank after hitting the ground
            function findDistance(pos1, pos2, range) {
                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                return Math.sqrt(dx * dx + dy * dy) < range
            }
            const COLLISION_RANGE = 22;
            if (findDistance(p1.position, b.position, COLLISION_RANGE)) {
                p1.isAlive = false
                p1.pathTank.style.display = "none"
            }

            if (findDistance(p2.position, b.position, COLLISION_RANGE)) {
                p2.isAlive = false
                p2.pathTank.style.display = "none"
            }

            if (p1.isAlive || p2.isAlive) {
                //setup for next firing
                isFiring = false;
                if (whoseTurn === 1) {
                    if (p2.isAlive) whoseTurn = 2
                } else {
                    if (p1.isAlive) whoseTurn = 1
                }
                MOUSE_PATH.style.display = "block";

            }
        }
    }

    function draw() {
        b.path.setAttribute("cx", b.position.x);
        b.path.setAttribute("cy", b.position.y);

        //draw trajectory
        if (isFiring) {
            b.d += `L ${b.position.x} ${b.position.y} `
            if (whoseTurn === 1) {
                document.getElementById("bullet-x").innerHTML = "Δx = " + (b.position.x - p1.position.x).toPrecision(3) + " m"
                document.getElementById("bullet-trajectory-1").setAttribute("d", b.d);
            } else {
                document.getElementById("bullet-x").innerHTML = "Δx = " + (b.position.x - p2.position.x).toPrecision(3) + " m"
                document.getElementById("bullet-trajectory-2").setAttribute("d", b.d);
            }
        }
        // data out
        document.getElementById("bullet-t").innerHTML = "Δt = " + (time).toPrecision(3) + " s"
        document.getElementById("bullet-y").innerHTML = "Δy = " + (HEIGHT - b.position.y + p1.turretRelativePosition.y).toPrecision(3) + " m"
        document.getElementById("bullet-vy").innerHTML = "v = " + b.velocity.y.toPrecision(3) + " m/s"
    }

    function cycle() {
        physics(TIME_STEP);
        checkForCollision();
        draw();
        if (!isPaused && isFiring && (p1.isAlive || p2.isAlive)) requestAnimationFrame(cycle);
    }
}