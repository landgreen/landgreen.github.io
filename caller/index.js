// to edit a name use: p._data.allPeriods[0][0].name

let defaultPeriods = [
  [
    // { x: 0, y: 0, w: 3, h: 1, i: "0", name: "Ln0", num: 0, focus: false },
    // { x: 3, y: 0, w: 3, h: 1, i: "1", name: "Lan1", num: 0, focus: false },
    // { x: 6, y: 0, w: 3, h: 1, i: "2", name: "Lan2", num: 0, focus: false },
    // { x: 0, y: 1, w: 3, h: 1, i: "3", name: "Lan3", num: 0, focus: false },
    // { x: 3, y: 1, w: 3, h: 1, i: "4", name: "Lan4", num: 0, focus: false },
    // { x: 6, y: 1, w: 3, h: 1, i: "5", name: "Lan5", num: 0, focus: false },
    // { x: 0, y: 2, w: 2, h: 1, i: "6", name: "Lan6", num: 0, focus: false },
    // { x: 2, y: 2, w: 4, h: 1, i: "7", name: "Lan7", num: 0, focus: false },
    // { x: 0, y: 3, w: 3, h: 1, i: "8", name: "Lan8", num: 0, focus: false },
    // { x: 3, y: 3, w: 3, h: 1, i: "9", name: "Lan9", num: 0, focus: false },
    // { x: 6, y: 2, w: 3, h: 2, i: "10", name: "Lan10", num: 0, focus: false }
  ],
  [],
  [],
  [],
  [],
  []
];

// let a = JSON.parse(
//   '[[{"x":0,"y":0,"w":3,"h":1,"i":"0","name":"Ln0","num":0,"focus":false},{"x":3,"y":0,"w":3,"h":1,"i":"1","name":"Lan1","num":0,"focus":false},{"x":6,"y":0,"w":3,"h":1,"i":"2","name":"Lan2","num":0,"focus":false},{"x":0,"y":1,"w":3,"h":1,"i":"3","name":"Lan3","num":0,"focus":false},{"x":3,"y":1,"w":3,"h":1,"i":"4","name":"Lan4","num":0,"focus":false},{"x":6,"y":1,"w":3,"h":1,"i":"5","name":"Lan5","num":0,"focus":false},{"x":0,"y":2,"w":2,"h":1,"i":"6","name":"Lan6","num":0,"focus":false},{"x":2,"y":2,"w":4,"h":1,"i":"7","name":"Lan7","num":0,"focus":false},{"x":0,"y":3,"w":3,"h":1,"i":"8","name":"Lan8","num":0,"focus":false},{"x":3,"y":3,"w":3,"h":1,"i":"9","name":"Lan9","num":0,"focus":false},{"x":6,"y":2,"w":3,"h":2,"i":"10","name":"Lan10","num":0,"focus":false}],[{"x":0,"y":0,"w":2,"h":1,"i":"0","name":"Ln0","num":3,"focus":false},{"x":2,"y":0,"w":2,"h":1,"i":"1","name":"Lan1","num":4,"focus":false}],[],[],[],[]]'
// );
// console.log(a);
// localStorage.setItem("layout", JSON.stringify(layout)); //update classes to local storage
// layout = JSON.parse(localStorage.getItem("layout")); //pull data from local storage

let GridLayout = VueGridLayout.GridLayout;
let GridItem = VueGridLayout.GridItem;

let localSettings = JSON.parse(localStorage.getItem("localSettings"));
if (!localSettings) {
  console.log("No local settings found. Resetting to default settings.");
  localSettings = {
    draggable: true,
    resizable: false,
    verbose: false,
    isSettingsSeen: true,
    selectedIndex: 0
  };
} else {
  document.getElementById("language").selectedIndex = localSettings.selectedIndex;
}
document.getElementById("language").addEventListener("change", function () {
  p.saveToLocalSettings();
});
let local = JSON.parse(localStorage.getItem("allPeriods"));
if (!local) {
  console.log("No local period rosters found. Resetting to empty classes.");
  local = [
    [],
    [],
    [],
    [],
    [],
    []
  ];
  document.getElementById("add").classList.add("blue");
  document.getElementById("first-time").innerHTML = "Click add to fill up your period.";
} else {
  localSettings.isSettingsSeen = false;
  // p.saveToLocalSettings;
}

