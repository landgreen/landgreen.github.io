const wave = function () {
  const sineWaveTarget = document.getElementById("wave-form-path");
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
    width: document.body.clientWidth,
    time: 0,
    baseF: 0.02,
    scale: 24
  };
  document.getElementById("sin-wave").setAttribute("width", settings.width);

  let pause = true;
  const elZone = document.getElementById("sine-wave-zone");
  elZone.addEventListener("mouseleave", () => {
    pause = true;
  });
  elZone.addEventListener("mouseenter", () => {
    if (pause) {
      pause = false;
      requestAnimationFrame(cycle);
    }
  });

  document.getElementById("amplitude").value = settings.amplitude / 100;
  document.getElementById("velocity").value = settings.velocity / 100;
  document.getElementById("wavelength").value = settings.wavelength / 100;
  document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
  document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
  settings.phase = settings.phase % settings.wavelength; //makes the switch smoother

  function waveEquation() {
    const a = (settings.amplitude / 100).toFixed(1)
    const w = (settings.wavelength / 100).toFixed(1)
    const p = (settings.phase / 100).toFixed(1)
    document.getElementById("wave-equation").innerHTML = `(${a})sin((2π/${w})(x-${p})   )`
  }

  document.getElementById("amplitude").addEventListener("input", () => {
    settings.amplitude = Number(document.getElementById("amplitude").value) * 100;
    document.getElementById("amplitude-slider").value = settings.amplitude / 100
    draw()
  }, false);

  document.getElementById("amplitude-slider").addEventListener("input", () => {
    settings.amplitude = Number(document.getElementById("amplitude-slider").value) * 100;
    document.getElementById("amplitude").value = settings.amplitude / 100
    draw()
  }, false);


  document.getElementById("velocity").addEventListener("input", () => {
    settings.velocity = Number(document.getElementById("velocity").value) * 100;
    document.getElementById("velocity-slider").value = settings.velocity / 100
    settings.frequency = settings.velocity / settings.wavelength;
    settings.period = 1 / settings.frequency;
    document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
    draw()
  }, false);

  document.getElementById("velocity-slider").addEventListener("input", () => {
    settings.velocity = Number(document.getElementById("velocity-slider").value) * 100;
    document.getElementById("velocity").value = settings.velocity / 100
    settings.frequency = settings.velocity / settings.wavelength;
    settings.period = 1 / settings.frequency;
    document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
    draw()
  }, false);


  document.getElementById("wavelength").addEventListener("input", () => {
    settings.wavelength = Math.max(Number(document.getElementById("wavelength").value) * 100, 1);
    document.getElementById("wavelength-slider").value = settings.wavelength / 100
    settings.phase = settings.phase % settings.wavelength; //makes the switch smoother
    settings.frequency = settings.velocity / settings.wavelength;
    settings.period = 1 / settings.frequency;
    document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
    draw()
  }, false);

  document.getElementById("wavelength-slider").addEventListener("input", () => {
    settings.wavelength = Math.max(Number(document.getElementById("wavelength-slider").value) * 100, 1);
    document.getElementById("wavelength").value = settings.wavelength / 100
    settings.phase = settings.phase % settings.wavelength; //makes the switch smoother
    settings.frequency = settings.velocity / settings.wavelength;
    settings.period = 1 / settings.frequency;
    document.getElementById("frequency").innerHTML = "frequency = " + settings.frequency.toFixed(3) + " Hz";
    document.getElementById("period").innerHTML = "period = " + settings.period.toFixed(3) + " s";
    draw()
  }, false);

  let draw = drawSineWave
  draw()

  document.getElementById("waveform-select").addEventListener("input", () => {
    const form = document.getElementById("waveform-select").value
    if (form === "sine") {
      draw = drawSineWave
      sineWaveTarget.style.strokeLinejoin = "miter"
      // stroke-linejoin="round"
    } else if (form === "square") {
      draw = drawSquareWave
      sineWaveTarget.style.strokeLinejoin = "round"
    } else if (form === "triangle") {
      draw = drawTriangleWave
      sineWaveTarget.style.strokeLinejoin = "round"
    } else if (form === "sawtooth") {
      draw = drawSawtoothWave
      sineWaveTarget.style.strokeLinejoin = "round"
    }
    draw()
  }, false);

  function drawSineWave() {
    let d = "M-1 " + (Math.sin(((2 * Math.PI) / settings.wavelength) * (1 - settings.phase)) * settings.amplitude + origin.y);
    for (let x = 0; x < settings.width; ++x) {
      d += " L" + x + " " + (Math.sin(((2 * Math.PI) / settings.wavelength) * (x + 1 - settings.phase)) * settings.amplitude + origin.y);
    }
    d += "h20 V500 L-100 500";
    sineWaveTarget.setAttribute("d", d);
  }

  function drawSquareWave() {
    const phase = settings.phase % settings.wavelength - settings.wavelength
    const len = 2 * settings.width / settings.wavelength + 2
    let d = `M ${phase} ${origin.y + settings.amplitude} `;
    for (let i = 0; i < len; i++) {
      d += `h ${settings.wavelength/2} `;

      if (i % 2) {
        d += `v ${settings.amplitude*2} `;
      } else {
        d += `v ${-settings.amplitude*2} `;
      }
    }
    sineWaveTarget.setAttribute("d", d);
  }

  function drawTriangleWave() {
    const phase = settings.phase % settings.wavelength - settings.wavelength * 5 / 4
    const len = settings.width / settings.wavelength + 1
    let d = `M ${phase} ${origin.y - settings.amplitude} `;
    for (let i = 0; i < len; i++) {
      d += `l ${settings.wavelength/2} ${settings.amplitude*2} `
      d += `l ${settings.wavelength/2} ${-settings.amplitude*2} `
    }
    sineWaveTarget.setAttribute("d", d);
  }

  function drawSawtoothWave() {
    const phase = settings.phase % settings.wavelength - settings.wavelength
    const len = settings.width / settings.wavelength + 1
    let d = `M ${phase} ${origin.y + settings.amplitude} `;
    for (let i = 0; i < len; i++) {
      d += `l ${settings.wavelength} ${-settings.amplitude*2} `
      d += `v ${settings.amplitude*2} `
    }
    sineWaveTarget.setAttribute("d", d);
  }

  const fpsCap = 60;
  const fpsInterval = 1000 / fpsCap;
  let then = Date.now();

  function cycle() {
    if (!pause) requestAnimationFrame(cycle);
    const now = Date.now();
    const elapsed = now - then; // calc elapsed time since last loop
    if (elapsed > fpsInterval) { // if enough time has elapsed, draw the next frame
      then = now - (elapsed % fpsInterval); // Get ready for next frame by setting then=now.   Also, adjust for fpsInterval not being multiple of 16.67

      //frame capped code here
      settings.phase += settings.velocity / 60;
      settings.time += 1 / 60;
      document.getElementById("time").innerHTML = settings.time.toFixed(1) + " s";
      draw();
    }
  }
  requestAnimationFrame(cycle); //starts game loop

};
wave();