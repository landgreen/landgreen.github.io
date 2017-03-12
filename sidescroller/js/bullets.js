const mobBullet = [];
const bullet = [];

bullets = {  //data about bullets (this is passed to local storage)
	width: 14,
	height: 5,
	frictionAir: 0.01,
	gravity: 0.001,
	restitution: 0,
	fireCD: 35,
    sound: 'snare2',
    speed: 26,
	dmg: 0,
	minDmgSpeed: 10,
	density: 0.002,
	sizeMode: 1,
	sizeSpeed: 1,
    size: 1,
	number: 1,
	inaccuracy: 0.1,
	endCycle: 180,
	mode: 'none',
	shape: 'none',
	cFilter: {
		category: 0x000100,
		mask: 0x000101, //mask: 0x000001,
	},
}

function bulletLoop(){
	if (game.mouseDown && mech.fireCDcycle < game.cycle) { //fire
		mech.fireCDcycle = game.cycle + bullets.fireCD;
		playSound(bullets.sound);
		for (let i = 0; i < bullets.number; i++) {
			const len = bullet.length;
			const dir = (Math.random() - 0.5) * bullets.inaccuracy + mech.angle
			bullet[len] = Bodies.rectangle(mech.pos.x + (15+bullets.width) * Math.cos(mech.angle), mech.pos.y +(15+bullets.width) * Math.sin(mech.angle), bullets.width * bullets.size, bullets.height * bullets.size, {
				angle: dir,
				density: bullets.density,
				//friction: 0.5,
				frictionAir: bullets.frictionAir,
				restitution: bullets.restitution,
				collisionFilter: bullets.cFilter,
				dmg: bullets.dmg,
				minDmgSpeed: bullets.minDmgSpeed,
				endCycle: game.cycle + bullets.endCycle,
				color: '#000',
				classType: 'bullet',
				//inertia: Infinity, //prevents rotation
				onDmg: function() {
					//this.frictionAir = 1;
				},
			});
			//const speed = bullets.speed+bullets.inaccuracy*(Math.random()-0.5)*bullets.speed;
			const speed = bullets.speed*(1 + bullets.inaccuracy * (Math.random()-0.5)*0.6);
			Matter.Body.setVelocity(bullet[len], {
				x: mech.Vx / 2 + speed * Math.cos(dir),
				y: mech.Vy / 2 + speed * Math.sin(dir)
			});
			World.add(engine.world, bullet[len]); //add bullet to world
		}
	}
	let i = bullet.length;
	ctx.beginPath();
	ctx.fillStyle = '#000';
	while (i--) { //draw
		let vertices = bullet[i].vertices;
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (let j = 1; j < vertices.length; j += 1) {
			ctx.lineTo(vertices[j].x, vertices[j].y);
		}
		ctx.lineTo(vertices[0].x, vertices[0].y);
		if (bullet[i].endCycle < game.cycle) {
			Matter.World.remove(engine.world, bullet[i]);
			bullet.splice(i, 1);
		}
	}
	ctx.fill();
}

function mobBulletLoop(){
	let i = mobBullet.length;
	ctx.beginPath();
	while (i--) {
		let vertices = mobBullet[i].vertices;
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (let j = 1; j < vertices.length; j += 1) {
			ctx.lineTo(vertices[j].x, vertices[j].y);
		}
		ctx.lineTo(vertices[0].x, vertices[0].y);
		if (mobBullet[i].endCycle < game.cycle) {
			Matter.World.remove(engine.world, mobBullet[i]);
			mobBullet.splice(i, 1);
		}
	}
	//ctx.fillStyle = ((game.cycle%2) ? '#000' : '#f00');
	ctx.fillStyle = '#f00';
	ctx.fill();
}
