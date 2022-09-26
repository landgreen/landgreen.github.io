//http://newwestcharter.org/high-school-daily-bell-schedule/
let playBells = false
let todayMinutes = 0;
let startMinutes = 440;
let timeMode = 0;
let date = new Date();
let stopwatchStart;
const MinutesInDay = 7 * 60 + 10 + 10;
let scale = 200 / MinutesInDay * 2.5;
let centerOnNow = true;

const color = {
  period: "#fff",
  passing: "#ddd",
  lunch: "#ddd"
};
const schedule = {
  current: "regular",
  mouse: 0,
  setCurrentByDate: function () {
    // if (schedule.current !== "rally" || date.getHours() > 22) {
    if (date.getDay() === 5) {
      schedule.current = "advisory";
    } else {
      schedule.current = "regular";
    }
    // }
  },
  cycleCurrent: function () { //called in html with onclick
    if (schedule.current === "regular") {
      schedule.current = "advisory";
    } else if (schedule.current === "advisory") {
      schedule.current = "rally";
    } else if (schedule.current === "rally") {
      schedule.current = "rallyLunch";
    } else if (schedule.current === "rallyLunch") {
      schedule.current = "rally5th";
    } else if (schedule.current === "rally5th") {
      schedule.current = "earlyRelease";
    } else if (schedule.current === "earlyRelease") {
      schedule.current = "regular";
    }
    update(false);
  },
  regular: [{
      start: 0,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 8 * 60 + 30,
      long: 60,
      name: "P1",
      showName: true,
      fill: color.period
    },
    {  
      start: 9 * 60 + 30,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 9 * 60 + 33,
      long: 60,
      name: "P2",
      showName: true,
      fill: color.period
    },
    {
      start: 10 * 60 + 33,
      long: 18,
      name: "snack",
      showName: false,
      fill: color.lunch
    },
    {
      start: 10 * 60 + 51,
      long: 60,
      name: "P3",
      showName: true,
      fill: color.period
    },
    {
      start: 11 * 60 + 51,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 11 * 60 + 54,
      long: 60,
      name: "P4",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 54,
      long: 30,
      name: "lunch",
      showName: false,
      fill: color.lunch
    },
    {
      start: 12 * 60 + 1 * 60 + 24,
      long: 63, //don't forget this period is 3 minutes longer
      name: "P5",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 2 * 60 + 27,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 12 * 60 + 2 * 60 + 30,
      long: 60,
      name: "P6",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 3 * 60 + 30,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    }
  ],
  advisory: [{
      start: 0,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 8 * 60 + 30,
      long: 55,
      name: "P1",
      showName: true,
      fill: color.period
    },
    {
      start: 9 * 60 + 25,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 9 * 60 + 28,
      long: 55,
      name: "P2",
      showName: true,
      fill: color.period
    },
    {
      start: 10 * 60 + 23,
      long: 26,
      name: "A",
      showName: true,
      fill: color.period
    },
    {
      start: 10 * 60 + 49,
      long: 18,
      name: "snack",
      showName: false,
      fill: color.lunch
    },
    {
      start: 11 * 60 + 07,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 11 * 60 + 10,
      long: 55,
      name: "P3",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 5,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 12 * 60 + 8,
      long: 55,
      name: "P4",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 1 * 60 + 03,
      long: 30,
      name: "lunch",
      showName: false,
      fill: color.lunch
    },
    {
      start: 12 * 60 + 1 * 60 + 33,
      long: 58,
      name: "P5",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 2 * 60 + 31,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 12 * 60 + 2 * 60 + 34,
      long: 56,
      name: "P6",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 3 * 60 + 30,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    }
  ],
  rally: [{
      start: 0,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 8 * 60 + 30,
      long: 50,
      name: "P1",
      showName: true,
      fill: color.period
    },
    {
      start: 9 * 60 + 20,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 9 * 60 + 23,
      long: 50,
      name: "P2",
      showName: true,
      fill: color.period
    },
    {
      start: 10 * 60 + 13,
      long: 18,
      name: "snack",
      showName: false,
      fill: color.lunch
    },
    {
      start: 10 * 60 + 31,
      long: 50,
      name: "P3",
      showName: true,
      fill: color.period
    },
    {
      start: 11 * 60 + 21,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 11 * 60 + 24,
      long: 50,
      name: "P4",
      showName: true,
      fill: color.period
    },
    {
      start: 12 * 60 + 14,
      long: 33,
      name: "lunch",
      showName: false,
      fill: color.lunch
    },
    {
      start: 12 * 60 + 47,
      long: 50,
      name: "P5",
      showName: true,
      fill: color.period
    },
    {
      start: 13 * 60 + 37,
      long: 3,
      name: "",
      showName: false,
      fill: color.passing
    },
    {
      start: 13 * 60 + 40,
      long: 50,
      name: "P6",
      showName: true,
      fill: color.period
    },
    {
      start: 14 * 60 + 30,
      long: 60,
      name: "Rally",
      showName: true,
      fill: color.period
    },
    {
      start: 15 * 60 + 30,
      long: 8 * 60 + 30,
      name: "",
      showName: false,
      fill: color.passing
    }
  ],
  rallyLunch: [{
    start: 0,
    long: 8 * 60 + 30,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 8 * 60 + 30,
    long: 50,
    name: "P1",
    showName: true,
    fill: color.period
  },
  {
    start: 9 * 60 + 20,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 9 * 60 + 23,
    long: 50,
    name: "P2",
    showName: true,
    fill: color.period
  },
  {
    start: 10 * 60 + 13,
    long: 18,
    name: "snack",
    showName: false,
    fill: color.lunch
  },
  {
    start: 10 * 60 + 31,
    long: 50,
    name: "P3",
    showName: true,
    fill: color.period
  },
  {
    start: 11 * 60 + 21,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 11 * 60 + 24,
    long: 50,
    name: "P4",
    showName: true,
    fill: color.period
  },
  {
    start: 12 * 60 + 14,
    long: 60,
    name: "Rally",
    showName: true,
    fill: color.period
  },
  {
    start: 13 * 60 + 14,
    long: 33,
    name: "lunch",
    showName: false,
    fill: color.lunch
  },
  {
    start: 13 * 60 + 47,
    long: 50,
    name: "P5",
    showName: true,
    fill: color.period
  },
  {
    start: 14 * 60 + 37,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 14 * 60 + 40,
    long: 50,
    name: "P6",
    showName: true,
    fill: color.period
  },
  {
    start: 15 * 60 + 30,
    long: 8 * 60 + 30,
    name: "",
    showName: false,
    fill: color.passing
  }
],
  earlyRelease: [{
    start: 0,
    long: 8 * 60 + 30,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 8 * 60 + 30,
    long: 42,
    name: "P1",
    showName: true,
    fill: color.period
  },
  {
    start: 9 * 60 + 12,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 9 * 60 + 15,
    long: 42,
    name: "P2",
    showName: true,
    fill: color.period
  },
  {
    start: 9 * 60 + 57,
    long: 3,
    name: "",
    showName: false,
    fill: color.lunch
  },
  {
    start: 10 * 60,
    long: 42,
    name: "P3",
    showName: true,
    fill: color.period
  },
  {
    start: 10 * 60 + 42,
    long: 35,
    name: "lunch",
    showName: false,
    fill: color.lunch
  },
  {
    start: 11 * 60 + 17,
    long: 43,
    name: "P4",
    showName: true,
    fill: color.period
  },
  {
    start: 12 * 60,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 12 * 60 + 3,
    long: 42,
    name: "P5",
    showName: true,
    fill: color.period
  },
  {
    start: 12 * 60 + 45,
    long: 3,
    name: "",
    showName: false,
    fill: color.passing
  },
  {
    start: 12 * 60 + 48,
    long: 42,
    name: "P6",
    showName: true,
    fill: color.period
  },
  {
    start: 13 * 60 + 30,
    long: 10 * 60 + 30,
    name: "",
    showName: false,
    fill: color.passing
  }
],
rally5th: [{
  start: 0,
  long: 8 * 60 + 30,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 8 * 60 + 30,
  long: 50,
  name: "P1",
  showName: true,
  fill: color.period
},
{
  start: 9 * 60 + 20,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 9 * 60 + 23,
  long: 50,
  name: "P2",
  showName: true,
  fill: color.period
},
{
  start: 10 * 60 + 13,
  long: 18,
  name: "snack",
  showName: false,
  fill: color.lunch
},
{
  start: 10 * 60 + 31,
  long: 50,
  name: "P3",
  showName: true,
  fill: color.period
},
{
  start: 11 * 60 + 21,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 11 * 60 + 24,
  long: 50,
  name: "P4",
  showName: true,
  fill: color.period
},
{
  start: 12 * 60 + 14,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 12 * 60 + 17,
  long: 57,
  name: "P5",
  showName: true,
  fill: color.period
},
{
  start: 13 * 60 + 14,
  long: 33,
  name: "lunch",
  showName: false,
  fill: color.lunch
},
{
  start: 13 * 60 + 47,
  long: 50,
  name: "Rally",
  showName: true,
  fill: color.period
},
{
  start: 14 * 60 + 37,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 14 * 60 + 40,
  long: 50,
  name: "P6",
  showName: true,
  fill: color.period
},
{
  start: 15 * 60 + 30,
  long: 8 * 60 + 30,
  name: "",
  showName: false,
  fill: color.passing
}
],
earlyRelease: [{
  start: 0,
  long: 8 * 60 + 30,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 8 * 60 + 30,
  long: 42,
  name: "P1",
  showName: true,
  fill: color.period
},
{
  start: 9 * 60 + 12,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 9 * 60 + 15,
  long: 42,
  name: "P2",
  showName: true,
  fill: color.period
},
{
  start: 9 * 60 + 57,
  long: 3,
  name: "",
  showName: false,
  fill: color.lunch
},
{
  start: 10 * 60,
  long: 42,
  name: "P3",
  showName: true,
  fill: color.period
},
{
  start: 10 * 60 + 42,
  long: 35,
  name: "lunch",
  showName: false,
  fill: color.lunch
},
{
  start: 11 * 60 + 17,
  long: 43,
  name: "P4",
  showName: true,
  fill: color.period
},
{
  start: 12 * 60,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 12 * 60 + 3,
  long: 42,
  name: "P5",
  showName: true,
  fill: color.period
},
{
  start: 12 * 60 + 45,
  long: 3,
  name: "",
  showName: false,
  fill: color.passing
},
{
  start: 12 * 60 + 48,
  long: 42,
  name: "P6",
  showName: true,
  fill: color.period
},
{
  start: 13 * 60 + 30,
  long: 10 * 60 + 30,
  name: "",
  showName: false,
  fill: color.passing
}
]
};
//   regular: [{
//       start: 0,
//       long: 7 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 7 * 60 + 30,
//       long: 60,
//       name: "P1",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 8 * 60 + 30,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 8 * 60 + 33,
//       long: 60,
//       name: "P2",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 9 * 60 + 33,
//       long: 15,
//       name: "snack",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 9 * 60 + 48,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 9 * 60 + 51,
//       long: 60,
//       name: "P3",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 10 * 60 + 51,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 10 * 60 + 54,
//       long: 60,
//       name: "P4",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 11 * 60 + 54,
//       long: 30,
//       name: "lunch",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 12 * 60 + 24,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 12 * 60 + 27,
//       long: 60,
//       name: "P5",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 13 * 60 + 27,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 13 * 60 + 30,
//       long: 60,
//       name: "P6",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 14 * 60 + 30,
//       long: 9 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     }
//   ],
//   advisory: [{
//       start: 0,
//       long: 7 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 7 * 60 + 30,
//       long: 55,
//       name: "P1",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 8 * 60 + 25,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 8 * 60 + 28,
//       long: 55,
//       name: "P2",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 9 * 60 + 23,
//       long: 15,
//       name: "snack",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 9 * 60 + 38,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 9 * 60 + 41,
//       long: 26,
//       name: "A",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 10 * 60 + 07,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 10 * 60 + 10,
//       long: 55,
//       name: "P3",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 11 * 60 + 5,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 11 * 60 + 8,
//       long: 55,
//       name: "P4",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 12 * 60 + 03,
//       long: 27,
//       name: "lunch",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 12 * 60 + 30,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 12 * 60 + 33,
//       long: 58,
//       name: "P5",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 13 * 60 + 31,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 13 * 60 + 34,
//       long: 56,
//       name: "P6",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 14 * 60 + 30,
//       long: 9 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     }
//   ],
//   rally: [{
//       start: 0,
//       long: 7 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 7 * 60 + 30,
//       long: 50,
//       name: "P1",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 8 * 60 + 20,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 8 * 60 + 23,
//       long: 50,
//       name: "P2",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 9 * 60 + 13,
//       long: 15,
//       name: "snack",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 9 * 60 + 28,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 9 * 60 + 31,
//       long: 50,
//       name: "P3",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 10 * 60 + 21,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 10 * 60 + 24,
//       long: 50,
//       name: "P4",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 11 * 60 + 14,
//       long: 30,
//       name: "lunch",
//       showName: false,
//       fill: color.lunch
//     },
//     {
//       start: 11 * 60 + 44,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 11 * 60 + 47,
//       long: 50,
//       name: "P5",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 12 * 60 + 37,
//       long: 3,
//       name: "",
//       showName: false,
//       fill: color.passing
//     },
//     {
//       start: 12 * 60 + 40,
//       long: 50,
//       name: "P6",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 13 * 60 + 30,
//       long: 60,
//       name: "Rally",
//       showName: true,
//       fill: color.period
//     },
//     {
//       start: 14 * 60 + 30,
//       long: 9 * 60 + 30,
//       name: "",
//       showName: false,
//       fill: color.passing
//     }
//   ]
// };

