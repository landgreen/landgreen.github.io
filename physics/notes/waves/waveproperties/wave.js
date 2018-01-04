// https://github.com/josephg/noisejs

const wave = function() {
  const sineWaveTarget = document.getElementById("sine_wave");
  var origin = {
    //origin of axes
    x: 0,
    y: 200
  };
  settings = {
    velocity: 0.8334,
    amplitude: 60,
    wavelength: 300,
    frequency: 0.004167, //times 60 for seconds
    period: 240, //divide by 60 for seconds
    phase: 100,
    width: window.innerWidth, //805
    resolution: 1, // 1 is one to one pixel
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

  (function setup() {
    document.getElementById("amplitude").value = settings.amplitude;
    document.getElementById("velocity").value = settings.velocity * 60;
    document.getElementById("wavelength").value = settings.wavelength;
    document.getElementById("frequency").innerHTML = "frequency = " + (settings.frequency * 60 * settings.velocity).toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "peroid = " + (settings.period / 60).toFixed(3) + " s";
    settings.phase = settings.phase % settings.wavelength; //makes the switch smoother
    settings.frequency = 1 / settings.wavelength;
  })();
  document.getElementById("amplitude").addEventListener(
    "input",
    function() {
      settings.amplitude = document.getElementById("amplitude").value;
      drawSineWave();
    },
    false
  );

  document.getElementById("velocity").addEventListener(
    "input",
    function() {
      settings.velocity = document.getElementById("velocity").value / 60;
      settings.frequency = 1 / settings.wavelength;
      settings.period = 1 / settings.frequency;
      document.getElementById("frequency").innerHTML = "frequency = " + (settings.frequency * 60 * settings.velocity).toFixed(3) + " Hz";
      document.getElementById("period").innerHTML = "peroid = " + (settings.period / 60).toFixed(3) + " s";
      drawSineWave();
    },
    false
  );

  document.getElementById("wavelength").addEventListener(
    "input",
    function() {
      settings.wavelength = document.getElementById("wavelength").value;
      settings.phase = settings.phase % settings.wavelength; //makes the switch smoother

      settings.frequency = 1 / settings.wavelength;
      settings.period = 1 / settings.frequency;
      document.getElementById("frequency").innerHTML = "frequency = " + (settings.frequency * 60 * settings.velocity).toFixed(3) + " Hz";
      document.getElementById("period").innerHTML = "peroid = " + (settings.period / 60).toFixed(3) + " s";

      drawSineWave();
    },
    false
  );
  //adds sine wave path to svg
  // function drawSineWave() {
  //   let d = "M-1 " + (-Math.sin(settings.frequency * 2 * Math.PI * (-1 + settings.phase)) * settings.amplitude + origin.y);
  //   for (let i = 0; i < settings.width; i += settings.resolution) {
  //     d += " L" + i + " " + (-Math.sin(settings.frequency * 2 * Math.PI * (i - 1 + settings.phase)) * settings.amplitude + origin.y);
  //   }
  //   // d += "L" + settings.width + "-200 L0 -200";
  //   d += "V500 L-100 500";
  //   sineWaveTarget.setAttribute("d", d);
  // }
  function drawSineWave() {
    let d = "M-1 " + (-Math.sin(settings.frequency * 2 * Math.PI * (-1 + settings.phase)) * settings.amplitude + origin.y);
    for (let x = 0; x < settings.width; x += settings.resolution) {
      d += " L" + x + " " + (-Math.sin(settings.frequency * 2 * Math.PI * (x - 1 + settings.phase)) * settings.amplitude + origin.y);
    }
    d += "V500 L-100 500";
    sineWaveTarget.setAttribute("d", d);
  }
  drawSineWave();
  function render() {
    //repeating animation function
    settings.phase -= settings.velocity;
    settings.time++;
    document.getElementById("time").innerHTML = (settings.time / 60).toFixed(1) + "s";

    // settings.baseF += 0.000015 * Math.sin(settings.time * 0.005);
    // document.getElementById("fe-turb").setAttribute("baseFrequency", settings.baseF);
    // settings.scale += 0.04 * Math.sin(settings.time * 0.005 + Math.PI);
    // document.getElementById("fe-disp").setAttribute("scale", settings.scale);

    drawSineWave();
    if (!pause) window.requestAnimationFrame(render);
  }
};
wave();
