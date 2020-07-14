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

    let isBlocked = false;
    let wavelength = 0.201 //checked
    let separation = 5; //checked
    let slitWidth = 0.5; //checked
    let distance = 100;

    const wave = {
        array: [],
        calculate() { //fill an array for each point on the wave function
            wavelength = Math.max(0.01, Number(document.getElementById("slit-wavelength").value))
            separation = Math.max(0.01, Number(document.getElementById("slit-separation").value))
            slitWidth = Math.max(0.01, Number(document.getElementById("slit-slitWidth").value))
            // distance = Math.max(1, Number(document.getElementById("slit-distance").value))

            const edge = 74 - slitWidth - separation / 2
            if (isBlocked) {
                // const slit = `M${130-Math.min(108,distance)} 1 v73.5 m0 ${slitWidth} v73.5`
                const slit = `M${140-Math.min(108,distance)} 1 v${edge} h-1 v${slitWidth} h1 v${separation} m0 ${slitWidth} v${edge}`
                document.getElementById("slit").setAttribute("d", slit);
            } else {
                const slit = `M${140-Math.min(108,distance)} 1 v${edge} m0 ${slitWidth} v${separation} m0 ${slitWidth} v${edge}`
                document.getElementById("slit").setAttribute("d", slit);
            }


            wave.emitIndex = 0;
            wave.stacks = [];
            wave.emissionOrder = [];
            wave.array = [];


            for (let y = 3; y < height - 3; y += step) {
                // const hyp1 = Math.sqrt(distance * distance + yOff1 * yOff1)
                // const wave1 = wave.isSlit1 * amplitude * Math.sin(hyp1 / wavelength + phase) / hyp1 / hyp1
                // const wave2 =  wave.isSlit2 * amplitude * Math.sin(hyp2 / wavelength + phase) / hyp2 / hyp2
                // const hyp2 = Math.sqrt(distance * distance + yOff2 * yOff2)

                // const y1 = height / 2 - y - separation
                // let B1 = amplitude * Math.PI * slitWidth / wavelength * Math.sin(y1 / distance)
                // if (B1 === 0) B1 = 0.001
                // const diffraction1 = 20 * Math.sin(B1) / B1 * Math.sin(B1) / B1
                // const wave1 = diffraction1

                // const y2 = height / 2 - y + separation
                // let B2 = amplitude * Math.PI * slitWidth / wavelength * Math.sin(y2 / distance)
                // if (B2 === 0) B2 = 0.001
                // const diffraction2 = 20 * Math.sin(B1) / B1 * Math.sin(B1) / B1
                // const wave2 = diffraction2
                // const superposition = (wave1 + wave2) * Math.cos(height / 2 - y)
                // wave.array.push(superposition)

                // const yOff = (height / 2 - y)
                // let B = Math.PI * slitWidth / wavelength * Math.sin(yOff / distance)
                // if (B === 0) B = 0.001
                // const diffraction = Math.sin(B) / B * Math.sin(B) / B
                // const interference = separation / wavelength * Math.sin(yOff)
                // // const r2RuleDistance = (distance * distance) / (distance * distance + yOff * yOff)
                // const superposition = amplitude * diffraction * (isBlocked ? 1 : interference)

                const yOff = (height / 2 - y) + (isBlocked ? separation / 2 : 0)
                let B = Math.PI * slitWidth / wavelength * Math.sin(yOff / distance)
                if (B === 0) B = 0.001
                const diffraction = Math.sin(B) / B * Math.sin(B) / B
                const interference = Math.cos(yOff * separation / wavelength)
                const superposition = 50 * diffraction * (isBlocked ? 1 : interference)

                wave.array.push(superposition)
                let mag = Math.abs(superposition)
                for (let i = 0; i < mag; i++) {
                    if (Math.random() < mag) {
                        wave.emissionOrder.push(y)
                        wave.stacks.push(0)
                    }
                }
            }
            // for (let y = 1; y < height - 1; y += step) {
            //     // phase = 2 * Math.PI * Math.random()
            //     const yOff1 = height / 2 - y - separation
            //     // const hyp1 = Math.sqrt(distance * distance + yOff1 * yOff1)
            //     // const wave1 = wave.isSlit1 * amplitude * Math.sin(hyp1 / wavelength + phase) / hyp1 / hyp1

            //     const yOff2 = height / 2 - y + separation
            //     // const hyp2 = Math.sqrt(distance * distance + yOff2 * yOff2)
            //     // const wave2 = wave.isSlit2 * amplitude * Math.sin(hyp2 / wavelength + phase) / hyp2 / hyp2
            //     // const superPosition = wave1 + wave2

            //     let B = Math.PI * 10 / wavelength * Math.sin(yOff1 * 0.01)
            //     if (B === 0) B = 0.001
            //     const wave1 = Math.sin(B) / B * Math.sin(B) / B
            //     const superPosition = wave1

            //     wave.array.push(superPosition)
            //     // console.log(hyp1 === hyp2, hyp1, hyp2, yOff1, yOff2)
            //     const mag = Math.abs(superPosition)
            //     for (let i = 0; i < mag; i++) {
            //         wave.emissionOrder.push(y)
            //         wave.stacks.push(0)
            //     }
            // }
            wave.emissionOrder = shuffle(wave.emissionOrder)
            //render
            // wave.dWave = `M ${x} -1`
            wave.dMag = `M ${xMag} -1`
            for (let i = 0; i < wave.array.length; i++) {
                const y = i * step
                // wave.dWave += `L${x+wave.array[i]} ${y}`
                wave.dMag += `L${xMag+Math.abs(wave.array[i])} ${y+2}`
            }
            wave.dMag += `L${xMag}, ${height+1}`
            // document.getElementById("double-slit-wave-function").setAttribute("d", wave.dWave);
            document.getElementById("double-slit-probability-function").setAttribute("d", wave.dMag);
        },
        dWave: "",
        dMag: "",
        emitIndex: 0,
        emissionOrder: [],
        stacks: [],
        emit() { //draw an electron dot at a random 
            // const index = Math.floor(Math.random() * wave.emissionOrder.length)
            const y = wave.emissionOrder[wave.emitIndex]

            //random hits
            var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            newElement.setAttribute("cx", xMeasure + 5 + 20 * (Math.random() - 0.5) * (Math.random() - 0.5));
            newElement.setAttribute("cy", y + 0.1 * (Math.random() - 0.5));
            newElement.setAttribute("r", "0.6");
            newElement.setAttribute("opacity", "0.4");
            newElement.style.fill = "#345";
            newElement.style.strokeWidth = "0px";
            HITS.appendChild(newElement);
            //stacked and organized hits
            var newElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            newElement2.setAttribute("x", xMeasure + 15 + wave.stacks[Math.floor(y)]);
            newElement2.setAttribute("y", Math.floor(y));
            newElement2.setAttribute("width", "0.7");
            newElement2.setAttribute("height", "0.7");
            newElement2.style.fill = "#def";
            newElement2.style.strokeWidth = "0px";
            HITS.appendChild(newElement2);

            wave.stacks[Math.floor(y)]++
            wave.emitIndex++
            if (wave.emitIndex > wave.emissionOrder.length) wave.emitIndex = 0 //restart cycling through the array if you get to the end
        },
        fire() {
            if (isClearToEmit) {
                isClearToEmit = false
                wave.calculate();
                HITS.innerHTML = "";
                let count = 0;

                const emitAtATime = (document.getElementById("slit-one-checkbox").checked) ? 1 : 15
                document.getElementById("double-slit-emitter").style.fill = "#f05"
                requestAnimationFrame(cycle);

                function cycle() {
                    if (count < emissionTotal) {
                        for (let i = 0; i < emitAtATime; i++) {
                            count++
                            wave.emit()
                        }
                        if (isClearToEmit) {
                            document.getElementById("double-slit-emitter").style.fill = "#89a"
                        } else {
                            document.getElementById("double-slit-emitter").style.fill = "hsl(" + (180 + 190 * Math.random()) + "," + "100%," + "50%)" //"#f05"
                            requestAnimationFrame(cycle);
                        }
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
        wave.emit()
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