function toggleMode() {
  timeMode++;
  if (timeMode > 2) {
    timeMode = 0;
  } else if (timeMode === 2) {
    stopwatchStart = Date.now();
  }
}


function drawDigitalClock() {
  date = new Date();
  document.getElementById("time").textContent = `${(date.getHours() - 1) % 12 + 1}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
  // document.getElementById("week-day").textContent = dayOfWeekAsString(date.getDay());
  // document.getElementById("date").textContent = nameOfMonthAsString(date.getMonth()) + " " + date.getDate();
  // if (timeMode === 0) {
  //   //time no seconds
  //   document.getElementById("time").textContent = `${(date.getHours() - 1) % 12 + 1}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
  // } else if (timeMode === 1) {
  //   //time with seconds
  //   document.getElementById("time").textContent = `${(date.getHours() - 1) % 12 + 1}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${
  //     date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
  //   }`;
  // } else if (timeMode === 2) {
  //   //stopwatch
  //   let end = Date.now();
  //   let d = new Date(end - stopwatchStart);
  //   document.getElementById("time").textContent = d.toLocaleTimeString("en-GB").slice(3, 8);
  // }


  // else {
  //   document.getElementById("time").textContent = "";
  //   //analog clock
  //   let seconds = date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
  //   // console.log(seconds);
  //   //hours
  //   let h = (seconds / 60 / 60) % 12;
  //   h = h / 12 * 2 * Math.PI - Math.PI / 2;
  //   document.getElementById("clock-hours").setAttribute("x2", 15 * Math.cos(h));
  //   document.getElementById("clock-hours").setAttribute("y2", 15 * Math.sin(h));
  //   //minutes
  //   let m = (seconds / 60) % 60;
  //   m = m / 60 * 2 * Math.PI - Math.PI / 2;
  //   document.getElementById("clock-minutes").setAttribute("x2", 24 * Math.cos(m));
  //   document.getElementById("clock-minutes").setAttribute("y2", 24 * Math.sin(m));
  //   //seconds
  //   let s = seconds % 60;
  //   s = s / 60 * 2 * Math.PI - Math.PI / 2;
  //   document.getElementById("clock-seconds").setAttribute("x2", 30 * Math.cos(s));
  //   document.getElementById("clock-seconds").setAttribute("y2", 30 * Math.sin(s));
  //   document.getElementById("analogClock").setAttribute("visibility", "visible");
  // }
}

