function energy0() {
    //set up canvas
    var canvasID = "canvas0"
    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext("2d");
    //var id = document.getElementById(canvasID).parentNode.id;
    //ctx.canvas.width = document.getElementById(id).clientWidth;
    //ctx.canvas.width = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;

    //window.onresize = function(event) {
    //var id = document.getElementById(canvasID).parentNode.id;
    //ctx.canvas.width = document.getElementById(id).clientWidth;
    //ctx.canvas.width = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;
    //};

    // module aliases
    var Engine = Matter.Engine,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Composite = Matter.Composite;




    // create an engine
    var engine = Engine.create();
    var scale = 10;
    //adjust gravity to fit simulation
    engine.world.gravity.scale = 0.000001 * scale;;
    engine.world.gravity.y = 9.8;


    var mass = [];
    var energy = {
            max: 1,
            ke: 0,
            pe: 0,
            angular:0,
            total: 0,
            speed:0,
            height:0,
            angularSpeed:0,
        }
        //toggle super slow timeScale if you click in the upper left corner of the canvas
    document.getElementById("pause").addEventListener("click", function() {
        //slow timeScale changes the value of velocity while in slow timeScale so divide by engine.timing.timeScale to set velocity normal
        if (engine.timing.timeScale === 1) engine.timing.timeScale = 0.000001
        else engine.timing.timeScale = 1;
    });

    document.getElementById(canvasID).addEventListener("mousedown", function(evt) {
        World.clear(engine.world, true); //clear matter engine, leave static
        mass = []; //clear mass array
        spawnList();
    });
    spawnList();

    function spawnList() {
        spawnMass(canvas.width / 2 / scale, 10, 0, 0, 50 / scale, 5);
        calcEnergy()
        energy.max = energy.pe+energy.ke+energy.angular
      }

    function spawnMass(xIn, yIn, VxIn, VyIn, radius, sides) {
        //spawn mass
        var i = mass.length
        mass.push();
        mass[i] = Bodies.polygon(xIn * scale, yIn * scale, 8, radius * scale, {
            friction: 0.1,
            frictionStatic: 0.4,
            frictionAir: 0.0,
            restitution: 0.8,
            radius: radius,
            color: randomColor({
                luminosity: 'light',
            }),
        });

        Body.setVelocity(mass[i], {
            x: VxIn / 60 * scale,
            y: -VyIn / 60 * scale
        });
        //Matter.Body.setAngle(mass[i], angle)
        Matter.Body.setAngularVelocity(mass[i], (0.5-Math.random())*0.1   );
        World.add(engine.world, mass[i]);
    }

    //add walls flush with the edges of the canvas
    var offset = 25;
    World.add(engine.world, [
        Bodies.rectangle(canvas.width * 0.5, -offset - 1, canvas.width * 2 + 2 * offset, 50, { //top
            isStatic: true,
            friction: 1,
            frictionStatic: 1,
        }),
        Bodies.rectangle(canvas.width * 0.5, canvas.height + offset + 1, canvas.width * 2 + 2 * offset, 50, { //bottom
            isStatic: true,
            friction: 1,
            frictionStatic: 1,
        }),
        Bodies.rectangle(canvas.width + offset + 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //right
            isStatic: true,
            friction: 1,
            frictionStatic: 1,
        }),
        Bodies.rectangle(-offset - 1, canvas.height * 0.5, 50, canvas.height * 2 + 2 * offset, { //left
            isStatic: true,
            friction: 1,
            frictionStatic: 1,
        })
    ]);

    // run the engine
    Engine.run(engine);

