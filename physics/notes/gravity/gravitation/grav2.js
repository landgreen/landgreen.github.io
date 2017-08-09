const setup2 = function() {
	var canvas = document.getElementById('grav2');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup2()

function grav2(el) {
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
		setTimeout(function(){ Particle.scalarField(q, 1, fMag) }, 100);
	});
	el.addEventListener("mouseenter", function() {
		pause = false
		Particle.setCanvas(el)
		if (!pause) requestAnimationFrame(cycle);
	});

	let q = [] //holds the Particles

	document.getElementById('num1').addEventListener("input", function() {
		reset()
	}, false);

	const reset = function(){
		q = []
		Particle.spawnRandom(q, Math.min(document.getElementById("num1").value, 1000))
		fMag = -20000/Particle.totalMass(q)
	}
	let fMag
	reset()

	// Particle.spawnRandom(q, 35)

	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Particle.physicsAll(q)
		//Particle.vectorField(q,vMag)
		Particle.scalarField(q, 3, fMag)
		// Particle.drawAll(q)
		Particle.bounds(q, -10)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
