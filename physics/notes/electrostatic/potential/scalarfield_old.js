/*  todo
make pixel detail higher for higher lum values only, near the charges
http://gka.github.io/palettes/#colors=red,yellow,white,cyan,blue|steps=1000|bez=1|coL=0
*/
"use strict";
(function setup() {
  //writes a message onload
  let canvas = document.getElementById("field");
  let ctx = canvas.getContext("2d");
  ctx.font = "25px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})();

function diagram(button) {
  button.onclick = null; //stops the function from running after first run
  //document.getElementById("field").style.filter = "blur(6px)";  //adds a blue to everything to remove pixelation
  let settings = {
    size: 13,
    fieldSpacing: 6, //pixel size,  below 5 is very very slow
    fieldMag: 5000, //how saturated the fields look
    bar: 40
  };

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

  let canvas = document.getElementById("field");
  let ctx = canvas.getContext("2d");

  (function setupCanvas() {
    canvas.width = window.innerWidth - 40;
    ctx.font = "15px Arial";
    ctx.lineCap = "round";
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    //ctx.lineWidth = 2;
  })();
  window.onresize = function() {
    setupCanvas();
  };

  let mouse = {
    down: false,
    pos: {
      x: 0,
      y: 0
    }
  };

  // waits for mouse move and then updates position
  document.addEventListener(
    "mousemove",
    function(e) {
      let rect = canvas.getBoundingClientRect();
      mouse.pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      if (mouse.pos.x > 1 && mouse.pos.y > 1 && mouse.pos.x < canvas.width - 1 && mouse.pos.y < canvas.height - 1) cycle();
    },
    false
  );

  //track if mouse is up or down
  window.onmousedown = function() {
    mouse.down = true;
    let over = false;
    for (let i = 0; i < body.length; i++) {
      if (!over) {
        body[i].isMouseOver = body[i].mouseOverCheck();
        if (body[i].isMouseOver) {
          over = true;
          body[i].setMouseOffset();
        }
      } else {
        body[i].isMouseOver = false;
      }
    }
    if (mouse.pos.y > canvas.height - settings.bar) {
      let len = body.length;
      body[len] = new bodyProto(len + 1, mouse.pos.x, mouse.pos.y, settings.size, Math.round(Math.random()) * 2 - 1);
      body[len].isMouseOver = true;
    }
    if (mouse.pos.x > 1 && mouse.pos.y > 1 && mouse.pos.x < canvas.width - 1 && mouse.pos.y < canvas.height - 1) cycle();
  };
  window.onmouseup = function() {
    mouse.down = false;
    if (mouse.pos.y > canvas.height - settings.bar) {
      for (let i = 0; i < body.length; i++) {
        if (body[i].isMouseOver) {
          body.splice(i, 1);
          break;
        }
      }
      if (mouse.pos.x > 1 && mouse.pos.y > 1 && mouse.pos.x < canvas.width - 1 && mouse.pos.y < canvas.height - 1) cycle();
    }
  };

  const body = [];
  let bodyProto = function(name, x, y, radius, charge) {
    this.name = name;
    //this.color = (charge > 0) ? '#f20' : '#00f';
    this.r = radius; //radius is also used as mass for force calculations
    this.charge = charge;
    this.pos = {
      x: x,
      y: y
    };
    this.force = {
      x: 0,
      y: 0
    };
    this.distanceTo = function(pos) {
      let dx = this.pos.x - pos.x;
      let dy = this.pos.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy);
    };
    this.isMouseOver = false;
    this.mouseOverCheck = function() {
      if (this.distanceTo(mouse.pos) < this.r) {
        return true;
      } else {
        return false;
      }
    };
    this.mouseMove = function() {
      if (this.isMouseOver && mouse.down) {
        this.pos.x = mouse.pos.x + this.mouseOffset.x;
        this.pos.y = mouse.pos.y + this.mouseOffset.y;
      }
    };
    this.mouseOffset = {
      x: 0,
      y: 0
    };
    this.setMouseOffset = function() {
      this.mouseOffset.x = this.pos.x - mouse.pos.x;
      this.mouseOffset.y = this.pos.y - mouse.pos.y;
    };

    this.drawOutline = function() {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r + 5, 0, 2 * Math.PI);
      ctx.stroke();
    };

    this.drawFill = function() {
      if (this.mouseOverCheck()) {
        ctx.fillStyle = "#f0f";
      } else {
        ctx.fillStyle = "#fff";
      }

      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.fillRect(this.pos.x - this.r / 2, this.pos.y - this.r / 8, this.r, this.r / 4);
      if (this.charge < 0) ctx.fillRect(this.pos.x - this.r / 8, this.pos.y - this.r / 2, this.r / 4, this.r);
    };
  };

  function drawBar() {
    ctx.fillStyle = "#cdd";
    ctx.fillRect(0, canvas.height - settings.bar, canvas.width, canvas.height);
    ctx.fillStyle = "#033";
    ctx.font = "25px Arial";
    ctx.fillText("add / remove", canvas.width / 2, canvas.height - settings.bar / 2);
  }

  function scalarField() {
    //ctx.globalCompositeOperation = 'lighter';
    //ctx.globalAlpha=0.5;
    const lenX = Math.floor(canvas.width / settings.fieldSpacing);
    const lenY = Math.floor(canvas.height / settings.fieldSpacing);
    const offset = settings.fieldSpacing / 2;
    const squareRadius = settings.fieldSpacing + 1;
    const yHeight = (canvas.height - settings.bar) / lenY;
    const xheight = canvas.width / lenX;
    let hue = 0; //tracks last color to see if a new ctx color is needed
    for (let k = 0; k < lenY + 1; k++) {
      for (let j = 0; j < lenX + 1; j++) {
        const x = xheight * j;
        const y = yHeight * k;
        let mag = 0;
        for (let i = 0; i < body.length; i++) {
          const dx = body[i].pos.x - x;
          const dy = body[i].pos.y - y;
          mag += body[i].charge / Math.sqrt(dx * dx + dy * dy);
        }
        //luminosity based and red/blue
        // let lum = Math.abs(mag) * settings.fieldMag
        // if (lum > 50) lum = 50;
        // let hue = (mag > 0) ? 345 : 195;
        // ctx.fillStyle = "hsl(" + hue + ", 100%," + lum + "%)";
        //hue based colors red/green/blue
        // let hue = 120-mag*settings.fieldMag;
        // if (hue > 240) hue = 240;
        // if (hue < 0) hue = 0;
        // ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";

        let thisHue = Math.round(mag * settings.fieldMag) + 128; //+500;
        if (thisHue > 255) thisHue = 255; //999;
        if (thisHue < 0) thisHue = 0;
        if (thisHue != hue) {
          //only change color if the color is new
          hue = thisHue;
          ctx.fillStyle = chroma[hue];
        }
        ctx.fillRect(x - offset, y - offset, squareRadius, squareRadius);
      }
    }
  }

  // function gradientField(){
  // 	ctx.globalCompositeOperation='xor';
  // 	//might work: overlay, multiply,hard-light,soft-light
  // 	//ctx.globalAlpha=0.2;
  // 	for(var i=0;i<body.length;i++){
  // 		var grd=ctx.createRadialGradient(body[i].pos.x,body[i].pos.y,50,body[i].pos.x,body[i].pos.y,600);
  // 		if (body[i].charge>0){
  // 			grd.addColorStop(0,"#fff");
  // 			grd.addColorStop(1,"#888");
  // 		} else{
  // 			grd.addColorStop(0,"#000");
  // 			grd.addColorStop(1,"#888");
  // 		}
  // 		ctx.fillStyle=grd;
  // 		ctx.beginPath();
  // 		ctx.arc(body[i].pos.x,body[i].pos.y,600,0,2*Math.PI);
  // 		ctx.fill();
  // 	}
  // 	ctx.globalCompositeOperation='source-over';
  // 	//ctx.globalAlpha=1;
  // }

  function spawn() {
    for (let i = 0; i < 2; i++) {
      body[i] = new bodyProto(
        i + 1,
        canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
        canvas.height * 0.1 - settings.bar + Math.random() * canvas.height * 0.8,
        settings.size,
        Math.round(Math.random()) * 2 - 1
      );
    }
  }
  spawn();

  function cycle() {
    //runs each time the mouse moves
    //mouse over anything?
    for (let i = 0; i < body.length; i++) {
      body[i].mouseMove();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = "hsl(220, 100%, 50%)";
    //ctx.fillStyle = "#888";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    scalarField();
    //gradientField();
    drawBar();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000";
    for (let i = 0; i < body.length; i++) {
      body[i].drawFill();
    }
  }
  cycle(); //run once at start
}
