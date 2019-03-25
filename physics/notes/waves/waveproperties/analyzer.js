(() => {
    var canvas = document.getElementById("analyzer-canvas");
    var ctx = canvas.getContext("2d");
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
})();

(() => {
    var canvas = document.getElementById("barGraph-canvas");
    var ctx = canvas.getContext("2d");
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
})();

function analyzer(el) {
    el.onclick = null; //stops the function from running on button click

    const canvas = document.getElementById("analyzer-canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = 256;

    let audioContext, analyser, dataArray, bufferLength
    let pause = false

    let constraints = {
        audio: true
    };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        initAudio(stream);
        startDrawing();
        document.getElementById("microphone-text").style.display = "inline";
    }).catch(err => {
        console.log(err);
    });


    // const microphoneZone = document.getElementById("microphone-zone")
    // microphoneZone.addEventListener("mouseleave", () => {
    //     pause = true;
    // });
    // microphoneZone.addEventListener("mouseenter", () => {
    //     pause = false;
    //     if (!pause) startDrawing()
    // });


    canvas.addEventListener("click", () => {
        if (pause) {
            pause = false;
            draw();
        } else {
            pause = true;
        }
    });

    function initAudio(stream) {
        audioContext = new(window.AudioContext || window.webkitAudioContext)();
        let mediaStreamSource = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.9;
        mediaStreamSource.connect(analyser);
    }

    function startDrawing() {
        analyser.fftSize = 1024;
        bufferLength = analyser.frequencyBinCount + 100;
        dataArray = new Uint8Array(bufferLength);
        ctx.lineWidth = 2;
        pause = false
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!pause) requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        ctx.beginPath();
        for (let x = 0; x < bufferLength; x++) {
            let y = 255 - dataArray[x];
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}






function barGraph(el) {
    el.onclick = null; //stops the function from running on button click

    const canvas = document.getElementById("barGraph-canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    canvas.height = 128;

    let audioContext, analyser, dataArray, bufferLength
    let pause = false

    let constraints = {
        audio: true
    };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        initAudio(stream);
        startDrawing();
        document.getElementById("barGraph-text").style.display = "inline";
    }).catch(err => {
        console.log(err);
    });


    // const microphoneZone = document.getElementById("barGraph-zone")
    // microphoneZone.addEventListener("mouseleave", () => {
    //     pause = true;
    // });
    // microphoneZone.addEventListener("mouseenter", () => {
    //     pause = false;
    //     if (!pause) startDrawing()
    // });


    canvas.addEventListener("click", () => {
        if (pause) {
            pause = false;
            draw();
        } else {
            pause = true;
        }
    });

    function initAudio(stream) {
        audioContext = new(window.AudioContext || window.webkitAudioContext)();
        let mediaStreamSource = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.9;
        mediaStreamSource.connect(analyser);
    }

    function startDrawing() {
        analyser.fftSize = 2048 //1024;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        pause = false
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!pause) requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        var barWidth = canvas.width / bufferLength;
        var barHeight;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            // ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth + 1, barHeight);
            x += barWidth;
        }
    };
}