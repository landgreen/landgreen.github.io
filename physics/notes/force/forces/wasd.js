(function box() {
    let pause = true;
    const s = {
        width: window.innerWidth, //I can't find the right way to account for the scroll bar for edge collisions
        height: window.innerHeight
    }

    window.onresize = function () {
        s.width = window.innerWidth //I can't find the right way to account for the scroll bar for edge collisions
        s.height = window.innerHeight
    }

    // console.log(document.documentElement.clientWidth, window.innerWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth, screen.width, window.screen.availWidth)
    const a = {
        el: document.getElementById("rect"),
        SVGID: document.getElementById("force-box"),
        width: 60,
        height: 60,
        position: {
            x: 20,
            y: window.innerHeight / 2 - 30
        },
        velocity: {
            x: 0,
            y: 0
        },
        speed: 0,
        acceleration: {
            x: 0,
            y: 0
        },
        thrustMag: 0.1,
        thrust: {
            x: 0,
            y: 0
        },
        dragMag: 0.0005,
        drag: {
            x: 0,
            y: 0
        },
        normal: {
            x: 0,
            y: 0
        },
        gravityMag: 0.06,
        restitution: 1 + 0.4,
        friction: {
            x: 0,
            y: 0
        },
        arrowSmoothed: {
            left: 0,
            right: 0,
            up: 0,
            down: 0,
            scale: 1000
        },
        frictionForceY(arrow, mag = 0.8 * a.gravityMag) {
            if (Math.abs(a.velocity.y) > mag) {
                if (a.velocity.y < 0) {
                    a.friction.y += mag
                    arrow.down += a.friction.y * arrow.scale
                } else {
                    a.friction.y -= mag
                    arrow.up += a.friction.y * arrow.scale
                }

            } else {
                //zero when too slow
                a.friction.y = -a.velocity.y
                if (a.velocity.y < 0) {
                    arrow.down += a.friction.y * arrow.scale
                } else {
                    arrow.up += a.friction.y * arrow.scale
                }
            }
        },
        frictionForceX(arrow, mag = 0.8 * a.gravityMag) {
            if (Math.abs(a.velocity.x) > mag) {
                if (a.thrust.y > 0) mag += a.thrust.y
                if (a.velocity.x < 0) {
                    a.friction.x += mag
                    arrow.right += a.friction.x * arrow.scale
                } else {
                    a.friction.x -= mag
                    arrow.left += a.friction.x * arrow.scale
                }
            } else {
                //zero when too slow
                a.friction.x = -a.velocity.x
                if (a.velocity.x < 0) {
                    arrow.right += a.friction.x * arrow.scale
                } else {
                    arrow.left += a.friction.x * arrow.scale
                }
            }
        },
        dragForce(arrow, mag) {
            //drag force calculation, modeled after kinetic friction
            a.drag.x = -mag * a.velocity.x * Math.abs(a.velocity.x)
            a.drag.y = -mag * a.velocity.y * Math.abs(a.velocity.y)

            if (a.drag.x > 0) {
                arrow.right += a.drag.x * arrow.scale
            } else {
                arrow.left += a.drag.x * arrow.scale
            }
            if (a.drag.y < 0) {
                arrow.up += a.drag.y * arrow.scale
            } else {
                arrow.down += a.drag.y * arrow.scale
            }
        },
    }

    //___________________get keyboard input___________________
    const keys = [];
    document.onkeydown = event => {
        keys[event.keyCode] = true;
        // console.log(event.keyCode);
        if (keys[69]) {
            if (pause) {
                pause = false
                a.SVGID.classList.add('fixed')
                a.SVGID.classList.remove('static')
                a.position.x = 30
                a.position.y = window.innerHeight / 2 - 30
                // const b = a.SVGID.getBoundingClientRect();
                // console.log(b)
                requestAnimationFrame(cycle);
            } else {
                pause = true
                a.SVGID.classList.add('static')
                a.SVGID.classList.remove('fixed')
                a.velocity.x = 0
                a.velocity.y = 0
                a.position.x = 20
                a.position.y = 20
                document.getElementById("right-vector").setAttribute("d", "M0 0");
                document.getElementById("left-vector").setAttribute("d", "M0 0");
                document.getElementById("up-vector").setAttribute("d", "M0 0");
                document.getElementById("down-vector").setAttribute("d", "M0 0");
                a.el.setAttribute("transform", `translate(${a.position.x} ${a.position.y})`);
            }
        }
    }
    document.onkeyup = event => {
        keys[event.keyCode] = false;
    }

    //___________________animation loop ___________________
    function cycle() {
        if (!pause) {
            requestAnimationFrame(cycle);
            //zero forces and acceleration
            a.acceleration.x = a.acceleration.y = 0
            a.thrust.x = a.thrust.y = 0
            a.drag.x = a.drag.y = 0
            a.normal.x = a.normal.y = 0
            a.friction.x = a.friction.y = 0


            const arrow = {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                scale: 1000
            }

            //thrust force key checks
            if (keys[68]) {
                a.thrust.x += a.thrustMag
                arrow.right += a.thrustMag * arrow.scale
            }
            if (keys[65]) {
                a.thrust.x += -a.thrustMag
                arrow.left -= a.thrustMag * arrow.scale
            }
            if (keys[83]) {
                a.thrust.y += a.thrustMag
                arrow.down += a.thrustMag * arrow.scale
            }
            if (keys[87]) {
                a.thrust.y += -a.thrustMag
                arrow.up -= a.thrustMag * arrow.scale
            }

            a.dragForce(arrow, a.dragMag)

            //normal force calculation
            const edge = 0
            if (a.position.x < edge) {
                a.position.x = edge
                a.normal.x = -a.velocity.x * a.restitution
                arrow.right += a.normal.x * arrow.scale
                a.frictionForceY(arrow)
            } else if (a.position.x > s.width - a.width - edge) {
                a.position.x = s.width - a.width - edge
                a.normal.x = -a.velocity.x * a.restitution
                arrow.left += a.normal.x * arrow.scale
                a.frictionForceY(arrow)
            }

            if (a.position.y < edge) {
                a.position.y = edge
                a.normal.y = -a.velocity.y * a.restitution
                arrow.down += a.normal.y * arrow.scale
                a.frictionForceX(arrow)
            } else if (a.position.y > s.height - a.height - edge) { //on ground
                a.position.y = s.height - a.height - edge
                a.normal.y = -a.velocity.y * a.restitution
                arrow.up += a.normal.y * arrow.scale
                a.frictionForceX(arrow)
            }

            //apply forces
            a.acceleration.x += a.thrust.x + a.drag.x + a.normal.x + a.friction.x
            a.acceleration.y += a.thrust.y + a.drag.y + a.normal.y + a.friction.y + a.gravityMag
            arrow.down += a.gravityMag * arrow.scale

            //apply acceleration to velocity
            a.velocity.x += a.acceleration.x
            a.velocity.y += a.acceleration.y
            //apply velocity to position
            a.position.x += a.velocity.x
            a.position.y += a.velocity.y

            //move SVG
            a.el.setAttribute("transform", `translate(${a.position.x} ${a.position.y})`);

            //smooth arrow changes
            const old = 0.6;
            const newer = 1 - old;
            a.arrowSmoothed.left = a.arrowSmoothed.left * old + arrow.left * newer;
            a.arrowSmoothed.right = a.arrowSmoothed.right * old + arrow.right * newer;
            a.arrowSmoothed.up = a.arrowSmoothed.up * old + arrow.up * newer;
            a.arrowSmoothed.down = a.arrowSmoothed.down * old + arrow.down * newer;

            //update arrow vectors to smooth value
            const plus = 5
            //hide if arrow is too small
            const threshold = 0.1
            if (a.arrowSmoothed.right > threshold) {
                document.getElementById("right-vector").setAttribute("visibility", "visible");
                document.getElementById("right-vector").setAttribute("d", `M60 30 h ${a.arrowSmoothed.right+plus} l-1 3 l6 -3 l-6 -3 l1 3`);
            } else {
                document.getElementById("right-vector").setAttribute("visibility", "hidden");
            }
            if (a.arrowSmoothed.left < -threshold) {
                document.getElementById("left-vector").setAttribute("visibility", "visible");
                document.getElementById("left-vector").setAttribute("d", `M0 30 h ${a.arrowSmoothed.left-plus} l1 3 l-6 -3 l6 -3 l-1 3`);
            } else {
                document.getElementById("left-vector").setAttribute("visibility", "hidden");
            }
            if (a.arrowSmoothed.up < -threshold) {
                document.getElementById("up-vector").setAttribute("visibility", "visible");
                document.getElementById("up-vector").setAttribute("d", `M30 0 v ${a.arrowSmoothed.up-plus} l3 1 l-3 -6 l-3 6 l3 -1`);
            } else {
                document.getElementById("up-vector").setAttribute("visibility", "hidden");
            }
            if (a.arrowSmoothed.down > threshold) {
                document.getElementById("down-vector").setAttribute("visibility", "visible");
                document.getElementById("down-vector").setAttribute("d", `M30 60 v ${a.arrowSmoothed.down+plus} l3 -1 l-3 6 l-3 -6 l3 1`);
            } else {
                document.getElementById("down-vector").setAttribute("visibility", "hidden");
            }
        }
    }
})()