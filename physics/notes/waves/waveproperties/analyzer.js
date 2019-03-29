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
    canvas.style.background = "#000"
    ctx.lineJoin = "bevel"
    ctx.lineCap = "round"

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
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#0ff";
        ctx.stroke();

        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(0,255,255,0.2)";
        ctx.stroke();

        ctx.lineWidth = 9;
        ctx.strokeStyle = "rgba(0,255,255,0.1)";
        ctx.stroke();
    }
}






function barGraph(el) {
    el.onclick = null; //stops the function from running on button click

    const canvas = document.getElementById("barGraph-canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = 256;
    canvas.style.background = "#000"
    ctx.fillStyle = "#0ff";

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
        analyser.fftSize = 8192 //2048 //1024;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        pause = false
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!pause) requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        let barWidth = canvas.width / bufferLength * 5;
        let x = 0;
        for (let i = 0, len = bufferLength / 5; i < len; i++) {
            const barHeight = dataArray[i];
            const red = 180 - barHeight;
            const green = barHeight * 1.5 - 72;
            const blue = barHeight + 56;
            ctx.fillStyle = `rgb(${red},${green},${blue})`
            ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth + 1, barHeight);
            x += barWidth;
        }
    };
}
// function barGraph(el) {
//     el.onclick = null; //stops the function from running on button click

//     const canvas = document.getElementById("barGraph-canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.height = 256;
//     canvas.style.background = "#000"
//     ctx.fillStyle = "#0ff";

//     let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     let data = imageData.data;

//     let audioContext, analyser, dataArray, bufferLength
//     let pause = false

//     let constraints = {
//         audio: true
//     };
//     navigator.mediaDevices.getUserMedia(constraints).then(stream => {
//         initAudio(stream);
//         startDrawing();
//         document.getElementById("barGraph-text").style.display = "inline";
//     }).catch(err => {
//         console.log(err);
//     });

//     canvas.addEventListener("click", () => {
//         if (pause) {
//             pause = false;
//             draw();
//         } else {
//             pause = true;
//         }
//     });

//     function initAudio(stream) {
//         audioContext = new(window.AudioContext || window.webkitAudioContext)();
//         let mediaStreamSource = audioContext.createMediaStreamSource(stream);
//         analyser = audioContext.createAnalyser();
//         analyser.smoothingTimeConstant = 0.9;
//         mediaStreamSource.connect(analyser);
//     }

//     function startDrawing() {
//         analyser.fftSize = 8192 //2048 //1024;
//         bufferLength = analyser.frequencyBinCount;
//         dataArray = new Uint8Array(bufferLength);
//         pause = false
//         setBaseColor();
//         draw();
//     }

//     function setBaseColor(color = 0) {
//         for (var i = 0; i < data.length; i += 4) {
//             //Math.random() > 0.5 ? 255 : 0;
//             data[i] = color; // red
//             data[i + 1] = color; // green
//             data[i + 2] = color; // blue
//             data[i + 3] = 255; // alpha
//         }
//     }

//     function draw() {
//         if (!pause) requestAnimationFrame(draw);


//         //move data up
//         for (var i = 0; i < data.length; i += 4) {
//             const index = i + canvas.width * 4
//             data[i] = data[index];
//             data[i + 1] = data[index + 1];
//             data[i + 2] = data[index + 2];
//         }

//         //draw microphone data
//         analyser.getByteFrequencyData(dataArray);
//         for (let i = 0, len = canvas.width; i < len; i++) {
//             const barHeight = dataArray[i];
//             const red = 0 //Math.floor(180 - barHeight * 0.75);
//             const green = Math.floor(barHeight * 1.5 - 128);
//             const blue = Math.floor(barHeight);

//             const x = i
//             const y = canvas.height - 1
//             const index = 4 * (x + y * canvas.width)

//             data[index] = red;
//             data[index + 1] = green;
//             data[index + 2] = blue;
//         }
//         ctx.putImageData(imageData, 0, 0);
//     };
// }