//  https://github.com/maurizzzio/function-plot
//  http://maurizzzio.github.io/function-plot/


functionPlot({
    width: 625,
    height: 200,
    target: '#graph1',
    // title: 'F = 1/r²',
    grid: true,
    xAxis: {
        domain: [0, 10],
        label: 'time (m)'
    },
    yAxis: {
        domain: [0, 10],
        label: 'velocity  (m/s)'
    },
    data: [{
        fn: '2/3*x',
        //fn: '398.6*10^(12)*x^(-2)',
        // range: [0, 300000000],
        // nSamples: 4000,
        // color: '#f66',
        // closed: true
    }],
    // annotations: [{
    //     x: 6373,
    //     text: 'low Earth orbit'
    // }, {
    //     x: 42164,
    //     text: 'geosynchronous orbit'
    // }, ]
});

functionPlot({
    width: 625,
    height: 200,
    target: '#graph2',
    // title: 'F = 1/r²',
    grid: true,
    xAxis: {
        domain: [0, 10],
        label: 'time (m)'
    },
    yAxis: {
        domain: [0, 10],
        label: 'velocity  (m/s)'
    },
    data: [{
        fn: '0.1*x^2',
        derivative: {
            fn: '0.1 * 2 * x',
            updateOnMouseMove: true
        }
    }],
    // annotations: [{
    //     x: 6373,
    //     text: 'low Earth orbit'
    // }, {
    //     x: 42164,
    //     text: 'geosynchronous orbit'
    // }, ]
});
