let round = function(input) {
  return Math.round(input * 100) / 100;
};

Vue.component("vueSlider", {
  // options
});

var ballistic1 = new Vue({
  el: "#values",
  components: {
    vueSlider: window["vue-slider-component"]
  },
  data: {
    t: 0,
    x: 0,
    ux: 30,
    vx: 0,
    ax: 0,
    y: 0,
    uy: 30,
    vy: 0,
    ay: -9.8,
    value: 10
  },
  methods: {
    calc: function() {
      // if (this.ay > 0) this.ay = 0;
      this.vy = round(-Math.sqrt(this.uy * this.uy + 2 * this.ay * this.y));
      this.t = round((this.vy - this.uy) / this.ay);
      this.x = round(this.t * this.ux + (this.ax * this.t * this.t) / 2);
      this.vx = round(this.ux + this.ax * this.t);
      this.drawSVG();
    },
    calcX: function() {
      this.vx = round(Math.sqrt(this.ux * this.ux + 2 * this.ax * this.x));
      this.t = round((2 * this.x) / (this.vx + this.ux));
      this.y = round(this.t * this.uy + (this.ay * this.t * this.t) / 2);
      this.vy = round(-Math.sqrt(this.uy * this.uy + 2 * this.ay * this.y));
      // document.getElementById("plot").style.visibility = hidden
      this.drawSVG();
    },
    calcT: function() {
      //x side
      this.x = round(this.ux * this.t + 0.5 * this.ax * this.t * this.t);
      this.vx = round(this.ux + this.ax * this.t);
      //y side
      this.y = round(this.uy * this.t + 0.5 * this.ay * this.t * this.t);
      this.vy = round(this.uy + this.ay * this.t);
      this.drawSVG();
    },
    drawSVG: function() {
      const xOff = 50;
      const yOff = 200;
      const SCALE = 2;
      //set path of projectile
      let d = " M" + (xOff + this.ux * -100 + 0.5 * this.ax * -100 * -100) * SCALE + " " + (yOff - (this.uy * -100 + 0.5 * this.ay * -100 * -100)) * SCALE;
      for (let t = -100, len = 1000; t < len; t += 0.2) {
        d += " L" + (xOff + (this.ux * t + 0.5 * this.ax * t * t) * SCALE) + " " + (yOff - (this.uy * t + 0.5 * this.ay * t * t) * SCALE);
      }
      document.getElementById("b-path-full").setAttribute("d", d);
      //partial path
      d = " M" + xOff + " " + yOff;
      for (let t = 0, len = this.t; t < len; t += 0.01) {
        d += " L" + (xOff + (this.ux * t + 0.5 * this.ax * t * t) * SCALE) + " " + (yOff - (this.uy * t + 0.5 * this.ay * t * t) * SCALE);
      }
      document.getElementById("b-path").setAttribute("d", d);
      //move circle to end of trajectory
      if (!isNaN(this.x) && !isNaN(this.y)) {
        document.getElementById("b_path_end").style.display = "inline";
        document.getElementById("b_path_end").setAttribute("cx", xOff + this.x * SCALE);
        document.getElementById("b_path_end").setAttribute("cy", yOff - this.y * SCALE);
      } else {
        document.getElementById("b_path_end").style.display = "none";
      }
      //change initial velocity vectors
      document.getElementById("v_ux").setAttribute("x2", xOff + this.ux * 2);
      document.getElementById("v_uy").setAttribute("y2", yOff - this.uy * 2);
      //change final velocity vectors
      document.getElementById("v_vx").setAttribute("x1", xOff + this.x * SCALE);
      document.getElementById("v_vx").setAttribute("y1", yOff - this.y * SCALE);
      document.getElementById("v_vx").setAttribute("y2", yOff - this.y * SCALE);
      document.getElementById("v_vx").setAttribute("x2", xOff + this.x * SCALE + this.vx * 2);

      document.getElementById("v_vy").setAttribute("x1", xOff + this.x * SCALE);
      document.getElementById("v_vy").setAttribute("y1", yOff - this.y * SCALE);
      document.getElementById("v_vy").setAttribute("x2", xOff + this.x * SCALE);
      document.getElementById("v_vy").setAttribute("y2", yOff - this.y * SCALE - this.vy * 2);
      //change acceleration vectors
      const Vx = 550 + this.ax * 4;
      const Vy = 50 - this.ay * 4;
      document.getElementById("a").setAttribute("transform", `translate(${Vx} ${Vy}) rotate(${(Math.atan2(-this.ay, this.ax) * 180) / Math.PI} )`);
      document.getElementById("a_line").setAttribute("x2", Vx);
      document.getElementById("a_line").setAttribute("y2", Vy);
      //hide arrow if vector is small
      if (this.ax * this.ax + this.ay * this.ay < 1) {
        document.getElementById("a").style.display = "none";
      } else {
        document.getElementById("a").style.display = "inline";
      }
    }
  }
});
ballistic1.calc();
