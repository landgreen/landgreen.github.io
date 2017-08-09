const setup2 = function() {
	var canvas = document.getElementById('charge2');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup2()

function charges2(el) {
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
	const separation = 40
	const off = 250

	for (let i = 0; i < Math.ceil((canvas.width + off * 2) / separation); ++i) {
		q[q.length] = new Charge('p', {
			x: separation * i - off,
			y: canvas.height / 2 + separation
		})
		q[q.length] = new Charge('p', {
			x: separation * i - off,
			y: canvas.height / 2
		})
		q[q.length] = new Charge('p', {
			x: separation * i - off,
			y: canvas.height / 2 - separation
		})
	}

	for (let i = 0; i<Math.ceil((canvas.width+off*2)/separation);++i){
		q[q.length] = new Charge('e', {
			x: separation*i-off,
			y: canvas.height/2+separation
		},{x:1.5,y:0})
		q[q.length] = new Charge('e', {
			x: separation*i-off,
			y: canvas.height/2
		},{x:1.5,y:0})
		q[q.length] = new Charge('e', {
			x: separation*i-off,
			y: canvas.height/2-separation
		},{x:1.5,y:0})
	}
	// Charge.spawnCharges(q, 25, 'e')
	// Charge.spawnCharges(q, 25, 'p')
	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Charge.physicsAll(q)
		Charge.teleport(q)
		// Charge.vectorField(q)
		// Charge.scalarField(q)
		Charge.drawAll(q)
		// Charge.pushZone()
		// Charge.bounds(q)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
