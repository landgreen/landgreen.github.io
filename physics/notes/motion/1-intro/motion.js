(function setup() { //writes a message onload
    var canvas;
    var ctx;
    for (var i = 0; i < 6; i++) {
        canvas = document.getElementById('canvas' + i);
        ctx = canvas.getContext("2d");
        ctx.font = "25px Arial";
        ctx.fillStyle = '#aaa';
        ctx.textAlign = "center";
        ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
    }
})()


var motion = function(canvasID, button, showPos, showTime, showVel, showAccel, velocity, acceleration, edges) {
    button.onclick = null; //stops the function from running on button click
    var canvasID = canvasID;
    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext("2d");
    ctx.font = "18px Arial";
    ctx.textAlign = "start";
    ctx.lineWidth=2;

    document.getElementById(canvasID).addEventListener("mousedown", function() {
      spawn();
      physics.startTime = new Date().getTime();

    });



    var physics = {
        gravX: 0,
        gravY: 0,
        restitution: 1,
        airFriction: 1,
        equalibrium: 400,
        startTime: new Date().getTime()
    }
    if (acceleration) {
        physics.gravX = acceleration;
    }

function play(){


}



    function mass(x, y, Vx, Vy, r, fillColor) { //constructor function that determines how masses work
        this.x = x;
        this.y = y;
        this.Vx = Vx;
        this.Vy = Vy;
        this.r = r;
        this.mass = Math.PI * this.r * this.r * 0.01; //pi r squared * density
        this.fillColor = fillColor;
        this.draw = function() {
            ctx.fillStyle = this.fillColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            //ctx.stroke();
            ctx.fill();
        };
        this.move = function() {
            this.x += this.Vx / 60;
            this.y += this.Vy / 60;
            this.Vx *= physics.airFriction;
            this.Vy *= physics.airFriction;
        };
        this.edges = function() {
            if (this.x > canvas.width - this.r) {
                this.Vx *= -physics.restitution
                this.x = canvas.width - this.r;
            } else if (this.x < this.r) {
                this.Vx *= -physics.restitution
                this.x = this.r;
            };
            if (this.y > canvas.height - this.r) {
                this.Vy *= -physics.restitution
                this.y = canvas.height - this.r;
            } else if (this.y < this.r) {
                this.Vy *= -physics.restitution
                this.y = this.r;
            };
        };
        this.gravity = function() {
            this.Vx += physics.gravX / 60;
            this.Vy += physics.gravY / 60;
        };
        this.info = function() {
            //text
            ctx.fillStyle = '#000';
            var lineHeight = 20;
            var line = 0;
            if (showPos) {
                line += lineHeight;
                ctx.fillText('x = ' + (this.x-canvas.width/2).toFixed(1) + 'm', 5, line);
            }
            if (showTime) {
                line += lineHeight;
                var endTime = new Date().getTime();
                ctx.fillText('t = ' + ((endTime - physics.startTime) / 1000).toFixed(1) + 's', 5, line);
            }
            if (showVel) {
                line += lineHeight;
                ctx.fillText('v = ' + (this.Vx).toFixed(1) + 'm/s', 5, line);
            }
            if (showAccel) {
                line += lineHeight;
                ctx.fillText('a = ' + (physics.gravX).toFixed(1) + 'm/s²', 5, line);
            }

        };
    }



    var box;

    function spawn() {
        //mass(x, y, Vx, Vy ,r, fillColor)
        box = new mass(canvas.width / 2, canvas.height / 2, velocity, 0, 50, randomColor() );
    }
    spawn();

    window.requestAnimationFrame(render);

    function render() { //repeating animation function
        window.requestAnimationFrame(render);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(edges) box.edges();
        box.move();
        box.gravity();
        box.draw();
        box.info();
    }

}
