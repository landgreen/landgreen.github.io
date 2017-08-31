// motion();

function motion() {
    var canvas = document.getElementById('canvas-1');
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.shadowBlur=8;
    ctx.shadowOffsetX=3;
    ctx.shadowOffsetY=3;

    //___________________get mouse input___________________
    var mouse = {
        down: false,
        x: 0,
        y: 0
    };
    canvas.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        //ball.r = mouse.x - canvas.width / 2;
    }
    canvas.onmousedown = function() {
        mouse.down = true;
        ball.r = mouse.x - canvas.width / 2;
        count = 0;
    };
    canvas.onmouseup = function() {
        mouse.down = false;
    };


    var count = 0;

    ball = {
        pos: {
            x: 0,
            y: 0
        },
		vel: {
			x: 0,
            y: 0
		},
        r: 200,
        s: 21.221,
        size: 15,
        color: '#0aa',
        draw: function() {
            //ctx.shadowColor="#999";
            //ctx.fillStyle = '#000'
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
            //ctx.shadowColor="transparent";
        },
        speed: 0,
        lastPos: {
          x:0,
          y:0
        },
        move: function() {
            this.lastPos = {
                x: this.pos.x,
                y: this.pos.y
            }
            this.pos.x = Math.cos(count / 60 / 3 / Math.PI) * this.r + canvas.width / 2;
            this.pos.y = Math.sin(count / 60 / 3 / Math.PI) * this.r + canvas.height / 2;
        },
		MG: 100,
		period: 0,
		orbit: function() {
            this.speed = Math.sqrt(this.MG/Math.abs(this.r));
			this.period = Math.sqrt(4*Math.PI*Math.abs(this.r)*this.r*this.r/this.MG)
			//console.log(time);
			const time = (count % this.period) /this.period *2*Math.PI//count / 60 / 3 / Math.PI
            this.pos.x = Math.cos(time) * this.r + canvas.width / 2;
            this.pos.y = Math.sin(time) * this.r + canvas.height / 2;
        },

        speedCalc: function() {
            var dx = this.pos.x - this.lastPos.x;
            var dy = this.pos.y - this.lastPos.y;
            this.speed = Math.sqrt(dx * dx + dy * dy);
        },
    }

    function background() {
        ctx.beginPath();
        //cross
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaa'
        ctx.stroke();
        //radius
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2-1);
        ctx.lineTo(canvas.width / 2, canvas.height / 2-7);
        ctx.moveTo(canvas.width / 2, canvas.height / 2-4);
        ctx.lineTo(canvas.width / 2 + ball.r, canvas.height / 2-4);
        ctx.lineTo(canvas.width / 2 + ball.r, canvas.height / 2-7);
        ctx.lineTo(canvas.width / 2 + ball.r, canvas.height / 2-1);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#666'
        ctx.stroke();
		//force
        // ctx.beginPath();
        // ctx.moveTo(ball.pos.x,ball.pos.y);
        // ctx.lineTo(ball.pos.x - (ball.pos.x-canvas.width/2)/2,
        //            ball.pos.y - (ball.pos.y-canvas.height/2)/2);
        // ctx.strokeStyle = '#a55'
        // ctx.stroke();
    }

    function output() {
        document.getElementById("hud1").innerHTML =
		'radius = ' + (ball.r).toFixed(1) + ' m'
        + '<br>velocity = ' + (ball.speed * 60).toFixed(1) + ' m/s'
        + '<br> acceleration = ' + (ball.speed * 60*ball.speed * 60/Math.abs(ball.r)).toFixed(1) + ' m/s²';

		document.getElementById("hud2").innerHTML =
		'central mass = ' + (ball.MG / (0.000000000067)).toExponential(2)+' kg'
		+ '<br> period = ' + (ball.period/60).toFixed(1) +' s'
		+ '<br> time = ' + (count / 60).toFixed(1) +' s';
    }

    //___________________animation loop ___________________
    function cycle() {
        count++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ball.move();
		ball.orbit();
        //ball.speedCalc();
        output();
        background();
        ball.draw();
        requestAnimationFrame(cycle);
    }
    requestAnimationFrame(cycle);

}
