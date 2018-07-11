const canvas = document.getElementById("canvas-graph-1");
const ctx = canvas.getContext("2d");

funGraph(ctx, x => 1 / x / x, {
  x0: 30,
  y0: canvas.height - 30,
  scale: 50,
  xLabel: "radius (m)",
  yLabel: "force (N)"
});

// funGraph(ctx, x => x * x, {
//   //   x0: 100,
//   y0: canvas.height - 80,
//   scale: 40
// });

// funGraph(ctx, x => Math.sin(x), {
//   x0: 10,
//   y0: canvas.height - 10,
//   scale: 100,
//   color: "#f00",
//   lineWidth: 2,
//   showAxes: false,
//   showCoords: false
// });

//   ___________________animation loop ___________________
// let a = 0;
// function cycle() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   a += 0.01;
//   funGraph(ctx, x => a / x / x, {
//     x0: 10,
//     y0: canvas.height - 10,
//     scale: 100,
//     color: "#000",
//     lineWidth: 2
//   });

//   if (a < 1) requestAnimationFrame(cycle);
// }
// requestAnimationFrame(cycle);