function dayOfWeekAsString(dayIndex) {
  return ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"][dayIndex];
}

function nameOfMonthAsString(MonthIndex) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][MonthIndex];
}

function nameOfSeasonAsString(MonthIndex) {
  return ["spring", "summer", "fall", "winter"][MonthIndex];
}

function findCurrentPeriod(b) {
  // let period = 0;
  for (let i = 0, len = b.length; i < len; ++i) {
    if (todayMinutes >= b[i].start && todayMinutes < b[i].start + b[i].long) {
      return i;
    }
  }
  return b.length - 1;
}

function drawCurrentPeriod(b) {
  const period = b[findCurrentPeriod(b)];
  let startTime = {
    hour: Math.floor((period.start / 60 - 1) % 12 + 1),
    minute: period.start % 60
  };
  if (startTime.minute < 10) startTime.minute = "0" + startTime.minute; //add zero for single digit minutes
  let endTime = {
    hour: Math.floor(((period.start + period.long) / 60 - 1) % 12 + 1),
    minute: (period.start + period.long) % 60
  };
  if (endTime.minute < 10) endTime.minute = "0" + endTime.minute; //add zero for single digit minutes
  document.getElementById("period").textContent = period.name + " " + startTime.hour + ":" + startTime.minute + " - " + endTime.hour + ":" + endTime.minute;
  // document.getElementById("period-time").textContent = startTime + " - " + endTime;
  document.getElementById(schedule.mouse).setAttribute("fill", schedule[schedule.current][schedule.mouse].fill);
  //color now line
  if (period.showName && (todayMinutes - period.start < 15 || todayMinutes - period.start > period.long - 15)) {
    document.getElementById("now").setAttribute("stroke", "#f05");
  } else {
    document.getElementById("now").setAttribute("stroke", "#000");
  }
}

