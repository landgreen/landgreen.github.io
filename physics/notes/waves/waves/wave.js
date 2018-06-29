// https://github.com/josephg/noisejs

const wave = function() {
  const sineWaveTarget = document.getElementById("sine_wave");
  var origin = {
    //origin of x,y axes
    x: 0,
    y: 200
  };
  settings = {
    velocity: 60,
    amplitude: 60,
    wavelength: 300,
    frequency: 0.2,
    period: 5,
    phase: 100,
    width: window.innerWidth, //805
    time: 0,
    water: true,
    baseF: 0.02,
    scale: 24
  };
  document.getElementById("sin-wave").setAttribute("width", settings.width);

  let pause = true;
  document.getElementById("wave_animation").addEventListener("mouseleave", function() {
    pause = true;
  });
  document.getElementById("wave_animation").addEventListener("mouseenter", function() {
    if (pause) {
      pause = false;
      requestAnimationFrame(render);
    }
  });

  function toggleWater() {
    if (settings.water) {
      settings.water = false;
      sineWaveTarget.setAttribute("filter", "none");
      sineWaveTarget.setAttribute("fill", "none");
      sineWaveTarget.setAttribute("stroke", "#000");
      sineWaveTarget.setAttribute("stroke-width", "2");
    } else {
      settings.water = true;
      sineWaveTarget.setAttribute("filter", "url(#displacementFilter)");
      sineWaveTarget.setAttribute("fill", "rgba(0,0,255,0.4)");
      sineWaveTarget.setAttribute("stroke", "rgba(255,255,255,0.5)");
      sineWaveTarget.setAttribute("stroke-width", "5");
    }
  }
  document.getElementById("sin-wave").addEventListener("click", toggleWater);
  toggleWater();
  (function setup() {
    document.getElementById("amplitude").value = settings.amplitude;
    document.getElementById("velocity").value = settings.velocity;
    document.getElementById("wavelength").value = settings.wavelength;
    document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
    settings.phase = settings.phase % settings.wavelength; //makes the switch smoother
  })();

  document.getElementById("amplitude").addEventListener(
    "input",
    function() {
      settings.amplitude = Number(document.getElementById("amplitude").value);
      drawSineWave();
    },
    false
  );

  document.getElementById("velocity").addEventListener(
    "input",
    function() {
      settings.velocity = Number(document.getElementById("velocity").value);
      settings.frequency = settings.velocity / settings.wavelength;
      settings.period = 1 / settings.frequency;
      document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
      document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
      drawSineWave();
    },
    false
  );

  document.getElementById("wavelength").addEventListener(
    "input",
    function() {
      settings.wavelength = Math.max(Number(document.getElementById("wavelength").value), 1);
      settings.phase = settings.phase % settings.wavelength; //makes the switch smoother
      settings.frequency = settings.velocity / settings.wavelength;
      settings.period = 1 / settings.frequency;
      document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
      document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
      drawSineWave();
    },
    false
  );

  function drawSineWave() {
    let d = "M-1 " + (-Math.sin(((2 * Math.PI) / settings.wavelength) * (-1 + settings.phase)) * settings.amplitude + origin.y);
    for (let x = 0; x < settings.width; ++x) {
      d += " L" + x + " " + (-Math.sin(((2 * Math.PI) / settings.wavelength) * (x - 1 + settings.phase)) * settings.amplitude + origin.y);
    }
    d += "V500 L-100 500";
    sineWaveTarget.setAttribute("d", d);
  }
  drawSineWave();
  function render() {
    //repeating animation function
    settings.phase -= settings.velocity / 60;
    settings.time += 1 / 60;
    document.getElementById("time").innerHTML = settings.time.toFixed(1) + " s";
    drawSineWave();
    if (!pause) window.requestAnimationFrame(render);
  }
};
wave();
