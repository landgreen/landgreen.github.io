//  https://github.com/maurizzzio/function-plot
//  http://maurizzzio.github.io/function-plot/

functionPlot({
  width: 625,
  height: 400,
  target: "#f-v-r",
  // tip: {
  //     xLine: true, // dashed line parallel to y = 0
  //     yLine: true, // dashed line parallel to x = 0
  //     renderer: function(x, y, index) {
  //         // the returning value will be shown in the tip
  //     }
  // },
  title: "F = 1/r²",
  grid: true,
  xAxis: {
    domain: [0, 4],
    label: "radius (m)"
  },
  yAxis: {
    domain: [0, 10],
    label: "Force (N)"
  },
  data: [
    {
      fn: "1/x^2"
      //fn: '398.6*10^(12)*x^(-2)',
      // range: [0, 300000000],
      // nSamples: 4000,
      // color: '#f66',
      // closed: true
    }
  ]
  // annotations: [{
  //     x: 6373,
  //     text: 'low Earth orbit'
  // }, {
  //     x: 42164,
  //     text: 'geosynchronous orbit'
  // }, ]
});
