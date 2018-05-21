const setup1 = function() {
	var canvas = document.getElementById('charge1');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup1()

function charges1(el) {
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
	});
	el.addEventListener("mouseenter", function() {
		pause = false
		Charge.setCanvas(el)
		if (!pause) requestAnimationFrame(cycle);
	});

	const q = [] //holds the charges
	//spawn
	const separation = 30
	const len = 7
	const offx = canvas.width/2 - (len-1)*separation/2
	const offy = canvas.height/2 - (len-1)*separation/2
	for (let i = 0; i<len;++i){
		for(let j = 0; j<len;++j){
			q[q.length] = new Charge('p', {
				x: i*separation + offx,
				y: j*separation + offy
			})
		}
	}
	for (let i = 0; i<len;++i){
		for(let j = 0; j<len;++j){
			q[q.length] = new Charge('e', {
				x: i*separation + offx,
				y: j*separation + offy
			})
		}
	}
	// Charge.spawnCharges(q, 25, 'e')
	// Charge.spawnCharges(q, 25, 'p')
	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Charge.physicsAll(q)
		// Charge.vectorField()
		// Charge.scalarField()
		Charge.drawAll(q)
		// Charge.pushZone()
		Charge.bounds(q)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
