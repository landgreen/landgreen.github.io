let stopTrainObserver = false;
let stopTrainPassenger = false;

function passenger() {
    stopTrainObserver = true;
    stopTrainPassenger = false;


    const lightLeft = document.getElementById("light-left")
    const lightRight = document.getElementById("light-right")
    const train = document.getElementById("train")

    train.setAttribute("transform", "translate(0)")
    lightLeft.style.display = "inline"
    lightRight.style.display = "inline"


    let time = 0;

    function cycle() {
        time++
        lightLeft.setAttribute("r", time);
        lightRight.setAttribute("r", time);
        if (time < 345 && !stopTrainPassenger) requestAnimationFrame(cycle);
    }
    requestAnimationFrame(cycle);
}

function observer() {
    stopTrainObserver = false;
    stopTrainPassenger = true;
    const lightLeft = document.getElementById("light-left")
    const lightRight = document.getElementById("light-right")
    const train = document.getElementById("train")

    lightLeft.style.display = "inline"
    lightRight.style.display = "inline"


    let time = 0;
    let trainPos = 0;

    function cycle() {
        time++

        lightLeft.setAttribute("r", time);
        lightRight.setAttribute("r", time);

        trainPos += 0.2;
        train.setAttribute("transform", "translate(" + trainPos + ")");

        if (time < 345 && !stopTrainObserver) requestAnimationFrame(cycle);
        if (stopTrainObserver) train.setAttribute("transform", "translate(0)");

    }
    requestAnimationFrame(cycle);
}