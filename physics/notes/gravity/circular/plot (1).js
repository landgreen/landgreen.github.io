//  https://github.com/maurizzzio/function-plot
//  http://maurizzzio.github.io/function-plot/


functionPlot({
    width: 625,
    height: 450,
    target: '#v-vs-r',
    tip: {
        xLine: true, // dashed line parallel to y = 0
        yLine: true, // dashed line parallel to x = 0
        renderer: function(x, y, index) {
            // the returning value will be shown in the tip
        }
    },
    // title: 'orbital velocity vs radius for a satellite of Earth',
    // grid: true,
    xAxis: {
        domain: [1, 50000],
        label: 'radius (km)'
    },
    yAxis: {
        domain: [1, 13],
        label: 'velocity (km/s)'
    },
    data: [{
        fn: '19.964 * 10^3 / nthRoot(x*1000, 2)',
        //fn: '398.6*10^(12)*x^(-2)',
        // range: [0, 300000000],
        // nSamples: 4000,
        // color: '#f66',
        // closed: true
    }],
    annotations: [{
        //     x: 6371000,
        // 	text: 'surface of Earth'
        // },{
        x: 400000,
        text: 'moon'
    }, {
        x: 6373,
        text: 'low Earth orbit'
    }, {
        x: 42164,
        text: 'geosynchronous orbit'
    }, ]
});
