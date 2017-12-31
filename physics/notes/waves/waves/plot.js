//  https://github.com/maurizzzio/function-plot
//  http://maurizzzio.github.io/function-plot/

functionPlot({
  width: 625,
  height: 450,
  target: "#T-vs-f",
  tip: {
    xLine: true, // dashed line parallel to y = 0
    yLine: true, // dashed line parallel to x = 0
    renderer: function(x, y, index) {
      // the returning value will be shown in the tip
    }
  },
  //   title: "frequency vs. period",
  grid: true,
  xAxis: {
    domain: [0, 6],
    label: "period (s)"
  },
  yAxis: {
    domain: [0, 4],
    label: "frequency (Hz)"
  },
  data: [
    {
      fn: "1/x"
      //   color: "#0f"
      //   closed: true
    }
  ]
});
