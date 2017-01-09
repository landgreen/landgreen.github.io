"use strict"
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
//https://bitsofco.de/an-overview-of-client-side-storage/
let focus = null;
localStorage.setItem('period', 0); //update period to local storage
outputGrid(1);

function pickRandom() {
    let classes = JSON.parse(localStorage.getItem('classes')) //pull data from local storage
    let total = 0;
    let p = localStorage.getItem('period');
    let len = classes[p].length;
    let add = 0;
    for (let i = 0; i < len; i++) {
        total += classes[p][i].picked;
    }
    let weighted = [];
    for (let i = 0; i < len; i++) {
        if (total / len > classes[p][i].picked) {
            add = 10; // if under mean picked weight by 10
        } else {
            add = 1; //above average gets 1 weight
        }
        for (let j = 0; j < add; j++) {
            weighted.push(i);
        }
    }
    focus = weighted[Math.floor(Math.random() * (weighted.length))];
    //focus = Math.floor(Math.random() * classes[localStorage.getItem('period')].length)
    classes[p][focus].picked++;
    localStorage.setItem('classes', JSON.stringify(classes)); //update classes to local storage
    outputGrid(localStorage.getItem('period'));
    //play sound
	// var sound = document.getElementById("myAudio"); //setup audio
	// sound.currentTime = 0; //reset position of playback to zero
    // sound.play();
	speech(classes[p][focus].firstName);
}
//setInterval(pickRandom, 1);

function speech(say) {
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance(say);
    //msg.voice = voices[10]; // Note: some voices don't support altering params
    //msg.voiceURI = 'native';
    //utterance.volume = 1; // 0 to 1
    //utterance.rate = 0.1; // 0.1 to 10
    //utterance.pitch = 1; //0 to 2
    //utterance.text = 'Hello World';
    //utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }
}

function list() {
    return JSON.parse(localStorage.getItem('classes'))[localStorage.getItem('period')]
}

function add() {
    let add = document.getElementById("name").value
    if (add) {
        let classes = JSON.parse(localStorage.getItem('classes')) //pull data from local storage
        classes[localStorage.getItem('period')].push({
            firstName: add,
            picked: 0
        })
        localStorage.setItem('classes', JSON.stringify(classes)); //update classes to local storage
        outputGrid(localStorage.getItem('period'));
    }

}

function outputGrid() {
    let classes = JSON.parse(localStorage.getItem('classes')) //pull data from local storage
    let output = "";
    if (classes[localStorage.getItem('period')]) {
        for (let i = 0; i < classes[localStorage.getItem('period')].length; i++) {
            let s = classes[localStorage.getItem('period')][i]
            if (focus === i) {
                output += "<li><div class='focus'>" + s.firstName + "<div class='num'>" + s.picked + "</div></div></li>";
            } else {
                output += "<li><div>" + s.firstName + "<div class='num'>" + s.picked + "</div></div></li>";
            }
        }
    }
    document.getElementById("grid").innerHTML = output;
}

function nextPeriod() {
    focus = 'null'
    let period = localStorage.getItem('period')
    period++
    if (period > 5) period = 0;
    localStorage.setItem('period', period); //update period to local storage
    document.getElementById("period").innerHTML = period + 1;
    outputGrid(period);
}

function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'data.json');
    linkElement.click();
}



document.getElementById('import').onclick = function() {
    var files = document.getElementById('selectFiles').files;
    //console.log(files);
    if (files.length <= 0) {
        return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) {
        //console.log(e);
        var result = JSON.parse(e.target.result);
        var formatted = JSON.stringify(result, null, 2);

        localStorage.setItem('classes', JSON.parse(formatted)); //update classes to local storage
        outputGrid(localStorage.getItem('period'));
    }

    fr.readAsText(files.item(0));
};


function reset() {
    if (prompt('To wipe all periods type yes', 'no') === 'yes') {
        focus = 'null';
        let classes = [
            [],
            [],
            [],
            [],
            [],
            []
        ]
        localStorage.setItem('classes', JSON.stringify(classes)); //update classes to local storage
        outputGrid(localStorage.getItem('period'));
    }
}

function set() { //run reset to reset the classes
    focus = 'null';
    let classes = [null, [{ // ***period 1*******************
            name: 'Ned Ryerson',
            picked: 0,
        }, {
            name: 'alice',
            picked: 0,
        }, {
            name: 'Phyllis',
            picked: 0,
        }],
        [{ // ***period 1*******************
            name: 'Ned Ryerson2',
            picked: 0,
        }, {
            name: 'alice2',
            picked: 0,
        }, {
            name: 'Phyllis2',
            picked: 0,
        }]
    ]
    localStorage.setItem('classes', JSON.stringify(classes)); //update classes to local storage
    outputGrid(period);
}


function hide() {
    var x = document.getElementById('hide');
    if (x.style.display === 'none') {
        x.style.display = 'block';
    } else {
        x.style.display = 'none';
    }
}
hide();
