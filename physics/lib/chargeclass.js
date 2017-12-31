var canvas, ctx;
class Charge {
  //charge class
  constructor(
    type,
    position,
    velocity = {
      x: 0,
      y: 0
    }
  ) {
    this.position = position;
    this.velocity = velocity;
    if (type === "e") {
      this.electron = true;
      this.name = "electron";
      this.charge = -1;
      this.radius = 15;
      this.color = "rgba(0,100,255,0.4)";
    } else if (type === "p") {
      this.electron = false;
      this.name = "proton";
      this.charge = 1;
      this.radius = 4;
      this.color = "rgba(255,0,100,1)";
    }
  }
  static spawnCharges(who, len = 1, type = "e") {
    for (let i = 0; i < len; ++i) {
      who[who.length] = new Charge(type, {
        x: 30 + Math.random() * (canvas.width - 60),
        y: 30 + Math.random() * (canvas.height - 60)
      });
    }
  }
  static setCanvas(el) {
    canvas = el;
    ctx = canvas.getContext("2d");
    ctx.font = "300 20px Roboto";
  }
  static drawAll(who) {
    for (let i = 0, len = who.length; i < len; ++i) {
      ctx.fillStyle = who[i].color;
      ctx.beginPath();
      ctx.arc(who[i].position.x, who[i].position.y, who[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  static teleport(who, off = 200) {
    let count = 0;
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron && who[i].position.x > canvas.width + off) {
        count++;
        who[i].position.x = -off;
      }
    }
    return count;
  }
  static bounds(who, range = 50) {
    //range = how far outside of canvas,  0 is at canvs edge
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        if (who[i].position.x > canvas.width + range) {
          who[i].velocity.x = 0; //-Math.abs(who[i].velocity.x)
          who[i].position.x = canvas.width + range;
        } else if (who[i].position.x < -range) {
          who[i].velocity.x = 0; //Math.abs(who[i].velocity.x)
          who[i].position.x = -range;
        }
        if (who[i].position.y > canvas.height + range) {
          who[i].velocity.y = 0; //-Math.abs(who[i].velocity.y)
          who[i].position.y = canvas.height + range;
        } else if (who[i].position.y < -range) {
          who[i].velocity.y = 0; //Math.abs(who[i].velocity.y)
          who[i].position.y = -range;
        }
      }
    }
  }
  static physicsAll(who) {
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        //move
        who[i].position.x += who[i].velocity.x;
        who[i].position.y += who[i].velocity.y;
        //friction
        who[i].velocity.x *= 0.99;
        who[i].velocity.y *= 0.99;
        //electrostatic force
        for (let j = 0, len = who.length; j < len; ++j) {
          if (i != j) {
            const dx = who[i].position.x - who[j].position.x;
            const dy = who[i].position.y - who[j].position.y;
            const a = Math.atan2(dy, dx);
            //the +1000 keeps r from being zero / adds stability
            const r = dx * dx + dy * dy + 1000;
            const mag = 200 * who[i].charge * who[j].charge / r;
            who[i].velocity.x += mag * Math.cos(a);
            who[i].velocity.y += mag * Math.sin(a);
          }
        }
      }
    }
  }
  static pushZone(who, offx = 0, push = 0.1) {
    const range = {
      min: {
        x: offx - 50,
        y: 50
      },
      max: {
        x: offx + 50,
        y: 350
      }
    };
    //draw push
    ctx.beginPath();
    ctx.moveTo(range.min.x, range.min.y);
    ctx.lineTo(range.min.x, range.max.y);
    ctx.lineTo(range.max.x, range.max.y);
    ctx.lineTo(range.max.x, range.min.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
    ctx.stroke();
    // ctx.strokeStyle = "#000";
    // ctx.stroke();
    //push electrons
    for (let i = 0, len = who.length; i < len; ++i) {
      if (
        who[i].electron &&
        who[i].position.x < range.max.x &&
        who[i].position.x > range.min.x &&
        who[i].position.y < range.max.y &&
        who[i].position.y > range.min.y
      ) {
        who[i].velocity.y += push;
      }
    }
  }
  static slow(range, who) {
    //draw slow
    ctx.beginPath();
    ctx.moveTo(range.min.x, range.min.y);
    ctx.lineTo(range.min.x, range.max.y);
    ctx.lineTo(range.max.x, range.max.y);
    ctx.lineTo(range.max.x, range.min.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fill();
    //slow electrons
    for (let i = 0, len = who.length; i < len; ++i) {
      if (
        who[i].electron &&
        who[i].position.x < range.max.x &&
        who[i].position.x > range.min.x &&
        who[i].position.y < range.max.y &&
        who[i].position.y > range.min.y
      ) {
        who[i].velocity.x *= 0.8;
        who[i].velocity.y *= 0.8;
      }
    }
  }
  static repulse(who, pos) {
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        const dx = who[i].position.x - pos.x;
        const dy = who[i].position.y - pos.y;
        const a = Math.atan2(dy, dx);
        //the +4000 keeps r from being zero
        const r = dx * dx + dy * dy + 4000;
        const mag = 30000 / r;
        who[i].velocity.x += mag * Math.cos(a);
        who[i].velocity.y += mag * Math.sin(a);
      }
    }
  }

  static potential(who, position) {
    let v = 0;
    for (let i = 0, len = who.length; i < len; ++i) {
      const dx = who[i].position.x - position.x;
      const dy = who[i].position.y - position.y;
      // const a = Math.atan2(dy, dx);
      // //the +4000 keeps r from being zero / adds stability
      // const r = (dx * dx + dy * dy) + 4000
      // v += 200 * who[i].charge / r;

      v += who[i].charge / Math.sqrt(dx * dx + dy * dy + 4000);
    }
    return v;
  }

  static vectorField(who, spacing = 15) {
    var lenX = Math.floor(canvas.width / spacing);
    var lenY = Math.floor(canvas.height / spacing);
    var x, y, dist, draw;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#033";
    for (var k = 0; k < lenY; k++) {
      for (var j = 0; j < lenX; j++) {
        draw = true;
        x = canvas.width * (j + 0.5) / lenX;
        y = canvas.height * (k + 0.5) / lenY;
        //calc Forces
        var f, a;
        var fx = 0;
        var fy = 0;
        for (var i = 0; i < who.length; i++) {
          var dx = who[i].position.x - x;
          var dy = who[i].position.y - y;
          dist = Math.sqrt(dx * dx + dy * dy) + 1000;
          if (dist < who[i].r) {
            draw = false; //don't draw in inside a body
            break; //exit the forloop
          }
          f = -who[i].charge * 6000000 / (dist * dist);
          a = Math.atan2(dy, dx);
          fx += f * Math.cos(a);
          fy += f * Math.sin(a);
        }
        if (draw) {
          f = Math.sqrt(fx * fx + fy * fy);
          if (f > spacing - 5) f = spacing - 5;
          a = Math.atan2(fy, fx);
          var alpha = 1;
          if (f < 6) alpha = f / 6;
          ctx.globalAlpha = alpha * alpha;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(a);
          //vector line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.abs(f), 0);
          ctx.stroke();
          //arrows
          ctx.beginPath();
          ctx.moveTo(f + 4, 0);
          ctx.lineTo(f, -2);
          ctx.lineTo(f, 2);
          ctx.fillStyle = "#033";
          ctx.fill();
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  static scalarField(who, fieldSpacing = 3, fieldMag = 1000) {
    const lenX = Math.floor(canvas.width / fieldSpacing);
    const lenY = Math.floor(canvas.height / fieldSpacing);
    const offset = Math.floor(fieldSpacing / 2);
    const squareRadius = fieldSpacing + 1;
    const yHeight = Math.floor(canvas.height / lenY);
    const xheight = Math.floor(canvas.width / lenX);
    const chroma = [
      //http://gka.github.io/palettes/#colors=800,f00,f80,fd0,fff,0df,08f,00f,008|steps=256|bez=0|coL=0
      "#880000",
      "#8b0000",
      "#8f0001",
      "#930001",
      "#960001",
      "#9a0002",
      "#9d0002",
      "#a10002",
      "#a40002",
      "#a80002",
      "#ac0002",
      "#af0002",
      "#b30002",
      "#b70002",
      "#bb0002",
      "#be0002",
      "#c20002",
      "#c60002",
      "#c90002",
      "#cd0002",
      "#d10002",
      "#d50002",
      "#d90002",
      "#dc0001",
      "#e00001",
      "#e40001",
      "#e80001",
      "#ec0001",
      "#f00001",
      "#f40001",
      "#f80000",
      "#fc0000",
      "#ff0200",
      "#ff1300",
      "#ff1e00",
      "#ff2500",
      "#ff2c00",
      "#ff3200",
      "#ff3700",
      "#ff3c00",
      "#ff4000",
      "#ff4400",
      "#ff4800",
      "#ff4c00",
      "#ff5000",
      "#ff5300",
      "#ff5600",
      "#ff5a00",
      "#ff5d00",
      "#ff6000",
      "#ff6300",
      "#ff6600",
      "#ff6900",
      "#ff6c00",
      "#ff6f00",
      "#ff7100",
      "#ff7400",
      "#ff7700",
      "#ff7900",
      "#ff7c00",
      "#ff7f00",
      "#ff8100",
      "#ff8400",
      "#ff8600",
      "#ff8900",
      "#ff8c00",
      "#ff8e00",
      "#ff9100",
      "#ff9400",
      "#ff9700",
      "#ff9a00",
      "#ff9c00",
      "#ff9f00",
      "#ffa200",
      "#ffa500",
      "#ffa700",
      "#ffaa00",
      "#ffad00",
      "#ffaf00",
      "#ffb200",
      "#ffb500",
      "#ffb700",
      "#ffba00",
      "#ffbc00",
      "#ffbf00",
      "#ffc200",
      "#ffc400",
      "#ffc700",
      "#ffc900",
      "#ffcc00",
      "#ffcf00",
      "#ffd100",
      "#ffd400",
      "#ffd600",
      "#ffd900",
      "#ffdb00",
      "#ffdd0e",
      "#ffde22",
      "#ffdf30",
      "#ffe03b",
      "#ffe144",
      "#ffe24d",
      "#ffe355",
      "#ffe45d",
      "#ffe565",
      "#ffe66c",
      "#ffe773",
      "#ffe87a",
      "#ffe981",
      "#ffeb88",
      "#ffec8e",
      "#ffed95",
      "#ffee9b",
      "#ffefa2",
      "#fff0a9",
      "#fff1af",
      "#fff2b5",
      "#fff3bc",
      "#fff4c2",
      "#fff5c9",
      "#fff6cf",
      "#fff8d5",
      "#fff9dc",
      "#fffae2",
      "#fffbe9",
      "#fffcef",
      "#fffdf5",
      "#fffefc",
      "#fdfeff",
      "#f8fdff",
      "#f3fcff",
      "#eefbff",
      "#eafaff",
      "#e5f9ff",
      "#e0f8ff",
      "#dbf7ff",
      "#d6f6ff",
      "#d1f5ff",
      "#ccf4ff",
      "#c6f3ff",
      "#c1f2ff",
      "#bcf1ff",
      "#b6f0ff",
      "#b0efff",
      "#abeeff",
      "#a5edff",
      "#9fecff",
      "#98ebff",
      "#92eaff",
      "#8be9ff",
      "#84e7ff",
      "#7de6ff",
      "#75e5ff",
      "#6de4ff",
      "#64e3ff",
      "#5ae2ff",
      "#4fe1ff",
      "#42e0ff",
      "#31dfff",
      "#17ddff",
      "#04dbff",
      "#0ad9ff",
      "#0fd6ff",
      "#13d3ff",
      "#16d0ff",
      "#18ceff",
      "#1acbff",
      "#1bc8ff",
      "#1dc6ff",
      "#1ec3ff",
      "#1fc0ff",
      "#1fbeff",
      "#20bbff",
      "#20b8ff",
      "#21b6ff",
      "#21b3ff",
      "#20b0ff",
      "#20aeff",
      "#20abff",
      "#1fa8ff",
      "#1ea6ff",
      "#1da3ff",
      "#1ca0ff",
      "#1b9eff",
      "#199bff",
      "#1898ff",
      "#1596ff",
      "#1393ff",
      "#1091ff",
      "#0c8eff",
      "#078bff",
      "#0189ff",
      "#0686ff",
      "#0d83ff",
      "#1280ff",
      "#167dff",
      "#197aff",
      "#1b77ff",
      "#1d73ff",
      "#1f70ff",
      "#206dff",
      "#216aff",
      "#2267ff",
      "#2364ff",
      "#2461ff",
      "#245dff",
      "#245aff",
      "#2457ff",
      "#2453ff",
      "#2450ff",
      "#234cff",
      "#2248ff",
      "#2245ff",
      "#2141ff",
      "#1f3dff",
      "#1e39ff",
      "#1c34ff",
      "#1a30ff",
      "#182bff",
      "#1526ff",
      "#111fff",
      "#0d18ff",
      "#070fff",
      "#0102ff",
      "#0000fc",
      "#0000f8",
      "#0000f4",
      "#0000f0",
      "#0000ec",
      "#0000e8",
      "#0000e4",
      "#0000e0",
      "#0000dd",
      "#0000d9",
      "#0000d5",
      "#0000d1",
      "#0000cd",
      "#0000ca",
      "#0000c6",
      "#0000c2",
      "#0000be",
      "#0000bb",
      "#0000b7",
      "#0000b3",
      "#0000af",
      "#0000ac",
      "#0000a8",
      "#0000a5",
      "#0000a1",
      "#00009d",
      "#00009a",
      "#000096",
      "#000093",
      "#00008f",
      "#00008c",
      "#000088"
    ];
    let hue = 0; //tracks last color to see if a new ctx color is needed
    for (let k = 0; k < lenY + 1; k++) {
      for (let j = 0; j < lenX + 1; j++) {
        const x = xheight * j;
        const y = yHeight * k;
        let mag = 0;
        for (let i = 0, len = who.length; i < len; i++) {
          const dx = who[i].position.x - x;
          const dy = who[i].position.y - y;
          mag -= who[i].charge / (Math.sqrt(dx * dx + dy * dy) + 1);
        }
        let thisHue = Math.min(Math.max(Math.round(mag * fieldMag) + 128, 0), 255);
        if (thisHue != hue) {
          //only change color if the color is new
          hue = thisHue;
          ctx.fillStyle = chroma[hue];
        }
        ctx.fillRect(x - offset, y - offset, squareRadius, squareRadius);
      }
    }
  }
  static magnetic(who, scale = 0.05) {
    for (let i = 0, len = who.length; i < len; ++i) {
      let dir = Math.atan2(who[i].velocity.y, who[i].velocity.x);
      let angle = dir + Math.PI / 2 * who[i].charge;
      let speed = Math.sqrt(who[i].velocity.x * who[i].velocity.x + who[i].velocity.y * who[i].velocity.y);
      let mag = scale * speed;
      who[i].velocity.x += mag * Math.cos(angle);
      who[i].velocity.y += mag * Math.sin(angle);
    }
  }
}
