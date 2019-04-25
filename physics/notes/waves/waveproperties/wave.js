//adds a equalibirum line
function centerLine(el) {
  const width = el.getAttribute("width");
  const height = el.getAttribute("height") / 2;
  const d = "M0 " + height + " L" + width + " " + height;
  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // newpath.setAttributeNS(null, "id", "pathIdD");
  newpath.setAttributeNS(null, "d", d);
  newpath.setAttributeNS(null, "stroke", "#000");
  newpath.setAttributeNS(null, "stroke-width", 1);
  newpath.setAttributeNS(null, "opacity", 0.3);
  newpath.setAttributeNS(null, "fill", "none");
  newpath.setAttributeNS(null, "stroke-dasharray", "5,5");
  el.appendChild(newpath);
}

//draws sin waves to an SVG
//called onload in SVG with this passing into el
function drawSineWave(el, wavelength, amplitude, phase = 0, color = "#000", opacity = 1, autoWidth = true, widthSVG = "600") {
  let width;
  if (autoWidth) {
    width = screen.width - 5; //window.innerWidth;
    el.style.position = "relative";
    el.style.left = Math.min(-(width - 600) / 2, 0) + "px";
  } else {
    width = widthSVG;
  }
  el.setAttribute("width", width);

  const offset = el.getAttribute("height") / 2;
  let d = "M-1 " + (-Math.sin(((2 * Math.PI) / wavelength) * (-1 + phase)) * amplitude + offset);

  for (let x = 0; x < width; ++x) {
    d += " L" + x + " " + (-Math.sin(((2 * Math.PI) / wavelength) * (x - 1 + phase)) * amplitude + offset);
  }

  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // newpath.setAttributeNS(null, "id", "pathIdD");
  newpath.setAttributeNS(null, "d", d);
  newpath.setAttributeNS(null, "stroke", color);
  newpath.setAttributeNS(null, "stroke-width", 4);
  newpath.setAttributeNS(null, "opacity", opacity);
  newpath.setAttributeNS(null, "fill", "none");

  el.appendChild(newpath);
}

function drawSineWaves(
  el,
  wavelength1,
  amplitude1,
  phase1,
  color1,
  wavelength2,
  amplitude2,
  phase2,
  color2,
  color = "#000",
  superposition = true,
  autoWidth = true,
  widthSVG = "600"
) {
  let width;
  if (autoWidth) {
    // width = window.innerWidth;
    width = screen.width - 5;
    el.style.position = "relative";
    el.style.left = Math.min(-(width - 600) / 2, 0) + "px";
  } else {
    width = widthSVG;
  }
  el.setAttribute("width", width);

  if (superposition) {
    drawSineWave(el, wavelength1, amplitude1, phase1, color1, 0.2);
    drawSineWave(el, wavelength2, amplitude2, phase2, color2, 0.2);
  }

  const offset = el.getAttribute("height") / 2;
  let d =
    "M-1 " +
    (-Math.sin(((2 * Math.PI) / wavelength1) * (-1 + phase1)) * amplitude1 + -Math.sin(((2 * Math.PI) / wavelength2) * (-1 + phase2)) * amplitude2 + offset);
  for (let x = 0; x < width; ++x) {
    d +=
      " L" +
      x +
      " " +
      (-Math.sin(((2 * Math.PI) / wavelength1) * (x - 1 + phase1)) * amplitude1 +
        -Math.sin(((2 * Math.PI) / wavelength2) * (x - 1 + phase2)) * amplitude2 +
        offset);
  }

  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // newpath.setAttributeNS(null, "id", "pathIdD");
  newpath.setAttributeNS(null, "d", d);
  newpath.setAttributeNS(null, "stroke", color);
  newpath.setAttributeNS(null, "stroke-width", 6);
  newpath.setAttributeNS(null, "opacity", 1);
  newpath.setAttributeNS(null, "fill", "none");

  el.appendChild(newpath);
  //draw the individual waves
}

function AppendSinePath(el, wavelength, amplitude, phase = 0, color = "#000", opacity = 1) {
  // let width = window.innerWidth;
  let width = screen.width - 5;
  el.style.position = "relative";
  el.style.left = Math.min(-(width - 600) / 2, 0) + "px";

  const offset = el.getAttribute("height") / 2;
  let d = "M-1 " + (-Math.sin(((2 * Math.PI) / wavelength) * (-1 + phase)) * amplitude + offset);
  for (let x = 0; x < width; ++x) {
    d += " L" + x + " " + (-Math.sin(((2 * Math.PI) / wavelength) * (x - 1 + phase)) * amplitude + offset);
  }

  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // newpath.setAttributeNS(null, "id", "pathIdD");
  newpath.setAttributeNS(null, "d", d);
  newpath.setAttributeNS(null, "stroke", color);
  newpath.setAttributeNS(null, "stroke-width", 4);
  newpath.setAttributeNS(null, "opacity", opacity);
  newpath.setAttributeNS(null, "fill", "none");
  el.appendChild(newpath);
}

function drawSineWavesArray(el, waves, superposition = true, autoWidth = true, widthSVG = "600") {
  let width;
  if (autoWidth) {
    width = screen.width - 5;
    // width = window.innerWidth;
    el.style.position = "relative";
    el.style.left = Math.min(-(width - 600) / 2, 0) + "px";
  } else {
    width = widthSVG;
  }
  el.setAttribute("width", width);

  if (superposition) {
    const offset = el.getAttribute("height") / 2;

    //calculate wave starting position
    let d = "M-1 ";
    let amp = offset;
    for (let i = 0; i < waves.length; ++i) {
      amp += -Math.sin(((2 * Math.PI) / waves[i].wavelength) * (-1 + waves[i].phase)) * waves[i].amplitude;
    }
    d += amp;

    //calculate wave position
    for (let x = 0; x < width; ++x) {
      let amp = offset;
      for (let i = 0; i < waves.length; ++i) {
        amp += -Math.sin(((2 * Math.PI) / waves[i].wavelength) * (x - 1 + waves[i].phase)) * waves[i].amplitude;
      }
      d += " L" + x + " " + amp;
    }
    //set wave  position
    newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // newpath.setAttributeNS(null, "id", "pathIdD");
    newpath.setAttributeNS(null, "d", d);
    newpath.setAttributeNS(null, "stroke", "#000");
    newpath.setAttributeNS(null, "stroke-width", 6);
    newpath.setAttributeNS(null, "opacity", 1);
    newpath.setAttributeNS(null, "fill", "none");
    el.appendChild(newpath);
  }

  for (let i = 0; i < waves.length; ++i) {
    AppendSinePath(el, waves[i].wavelength, waves[i].amplitude, waves[i].phase, waves[i].color, waves[i].opacity);
  }
}