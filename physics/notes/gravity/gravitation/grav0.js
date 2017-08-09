const setup0 = function() {
	var canvas = document.getElementById('grav0');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 30px Roboto";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup0()

function grav0(el) {
	el.onclick = null; //stops the function from running on button click
	Particle.setCanvas(el)
	ctx.globalCompositeOperation = 'lighter'
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


	document.getElementById('num').addEventListener("input", function() {
		reset()
	}, false);


let q = [] //holds the Particles
const reset = function(){
	q = []
	Particle.spawnRandom(q, Math.min(document.getElementById("num").value, 1000))
}
reset()


	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Particle.physicsAll(q)
		// Particle.vectorField(q,vMag)
		Particle.drawAll(q)
		Particle.bounds(q, -10)
		if (!pause) requestAnimationFrame(cycle);
	}
	requestAnimationFrame(cycle);
}
