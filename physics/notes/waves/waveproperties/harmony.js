harmony(document.getElementById("sound-play-1"), 300, 150)
harmony(document.getElementById("sound-play-2"), 243, 150, 0.75)

function harmony(el, freq1, freq2, gain = 0.5) {
    let audioCtx, oscillator1, gainNode1, oscillator2, gainNode2
    let started = false;

    // start -> play/pause  button events
    el.addEventListener("click", function () {
        if (!started) {
            started = true
            paused = false
            el.textContent = 'pause';
            //setup audio context
            audioCtx = new(window.AudioContext || window.webkitAudioContext)();

            oscillator1 = audioCtx.createOscillator();
            gainNode1 = audioCtx.createGain();
            gainNode1.gain.value = gain; //controls volume
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioCtx.destination);
            oscillator1.type = "sine"; // 'sine' 'square', 'sawtooth', 'triangle' and 'custom'
            oscillator1.frequency.value = freq1; // value in hertz
            oscillator1.start();

            oscillator2 = audioCtx.createOscillator();
            gainNode2 = audioCtx.createGain();
            gainNode2.gain.value = gain; //controls volume
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioCtx.destination);
            oscillator2.type = "sine"; // 'sine' 'square', 'sawtooth', 'triangle' and 'custom'
            oscillator2.frequency.value = freq2; // value in hertz
            oscillator2.start();
        } else {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(function () {
                    el.textContent = 'pause';
                });
            } else if (audioCtx.state === 'running') {
                audioCtx.suspend().then(function () {
                    el.textContent = 'play';
                });
            }
        }
    });
}