function enterBlock(target) {
  let id = target.id;
  if (id.charAt(0) === "n") {
    id = id.substr(1);
  }
  schedule.mouse = id;
  period = schedule[schedule.current][id];
  let startTime = {
    hour: Math.floor((period.start / 60 - 1) % 12 + 1),
    minute: period.start % 60
  };
  if (startTime.minute < 10) startTime.minute = "0" + startTime.minute; //add zero for single digit minutes
  let endTime = {
    hour: Math.floor(((period.start + period.long) / 60 - 1) % 12 + 1),
    minute: (period.start + period.long) % 60
  };
  if (endTime.minute < 10) endTime.minute = "0" + endTime.minute; //add zero for single digit minutes
  // document.getElementById("period").textContent = period.name + " " + startTime.hour + ":" + startTime.minute + " - " + endTime.hour + ":" + endTime.minute;
  document.getElementById("period").textContent = startTime.hour + ":" + startTime.minute + " - " + endTime.hour + ":" + endTime.minute;
  document.getElementById(id).setAttribute("fill", "#bff");
}

function moveSVGPeriods(b) {
  //center on current time
  if (centerOnNow) {
    document.getElementById("period-zone").setAttribute("transform", "translate(" + (100 - (todayMinutes - startMinutes) * scale) + ",77)");
    // document.getElementById("period-zone").setAttribute("transform", "translate(" + (50 - (todayMinutes - startMinutes) * scale) + ",77)");
  } else {
    document.getElementById("period-zone").setAttribute("transform", "translate(-27,77)");
  }
  //schedule title
  document.getElementById("schedule").textContent = schedule.current + " schedule";
  // hide all periods
  for (let i = 0, len = 17; i < len; ++i) {
    document.getElementById(i).setAttribute("width", 0);
    document.getElementById("n" + i).textContent = "  ";
  }

  for (let i = 0, len = b.length; i < len; ++i) {
    //position period boxes
    document.getElementById(i).setAttribute("x", (b[i].start - startMinutes) * scale);
    document.getElementById(i).setAttribute("width", b[i].long * scale);
    document.getElementById(i).setAttribute("fill", b[i].fill);
    //period titles
    if (b[i].showName) {
      document.getElementById("n" + i).textContent = b[i].name;
      document.getElementById("n" + i).setAttribute("x", (b[i].start + b[i].long / 2 - startMinutes) * scale);
    }
  }
  //draw line for current time
  let path1 = `M${(todayMinutes - startMinutes) * scale} -2 v24`;
  document.getElementById("now").setAttribute("d", path1);

  //focus path
  // let focus = 3;
  //don't draw focus if after school or before school
  // if (focus !== 0 && focus !== b.length - 1) {
  //   const X = (b[focus].start - startMinutes) * scale;
  //   const WIDTH = b[focus].long * scale;
  //   const Y = 80;
  //   const HEIGHT = 20;
  //   let path = `M ${X + WIDTH} ${Y} h${-WIDTH}
  //     L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y} `;
  //   //   let path = `M ${X + WIDTH} ${Y + HEIGHT} h${-WIDTH}
  //   //   L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y + HEIGHT} `;
  //   //   let path = `M ${X} ${Y} h${WIDTH} v${HEIGHT} h${-WIDTH} v${-HEIGHT}
  //   // L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y} `;
  //   document.getElementById("focus").setAttribute("d", path);
  // }
}

