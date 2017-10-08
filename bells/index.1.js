//http://newwestcharter.org/high-school-daily-bell-schedule/

const bells = {
  todayMinutes: 0,
  startMinutes: 450,
  schedules: {
    MondayThursday: [
      { start: 5 * 60 + 30, long: 120, name: "before school", fill: "#aff" },
      { start: 7 * 60 + 30, long: 60, name: "P1", fill: "#fff" },
      { start: 8 * 60 + 30, long: 3, name: "passing", fill: "#aaf" },
      { start: 8 * 60 + 33, long: 60, name: "P2", fill: "#fff" },
      { start: 9 * 60 + 33, long: 15, name: "brunch", fill: "#afa" },
      { start: 9 * 60 + 48, long: 3, name: "passing", fill: "#aaf" },
      { start: 9 * 60 + 51, long: 60, name: "P3", fill: "#fff" },
      { start: 10 * 60 + 51, long: 3, name: "passing", fill: "#aaf" },
      { start: 10 * 60 + 54, long: 60, name: "P4", fill: "#fff" },
      { start: 11 * 60 + 54, long: 30, name: "lunch", fill: "#afa" },
      { start: 12 * 60 + 24, long: 3, name: "passing", fill: "#aaf" },
      { start: 12 * 60 + 27, long: 60, name: "P5", fill: "#fff" },
      { start: 13 * 60 + 27, long: 3, name: "passing", fill: "#aaf" },
      { start: 13 * 60 + 30, long: 60, name: "P6", fill: "#fff" },
      { start: 14 * 60 + 30, long: 120, name: "after school", fill: "#aff" }
    ]
  },
  drawDigitalClock: function(date) {
    document.getElementById("time").textContent = `${date.getHours() % 12}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
  },
  findCurrentPeriod: function(b) {
    let period = 0;
    if (this.todayMinutes > b[0]) return b[0];
    for (let i = 0, len = b.length; i < len; ++i) {
      if (this.todayMinutes > b[i].start && this.todayMinutes < b[i].start + b[i].long) {
        return i;
      }
    }
    return b.length - 1;
  },
  moveSVGPeriods: function(b) {
    const SCALE = 0.476;
    //all periods
    for (let i = 0, len = b.length; i < len; ++i) {
      //position period boxes
      document.getElementById(i).setAttribute("x", (b[i].start - this.startMinutes) * SCALE);
      document.getElementById(i).setAttribute("width", b[i].long * SCALE);
      document.getElementById(i).setAttribute("fill", b[i].fill);
      //period titles
      if (b[i].name[0] === "P") {
        document.getElementById(b[i].name).textContent = b[i].name;
        document.getElementById(b[i].name).setAttribute("x", (b[i].start + b[i].long / 2 - this.startMinutes) * SCALE);
      }
    }
    //draw current time
    let path1 = `M${(this.todayMinutes - this.startMinutes) * SCALE} 80 v10`;
    document.getElementById("now").setAttribute("d", path1);
    //focus path
    // console.log(this.findCurrentPeriod(this.schedules.MondayThursday));
    let focus = 3; //this.findCurrentPeriod(this.schedules.MondayThursday);
    //don't draw focus if after school or before school
    if (focus !== 0 && focus !== b.length - 1) {
      const X = (b[focus].start - this.startMinutes) * SCALE;
      const WIDTH = b[focus].long * SCALE;
      const Y = 80;
      const HEIGHT = 20;
      let path = `M ${X + WIDTH} ${Y} h${-WIDTH}  
      L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y} `;
      //   let path = `M ${X + WIDTH} ${Y + HEIGHT} h${-WIDTH}
      //   L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y + HEIGHT} `;
      //   let path = `M ${X} ${Y} h${WIDTH} v${HEIGHT} h${-WIDTH} v${-HEIGHT}
      // L10 65 v-20 h 180 v20 h -180 h180 L${X + WIDTH} ${Y} `;
      document.getElementById("focus").setAttribute("d", path);
    }
  },
  //main repeating loop
  update: function() {
    var date = new Date();
    this.todayMinutes = date.getHours() * 60 + date.getMinutes();
    this.drawDigitalClock(date);
    this.moveSVGPeriods(this.schedules.MondayThursday);
  }
};

//var intervalID = window.setInterval(bells.update, 1000);
bells.update();
