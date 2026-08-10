/*
https://www.famaf.unc.edu.ar/~gcas/cuantica1/frabboni12-young_e-.pdf
http://web.mit.edu/viz/EM/visualizations/notes/modules/guide14.pdf
https://www.geogebra.org/m/ZSbeWGbe
https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_University_Physics_(OpenStax)/Map%3A_University_Physics_III_-_Optics_and_Modern_Physics_(OpenStax)/04%3A_Diffraction/4.03%3A_Intensity_in_Single-Slit_Diffraction

*/

(function doubleSlit() {
    const HITS = document.getElementById('double-slit-hits'); //Get svg element
    const xMag = 290
    const xMeasure = 130
    const height = 150
    const step = 0.5 //1, 0.5, 0.25, 0.125, 0.0625 work for electron stacks
    const emissionTotal = 1600
    const randomEmitterColor = () => "hsl(" + (180 + 190 * Math.random()) + ",100%,50%)"
    const markerFlashCycles = () => document.getElementById("slit-one-checkbox").checked ? 1 : 3

    let isBlocked = false;
    let wavelength = 0.2 //checked
    let separation = 2; //checked
    let slitWidth = 0.5; //checked
    let distance = 100;

    const wave = {
        array: [],
        calculate() { //fill an array for each point on the wave function
            wavelength = Math.max(0.01, Number(document.getElementById("slit-wavelength").value))
            slitWidth = Math.max(0.01, Number(document.getElementById("slit-slitWidth").value))
            separation = Math.max(slitWidth, Number(document.getElementById("slit-separation").value))
            document.getElementById("slit-separation").value = separation
            // distance = Math.max(1, Number(document.getElementById("slit-distance").value))

            const edge = 74 - slitWidth / 2 - separation / 2
            const slitGap = separation - slitWidth
            if (isBlocked) {
                // const slit = `M${130-Math.min(108,distance)} 1 v73.5 m0 ${slitWidth} v73.5`
                const slit = `M${140 - Math.min(108, distance)} 1 v${edge} h-1 v${slitWidth} h1 v${slitGap} m0 ${slitWidth} v${edge}`
                document.getElementById("slit").setAttribute("d", slit);
            } else {
                const slit = `M${140 - Math.min(108, distance)} 1 v${edge} m0 ${slitWidth} v${slitGap} m0 ${slitWidth} v${edge}`
                document.getElementById("slit").setAttribute("d", slit);
            }


            wave.emitIndex = 0;
            wave.stacks = Array(height).fill(0);
            wave.emissionOrder = [];
            wave.array = [];


            for (let y = 3; y < height - 3; y += step) {
                const yOff = (height / 2 - y) + (isBlocked ? separation / 2 : 0)
                const sinTheta = yOff / Math.hypot(distance, yOff)
                const beta = Math.PI * slitWidth * sinTheta / wavelength
                const diffraction = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2)
                const alpha = Math.PI * separation * sinTheta / wavelength
                const interference = Math.pow(Math.cos(alpha), 2)
                const probabilityDensity = 50 * diffraction * (isBlocked ? 1 : interference)

                wave.array.push(probabilityDensity)
                const wholeHits = Math.floor(probabilityDensity)
                const hitCount = wholeHits + (Math.random() < probabilityDensity - wholeHits ? 1 : 0)
                for (let i = 0; i < hitCount; i++) {
                    wave.emissionOrder.push(y)
                }
            }
            wave.emissionOrder = shuffle(wave.emissionOrder)
            //render
            wave.dMag = `M ${xMag} -1`
            for (let i = 0; i < wave.array.length; i++) {
                const y = i * step
                wave.dMag += `L${xMag + wave.array[i]} ${y + 2}`
            }
            wave.dMag += `L${xMag}, ${height + 1}`
            document.getElementById("double-slit-probability-function").setAttribute("d", wave.dMag);
        },
        dWave: "",
        dMag: "",
        emitIndex: 0,
        emissionOrder: [],
        stacks: [],
        flashingMarkers: [],
        advanceMarkerFlashes() {
            for (let i = wave.flashingMarkers.length - 1; i >= 0; i--) {
                const marker = wave.flashingMarkers[i]
                marker.cyclesRemaining--
                if (marker.cyclesRemaining <= 0) {
                    marker.element.style.fill = marker.normalColor
                    wave.flashingMarkers.splice(i, 1)
                }
            }
        },
        finishMarkerFlashes() {
            for (const marker of wave.flashingMarkers) {
                marker.element.style.fill = marker.normalColor
            }
            wave.flashingMarkers = []
        },
        flashMarker(element, normalColor, flashColor) {
            element.style.fill = flashColor || normalColor
            if (flashColor) {
                wave.flashingMarkers.push({
                    element,
                    normalColor,
                    cyclesRemaining: markerFlashCycles()
                })
            }
        },
        emit(flashColor = randomEmitterColor()) { //draw an electron dot at a random
            // const index = Math.floor(Math.random() * wave.emissionOrder.length)
            const y = wave.emissionOrder[wave.emitIndex]

            //random hits
            var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            newElement.setAttribute("cx", xMeasure + 5 + 20 * (Math.random() - 0.5) * (Math.random() - 0.5));
            newElement.setAttribute("cy", y + 0.1 * (Math.random() - 0.5));
            newElement.setAttribute("r", "0.6");
            newElement.setAttribute("opacity", "0.4");
            wave.flashMarker(newElement, "#345", flashColor);
            newElement.style.strokeWidth = "0px";
            HITS.appendChild(newElement);
            //stacked and organized hits
            var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            newElement2.setAttribute("x", xMeasure + 15 + wave.stacks[Math.floor(y)]);
            newElement2.setAttribute("y", Math.floor(y));
            newElement2.setAttribute("width", "0.7");
            newElement2.setAttribute("height", "0.7");
            wave.flashMarker(newElement2, "#def", flashColor);
            newElement2.style.strokeWidth = "0px";
            HITS.appendChild(newElement2);

            wave.stacks[Math.floor(y)]++
            wave.emitIndex++
            if (wave.emitIndex >= wave.emissionOrder.length) wave.emitIndex = 0 //restart cycling through the array if you get to the end
        },
        fire() {
            if (isClearToEmit) {
                isClearToEmit = false
                wave.calculate();
                HITS.innerHTML = "";
                let count = 0;

                const emitAtATime = (document.getElementById("slit-one-checkbox").checked) ? 1 : 5
                document.getElementById("double-slit-emitter").style.fill = "#f05"
                requestAnimationFrame(cycle);

                function cycle() {
                    wave.advanceMarkerFlashes()
                    if (count < emissionTotal) {
                        const cycleColor = randomEmitterColor()
                        for (let i = 0; i < emitAtATime; i++) {
                            count++
                            wave.emit(cycleColor)
                        }
                        if (isClearToEmit) {
                            wave.finishMarkerFlashes()
                            document.getElementById("double-slit-emitter").style.fill = "#89a"
                        } else {
                            document.getElementById("double-slit-emitter").style.fill = cycleColor
                            if (emitAtATime === 1) {
                                setTimeout(function () {
                                    requestAnimationFrame(cycle);
                                }, 500);
                            } else {
                                requestAnimationFrame(cycle);
                            }

                        }
                    } else if (wave.flashingMarkers.length) {
                        requestAnimationFrame(cycle)
                    } else {
                        isClearToEmit = true;
                        document.getElementById("double-slit-emitter").style.fill = "#89a"
                    }
                }
            } else {
                isClearToEmit = true;
            }
        }
    }

    document.getElementById("slit-blocked-checkbox").addEventListener("input", () => {
        if (document.getElementById("slit-blocked-checkbox").checked) {
            isBlocked = true;
        } else {
            isBlocked = false;
        }
        wave.calculate()
    });


    let isClearToEmit = true;

    document.getElementById("double-slit-button").addEventListener("click", () => { //animate electron emission
        wave.fire();
    });
    document.getElementById("double-slit").addEventListener("click", () => { //animate electron emission
        wave.fire();
    });

    // document.getElementById("slit-distance").value = distance
    document.getElementById("slit-separation").value = separation
    document.getElementById("slit-wavelength").value = wavelength
    document.getElementById("slit-slitWidth").value = slitWidth
    // document.getElementById("slit-distance").addEventListener("change", wave.calculate);
    document.getElementById("slit-separation").addEventListener("change", wave.calculate);
    document.getElementById("slit-wavelength").addEventListener("change", wave.calculate);
    document.getElementById("slit-slitWidth").addEventListener("change", wave.calculate);

    wave.calculate();
    HITS.innerHTML = "";
    for (let i = 0; i < emissionTotal; i++) {
        wave.emit(null)
    }
    // requestAnimationFrame(animate);
    // function animate() {
    //     phase += 2
    //     wave.calculate();
    //     requestAnimationFrame(animate);
    // }
})()


function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