function toggleZoom() {
  if (centerOnNow) {
    centerOnNow = false;
    scale = 200 / MinutesInDay;
  } else {
    centerOnNow = true;
    scale = 200 / MinutesInDay * 2.5;
  }
  moveSVGPeriods(schedule[schedule.current]);
}

//**************************************************
//weather

function slowUpdate() {
  //check if a new day and schedule
  //output day and month
  date = new Date();
  if (date.getHours() === 0) schedule.setCurrentByDate(); //at the end of the day check and see if it's Friday and you need to switch to advisory
  document.getElementById("week-day").textContent = dayOfWeekAsString(date.getDay());
  document.getElementById("date").textContent = nameOfMonthAsString(date.getMonth()) + " " + date.getDate();

  //get position
  function success(position) {
    getWeather(position.coords.latitude, position.coords.longitude);
    localStorage.setItem("latitude", position.coords.latitude);
    localStorage.setItem("longitude", position.coords.longitude);
  }

  function error() {
    console.log("Unable to retrieve your location");
  }

  if (localStorage.getItem("latitude") === null) {
    console.log("get new local");
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    getWeather(localStorage.latitude, localStorage.longitude);
  }

  //generic function to get JSON
  function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (success) success(JSON.parse(xhr.responseText));
        } else {
          if (error) error(xhr);
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  }
  //https://home.openweathermap.org/api_keys
  //https://openweathermap.org/api
  //https://api.openweathermap.org/data/2.5/weather?q=LosAngeles&APPID=
  //https://api.openweathermap.org/data/2.5/forecast?q=LosAngeles&APPID=
  function getWeather(lat, long) {
    const APPID = "258f642b3c9947c0eeae26f4a1ef22a3";
    loadJSON(
      "https://api.openweathermap.org/data/2.5/weather?&units=imperial&lat=" + lat + "&lon=" + long + "&APPID=" + APPID,
      function (data) {
        // console.log(data);
        setWeather(data.main.temp, data.weather[0].description);
      },
      function (xhr) {
        console.error(xhr);
      }
    );
  }

  function setWeather(temp, weather) {
    document.getElementById("temp").textContent = Math.round(temp) + "° F";

    document.getElementById("weather").textContent = weather;
    let size = 70 / weather.length;
    size = Math.min(11, Math.max(size, 4));
    document.getElementById("weather").setAttribute("font-size", size + "px");
  }
}

