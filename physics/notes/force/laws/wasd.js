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
        dragMag: 0.03,
        drag: {
            x: 0,
            y: 0
        },
        normal: {
            x: 0,
            y: 0
        },
        friction(arrow) {
            a.speed = Math.sqrt(a.velocity.x * a.velocity.x + a.velocity.y * a.velocity.y)
            if (a.speed > a.dragMag * 2) {
                a.drag.x = -a.dragMag * a.velocity.x / a.speed
                a.drag.y = -a.dragMag * a.velocity.y / a.speed
                if (a.drag.x > 0) {
                    arrow.right += a.drag.x * arrow.scale //* (0.05 * Math.random() + 0.95)
                } else {
                    arrow.left += a.drag.x * arrow.scale //* (0.05 * Math.random() + 0.95)
                }
                if (a.drag.y < 0) {
                    arrow.up += a.drag.y * arrow.scale //* (0.05 * Math.random() + 0.95)
                } else {
                    arrow.down += a.drag.y * arrow.scale //* (0.05 * Math.random() + 0.95)
                }
            } else {
                //zero when too slow
                a.velocity.x = 0;
                a.velocity.y = 0;
            }
        }
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

            const arrow = {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                scale: 1000
            }
            //friction force calculation, modeled after kinetic friction
            a.friction(arrow)

            //normal force calculation
            if (a.position.x < 0) {
                a.normal.x = -a.velocity.x
                a.position.x = 0
                arrow.right += a.normal.x * arrow.scale
            } else if (a.position.x > s.width - a.width) {
                a.normal.x = -a.velocity.x
                a.position.x = s.width - a.width
                arrow.left += a.normal.x * arrow.scale
            }
            if (a.position.y < 0) {
                a.normal.y = -a.velocity.y
                a.position.y = 0
                arrow.down += a.normal.y * arrow.scale
            } else if (a.position.y > s.height - a.height) {
                a.normal.y = -a.velocity.y
                a.position.y = s.height - a.height
                arrow.up += a.normal.y * arrow.scale
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

            //apply forces
            a.acceleration.x += a.thrust.x + a.drag.x + a.normal.x
            a.acceleration.y += a.thrust.y + a.drag.y + a.normal.y

            //apply acceleration
            a.velocity.x += a.acceleration.x
            a.velocity.y += a.acceleration.y

            //apply velocity
            a.position.x += a.velocity.x
            a.position.y += a.velocity.y

            //move SVG
            a.el.setAttribute("transform", `translate(${a.position.x} ${a.position.y})`);

            //draw force vectors
            const plus = 5
            //hide if arrow is zero
            if (arrow.right > 0) {
                document.getElementById("right-vector").setAttribute("visibility", "visible");
                document.getElementById("right-vector").setAttribute("d", `M60 30 h ${arrow.right+plus} l-1 3 l6 -3 l-6 -3 l1 3`);
            } else {
                document.getElementById("right-vector").setAttribute("visibility", "hidden");
            }
            if (arrow.left < 0) {
                document.getElementById("left-vector").setAttribute("visibility", "visible");
                document.getElementById("left-vector").setAttribute("d", `M0 30 h ${arrow.left-plus} l1 3 l-6 -3 l6 -3 l-1 3`);
            } else {
                document.getElementById("left-vector").setAttribute("visibility", "hidden");
            }
            if (arrow.up < 0) {
                document.getElementById("up-vector").setAttribute("visibility", "visible");
                document.getElementById("up-vector").setAttribute("d", `M30 0 v ${arrow.up-plus} l3 1 l-3 -6 l-3 6 l3 -1`);
            } else {
                document.getElementById("up-vector").setAttribute("visibility", "hidden");
            }
            if (arrow.down > 0) {
                document.getElementById("down-vector").setAttribute("visibility", "visible");
                document.getElementById("down-vector").setAttribute("d", `M30 60 v ${arrow.down+plus} l3 -1 l-3 6 l-3 -6 l3 1`);
            } else {
                document.getElementById("down-vector").setAttribute("visibility", "hidden");
            }
        }


    }
    // requestAnimationFrame(cycle);
})()