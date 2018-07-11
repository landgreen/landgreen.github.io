function funGraph(ctx, func, prop) {
  //default settings
  if (!prop.x0) prop.x0 = 0.5 + 0.5 * canvas.width;
  if (!prop.y0) prop.y0 = 0.5 + 0.5 * canvas.height;
  if (!prop.scale) prop.scale = 1;
  if (!prop.color) prop.color = "#000";
  if (!prop.lineDash) prop.lineDash = [5, 5];
  if (!prop.thickness) prop.thickness = 1;

  //draw function
  const dx = 4,
    x0 = prop.x0,
    y0 = prop.y0,
    iMax = Math.round((ctx.canvas.width - x0) / dx),
    iMin = Math.round(-x0 / dx);
  let xx, yy;
  ctx.beginPath();
  for (let i = iMin; i <= iMax; i++) {
    xx = dx * i;
    yy = prop.scale * func(xx / prop.scale);
    if (i == iMin) ctx.moveTo(x0 + xx, y0 - yy);
    else ctx.lineTo(x0 + xx, y0 - yy);
  }
  ctx.lineWidth = prop.thickness;
  ctx.strokeStyle = prop.color;
  ctx.stroke();

  if (!prop.hideAxes) {
    const x0 = prop.x0,
      w = ctx.canvas.width,
      y0 = prop.y0,
      h = ctx.canvas.height,
      xmin = 0;
    ctx.beginPath();
    ctx.moveTo(xmin, y0);
    ctx.lineTo(w, y0); // X axis
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, h); // Y axis
    ctx.strokeStyle = "#888";
    ctx.lineWidth = prop.thickness;
    ctx.setLineDash(prop.lineDash);
    ctx.stroke();
    ctx.setLineDash([0, 0]);
  }
}

const canvas = document.getElementById("graph0");
const ctx = canvas.getContext("2d");

//___________________ static equation graph ___________________

const prop = {
  // hideAxes: false,
  // x0: 0.5 + 0.5 * canvas.width,
  // y0: 0.5 + 0.5 * canvas.height,
  scale: 40,
  color: "#f00"
  // lineDash: [5, 5],
  // thickness: 1
};

funGraph(ctx, x => x * x, prop);
// funGraph(ctx, axes, x => Math.sin(x), "#f00", 3);

//___________________animation loop ___________________
// let a = 0;
// function cycle() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   funGraph(ctx, axes, x => x * x, "#00f", 2);
//   a += 0.01;
//   funGraph(ctx, axes, x => a * Math.sin(x), "#f00", 3);
//   if (a < 2) requestAnimationFrame(cycle);
// }
// requestAnimationFrame(cycle);
