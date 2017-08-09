(function() {
	var canvas = document.getElementById('graph');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
})()

function graph(el) {
	el.onclick = null; //stops the function from running on button click
	var canvas = el
	var ctx = canvas.getContext("2d");

	//___________________get mouse input___________________
	const mouse = {
		down: false,
		x: 0,
		y: 0
	};
	canvas.onmousemove = function(e) {
		var rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}
	canvas.onmousedown = function() {
		mouse.down = true;
	};
	canvas.onmouseup = function() {
		mouse.down = false;
	};

	const origin = {
		x:Math.round(canvas.width/2),
		y:Math.round(canvas.height/2),
	}


	const drawAxis = function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.moveTo(origin.x,0);
		ctx.lineTo(origin.x,canvas.height);
		ctx.moveTo(0,origin.y);
		ctx.lineTo(canvas.width,origin.y);

		ctx.strokeStyle="#666";
		ctx.stroke();
	}

	drawAxis()
}
