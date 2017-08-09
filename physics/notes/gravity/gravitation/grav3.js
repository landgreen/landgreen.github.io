const setup3 = function() {
	var canvas = document.getElementById('grav3');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup3()

function grav3(el) {
	el.onclick = null; //stops the function from running on button click
	Particle.setCanvas(el)
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
		Particle.repulse(q, mouse);
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
		Particle.setCanvas(el)
		if (!pause) requestAnimationFrame(cycle);
	});

	const q = [] //holds the Particles
	Particle.spawnRandom(q, 9)
	let vMag = 300000/Particle.totalMass(q)

	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Particle.physicsAll(q)
		Particle.vectorField(q,vMag)
		// Particle.scalarField()
		Particle.drawAll(q)
		// Particle.pushZone()
		Particle.bounds(q, -10)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