function noWeather() {
  document.getElementById("temp").textContent = "20" + date.getYear() % 100;
  document.getElementById("weather").textContent = nameOfSeasonAsString(Math.floor(date.getMonth() / 4));
}


function bellSound(time = 2000, frequency = 650, volume = 1) {
  let audioCtx, oscillator1, gainNode
  audioCtx = new(window.AudioContext)();
  oscillator1 = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = volume; //controls volume
  oscillator1.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator1.frequency.value = frequency; // value in hertz
  oscillator1.start();
  document.body.style.backgroundColor = "#0ff";

  setTimeout(function () {
    audioCtx.suspend()
    document.body.style.backgroundColor = "#fff";
  }, time);
}

function bellToggle() {
  if (playBells) {
    playBells = false
    document.getElementById("bell-toggle").textContent = "no bells";
  } else {
    playBells = true
    document.getElementById("bell-toggle").textContent = "bells on";
  }
}


//**************************************************
//main repeating loop
function update() {
  date = new Date();
  todayMinutes = date.getHours() * 60 + date.getMinutes();
  drawCurrentPeriod(schedule[schedule.current]);
  moveSVGPeriods(schedule[schedule.current]);

  // bellSound();
  //ring bell on new period
  // for (let i = 0, len = schedule[schedule.current].length; i < len; ++i) {
  //   // console.log(todayMinutes, schedule[schedule.current][i].start)
  //   if (schedule[schedule.current][i].start = todayMinutes) {
  //     if (bell && playBells) bellSound();
  //   }
  // }
}

// let audioCtx = new(window.AudioContext || window.webkitAudioContext)();

// let oscillator1 = audioCtx.createOscillator();
// let gainNode1 = audioCtx.createGain();
// gainNode1.gain.value = 1; //controls volume
// oscillator1.connect(gainNode1);
// gainNode1.connect(audioCtx.destination);
// oscillator1.frequency.value = 650; // value in hertz
// oscillator1.start();
// setTimeout(() => {
//   oscillator1.stop();
// }, 2000);

schedule.setCurrentByDate(); //check and see if it's Friday and you need to switch to advisory
update();
noWeather();
slowUpdate();
drawDigitalClock();

setTimeout(function () {
  update();
  window.setInterval(slowUpdate, 10 * 60 * 1000); //update weather every 10 min
  window.setInterval(update, 60 * 1000); //update every minute
}, (60 - date.getSeconds()) * 1000);

window.addEventListener("focus", function () {
  update();
});

const cycle = function () {
  drawDigitalClock();
  window.requestAnimationFrame(cycle);
};
window.requestAnimationFrame(cycle);