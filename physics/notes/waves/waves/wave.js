const wave = function() {
    var svg = document.getElementById("sine_wave").children[0];
    var origin = {
        //origin of axes
        x: 0,
        y: 200
    };
    settings = {
        velocity: 0.8334,
        amplitude: 100,
        wavelength: 200,
        frequency: 0.004167, //times 60 for seconds
        period: 240, //divide by 60 for seconds
        phase: 100,
        width: 805,
        resolution: 1, // 1 is one to one pixel
		time: 0,
    };
	let pause = true
	document.getElementById("wave_animation").addEventListener("mouseleave", function() {
		pause = true
	});
	document.getElementById("wave_animation").addEventListener("mouseenter", function() {
		if (pause) {
			pause = false
			requestAnimationFrame(render);
		}
	});

    (function setup() {
        document.getElementById("amplitude").value = settings.amplitude
        document.getElementById("velocity").value = settings.velocity * 60
        document.getElementById("wavelength").value = settings.wavelength
        document.getElementById("frequency").value = settings.frequency * 60
        document.getElementById("period").value = settings.period / 60
    })()
    document.getElementById('amplitude').addEventListener("input", function() {
        settings.amplitude = document.getElementById("amplitude").value
        drawSineWave();

    }, false);

    document.getElementById('velocity').addEventListener("input", function() {
        settings.velocity = document.getElementById("velocity").value / 60

        settings.frequency = 1 / settings.wavelength
        settings.period = 1 / settings.frequency
        document.getElementById("frequency").value = settings.frequency * 60 * settings.velocity
        document.getElementById("period").value = settings.period / 60 / settings.velocity

        drawSineWave();

    }, false);

    document.getElementById('wavelength').addEventListener("input", function() {
        settings.wavelength = document.getElementById("wavelength").value
        settings.phase = settings.phase % settings.wavelength //makes the switch smoother

        settings.frequency = 1 / settings.wavelength
        settings.period = 1 / settings.frequency
        document.getElementById("frequency").value = settings.frequency * 60 * settings.velocity
        document.getElementById("period").value = settings.period / 60 / settings.velocity

        drawSineWave();

    }, false);

    document.getElementById('frequency').addEventListener("input", function() {
        settings.frequency = document.getElementById("frequency").value / 60
        settings.phase = settings.phase % settings.wavelength //makes the switch smoother

        settings.wavelength = 1 / settings.frequency
        document.getElementById("wavelength").value = settings.wavelength

        settings.period = 1 / settings.frequency
        document.getElementById("period").value = settings.period / 60
        drawSineWave();

    }, false);

    document.getElementById('period').addEventListener("input", function() {
        settings.period = document.getElementById("period").value * 60
        settings.phase = settings.phase % settings.wavelength //makes the switch smoother

        document.getElementById("wavelength").value = settings.wavelength = settings.period

        settings.frequency = 1 / settings.period
        document.getElementById("frequency").value = settings.frequency * 60
        drawSineWave();

    }, false);
	//adds sinewave path to svg
    function drawSineWave() {
        let d = 'M-1 ' + (-Math.sin(settings.frequency * 2 * Math.PI * (-1 + settings.phase)) * settings.amplitude + origin.y);
        for (let i = 0; i < settings.width; i += settings.resolution) {
            d += ' L' + (i) + ' ' + (-Math.sin(settings.frequency * 2 * Math.PI * (i - 1 + settings.phase)) * settings.amplitude + origin.y);
        }
        document.getElementById('sine_wave').setAttribute('d', d)
    }
	drawSineWave();
    function render() { //repeating animation function
	    settings.phase -= settings.velocity
		settings.time++;
		document.getElementById("time").innerHTML = (settings.time/60).toFixed(1)+'s'
        drawSineWave();
        if (!pause) window.requestAnimationFrame(render);
    }

}
wave()
