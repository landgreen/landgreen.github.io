const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let randomColor = "white";
let randomCard = Math.floor(Math.random() * 9) + 1;
numberSave = 0;

let sky = "🏙️";

var transTint = 0;
var tint = "rgba(0, 0, 0," + transTint + ")";
let shadow = "rgba(0, 0, 0, 0.35)";
let finalDirt = "rgba(121, 74, 46,1)";

let menuShow = false;
let cardShow = false;

function generateColor() {
  randomColor =
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
}

let store = {
  outline: "transparent",
  background: "transparent",
  food1: "",
  food2: "",
  food3: "",
  food4: "",
  food5: "",
  food6: "",
  food7: "",
  food8: ""
};

let cardGame = {
  outline: "transparent",
  background: "transparent",
  number: "",
  explanation1: "",
  explanation2: "",
  button1: "",
  button2: ""
};

let cube = {
  cubeX: canvas.width / 2,
  cubeY: canvas.height / 2,
  cubeColor: "#FFCCE3",
  cubeSize: 95,
  cubeEyes: "black",
  cubeEyes2: "transparent",
  cubeNose: "black",
  cubeBody: "white",
  cubeOutline: "lightgrey",
  cubetag: "#FAFCAE",
  cubetagcollar: "#C7873C"
};

let buttons = {
  food: "#a2c7ec",
  sleep: "#a2c7ec",
  play: "#a2c7ec",
  dressUp: "#a2c7ec",
  bath: "#a2c7ec"
};

let energy = {
  color: "yellow",
  xSize: canvas.width / 2 - 220,
  ySize: canvas.height - 445,
  xPos: canvas.width - 150,
  yPos: 20,
  drain: 0.03
};

let hunger = {
  color: "red",
  xSize: canvas.width / 2 - 220,
  ySize: canvas.height - 475,
  xPos: canvas.width - 150,
  yPos: 20
};

let cleanliness = {
  color: "blue",
  xSize: canvas.width / 2 - 220,
  ySize: canvas.height - 415,
  xPos: canvas.width - 150,
  yPos: 20
};

let mood = {
  color: "#f4ff92",
  emotion: "😊",
  sleeping: false,
  dead: false
};

let mouse = {
  down: false,
  x: 0,
  y: 0,
  radius: 20
};

document.body.style.cursor = "default";
// document.body.style.cursor = 'pointer';

var dirty = 0;
var dirt = "rgba(121, 74, 46," + dirty + ")";

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

canvas.addEventListener("mousemove", function (event) {
  const mousePos = getMousePos(canvas, event);

  if (
    mousePos.x > canvas.width / 2 - 220 &&
    mousePos.x < canvas.width / 2 - 135 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    buttons.food = "#f4ff92";
  } else {
    buttons["food"] = "#a2c7ec";
  }

  if (
    mousePos.x > canvas.width / 2 - 130 &&
    mousePos.x < canvas.width / 2 - 45 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    buttons["sleep"] = "#f4ff92";
  } else {
    buttons["sleep"] = "#a2c7ec";
  }

  if (
    mousePos.x > canvas.width / 2 - 40 &&
    mousePos.x < canvas.width / 2 + 45 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    buttons["play"] = "#f4ff92";
  } else {
    buttons["play"] = "#a2c7ec";
  }

  if (
    mousePos.x > canvas.width / 2 + 50 &&
    mousePos.x < canvas.width / 2 + 135 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    buttons["dressUp"] = "#f4ff92";
  } else {
    buttons["dressUp"] = "#a2c7ec";
  }

  if (
    mousePos.x > canvas.width / 2 + 140 &&
    mousePos.x < canvas.width / 2 + 225 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    buttons["bath"] = "#f4ff92";
  } else {
    buttons["bath"] = "#a2c7ec";
  }
});

