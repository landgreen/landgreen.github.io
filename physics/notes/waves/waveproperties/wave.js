//append new path to the SVG el
//SVG el is pass as "this" from the svg onload

function drawSineWave(el, wavelength, amplitude, phase = 0, color = "#000", opacity = 1, autoWidth = true, widthSVG = "600") {
  let width;
  if (autoWidth) {
    width = window.innerWidth;
    el.style.position = "relative";
    el.style.left = -(width - 600) / 2 + "px";
  } else {
    width = widthSVG;
  }
  el.setAttribute("width", width);

  const offset = el.getAttribute("height") / 2;
  let d = "M-1 " + (-Math.sin(2 * Math.PI / wavelength * (-1 + phase)) * amplitude + offset);

  for (let x = 0; x < width; ++x) {
    d += " L" + x + " " + (-Math.sin(2 * Math.PI / wavelength * (x - 1 + phase)) * amplitude + offset);
  }

  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  newpath.setAttributeNS(null, "id", "pathIdD");
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
    width = window.innerWidth;
    el.style.position = "relative";
    el.style.left = -(width - 600) / 2 + "px";
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
    "M-1 " + (-Math.sin(2 * Math.PI / wavelength1 * (-1 + phase1)) * amplitude1 + -Math.sin(2 * Math.PI / wavelength2 * (-1 + phase2)) * amplitude2 + offset);
  for (let x = 0; x < width; ++x) {
    d +=
      " L" +
      x +
      " " +
      (-Math.sin(2 * Math.PI / wavelength1 * (x - 1 + phase1)) * amplitude1 + -Math.sin(2 * Math.PI / wavelength2 * (x - 1 + phase2)) * amplitude2 + offset);
  }

  newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  newpath.setAttributeNS(null, "id", "pathIdD");
  newpath.setAttributeNS(null, "d", d);
  newpath.setAttributeNS(null, "stroke", color);
  newpath.setAttributeNS(null, "stroke-width", 6);
  newpath.setAttributeNS(null, "opacity", 1);
  newpath.setAttributeNS(null, "fill", "none");

  el.appendChild(newpath);
  //draw the individual waves
}
