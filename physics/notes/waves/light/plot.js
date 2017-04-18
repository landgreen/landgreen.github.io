functionPlot({
    width: 600,
    height: 450,
    target: '#bb-rad',
    title: 'spectral radiance vs wavelength',
    grid: true,
    yAxis: {
        domain: [0, 100],
        label: 'spectral radiance'
    },
    xAxis: {
        domain: [0.01, 0.5],
        label: 'wavelength'
    },
    data: [{
        fn: 'x^-5/(exp(1/x/1.4)-1)',
		range: [0, 1],
        // nSamples: 4000,
        // color: '#f66',
        closed: true
    }, {
		fn: 'x^-5/(exp(1/x/1.3)-1)',
		range: [0, 1],
        // nSamples: 4000,
        // color: '#f00',
        closed: true
    }, {
        fn: 'x^-5/(exp(1/x/1.2)-1)',
		range: [0, 1],
        // nSamples: 4000,
        // color: '#f00',
        closed: true
    }, {
        fn: 'x^-5/(exp(1/x)-1)',
		range: [0, 1],
        // color: '#930',
        closed: true
    }],
});