canvas.addEventListener("click", (e) => {
  const mousePos = getMousePos(canvas, event);
  if (
    mousePos.x > canvas.width / 2 - 220 &&
    mousePos.x < canvas.width / 2 - 135 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    if (mood["dead"] === false) {
      buttons["food"] = "#edc042";
      mood["sleeping"] = false;
      showmenu();
      hideCardGame();
    }
  }
  if (
    mousePos.x > canvas.width / 2 - 130 &&
    mousePos.x < canvas.width / 2 - 45 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    if (menuShow === true) {
      hidemenu();
    } else {
      if (mood["dead"] === false) {
        buttons["sleep"] = "#edc042";
        mood["sleeping"] = true;
        sky = "🌃";
        hidemenu();
        hideCardGame();
      }
    }
  }
  if (
    mousePos.x > canvas.width / 2 - 40 &&
    mousePos.x < canvas.width / 2 + 45 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    if (menuShow === true) {
      hidemenu();
    } else {
      if (mood["dead"] === false) {
        buttons["play"] = "#edc042";
        mood["sleeping"] = false;
        hidemenu();
        if (cardShow === false) {
          showCardGame();
        } else {
          hideCardGame();
        }
      }
    }
  }
  if (
    mousePos.x > canvas.width / 2 + 50 &&
    mousePos.x < canvas.width / 2 + 135 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    if (menuShow === true) {
      hidemenu();
    } else {
      if (mood["dead"] === false) {
        buttons["dressUp"] = "#edc042";
        mood["sleeping"] = false;
        generateColor();
        cube["cubeColor"] = randomColor;
        hidemenu();
        hideCardGame();
      }
    }
  }
  if (
    mousePos.x > canvas.width / 2 + 140 &&
    mousePos.x < canvas.width / 2 + 225 &&
    mousePos.y > canvas.height - 105 &&
    mousePos.y < canvas.height - 25
  ) {
    hideCardGame();
    if (menuShow === true) {
      hidemenu();
    } else {
      if (mood["dead"] === false) {
        buttons["bath"] = "#edc042";
        mood["sleeping"] = false;
        if (cleanliness["xPos"] < canvas.width - 200) {
          cleanliness["xPos"] = cleanliness["xPos"] + 50;
        } else {
          cleanliness["xPos"] = canvas.width - 150;
        }
      }
    }
  }
  if (
    mousePos.x > canvas.width / 2 - 230 &&
    mousePos.x < canvas.width / 2 + 240 &&
    mousePos.y > canvas.height - 375 &&
    mousePos.y < canvas.height - 120
  ) {
    if (menuShow === true) {
      hidemenu();
      if (hunger["xPos"] < canvas.width - 200) {
        hunger["xPos"] = hunger["xPos"] + 50;
      } else {
        hunger["xPos"] = canvas.width - 150;
      }
    }
  }
  if (
    mousePos.x > canvas.width / 2 + 100 &&
    mousePos.x < canvas.width / 2 + 240 &&
    mousePos.y > canvas.height - 355 &&
    mousePos.y < canvas.height - 255
  ) {
    if (cardShow === true) {
      clickedHigher();
    }
  }
  if (
    mousePos.x > canvas.width / 2 + 100 &&
    mousePos.x < canvas.width / 2 + 240 &&
    mousePos.y > canvas.height - 250 &&
    mousePos.y < canvas.height - 150
  ) {
    if (cardShow === true) {
      clickedLower();
    }
  }
});

function showmenu() {
  store["outline"] = "black";
  store["background"] = "white";
  store["food1"] = "🍔";
  store["food2"] = "🍕";
  store["food3"] = "🍜";
  store["food4"] = "🌮";
  store["food5"] = "🍣";
  store["food6"] = "🥗";
  store["food7"] = "🍛";
  store["food8"] = "🍚";
  menuShow = true;
}

function hidemenu() {
  store["outline"] = "transparent";
  store["background"] = "transparent";
  store["food1"] = "";
  store["food2"] = "";
  store["food3"] = "";
  store["food4"] = "";
  store["food5"] = "";
  store["food6"] = "";
  store["food7"] = "";
  store["food8"] = "";
  menuShow = false;
}

function showCardGame() {
  randomizeCard();
  cardGame["outline"] = "black";
  cardGame["background"] = "white";
  cardGame["number"] = randomCard;
  cardGame["explanation1"] = "Guess the number";
  cardGame["explanation2"] = "of the next card";
  cardGame["button1"] = "Higher";
  cardGame["button2"] = "Lower";
  cardShow = true;
}

function hideCardGame() {
  cardGame["outline"] = "transparent";
  cardGame["background"] = "transparent";
  cardGame["number"] = "";
  cardGame["explanation1"] = "";
  cardGame["explanation2"] = "";
  cardGame["button1"] = "";
  cardGame["button2"] = "";
  cardShow = false;
}

