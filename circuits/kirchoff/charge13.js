(function() {
	var canvas = document.getElementById('charge13');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
})()


function charges13(el) {
	el.onclick = null; //stops the function from running on button click
	Charge.setCanvas(el)
	// var canvas = el
	// var ctx = canvas.getContext("2d");

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
	}
	canvas.onmousedown = function() {
		mouse.down = true;
		Charge.repulse(q, mouse);
	};
	canvas.onmouseup = function() {
		mouse.down = false;
	};
	let pause = false
	el.addEventListener("mouseleave", function() {
		pause = true
		setTimeout(function(){
			Charge.scalarField(q,1, 1500)
			drawResistor(150,87)
			drawResistor(300,87)
		}, 100);
	});
	el.addEventListener("mouseenter", function() {
		pause = false
		Charge.setCanvas(el)
		if (!pause) requestAnimationFrame(cycle);
	});

	const q = [] //holds the charges
	//spawn
	const sep = 15
	const len = 59
	const centerY = canvas.height/2
	const offX = -160
	for(let i = 0; i<len;++i){
		q[q.length] = new Charge('p', {x: i*sep + offX, y: centerY})
	}
	for(let i = 0; i<len;++i){
		q[q.length] = new Charge('e', {x: i*sep + offX, y: centerY})
	}

	function drawResistor(x,y, w=50, h = 25){
		ctx.fillStyle="rgba(255,0,255,0.8)";
		ctx.beginPath();
		ctx.rect(x,y,w,h);
		ctx.fill();
		ctx.stroke();
	}


	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Charge.physicsAll(q)
		Charge.teleport(q,200)
		// Charge.vectorField(q)
		Charge.scalarField(q,4, 1500)
		// Charge.drawAll(q)
		// Charge.pushZone()
		drawResistor(150,87)
		drawResistor(300,87)
		Charge.bounds(q, 205)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