function calcEnergy(){
  energy.speed = mass[0].speed * 60 / scale / engine.timing.timeScale;
  energy.height = ((canvas.height - mass[0].position.y) / scale - mass[0].radius)+0.486; //0.48g is to correct for octogon hieght vs circle height
  energy.angularSpeed = mass[0].angularSpeed * 60 / engine.timing.timeScale;
  energy.angular = 0.5 * mass[0].inertia / scale * energy.angularSpeed*energy.angularSpeed;
  energy.ke = 0.5 * mass[0].mass * energy.speed * energy.speed;
  energy.pe = mass[0].mass * engine.world.gravity.y * energy.height;
}


    //render
    (function render() {
        var bodies = Composite.allBodies(engine.world);
        window.requestAnimationFrame(render);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = 'rgba(255,255,255,0.4)';  //trails
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        for (var i = 0; i < bodies.length; i += 1) {
            var vertices = bodies[i].vertices;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (var j = 1; j < vertices.length; j += 1) {
                ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            if (bodies[i].color) {
                ctx.fillStyle = bodies[i].color;
            } else {
                ctx.fillStyle = '#ccc'
            }
            ctx.fill();
            ctx.stroke();
        }
        //draw angle lines
        // ctx.beginPath();
        // for (var k = 0, length = mass.length; k<length; k++){
        //   ctx.moveTo(mass[k].position.x,mass[k].position.y);
        //   ctx.lineTo(mass[k].vertices[0].x, mass[k].vertices[0].y);
        // }
        // ctx.stroke();
        //labels
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var k = 0, length = mass.length; k < length; k++) {
            ctx.fillText(mass[k].mass.toFixed(2) + 'kg', mass[k].position.x, mass[k].position.y);
            //ctx.fillText(mass[k].velocity.x.toFixed(2)+'m/s',mass[k].position.x,mass[k].position.y+9);
        }
        calcEnergy()
        //draw energy bars
          ctx.fillStyle = "#60ff9a";
        ctx.fillRect(0, 0, canvas.width * (energy.angular / energy.max), 20);
        ctx.fillStyle = "#eca4fc";
        ctx.fillRect(0, 20, canvas.width * (energy.ke / energy.max), 20);
        ctx.fillStyle = "#86affc";
        ctx.fillRect(0, 40, canvas.width * (energy.pe / energy.max), 20);
        ctx.fillStyle = "#d6d3d3";
        ctx.fillRect(0, 60, canvas.width * ((energy.ke + energy.pe + energy.angular) / energy.max), 20);
        ctx.fillStyle = "#ff6767";
        ctx.fillRect(canvas.width, 80, -canvas.width * ((energy.max - energy.ke - energy.pe -energy.angular) / energy.max), 20);



        //write energy text
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        ctx.fillText('RE = (1/2)('+(mass[0].inertia/scale).toFixed(0)+')('+energy.angularSpeed.toFixed(2)+')^2 = ' +energy.angular.toFixed(0) + 'J', 5, 10);
        ctx.fillText('KE = (1/2)(' + mass[0].mass.toFixed(1) + ')(' + (energy.speed * energy.speed).toFixed(1) + ')^2 = ' + energy.ke.toFixed(0) + 'J', 5, 30);
        ctx.fillText('PE = (' + mass[0].mass.toFixed(1) + ')(' + engine.world.gravity.y + ')(' + energy.height.toFixed(1) + ') = ' + energy.pe.toFixed(0) + 'J', 5, 50);
        ctx.fillText('PE + KE + RE = ' + (energy.pe + energy.ke + energy.angular).toFixed(0) + 'J', 5, 70);
        ctx.textAlign = "right";
        ctx.fillText( (energy.max - (energy.pe + energy.ke + energy.angular)).toFixed(0) + 'J = Heat', canvas.width-5, 90);

        //ctx.fillText('1/2Iω^2 = (1/2)('+mass[0].inertia.toFixed(0)+')('+energy.angularSpeed.toFixed(3)+')^2 = ' +energy.angular.toFixed(2) + 'J', 5, 90);
        // ctx.textAlign="right";
        // ctx.fillText('mv + mv = total vertical momentum',canvas.width-5,13);
        // ctx.fillText('(' + mass[0].mass.toFixed(2)+')('+-mass[0].velocity.y.toFixed(2) +') + ('
        // +mass[1].mass.toFixed(2)+') ('+-mass[1].velocity.y.toFixed(2)+') = '      +py.toFixed(2),canvas.width-5,30);
    })();
}
