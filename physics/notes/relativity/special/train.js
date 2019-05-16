let stopTrainObserver = false;
let stopTrainPassenger = false;

function passenger() {
    stopTrainObserver = true;
    stopTrainPassenger = false;

    const lightLeft = document.getElementById("light-left")
    const lightRight = document.getElementById("light-right")
    const train = document.getElementById("train")
    const trees = document.getElementById("trees")

    trees.setAttribute("transform", "translate(0)")
    train.setAttribute("transform", "translate(0)")
    lightLeft.style.display = "inline"
    lightRight.style.display = "inline"

    let time = 0;
    let trainPos = 0;

    function cycle() {
        if (stopTrainPassenger) {

        } else {
            time += 0.5
            lightLeft.setAttribute("r", time);
            lightRight.setAttribute("r", time);

            trainPos -= 0.25;
            trees.setAttribute("transform", "translate(" + trainPos + ")");

            if (time < 244) requestAnimationFrame(cycle);
        }
    }
    requestAnimationFrame(cycle);
}

function observer() {
    stopTrainObserver = false;
    stopTrainPassenger = true;

    const lightLeft = document.getElementById("light-left")
    const lightRight = document.getElementById("light-right")
    const train = document.getElementById("train")
    const trees = document.getElementById("trees")

    trees.setAttribute("transform", "translate(0)")
    lightLeft.style.display = "inline"
    lightRight.style.display = "inline"


    let time = 0;
    let trainPos = 0;

    function cycle() {
        if (stopTrainObserver) {
            train.setAttribute("transform", "translate(0)");
            trees.setAttribute("transform", "translate(0)");
        } else {
            time += 0.5
            lightLeft.setAttribute("r", time);
            lightRight.setAttribute("r", time);

            trainPos += 0.25;
            train.setAttribute("transform", "translate(" + trainPos + ")");

            if (time < 244) requestAnimationFrame(cycle);
        }
    }
    requestAnimationFrame(cycle);
}



//      sound version
let stopTrainObserverSound = false;
let stopTrainPassengerSound = false;

function passengerSound() {
    stopTrainObserverSound = true;
    stopTrainPassengerSound = false;

    const soundLeft = document.getElementById("sound-left")
    const soundRight = document.getElementById("sound-right")
    const train = document.getElementById("sound-train")
    const trees = document.getElementById("sound-trees")

    soundLeft.setAttribute("transform", "translate(0)");
    soundRight.setAttribute("transform", "translate(0)");
    trees.setAttribute("transform", "translate(0)")
    train.setAttribute("transform", "translate(0)")
    soundLeft.style.display = "inline"
    soundRight.style.display = "inline"

    let time = 0;
    let trainPos = 0;

    function cycle() {
        if (stopTrainPassengerSound) {
            train.setAttribute("transform", "translate(0)");
            trees.setAttribute("transform", "translate(0)");
            soundLeft.setAttribute("transform", "translate(0)");
            soundRight.setAttribute("transform", "translate(0)");
        } else {
            time += 0.5
            soundLeft.setAttribute("r", time);
            soundRight.setAttribute("r", time);

            trainPos -= 0.2;
            trees.setAttribute("transform", "translate(" + trainPos + ")");
            soundLeft.setAttribute("transform", "translate(" + (trainPos) + ")");
            soundRight.setAttribute("transform", "translate(" + (trainPos) + ")");

            if (time < 244) requestAnimationFrame(cycle);
        }

    }
    requestAnimationFrame(cycle);
}

function observerSound() {
    stopTrainObserverSound = false;
    stopTrainPassengerSound = true;

    const soundLeft = document.getElementById("sound-left")
    const soundRight = document.getElementById("sound-right")
    const train = document.getElementById("sound-train")
    const trees = document.getElementById("sound-trees")

    soundLeft.setAttribute("transform", "translate(0)");
    soundRight.setAttribute("transform", "translate(0)");
    trees.setAttribute("transform", "translate(0)")
    soundLeft.style.display = "inline"
    soundRight.style.display = "inline"

    let time = 0;
    let trainPos = 0;

    function cycle() {
        if (stopTrainObserverSound) {
            train.setAttribute("transform", "translate(0)");
            trees.setAttribute("transform", "translate(0)");
            soundLeft.setAttribute("transform", "translate(0)");
            soundRight.setAttribute("transform", "translate(0)");
        } else {
            time += 0.5
            soundLeft.setAttribute("r", time);
            soundRight.setAttribute("r", time);

            trainPos += 0.2;
            train.setAttribute("transform", "translate(" + trainPos + ")");

            if (time < 244) requestAnimationFrame(cycle);
        }
    }
    requestAnimationFrame(cycle);
}