function clickedHigher() {
  numberSave = cardGame["number"];
  randomizeCard();
  cardGame["number"] = randomCard;
  if (numberSave < cardGame["number"]) {
    cardGame["explanation1"] = "         Correct!";
    cardGame["explanation2"] = "    Next Card";
    if (energy["xPos"] < canvas.width - 200) {
      energy["xPos"] = energy["xPos"] + 50;
    } else {
      energy["xPos"] = canvas.width - 150;
    }
  } else {
    if (numberSave > cardGame["number"]) {
      cardGame["explanation1"] = "          Wrong";
      cardGame["explanation2"] = "    Next Card";
      if (energy["xPos"] > 0) {
        energy["xPos"] = energy["xPos"] - 50;
      }
    }
  }
}

function clickedLower() {
  numberSave = cardGame["number"];
  randomizeCard();
  cardGame["number"] = randomCard;
  if (numberSave > cardGame["number"]) {
    cardGame["explanation1"] = "         Correct!";
    cardGame["explanation2"] = "    Next Card";
    if (energy["xPos"] < canvas.width - 200) {
      energy["xPos"] = energy["xPos"] + 50;
    } else {
      energy["xPos"] = canvas.width - 150;
    }
  } else {
    if (numberSave < cardGame["number"]) {
      cardGame["explanation1"] = "          Wrong";
      cardGame["explanation2"] = "    Next Card";
      if (energy["xPos"] > 0) {
        energy["xPos"] = energy["xPos"] - 50;
      }
    }
  }
}

function randomizeCard() {
  randomCard = Math.floor(Math.random() * 9) + 1;
}

