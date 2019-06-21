(() => {
    const canvas = document.getElementById("standing-wave-canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.backgroundColor = "#fff"
    canvas.width = 500 //document.getElementsByTagName("article")[0].clientWidth;
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

function standing(canvas) {
    document.getElementById("standing-wave-input").style.display = "inline"
    canvas.onclick = null; //stops the function from running on button click
    canvas.style.backgroundColor = "#000"
    const ctx = canvas.getContext("2d");
    const width = canvas.width = 500;
    const height = canvas.height = 400;

    let wavelength = 1 / 3;
    document.getElementById("wavelength").value = wavelength;
    document.getElementById("wavelength-slider").value = wavelength;
    let phase = 0

    function drawWave() {
        phase += 0.01
        const distance = 500
        const amplitude = 170
        const widthCenter = width / 2
        const heightCenter = height / 2

        let sum = []; //array that stores the superposition data from reflected and incident waves
        const sumLength = 360
        for (let i = 0; i < sumLength; i++) {
            sum[i] = 0
        }

        ctx.lineWidth = 1
        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength + phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + widthCenter, y + heightCenter)

            const angle = Math.floor(Math.atan2(y, x) * 180 / Math.PI + 180)
            const mag = x * x + y * y
            sum[angle] += mag
        }
        ctx.strokeStyle = "rgba(255,0,80,0.1)" // "#f05"
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength - phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + widthCenter, y + heightCenter)

            const angle = Math.floor(Math.atan2(y, x) * 180 / Math.PI + 180)
            const mag = x * x + y * y
            sum[angle] += mag
        }
        ctx.strokeStyle = "rgba(0,175,207,0.1)" //"#0ac"
        ctx.stroke();

        ctx.beginPath();
        const scale = 0.1 / distance
        for (let a = 0; a < sumLength; a++) {
            const angle = (a - 180) * Math.PI / 180
            const x = scale * sum[a] * Math.cos(angle)
            const y = scale * sum[a] * Math.sin(angle)
            ctx.lineTo(widthCenter + x, heightCenter + y)
        }
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.fill();
        ctx.strokeStyle = "#fff"
        ctx.stroke();
        // console.log(sum)
    }




    function drawWavePhaseInterference() {
        phase += 0.01
        const distance = 500
        const amplitude = 170
        const widthCenter = width / 2
        const heightCenter = height / 2

        ctx.lineWidth = 1
        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength + phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + widthCenter, y + heightCenter)
        }
        ctx.strokeStyle = "rgba(255,0,80,0.1)" // "#f05"
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < distance; i += 0.1) {
            const wave = Math.sin(i / wavelength - phase) * amplitude
            const x = wave * Math.cos(i)
            const y = wave * Math.sin(i)
            ctx.lineTo(x + widthCenter, y + heightCenter)
        }
        ctx.strokeStyle = "rgba(0,175,207,0.1)" //"#0ac"
        ctx.stroke();

        let sum = []; //array that stores the superposition data from reflected and incident waves
        const sumLength = Math.round(2 * Math.PI * 10) + 1
        for (let i = 0; i < sumLength; i++) {
            sum[i] = {
                x: 0,
                y: 0
            }
        }
        for (let i = 0; i < distance; i += 0.1) {
            const wave1 = Math.sin(i / wavelength + phase) * amplitude
            const wave2 = Math.sin(i / wavelength - phase) * amplitude
            const x = (wave1 + wave2) * Math.cos(i)
            const y = (wave1 + wave2) * Math.sin(i)
            const index = Math.round(i % (2 * Math.PI) * 10)
            sum[index].x += x
            sum[index].y += y
        }


        ctx.beginPath();
        const scale = 1.4 * Math.PI / distance
        for (let i = 0; i < sumLength; i++) {
            ctx.lineTo(widthCenter + scale * sum[i].x, heightCenter + scale * sum[i].y)
        }
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.fill();
        // ctx.strokeStyle = "#fff"
        // ctx.stroke();
    }


    document.getElementById("wavelength").addEventListener("input", () => {
        wavelength = Number(document.getElementById("wavelength").value)
        document.getElementById("wavelength-slider").value = wavelength
    }, false);

    document.getElementById("wavelength-slider").addEventListener("input", () => {
        wavelength = Number(document.getElementById("wavelength-slider").value)
        document.getElementById("wavelength").value = wavelength
    }, false);

    let pause = false;
    const elZone = document.getElementById("standing-wave-zone");
    elZone.addEventListener("mouseleave", () => {
        pause = true;
    });
    elZone.addEventListener("mouseenter", () => {
        if (pause) {
            pause = false;
            requestAnimationFrame(cycle);
        }
    });
    time = 0

    function cycle() {
        time++
        if (!pause) requestAnimationFrame(cycle);
        ctx.clearRect(0, 0, width, height)
        // drawWave();
        drawWavePhaseInterference();
    }
    requestAnimationFrame(cycle); //starts loop
}