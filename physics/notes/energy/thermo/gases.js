(() => {
    const canvas = document.getElementById("gases");
    const ctx = canvas.getContext("2d");
    canvas.width = document.getElementsByTagName("article")[0].clientWidth;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let scale
    if (canvas.width > canvas.height) {
        scale = canvas.height / 10 + 7
    } else {
        scale = canvas.width / 10 + 7
    }
    ctx.strokeStyle = "#000";
    ctx.beginPath()
    ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
    ctx.moveTo(cx - scale * 0.8, cy - scale);
    ctx.lineTo(cx + scale * 1.2, cy);
    ctx.lineTo(cx - scale * 0.8, cy + scale);
    ctx.lineTo(cx - scale * 0.8, cy - scale);
    ctx.stroke();
    ctx.lineJoin = "miter"
    ctx.lineCap = "butt"
    ctx.lineWidth = 1;
})()

function gases(el) {
    el.onclick = null; //stops the function from running on button click
    el.className += " no-shadow";
    document.getElementById("gas-data").style.display = "inline";
    const canvas = el // let canvas = document.getElementById("gases");;
    const ctx = canvas.getContext("2d");
    canvas.style.backgroundColor = "#000"
    canvas.height = window.innerHeight * 0.5
    // canvas.width = window.innerWidth - 15;
    window.addEventListener("resize", () => {
        document.getElementById("gas-width-slider").max = window.innerWidth - 15 //makes width slider set to max possible canvas width
        document.getElementById("gas-width").max = window.innerWidth - 15
        if (canvas.width > window.innerWidth - 15) {
            canvas.width = window.innerWidth - 15;
            physics.widthGoal = canvas.width
            document.getElementById("gas-width").value = canvas.width
            document.getElementById("gas-width-slider").value = canvas.width
        }

        calculateValues();
    });
    canvas.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
    });

    let pause = false;
    const mouseRange = document.getElementById("gas-mouse-range")
    mouseRange.addEventListener("mouseleave", () => {
        pause = true;
    });
    mouseRange.addEventListener("mouseenter", () => {
        pause = false;
        if (!pause) requestAnimationFrame(cycle);
    });
    canvas.addEventListener("click", (event) => {
        const mouse = {
            x: (event.offsetX * canvas.width) / canvas.clientWidth,
            y: (event.offsetY * canvas.height) / canvas.clientHeight
        }
        for (let i = 0, len = gas.length; i < len; ++i) {
            const dx = gas[i].position.x - mouse.x;
            const dy = gas[i].position.y - mouse.y;
            const a = Math.atan2(dy, dx);
            gas[i].speed = 20000 / (dx * dx + dy * dy + 2000)
            gas[i].velocity.x += gas[i].speed * Math.cos(a);
            gas[i].velocity.y += gas[i].speed * Math.sin(a);
        }
        calculateValues();
        output();
    });

    physics = {
        n: 10000, //slows down at 500000 on fast desktop
        time: 0,
        radius: 1,
        netDeltaV: 0,
        timeStep: 30,
        smoothing: 0, //set this to zero after any change in values
        pressure: 0,
        temperature: 0,
        widthGoal: Math.min(1000, window.innerWidth - 15),
        widthRate: 1,
        volume: canvas.width * canvas.height,
    }

    canvas.width = physics.widthGoal
    document.getElementById("gas-width-slider").max = window.innerWidth - 15 //makes width slider set to max possible canvas width
    document.getElementById("gas-width").max = window.innerWidth - 15
    document.getElementById("gas-width").value = canvas.width
    document.getElementById("gas-width-slider").value = canvas.width

    document.getElementById("gas-width").addEventListener("input", () => {
        physics.widthGoal = document.getElementById("gas-width").value
        document.getElementById("gas-width-slider").value = physics.widthGoal
    }, false);

    document.getElementById("gas-width-slider").addEventListener("input", () => {
        physics.widthGoal = document.getElementById("gas-width-slider").value
        document.getElementById("gas-width").value = physics.widthGoal
    }, false);

    document.getElementById("gas-n").addEventListener("input", () => {
        const number = Math.floor(Math.min(document.getElementById("gas-n").value, 999999))
        document.getElementById("gas-n-slider").value = Math.log10(number)
        addRemoveGas(number)
        physics.n = number
        calculateValues();
        output();
    }, false);

    document.getElementById("gas-n-slider").addEventListener("input", () => {
        const convertLog = Math.pow(10, document.getElementById("gas-n-slider").value)
        const number = Math.floor(Math.min(convertLog, 999999))
        document.getElementById("gas-n").value = number
        addRemoveGas(number)
        physics.n = number
        calculateValues();
        output();
    }, false);

    function addRemoveGas(numberRequested) {
        const diff = numberRequested - gas.length;
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                const angle = Math.random() * 2 * Math.PI
                const speed = 3 * Math.random() * Math.random() + Math.sqrt(0.2 * Math.random())
                const index = {
                    position: {
                        x: physics.radius + Math.random() * (canvas.width - 2 * physics.radius),
                        y: physics.radius + Math.random() * (canvas.height - 2 * physics.radius)
                    },
                    velocity: {
                        x: speed * Math.cos(angle),
                        y: speed * Math.sin(angle)
                    },
                    speed: speed
                }
                gas.push(index) //add gas particles
            }
        } else {
            gas.length = gas.length + diff; //remove gas particles
        }
    }

    let gas = []
    //populate array with particles
    for (let i = 0; i < physics.n; i++) {
        const angle = Math.random() * 2 * Math.PI
        const speed = 3 * Math.random() * Math.random() + Math.sqrt(0.2 * Math.random())
        const index = {
            position: {
                x: Math.random() * canvas.width * 0.5 + canvas.width * 0.25,
                y: Math.random() * canvas.height * 0.5 + canvas.height * 0.25
            },
            velocity: {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle)
            },
            speed: speed
        }
        gas.push(index)
    }

    function draw() {
        let imgData = ctx.createImageData(canvas.width, canvas.height);

        //initialize all pixels 
        for (var i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i + 0] = 255 // red, green, blue, alpha
            imgData.data[i + 1] = 255
            imgData.data[i + 2] = 255
            imgData.data[i + 3] = 0;
        }
        //make pixel alpha 255 if if there is a particle in that position
        for (let i = 0, len = gas.length; i < len; i++) {
            const x = gas[i].position.x
            const y = gas[i].position.y
            const off = 4 * Math.floor(x) + 4 * canvas.width * Math.floor(y);
            imgData.data[off + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }



    function move() {
        if (physics.isMovingWidth) {
            function calculateSpeed(velocity) {
                return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
            }

            for (let i = 0, len = gas.length; i < len; i++) {
                //move
                gas[i].position.x += gas[i].velocity.x
                gas[i].position.y += gas[i].velocity.y
                //walls x
                if (gas[i].position.x < physics.radius) {
                    gas[i].position.x = physics.radius + Math.random()
                    physics.netDeltaV += gas[i].velocity.x
                    gas[i].velocity.x = Math.abs(gas[i].velocity.x + physics.widthRate)
                    gas[i].speed = calculateSpeed(gas[i].velocity)
                    physics.netDeltaV += gas[i].velocity.x
                } else if (gas[i].position.x > canvas.width - physics.radius) {
                    gas[i].position.x = canvas.width - physics.radius - Math.random()
                    physics.netDeltaV += gas[i].velocity.x //used in pressure calculation
                    gas[i].velocity.x = -Math.abs(gas[i].velocity.x - physics.widthRate)
                    physics.netDeltaV += -gas[i].velocity.x //used in pressure calculation
                    gas[i].speed = calculateSpeed(gas[i].velocity)
                }
                //walls y
                if (gas[i].position.y < physics.radius) {
                    gas[i].position.y = physics.radius
                    gas[i].velocity.y = Math.abs(gas[i].velocity.y)
                    physics.netDeltaV += gas[i].velocity.y * 2
                } else if (gas[i].position.y > canvas.height - physics.radius) {
                    gas[i].position.y = canvas.height - physics.radius
                    physics.netDeltaV += gas[i].velocity.y * 2 //used in pressure calculation
                    gas[i].velocity.y = -Math.abs(gas[i].velocity.y)
                }
            }
        } else {
            for (let i = 0, len = gas.length; i < len; i++) {
                //move
                gas[i].position.x += gas[i].velocity.x
                gas[i].position.y += gas[i].velocity.y
                //walls x
                if (gas[i].position.x < physics.radius) {
                    gas[i].position.x = physics.radius
                    gas[i].velocity.x = Math.abs(gas[i].velocity.x)
                    physics.netDeltaV += gas[i].velocity.x * 2
                } else if (gas[i].position.x > canvas.width - physics.radius) {
                    gas[i].position.x = canvas.width - physics.radius
                    physics.netDeltaV += gas[i].velocity.x * 2 //used in pressure calculation
                    gas[i].velocity.x = -Math.abs(gas[i].velocity.x)
                }
                //walls y
                if (gas[i].position.y < physics.radius) {
                    gas[i].position.y = physics.radius
                    gas[i].velocity.y = Math.abs(gas[i].velocity.y)
                    physics.netDeltaV += gas[i].velocity.y * 2
                } else if (gas[i].position.y > canvas.height - physics.radius) {
                    gas[i].position.y = canvas.height - physics.radius
                    physics.netDeltaV += gas[i].velocity.y * 2 //used in pressure calculation
                    gas[i].velocity.y = -Math.abs(gas[i].velocity.y)
                }
            }
        }
    }

    function calculateValues() {
        physics.smoothing = 0; //reset smoothing to low
        physics.volume = canvas.width * canvas.height

        // calculate temperature
        let totalSpeed = 0
        // let totalSpeed2 = 0
        for (let i = 0, len = gas.length; i < len; i++) {
            totalSpeed += gas[i].speed * gas[i].speed
            // totalSpeed2 += gas[i].velocity.x * gas[i].velocity.x + gas[i].velocity.y * gas[i].velocity.y
        }
        physics.temperature = 1 / 2 * totalSpeed / physics.n // T = 1/2 mv^2
    }
    calculateValues();

    function changeWidth() {
        if (Math.floor(canvas.width) === Math.floor(physics.widthGoal)) {
            physics.isMovingWidth = false
        } else {
            physics.isMovingWidth = true
            if (canvas.width < physics.widthGoal) {
                canvas.width += physics.widthRate
            } else {
                canvas.width -= physics.widthRate
            }
            calculateValues();
            document.getElementById("gas-v").innerHTML = `Volume = ${canvas.width}m x ${canvas.height}m x 1m = ${commafy(physics.volume)} m³`
        }
    }

    function output() {
        //calculate Pressure
        const P = physics.netDeltaV / physics.timeStep / (canvas.width * 2 + canvas.height * 2)
        physics.netDeltaV = 0 //reset for next round of collection
        //smooth the smoothing factor so smoothing does happen at first,  this lets the numbers get close to accurate values faster
        physics.smoothing = physics.smoothing * 0.8 + 0.98 * 0.2
        physics.pressure = physics.pressure * physics.smoothing + P * (1 - physics.smoothing) // smoothing function

        //calculate R with ideal gas law

        //out to html
        document.getElementById("gas-p").innerHTML = `Pressure = ${commafy(physics.pressure.toFixed(6))} N/m²`
        document.getElementById("gas-v").innerHTML = `Volume = ${canvas.width}m x ${canvas.height}m x 1m = ${commafy(physics.volume)} m³`
        document.getElementById("gas-t").innerHTML = `Average Kinetic Energy (T) = ${physics.temperature.toFixed(3)} Nm`
        // document.getElementById("gas-n").innerHTML = `N = ${commafy(physics.n)} particles`

        const k = physics.pressure * physics.volume / physics.n / physics.temperature
        document.getElementById("gas-k").innerHTML = `k = ${k.toFixed(4)}`
    }

    function commafy(num) { //used to format numbers with commas and spaces
        var str = num.toString().split('.');
        if (str[0].length >= 5) {
            str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        }
        if (str[1] && str[1].length >= 5) {
            str[1] = str[1].replace(/(\d{3})/g, '$1 ');
        }
        return str.join('.');
    }

    function cycle() {
        physics.time++
        changeWidth();
        move();
        // calculateValues();
        draw();
        if (!(physics.time % physics.timeStep)) output(); //output values once a second
        if (!pause) requestAnimationFrame(cycle);
    }
    requestAnimationFrame(cycle);
}