function cycle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function showTint() {
    transTint = transTint + 0.02;
    if (transTint >= 0.35) {
      transTint = 0.35;
    }
  }

  function hideTint() {
    transTint = transTint - 0.02;
    if (transTint <= 0) {
      transTint = 0;
    }
  }

  ctx.fillStyle = "grey";
  ctx.font = "350px serif";
  ctx.fillText(sky, canvas.width / 2 - 80, canvas.height / 2);

  ctx.fillStyle = "#72ede5";
  ctx.fillRect(0, 0, 190, canvas.height);
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);
  ctx.fillRect(0, canvas.height - 225, canvas.width, 225);

  ctx.fillStyle = "white";
  ctx.fillRect(190, canvas.height / 2 - 175, 10, 200);
  ctx.fillRect(canvas.width - 40, canvas.height / 2 - 175, 10, 200);
  ctx.fillRect(canvas.width - 175, canvas.height / 2 - 175, 10, 200);
  ctx.fillRect(190, canvas.height / 2 + 20, 280, 10);
  ctx.fillRect(190, canvas.height / 2 - 100, 280, 10);

  ctx.fillStyle = "#874e41";
  ctx.fillRect(0, canvas.height - 210, canvas.width, 210);
  ctx.fillStyle = "#40261f";
  ctx.fillRect(0, canvas.height - 210, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 145, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 75, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 5, canvas.width, 10);

  energy["xPos"] = energy["xPos"] - energy["drain"];
  if (energy["xPos"] < 0) {
    energy["xPos"] = 0;
  }

  hunger["xPos"] = hunger["xPos"] - 0.03;
  if (hunger["xPos"] < 0) {
    hunger["xPos"] = 0;
  }

  cleanliness["xPos"] = cleanliness["xPos"] - 0.03;
  if (cleanliness["xPos"] < 0) {
    cleanliness["xPos"] = 0;
  }

  function sleep() {
    if (energy["xPos"] < canvas.width - 150 && mood["sleeping"] === true) {
      energy["drain"] = -0.1;
    } else {
      mood["sleeping"] = false;
      energy["drain"] = 0.03;
    }
  }

  function checkEmotion() {
    if (mood["sleeping"] === true) {
      mood["emotion"] = "😴";
      mood["color"] = "#4a72bd";
      showTint();
      tint = "rgba(32, 24, 144," + transTint + ")";
      cube["cubeEyes"] = "transparent";
      cube["cubeEyes2"] = "black";
      sleep();
    } else {
      cube["cubeEyes"] = "black";
      cube["cubeEyes2"] = "transparent";
      sky = "🏙️";
      energy["drain"] = 0.03;
      if (
        energy["xPos"] >= 150 &&
        hunger["xPos"] >= 150 &&
        cleanliness["xPos"] >= 150
      ) {
        mood["emotion"] = "😊";
        mood["color"] = "#f4ff92";
        hideTint();
        tint = "rgba(32, 24, 144," + transTint + ")";
      }
      if (
        energy["xPos"] < 250 ||
        hunger["xPos"] < 250 ||
        cleanliness["xPos"] < 250
      ) {
        mood["emotion"] = "😐";
        mood["color"] = "lightgrey";
        hideTint();
        tint = "rgba(32, 24, 144," + transTint + ")";
      }
      if (
        energy["xPos"] < 200 ||
        hunger["xPos"] < 200 ||
        cleanliness["xPos"] < 200
      ) {
        mood["emotion"] = "🙁";
        mood["color"] = "lightblue";
      }
      if (cleanliness["xPos"] <= 135) {
        mood["emotion"] = "🤢";
        mood["color"] = "#6ebf6d";
        showTint();
        tint = "rgba(24, 144, 39," + transTint + ")";
      }
      if (energy["xPos"] < 150) {
        mood["emotion"] = "🥱";
        mood["color"] = "#90b5f0";
      }
      if (energy["xPos"] < 60 || hunger["xPos"] < 70) {
        mood["emotion"] = "😫";
        mood["color"] = "#b83232";
        showTint();
        tint = "rgba(144, 42, 24," + transTint + ")";
      }
      if (energy["xPos"] <= 0 && hunger["xPos"] <= 0) {
        mood["emotion"] = "💀";
        mood["color"] = "black";
        mood["dead"] = true;
        cube["cubeColor"] = "transparent";
        cube["cubeBody"] = "transparent";
        cube["cubeOutline"] = "transparent";
        cube["cubeEyes"] = "transparent";
        cube["cubeEyes2"] = "transparent";
        cube["cubeNose"] = "transparent";
        cube["cubetag"] = "transparent";
        cube["cubetagcollar"] = "transparent";
        shadow = "transparent";
        cleanliness["xPos"] = 0;
        finalDirt = "transparent";
        tint = "transparent";

        setTimeout(() => {
          document.title = "tamagotchi :(";
          bc.postMessage("death"); //this is used if this  tab is produced from my other game n-gon
          bc.isActive = false //disables connection to broadcast channel for communicating with my other game n-gon
          bc.close(); //end session
        }, 100);
      }
    }
  }

  checkEmotion();

  ctx.beginPath();
  ctx.ellipse(
    cube["cubeX"],
    cube["cubeY"] + 82,
    cube["cubeSize"] + 8,
    cube["cubeSize"] / 4,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = shadow;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 67.5,
    canvas.height / 2 + 82.875,
    30,
    11.25,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeColor"];
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 67.5,
    canvas.height / 2 + 82.875,
    28,
    10,
    0,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = shadow;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 + 43.875,
    54,
    52.5,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeBody"];
  ctx.lineWidth = 6;
  ctx.strokeStyle = cube["cubeOutline"];
  ctx.stroke();
  ctx.fill();

  function checkDirt() {
    dirty = 20 / cleanliness.xPos - 0.57;
    dirt = "rgba(121, 74, 46," + dirty + ")";
    ctx.fillStyle = dirt;
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2 + 43.875,
      54,
      52.5,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    if (cleanliness["xPos"] === 0) {
      ctx.fillStyle = finalDirt;
      ctx.beginPath();
      ctx.arc(cube["cubeX"], cube["cubeY"], cube["cubeSize"], 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  checkDirt();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 - 34.875,
    34,
    44,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeColor"];
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 - 34.875,
    33,
    42,
    0,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = shadow;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 + 16.125,
    7.5,
    7.5,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubetag"];
  ctx.lineWidth = 6;
  ctx.strokeStyle = cube["cubetagcollar"];
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 - 46.125,
    46.5,
    47.25,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeBody"];
  ctx.lineWidth = 6;
  ctx.strokeStyle = cube["cubeOutline"];
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 - 30,
    canvas.height / 2 + 88.875,
    16.5,
    11.25,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeBody"];
  ctx.lineWidth = 6;
  ctx.strokeStyle = cube["cubeOutline"];
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 30,
    canvas.height / 2 + 88.875,
    16.5,
    11.25,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeBody"];
  ctx.lineWidth = 6;
  ctx.strokeStyle = cube["cubeOutline"];
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    canvas.height / 2 - 28.125,
    9,
    6.75,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeNose"];
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 - 18.75,
    canvas.height / 2 - 43.125,
    9,
    9,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeEyes"];
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 18.75,
    canvas.height / 2 - 43.125,
    9,
    9,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeEyes"];
  ctx.fill();

  ctx.beginPath();
  ctx.rect(canvas.width / 2 + 10, canvas.height / 2 - 45, 20, 10);
  ctx.fillStyle = cube["cubeEyes2"];
  ctx.fill();
  ctx.rect(canvas.width / 2 - 30, canvas.height / 2 - 45, 20, 10);
  ctx.fillStyle = cube["cubeEyes2"];
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 - 56.25,
    canvas.height / 2 - 58.875,
    21,
    41.25,
    0.5,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeColor"];
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 - 56,
    canvas.height / 2 - 59,
    19.4,
    40,
    0.5,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = shadow;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 56.25,
    canvas.height / 2 - 58.875,
    21,
    41.25,
    -0.5,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = cube["cubeColor"];
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2 + 56,
    canvas.height / 2 - 59,
    19.4,
    40,
    -0.5,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = shadow;
  ctx.stroke();

  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.fillRect(
    canvas.width / 2 - 230,
    canvas.height - 485,
    canvas.width - 40,
    100
  );

  ctx.fillStyle = "black";
  ctx.fillRect(
    canvas.width / 2 - 230,
    canvas.height - 115,
    canvas.width - 40,
    100
  );

  ctx.fillStyle = "white";
  ctx.fillRect(
    canvas.width / 2 - 220,
    canvas.height - 475,
    canvas.width - 150,
    20
  );

  ctx.fillStyle = hunger["color"];
  ctx.fillRect(
    hunger["xSize"],
    hunger["ySize"],
    hunger["xPos"],
    hunger["yPos"]
  );

  ctx.fillStyle = "white";
  ctx.fillRect(
    canvas.width / 2 - 220,
    canvas.height - 445,
    canvas.width - 150,
    20
  );

  ctx.fillStyle = energy["color"];
  ctx.fillRect(
    energy["xSize"],
    energy["ySize"],
    energy["xPos"],
    energy["yPos"]
  );

  ctx.fillStyle = "white";
  ctx.fillRect(
    canvas.width / 2 - 220,
    canvas.height - 415,
    canvas.width - 150,
    20
  );

  ctx.fillStyle = cleanliness["color"];
  ctx.fillRect(
    cleanliness["xSize"],
    cleanliness["ySize"],
    cleanliness["xPos"],
    cleanliness["yPos"]
  );

  ctx.fillStyle = mood["color"];
  ctx.fillRect(canvas.width / 2 + 140, canvas.height - 475, 80, 80);

  ctx.fillStyle = buttons["food"];
  ctx.fillRect(canvas.width / 2 - 220, canvas.height - 105, 80, 80);

  ctx.fillStyle = buttons["sleep"];
  ctx.fillRect(canvas.width / 2 - 130, canvas.height - 105, 80, 80);

  ctx.fillStyle = buttons["play"];
  ctx.fillRect(canvas.width / 2 - 40, canvas.height - 105, 80, 80);

  ctx.fillStyle = buttons["dressUp"];
  ctx.fillRect(canvas.width / 2 + 50, canvas.height - 105, 80, 80);

  ctx.fillStyle = buttons["bath"];
  ctx.fillRect(canvas.width / 2 + 140, canvas.height - 105, 80, 80);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText(mood["emotion"], canvas.width / 2 + 143, canvas.height - 414);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText("🍴", canvas.width / 2 - 218, canvas.height - 44);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText("🛏️", canvas.width / 2 - 127, canvas.height - 44);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText("🎮", canvas.width / 2 - 37, canvas.height - 44);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText("👕", canvas.width / 2 + 53, canvas.height - 44);

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText("🛁", canvas.width / 2 + 143, canvas.height - 44);

  ctx.fillStyle = store["outline"];
  ctx.fillRect(
    canvas.width / 2 - 230,
    canvas.height - 375,
    canvas.width - 40,
    250
  );

  ctx.fillStyle = store["background"];
  ctx.fillRect(
    canvas.width / 2 - 220,
    canvas.height - 365,
    canvas.width - 60,
    230
  );

  ctx.fillStyle = "red";
  ctx.font = "60px serif";
  ctx.fillText(store["food1"], canvas.width / 2 - 185, canvas.height - 285);
  ctx.fillText(store["food2"], canvas.width / 2 - 85, canvas.height - 290);
  ctx.fillText(store["food3"], canvas.width / 2 + 10, canvas.height - 290);
  ctx.fillText(store["food4"], canvas.width / 2 + 115, canvas.height - 290);
  ctx.fillText(store["food5"], canvas.width / 2 - 185, canvas.height - 175);
  ctx.fillText(store["food6"], canvas.width / 2 - 85, canvas.height - 175);
  ctx.fillText(store["food7"], canvas.width / 2 + 10, canvas.height - 175);
  ctx.fillText(store["food8"], canvas.width / 2 + 115, canvas.height - 175);

  ctx.fillStyle = cardGame["outline"];
  ctx.fillRect(
    canvas.width / 2 - 230,
    canvas.height - 355,
    canvas.width - 370,
    200
  );
  ctx.fillRect(
    canvas.width / 2 + 100,
    canvas.height - 355,
    canvas.width - 370,
    95
  );
  ctx.fillRect(
    canvas.width / 2 + 100,
    canvas.height - 250,
    canvas.width - 370,
    95
  );

  ctx.fillStyle = cardGame["background"];
  ctx.fillRect(
    canvas.width / 2 - 220,
    canvas.height - 345,
    canvas.width - 390,
    180
  );
  ctx.fillRect(
    canvas.width / 2 + 110,
    canvas.height - 345,
    canvas.width - 390,
    75
  );
  ctx.fillRect(
    canvas.width / 2 + 110,
    canvas.height - 240,
    canvas.width - 390,
    75
  );

  ctx.fillStyle = "black";
  ctx.font = "30px sans-serif";
  ctx.fillText(
    cardGame["button1"],
    canvas.width / 2 + 120,
    canvas.height - 295
  );
  ctx.fillText(
    cardGame["button2"],
    canvas.width / 2 + 120,
    canvas.height - 195
  );
  ctx.font = "12px sans-serif";
  ctx.fillText(
    cardGame["explanation1"],
    canvas.width / 2 - 215,
    canvas.height - 320
  );
  ctx.fillText(
    cardGame["explanation2"],
    canvas.width / 2 - 205,
    canvas.height - 300
  );
  ctx.font = "70px sans-serif";
  ctx.fillText(cardGame["number"], canvas.width / 2 - 185, canvas.height - 210);

  requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);











//this is used if this tab is produced from n-gon
// Connection to a broadcast channel
const bc = new BroadcastChannel('tamagotchi');
bc.isActive = false
bc.onmessage = function (ev) {
  if (ev.data === 'activate' && !bc.isActive) {
    bc.isActive = true
    document.title = "n-gon -> tamagotchi";
  }
  if (ev.data = 'status') { }
  if (ev.data.hunger) {
    hunger["xPos"] = ev.data.hunger
    energy["xPos"] = ev.data.energy
    cleanliness["xPos"] = ev.data.cleanliness

    function updateDocumentTitle(hunger, energy, cleanliness) {
      // Map hunger (0-340) to descriptive words
      const getHungerWord = (value) => {
        if (value < 50) return "ravenous";
        if (value < 100) return "hungry";
        if (value < 170) return "peckish";
        if (value < 240) return "satisfied";
        if (value < 300) return "full";
        return "stuffed";
      };
      // Map energy (0-340) to descriptive words
      const getEnergyWord = (value) => {
        if (value < 50) return "exhausted";
        if (value < 100) return "tired";
        if (value < 170) return "sluggish";
        if (value < 240) return "alert";
        if (value < 300) return "energetic";
        return "zesty";
      };
      // Map cleanliness (0-340) to descriptive words
      const getCleanlinessWord = (value) => {
        if (value < 50) return "filthy";
        if (value < 100) return "grimy";
        if (value < 170) return "smudged";
        if (value < 240) return "tidy";
        if (value < 300) return "clean";
        return "pristine";
      };
      const hungerWord = getHungerWord(hunger);
      const energyWord = getEnergyWord(energy);
      const cleanlinessWord = getCleanlinessWord(cleanliness);

      document.title = `${hungerWord}, ${energyWord}, ${cleanlinessWord}`;
    }

    // Example usage:
    updateDocumentTitle(hunger["xPos"], energy["xPos"], cleanliness["xPos"]);
  }
}
bc.postMessage("ready")

// bc.postMessage("death"); //this is used if this  tab is produced from my other game n-gon


window.addEventListener('blur', () => {
  const message = {
    hunger: hunger["xPos"],
    energy: energy["xPos"],
    cleanliness: cleanliness["xPos"]
  };
  bc.postMessage(message);
});
window.addEventListener('focus', () => {
  setTimeout(() => {
    document.title = "n-gon -> tamagotchi";
  }, 1000);
});
window.addEventListener('beforeunload', (event) => {
  bc.postMessage("death"); //this is used if this  tab is produced from my other game n-gon
  bc.isActive = false //disables connection to broadcast channel for communicating with my other game n-gon
  bc.close(); //end session
});