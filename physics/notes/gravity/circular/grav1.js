const setup1 = function() {
	var canvas = document.getElementById('grav1');
	var ctx = canvas.getContext("2d");
	ctx.font = "300 22px Arial, Helvetica, sans-serif";
	ctx.fillStyle = '#aaa';
	ctx.textAlign = "center";
	ctx.fillText('click to start simulation', canvas.width / 2, canvas.height / 2);
}
setup1()

function grav1(el) {
	el.onclick = null; //stops the function from running on button click
	var canvas = el
	var ctx = canvas.getContext("2d");

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
		if (!pause) requestAnimationFrame(cycle);
	});

	const q = [] //holds the Particles
	
	q[q.length] = new Particle({
		x: 125,
		y: 125
	}, 500, 0,{x:0,y:0.016},'#ff0')


	q[q.length] = new Particle({
		x: 225,
		y: 125
	}, 15,0,{x:0,y:-0.5},'#0df')

	q[q.length] = new Particle({
		x: 235,
		y: 125
	}, 1,0,{x:-0.02,y:-0.5},'#fff')

	// ctx.globalCompositeOperation = 'lighter'
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	function cycle() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// ctx.globalAlpha = 0.05
		// ctx.fillStyle = '#000'
		// ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1
		Particle.physicsAll(q)
		// Particle.vectorField(q,vMag)
		Particle.drawAll(q, ctx)
		Particle.bounds(q, canvas, 0)
		if (!pause) requestAnimationFrame(cycle);
	}
	// for (let i =0; i<140; ++i)requestAnimationFrame(cycle);
	requestAnimationFrame(cycle);
}