let p = new Vue({
  el: "#periods",
  components: {
    GridLayout,
    GridItem
  },
  data: {
    allPeriods: local,
    layout: local[0],
    index: local[0].length.toString(),
    period: 1,
    draggable: localSettings.draggable,
    resizable: localSettings.resizable,
    verbose: localSettings.verbose,
    isSettingsSeen: localSettings.isSettingsSeen
  },
  methods: {
    // importInConvertionFromOldJSON: function() {
    //   var files = document.getElementById("selectFiles").files;
    //   if (files.length <= 0) {
    //     return false;
    //   }
    //   var fr = new FileReader();
    //   fr.onload = e => {
    //     var result = JSON.parse(JSON.parse(e.target.result));
    //     //convert from old system
    //     let converted = [[], [], [], [], [], []];
    //     for (j = 0; j < result.length; ++j) {
    //       for (i = 0, len = result[j].length; i < len; ++i) {
    //         converted[j].push({
    //           i: i.toString(),
    //           x: (i % 3) * 3,
    //           y: 0,
    //           h: 1,
    //           w: 3,
    //           num: result[j][i].picked,
    //           name: result[j][i].firstName
    //         });
    //       }
    //     }
    //     localStorage.setItem("allPeriods", JSON.stringify(converted));
    //     location.reload();
    //   };
    //   fr.readAsText(files.item(0));
    // },
    importIn: function () {
      var files = document.getElementById("selectFiles").files;
      if (files.length <= 0) {
        return false;
      }
      var fr = new FileReader();
      fr.onload = e => {
        var result = JSON.parse(JSON.parse(e.target.result)); //not sure why 2 parses are needed, but they are
        console.log(result);
        localStorage.setItem("allPeriods", JSON.stringify(result));
        location.reload();
      };
      fr.readAsText(files.item(0));
    },
    exportOut: function () {
      let dataStr = JSON.stringify(localStorage.getItem("allPeriods"));
      let dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      let linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", "data.json");
      linkElement.click();
    },
    movedEvent: function (i, newX, newY) {
      this.saveToLocal();
    },
    resizedEvent: function (i, newX, newY) {
      this.saveToLocal();
    },
    undoLastedCalled: function () {
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        if (this.layout[i].focus) {
          this.layout[i].focus = false;
          this.layout[i].num--;
          document.getElementById("speech").innerHTML = "";
          this.saveToLocal();
        }
      }
    },
    reset: function () {
      if (prompt("WARNING THIS WILL REMOVE ALL NAMES FROM ALL PERIODS.  Type yes to remove all names", "no") === "yes") {
        this.allPeriods = defaultPeriods;
        this.layout = this.allPeriods[this.period - 1];
        this.saveToLocal();
      }
    },
    resetCount: function () {
      if (prompt("To reset all counts for only this period type yes", "no") === "yes") {
        for (let i = 0, len = this.layout.length; i < len; ++i) {
          this.layout[i].num = 0;
        }
        this.saveToLocal();
      }
    },
    tidy: function () {
      // for (let i = 0, len = this.layout.length; i < len; ++i) {
      //   this.layout[i].x = (i % 4) * 3;
      //   this.layout[i].y = 0;
      //   // this.layout[i].w = 3;
      //   this.layout[i].i = i.toString();
      // }
      this.shrink();
      const columns = 12;
      let w = 0;
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        this.layout[i].y = Math.floor((w + this.layout[i].w - 1) / columns);
        this.layout[i].x = w % columns;

        w += this.layout[i].w;
        this.layout[i].i = i.toString();
      }

      this.saveToLocal();
      location.reload();
    },
    shrink: function () {
      var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");

      function getTextWidth(text, font) {
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
      }
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        this.layout[i].h = 1;
        this.layout[i].w = Math.min(12, Math.ceil((getTextWidth(this.layout[i].name, "12px Roboto") + 35) / 57));
      }

      this.saveToLocal();
    },
    saveToLocal: function () {
      this.allPeriods[this.period - 1] = this.layout;
      localStorage.setItem("allPeriods", JSON.stringify(this.allPeriods)); //update classes to local storage
    },
    saveToLocalSettings: function () {
      const localSettings = {
        draggable: this.draggable,
        resizable: this.resizable,
        verbose: this.verbose,
        isSettingsSeen: this.isSettingsSeen,
        selectedIndex: document.getElementById("language").selectedIndex
      };
      localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update classes to local storage
    },
    showSettings: function () {
      if (this.isSettingsSeen) {
        this.isSettingsSeen = false;
      } else {
        this.isSettingsSeen = true;
      }
      this.saveToLocalSettings();
    },
    nextPeriod: function () {
      this.unFocusAll();
      this.saveToLocal();
      if (this.period > this.allPeriods.length - 1) {
        this.period = 1;
      } else {
        this.period++;
      }
      this.layout = this.allPeriods[this.period - 1];
      document.getElementById("speech").innerHTML = "";
    },
    unFocusAll: function () {
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        this.layout[i].focus = false;
      }
    },
    editCount: function () {
      //ask user who to edit
      let editName = prompt("enter name to edit", this.layout[0].name);
      let newCount
      if (editName) newCount = prompt("enter their new times called on");
      //find the name and update it
      if (newCount) {
        for (let i = 0, len = this.layout.length; i < len; ++i) {
          if (this.layout[i].name === editName) {
            this.layout[i].num = newCount;
            this.reIndex();
            this.unFocusAll();
            this.saveToLocal();
            break;
          }
        }
      }
    },
    editStudentName: function () {
      //who is focused
      let focusName
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        if (this.layout[i].focus) {
          focusName = this.layout[i].name;
          break;
        }
      }
      //ask user who to edit

      let editName
      if (focusName) {
        editName = prompt("enter name to edit", focusName);
      } else {
        editName = prompt("enter name to edit", this.layout[0].name);
      }

      const emojiList = "🗑 💵 💎 🔬 🚲 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 🧩 ♟ 🎯 🎳 🎮 🎰 ⚽ 🎬 🎤 🎧️ 🏀 🏈 ⚾️ 🥎 🏐 🏉 🎾 🥏 🎱 🏓 🏸 🥅 🏒 🏑 🥍 🏏 ⛳️ 🏹 🎣 🥊 🥋 🎽 ⛸ 🥌 🛷 🛹🧨🏴‍☠️🏳️🔪 🗡 ⚔️🃏💍 💄 💋 👄 👅 👂 👃 👣 👁 👀 🧠 🦴 🦷 🗣 👤 👥🥰 🥵 🥶 🦵 🦶 🦴 🦷 🥽 🥼 🥾 🥿 🦝 🦙 🦛 🦘 🦡 🦢 🦚 🦜 🦞 🦟 🦠 🥭 🥬 🥯 🧂 🥮 🧁 🧭 🧱 🛹 🧳 🧨 🧧 🥎 🥏 🥍 🧿 🧩 🧸 ♟ 🧮 🧾 🧰 🧲 🧪 🧫 🧬 🧯 🧴 🧵 🧶 🧷 🧹 🧺 🧻 🧼 🧽 ♾ 🏴‍☠️ 🧥 👚 👕 👖 👔 👗 👙 👘 👠 👡 👢 👞 👟 🥾 🥿 🧦 🧤 🧣 🎩 🧢 👒 🎓 ⛑ 👑 👝 👛 👜 💼 🎒 👓 🕶 🥽 🥼 🌂 🧵 🧶🐶 🐱 🐭 🐹 🐰 🦊 🦝 🐻 🐼 🦘 🦡 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦢 🦅 🦉 🦚 🦜 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐚 🐞 🐜 🦗 🕷 🕸 🦂 🦟 🦠 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦏 🦛 🐪 🐫 🦙 🦒 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🕊 🐇 🐁 🐀 🐿 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🎋 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 💫 ⭐️ 🌟 ✨ ⚡️ ☄️ 💥 🔥 🌪 🌈 ☀️ 🌤 ⛅️ 🌥 ☁️ 🌦 🌧 ⛈ 🌩 🌨 ❄️ ☃️ ⛄️ 🌬 💨 💧 💦 ☔️ ☂️ 🌊 🌫 🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍍 🥭 🥥 🥝 🍅 🥑 🥦 🥒 🥬 🌶 🌽 🥕 🥔 🍠 🥐 🍞 🥖 🥨 🥯 🧀 🥚 🍳 🥞 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🥙 🌮 🌯 🥗 🥘 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥮 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🧂 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕️ 🍵 🥤 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🍾 🥄 🍴 🍽 🥣 🥡 🥢🅱️"
      let newName
      if (editName) newName = prompt("enter new name " + emojiList, editName);
      //find the name and update it
      if (newName) {
        for (let i = 0, len = this.layout.length; i < len; ++i) {
          if (this.layout[i].name === editName) {
            this.layout[i].name = newName;
            this.reIndex();
            this.unFocusAll();
            this.saveToLocal();
            const out = editName + " is now " + newName
            console.log(out);
            speech(out);
            document.getElementById("speech").innerHTML = out;
            break;
          }
        }
      }
    },
    removeItem: function (item) {
      let removeName = prompt("enter name of student to remove", this.layout[0].name);
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        if (this.layout[i].name === removeName) {
          this.layout.splice(i, 1);
          this.index--;
          this.reIndex();
          this.unFocusAll();
          this.saveToLocal();
          console.log(removeName + " removed");
          break;
        }
      }
      // document.body.style.userSelect = "auto";
      // document.body.style.userSelect = "none";
    },
    reIndex: function () {
      for (let j = 0, len = this.layout.length; j < len; ++j) {
        // console.log(this.layout[j].i);
        this.layout[j].i = j.toString();
      }
    },
    addItem: function () {
      this.unFocusAll();
      let name = prompt("name");
      if (name) {
        this.index++;
        let item = {
          x: 0,
          y: 0,
          w: 3,
          h: 1,
          i: this.index.toString(),
          name: name,
          num: 0
        };
        this.layout.push(item);
        this.saveToLocal();
      }
    },
    callRandom: function () {
      this.unFocusAll();
      let say = "";
      let pool = [];
      let totalCalled = 0;
      this.layout.forEach(function (element) {
        totalCalled += element.num;
      });

      // function cycle(who) {
      //   this.layout[Math.floor(Math.random() * this.layout.length)].focus = true;
      //   requestAnimationFrame(cycle);
      // }
      // requestAnimationFrame(cycle);


      const AVGCALLED = totalCalled / this.layout.length;
      for (let i = 0, len = this.layout.length; i < len; ++i) {
        if (this.layout[i].num > AVGCALLED) {
          pool.push(i);
        } else {
          for (let j = 0; j < 4; ++j) {
            pool.push(i);
          }
        }
      }
      const PICK = pool[Math.floor(Math.random() * pool.length)];
      const callOn = this.layout[PICK];

      callOn.focus = true;
      callOn.num++;

      if (this.verbose) {
        var d = new Date();
        var time = {
          min: d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
          hour: d.getHours() % 12,
          noon: d.getHours() > 12 ? "PM" : "AM",
          day: d.getDay(),
          dayname: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        };
        const thing = [
          "is a spooky ghost",
          "is asleep",
          "is my favorite",
          "is a wittle pupper",
          "is a spy",
          "is a robot",
          " ... eats poop",
          " ... needs a long nap",
          "... answer in 20 seconds or this program will delete you",
          " I wish I could always pick you.",
          "is having a good day.",
          "needs a high five!",
          "and I love cheese!",
          "is in charge for the next 30 seconds",
          "is super cool"
        ];
        const oh = ["oh", "hey", "what?", "oh wow"];
        const great = ["good news", "good news everyone", "great", "wow!", "amazing! ", "fantastic", "superb", "excellent", "magnificent"];
        const nextTo = PICK === this.layout.length - 1 ? this.layout[0].name : this.layout[PICK + 1].name; //name of another student

        const n = this.layout[PICK].name; //focus student's name
        const sayThis = [
          `${n} is just a city boy. Born and raise in South Detroit.`,
          `${n} is just a small town girl living in a lonely world.`,
          `${n} eats tide pods`,
          `${n} is trapped in the Quantum Realm`,
          `${n} is burnin' through the sky... yeah... Two hundred degrees, that's why they call ${n} Mister Fahrenheit`,
          `SWEET, ${n}, bum bum bum.  Good times never felt so good!`,
          `${n} has ascended to New West Plus.`,
          `${n} is never gonna give you up. Never gonna let you down. Never gonna run around and desert you. Never gonna make you cry. Never gonna say goodbye. Never gonna tell a lie and hurt you.`,
          `${n} blessed the rains down in Africa.`,
          `${n} went sicko mode.`,
          `${n} has doodoo bref.`,
          `${n}, Do you remember... the 21st night of September?`,
          `${n} secretly loves fidget spinners`,
          `Everyone make eye contact with ${n} for 5 seconds.`,
          `${n} is the type of student to remind the teacher to collect the homework.`,
          // `I'm thinking of a name that starts with the letter ${n[0]}... It's ${n}`,
          `The name’s ${n}... James ${n}.`,
          `${n} doesn't look like they're paying attention.`,
          `I know what you did ${n}. You can't hide it forever.`,
          `I think ${n} will get this right!`,
          `${n} has great hair today… So I choose ${n}.`,
          n + " go!",
          oh[Math.floor(Math.random() * oh.length)] + " " + n + " ... hi!",
          "This " + animals[Math.floor(Math.random() * animals.length)] + " thinks " + n + " is really cool.",
          n + " tell me your favorite color.",
          n + " has a pet " + animals[Math.floor(Math.random() * animals.length)],
          oh[Math.floor(Math.random() * oh.length)] + ", The time is " + time.hour + ":" + time.min + " " + time.noon + ", also I pick " + n,
          n + " " + thing[Math.floor(Math.random() * thing.length)],
          n + " " + thing[Math.floor(Math.random() * thing.length)] + " ... just kidding!",
          n + " " + thing[Math.floor(Math.random() * thing.length)],
          n + " " + thing[Math.floor(Math.random() * thing.length)],
          n + " " + thing[Math.floor(Math.random() * thing.length)],
          great[Math.floor(Math.random() * great.length)] + " ... " + n + " " + thing[Math.floor(Math.random() * thing.length)],
          n + " ... " + n + " " + n + " " + n + "? " + n + "! " + n + "? ",
          n + " " + n + " " + n + " " + n + " " + n,
          "Who looks like a " + animals[Math.floor(Math.random() * animals.length)] + "? ... it's " + n,
          great[Math.floor(Math.random() * great.length)] + " ... " + n + " eats poop",
          n + " ... is a " + animals[Math.floor(Math.random() * animals.length)],
          great[Math.floor(Math.random() * great.length)] + " ... " + n + " is a " + animals[Math.floor(Math.random() * animals.length)],
          oh[Math.floor(Math.random() * oh.length)] + ", is it " + time.dayname[time.day] + "? if it is I pick " + n,
          great[Math.floor(Math.random() * great.length)] + " ... " + n + " smells",
          n + " ... is friends with a " + animals[Math.floor(Math.random() * animals.length)],
          n + " smells like a " + animals[Math.floor(Math.random() * animals.length)],
          n + "'s favorite animal is a " + animals[Math.floor(Math.random() * animals.length)],
          n + " ... is literally a " + animals[Math.floor(Math.random() * animals.length)],
          n + "asaurus... rex",
          nextTo + ", is not who I pick ... I pick ... " + n,
          "I don't want to call on " + nextTo + ", so I pick ... " + n + " ... instead.",
          n + " ... has been called on " + (callOn.num - 1) + " times and this time makes " + callOn.num,
          n + " thinks " + nextTo + " is annoying",
          n + " ... hey " + n + " ... " + n + " ... hey ... hello " + n + " ... " + n,
          "I choose you ... " + n
        ];
        say = sayThis[Math.floor(Math.random() * sayThis.length)]; //pick a random array index to say
        //const say = sayThis[0]; //says the first command in array for testing
      } else {
        //non verbose mode
        say = this.layout[PICK].name;
      }
      speech(say);
      document.getElementById("speech").innerHTML = say;
      this.saveToLocal();
    }
  }
});
p.unFocusAll(); //clear all after load
function speech(say) {
  if ("speechSynthesis" in window) {
    let utterance = new SpeechSynthesisUtterance(say);
    //msg.voice = voices[10]; // Note: some voices don't support altering params
    //msg.voiceURI = 'native';
    //utterance.volume = 1; // 0 to 1
    utterance.rate = 1; // 0.1 to 10
    //utterance.pitch = 0.8; //0 to 2
    //utterance.text = 'Hello World';
    // utterance.lang = "en-GB";
    utterance.lang = document.getElementById("language").value; //'en-GB';
    //http://stackoverflow.com/questions/14257598/what-are-language-codes-for-voice-recognition-languages-in-chromes-implementati
    //working on mac: de-DE  en-GB  fr-FR  en-US  es-ES
    // var voices = speechSynthesis.getVoices();
    //   for(var i = 0; i < voices.length; i++ ) {
    //     console.log("Voice " + i.toString() + ' ' + voices[i].name + ' ' + voices[i].uri);
    //   }
    speechSynthesis.speak(utterance);
  }
}