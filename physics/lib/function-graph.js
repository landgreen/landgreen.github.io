function funGraph(
  ctx,
  func,
  {
    width = ctx.canvas.width,
    height = ctx.canvas.height,
    x0 = 0.5 * width, // center point x, unscaled
    y0 = 0.5 * height, // center point y, unscaled
    color = "#07b", // color of function
    lineWidth = 2, // stroke width of function
    scale = 1, // larger numbers = zoomed in
    tickSize = 50, //spacing relative to canvas size
    showGrid = true,
    gridColor = "#eee",
    showAxes = true,
    axesLineDash = [7, 3],
    showCoords = true,
    xLabel = "",
    yLabel = "",
    markingColor = "#888",
    margin = 30,
    precision = 2,
    step = 1
  } = {}
) {
  function drawLabels() {
    if (xLabel) {
      ctx.font = "12px Arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";
      ctx.fillStyle = markingColor;
      ctx.fillText(xLabel, width - 3, height - margin - 12);
    }
    if (yLabel) {
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = markingColor;
      const x = margin + 12;
      const y = 3;
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.rotate(Math.PI / 2);
      ctx.translate(-x, -y);
    }
  }

  function drawMargin() {
    ctx.fillStyle = markingColor;
    ctx.strokeStyle = markingColor;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 0.5, 0.5, width - margin - 1, height - margin);
    //draw ticks
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";

    //y-axis, vertical ticks
    for (let i = 0, len = Math.ceil(height / tickSize); i < len; i++) {
      ctx.beginPath();
      const yTick = i * tickSize + 0.5;
      const xTick = margin;
      if (showGrid) {
        ctx.moveTo(xTick, yTick);
        ctx.lineTo(width, yTick);
      } else {
        ctx.moveTo(xTick + 4, yTick);
        ctx.lineTo(xTick, yTick);
      }

      ctx.stroke();
      ctx.fillText(((y0 - i * tickSize) / scale).toPrecision(precision), xTick - 5, i * tickSize);
    }
    // x-axis, horizontal ticks
    ctx.textAlign = "center";
    for (let i = 0, len = 1 + Math.ceil((width - margin) / tickSize); i < len; i++) {
      ctx.beginPath();
      const xTick = (i + 1) * tickSize + 0.5;
      const yTick = height - margin;

      if (showGrid) {
        ctx.moveTo(xTick, 0);
        ctx.lineTo(xTick, yTick);
      } else {
        ctx.moveTo(xTick, yTick);
        ctx.lineTo(xTick, yTick - 4);
      }

      ctx.stroke();
      ctx.fillText((((i + 1) * tickSize - x0) / scale).toPrecision(precision), xTick, yTick + 10);
    }
  }

  function drawAxes() {
    if (showAxes) {
      ctx.beginPath();
      // horizontal, X axis
      if (y0 < height - margin) {
        ctx.moveTo(margin, y0 + 0.5);
        ctx.lineTo(width, y0 + 0.5);
      }
      // vertical, Y axis
      if (x0 > margin) {
        ctx.moveTo(x0 + 0.5, 0);
        ctx.lineTo(x0 + 0.5, height - margin);
      }

      ctx.strokeStyle = markingColor;
      ctx.lineWidth = 1;
      ctx.setLineDash(axesLineDash);
      ctx.stroke();
      ctx.setLineDash([0, 0]);
    }
  }

  function drawFunction() {
    //limit function to just the part of the canvas for the graph with a clipped path
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height - margin);
    ctx.lineTo(width, height - margin);
    ctx.lineTo(width, 0);
    ctx.clip();

    //draw the function by calculating each pixel's y-value for each x-value
    const iMax = Math.round((width - x0) / step);
    const iMin = Math.round((margin - x0) / step);
    let xx, yy;
    ctx.beginPath();
    for (let i = iMin; i <= iMax; i++) {
      xx = step * i;
      yy = scale * func(xx / scale);
      if (i == iMin) ctx.moveTo(x0 + xx, y0 - yy);
      else ctx.lineTo(x0 + xx, y0 - yy);
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  //mouse over show value of function
  if (showCoords) {
    canvas.addEventListener("mousemove", event => {
      let rect = canvas.getBoundingClientRect();
      let mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      if (mouse.x > margin) {
        //redraw graph
        ctx.clearRect(0, 0, width, height);

        drawMargin();
        drawAxes();
        drawLabels();
        drawFunction();

        //draw mouse location as a circle
        ctx.beginPath();
        coords = {
          x: mouse.x,
          y: y0 - scale * func((mouse.x - x0) / scale)
        };
        ctx.arc(coords.x, coords.y, 2 + lineWidth, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        //draw coordinates as text
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = markingColor;
        ctx.fillText(`(${((coords.x - x0) / scale).toPrecision(precision)}, ${((y0 - coords.y) / scale).toPrecision(precision)})`, mouse.x + 5, coords.y - 10);
      }
    });
  }
  drawMargin();
  drawAxes();
  drawLabels();
  drawFunction();
}
