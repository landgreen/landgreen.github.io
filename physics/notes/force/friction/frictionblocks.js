let blocks = () => {
    const maxStaticFriction = 0.15
    let leftBlock = {
        target: document.getElementById("leftBlock"),
        textTarget: document.getElementById("leftBlock-text"),
        position: {
            x: 150,
            y: 10
        },
        velocity: {
            x: 0,
            y: 0
        },
        mass: 5,
        muStatic: 0.61,
        muKinetic: 0.47,
        moving: false,
    }
    let rightBlock = {
        target: document.getElementById("rightBlock"),
        textTarget: document.getElementById("rightBlock-text"),
        position: {
            x: 310,
            y: 70
        },
        velocity: {
            x: 0,
            y: 0
        },
        mass: 0
    }

    document.getElementById("mass").addEventListener("input", () => {
            rightBlock.mass = Number(document.getElementById("mass").value)
            document.getElementById("mass-slider").value = rightBlock.mass
            // if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic && rightBlock.mass > leftBlock.muKinetic) requestAnimationFrame(cycle);
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );
    document.getElementById("mass-slider").addEventListener("input", () => {
            rightBlock.mass = Number(document.getElementById("mass-slider").value)
            document.getElementById("mass").value = rightBlock.mass
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );
    document.getElementById("mu").addEventListener("input", () => {
            leftBlock.muStatic = Number(document.getElementById("mu").value)
            document.getElementById("mu-slider").value = leftBlock.muStatic
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );
    document.getElementById("mu-slider").addEventListener("input", () => {
            leftBlock.muStatic = Number(document.getElementById("mu-slider").value)
            document.getElementById("mu").value = leftBlock.muStatic
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );

    document.getElementById("mu-k").addEventListener("input", () => {
            leftBlock.muKinetic = Number(document.getElementById("mu-k").value)
            document.getElementById("mu-k-slider").value = leftBlock.muKinetic
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );
    document.getElementById("mu-k-slider").addEventListener("input", () => {
            leftBlock.muKinetic = Number(document.getElementById("mu-k-slider").value)
            document.getElementById("mu-k").value = leftBlock.muKinetic
            if (!leftBlock.moving && rightBlock.mass > leftBlock.muStatic * leftBlock.mass && rightBlock.mass > leftBlock.muKinetic * leftBlock.mass) requestAnimationFrame(cycle);
        },
        false
    );

    document.getElementById("reset-blocks").addEventListener("click", () => {
            leftBlock.position.x = 150
            leftBlock.velocity.x = 0
            leftBlock.moving = false
            rightBlock.position.y = 70
            rightBlock.velocity.y = 0
            rightBlock.mass = 0.01
            leftBlock.muKinetic = 0.47
            leftBlock.muStatic = 0.61
            document.getElementById("mass").value = rightBlock.mass
            document.getElementById("mass-slider").value = rightBlock.mass
            document.getElementById("mu").value = leftBlock.muStatic
            document.getElementById("mu-slider").value = leftBlock.muStatic
            document.getElementById("mu-k").value = leftBlock.muKinetic
            document.getElementById("mu-k-slider").value = leftBlock.muKinetic
            draw()
        },
        false
    );

    function physics() {
        const a = 9.8 * (leftBlock.mass * leftBlock.muKinetic - rightBlock.mass) / (rightBlock.mass + leftBlock.mass)
        // const a = 9.8 * (5 * leftBlock.muKinetic - rightBlock.mass) / (5 - rightBlock.mass)
        leftBlock.velocity.x = rightBlock.velocity.y -= a / 60 / 4; // /60 for the frame rate  /4 just for looks

        if (leftBlock.velocity.x > 0) {
            leftBlock.moving = true;
        } else {
            leftBlock.moving = false;
        }
        leftBlock.position.x += leftBlock.velocity.x;
        rightBlock.position.y += rightBlock.velocity.y;
    }

    function draw() {
        leftBlock.target.setAttribute("x", leftBlock.position.x);
        leftBlock.textTarget.setAttribute("x", leftBlock.position.x + 25);
        rightBlock.target.setAttribute("y", rightBlock.position.y);
        rightBlock.textTarget.setAttribute("y", rightBlock.position.y + 15);
        document.getElementById("rope").setAttribute("d", `M${(leftBlock.position.x+50)} 35 h${267-leftBlock.position.x} m8 8 v${rightBlock.position.y-43}`);
    }

    function cycle() {
        if (leftBlock.position.x < 250) {
            physics()
            draw()
            if (leftBlock.moving) requestAnimationFrame(cycle);
        } else {
            leftBlock.velocity.x = rightBlock.velocity.y = 0;
            leftBlock.position.x = 250;
            rightBlock.position.y = 170;
            draw()
        }
    }

}
blocks();