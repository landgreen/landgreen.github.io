(() => {
  var canvas = document.getElementById("three-fabric-load");
  var ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.font = "30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()


const fabric = function (id) {
  const el = document.getElementById(id);
  document.getElementById("three-fabric-load").remove()

  settings = {
    range: 50,
    totalPlanets: 10,
    planetRadius: 1,
    fullView: false,
    cameraRange: 400,
    resolution: 256
  };
  settings.totalMass = settings.totalPlanets * settings.planetRadius;

  let pause = true;
  el.addEventListener("mouseleave", function () {
    pause = true;
  });
  el.addEventListener("mouseenter", function () {
    if (pause) {
      pause = false;
      requestAnimationFrame(animationLoop);
    }
  });

  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    if (settings.fullView) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  //full screen mode
  el.addEventListener("dblclick", function () {
    if (settings.fullView) {
      settings.fullView = false;
      //not full screen
      // exitFullscreen();
      el.classList.remove("full-page");
      camera.aspect = 600 / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(600, 400);
      document.body.style.overflow = "auto";
    } else {
      settings.fullView = true;
      //full screen
      // requestFullscreen(el);
      el.classList.add("full-page");
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.style.overflow = "hidden";
    }
  });
  /////////////////////////////////////////
  // Scene Setup
  /////////////////////////////////////////
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas: el,
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(600, 400);
  renderer.domElement.style.background = "#000";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////

  const camera = new THREE.PerspectiveCamera(45, 600 / 400, 10, settings.cameraRange);

  camera.position.set(0, -45, 30);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableKeys = false;

  let lightA = new THREE.AmbientLight(0xffffff);
  scene.add(lightA);

  /////////////////////////////////////////
  // spawn things
  /////////////////////////////////////////
  let material, geometry

  //random planets
  const planet = [];
  //central body
  let index = 0;
  let radius = 3;
  geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  planet[index] = new THREE.Mesh(geometry, material);
  planet[index].radius = radius
  planet[index].position.set(0, 0, -5);
  planet[index].velocity = {
    x: 0,
    y: 0,
    z: 0
  };
  scene.add(planet[index]);

  //orbiting body
  index++
  radius = 0.5;
  geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  planet[index] = new THREE.Mesh(geometry, material);
  planet[index].radius = radius
  planet[index].position.set(13, 0, -5);
  planet[index].velocity = {
    x: 0,
    y: 0.06,
    z: 0
  };
  scene.add(planet[index]);

  //orbiting body
  // index++
  // radius = 0.4;
  // geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  // material = new THREE.MeshLambertMaterial({
  //   color: 0xffffff,
  //   transparent: true,
  //   opacity: 0,
  // });
  // planet[index] = new THREE.Mesh(geometry, material);
  // planet[index].radius = radius
  // planet[index].position.set(-13, 0, -5);
  // planet[index].velocity = {
  //   x: 0,
  //   y: -0.06,
  //   z: 0
  // };
  // scene.add(planet[index]);


  // for (let i = 0; i < settings.totalPlanets; ++i) {
  //   let radius = settings.planetRadius * (0.2 + 3 * Math.random() * Math.random() * Math.random())
  //   if (i === 0) radius = settings.planetRadius * 2.5
  //   geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  //   material = new THREE.MeshLambertMaterial({
  //     color: 0xffffff,
  //     transparent: true,
  //     opacity: 0,
  //   });
  //   planet[i] = new THREE.Mesh(geometry, material);
  //   planet[i].radius = radius
  //   planet[i].position.set(settings.range * (Math.random() - 0.5), settings.range * (Math.random() - 0.5), -5);
  //   planet[i].velocity = {
  //     x: 0.1 * (Math.random() - 0.5),
  //     y: 0.1 * (Math.random() - 0.5),
  //     z: 0
  //   };
  //   scene.add(planet[i]);
  // }

  // potential energy plane
  let potentialEnergy = new THREE.PlaneGeometry(settings.range, settings.range, settings.resolution, settings.resolution);

  material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });


  let potentialEnergyMesh = new THREE.Mesh(potentialEnergy, material);
  potentialEnergyMesh.position.set(0, 0, 0);
  scene.add(potentialEnergyMesh);


  /////////////////////////////////////////
  // Physics
  /////////////////////////////////////////
  function physics(who) {
    const gravityConst = 0.05;
    const minDistance2 = 10;
    const edge = settings.range / 2
    //change position from velocity
    const len = who.length;
    for (let i = 0; i < len; ++i) {
      if (i !== 0) {
        // move
        who[i].position.x += who[i].velocity.x;
        who[i].position.y += who[i].velocity.y;

        // walls
        if (who[i].position.x > edge - who[i].radius) {
          who[i].position.x = edge - who[i].radius
          who[i].velocity.x = -Math.abs(who[i].velocity.x);
        } else if (who[i].position.x < -edge + who[i].radius) {
          who[i].position.x = -edge + who[i].radius
          who[i].velocity.x = Math.abs(who[i].velocity.x);
        }
        if (who[i].position.y > edge - who[i].radius) {
          who[i].position.y = edge - who[i].radius
          who[i].velocity.y = -Math.abs(who[i].velocity.y);
        } else if (who[i].position.y < -edge + who[i].radius) {
          who[i].position.y = -edge + who[i].radius
          who[i].velocity.y = Math.abs(who[i].velocity.y);
        }
      }
      //accelerate velocity from gravity
      for (let j = i + 1; j < len; ++j) {
        const dx = who[i].position.x - who[j].position.x;
        const dy = who[i].position.y - who[j].position.y;
        const d2 = Math.max(dx * dx + dy * dy, minDistance2);
        const mag = gravityConst / d2 / Math.sqrt(d2);
        who[i].velocity.x -= mag * dx;
        who[i].velocity.y -= mag * dy;
        who[j].velocity.x += mag * dx;
        who[j].velocity.y += mag * dy;
      }
    }
  }


  /////////////////////////////////////////
  // move potentialEnergyMesh
  /////////////////////////////////////////
  function dynamicPlane() {
    const depth = 100 / settings.totalMass
    for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
      let v = potentialEnergyMesh.geometry.vertices[i];
      let mag = depth; //this should be zero but I'm using depth as 0 to center the energy mesh higher up with the camera
      for (let j = 0, len = planet.length; j < len; j++) {
        const dx = planet[j].position.x - v.x;
        const dy = planet[j].position.y - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy)
        mag -= depth * planet[j].radius * planet[j].radius / (Math.max(dist, planet[j].radius));
        //below code is technically more accurate, but it just looks really confusing ...
        // if (dist > planet[j].radius) {
        //   mag -= depth * planet[j].radius * planet[j].radius / dist; //outside planet
        // } else {
        //   mag -= depth * planet[j].radius * planet[j].radius / (planet[j].radius + planet[j].radius / dist - 1);//inside planet
        // }
      }
      v.z = mag;
      // v.z = v.z * 0.9 + mag * 0.1; // smooth changes
    }
    potentialEnergyMesh.geometry.computeFaceNormals();
    potentialEnergyMesh.geometry.normalsNeedUpdate = true;
    potentialEnergyMesh.geometry.verticesNeedUpdate = true;
  }

  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  dynamicPlane()
  renderer.render(scene, camera);

  function animationLoop() {
    if (!pause) requestAnimationFrame(animationLoop);
    controls.update();
    renderer.render(scene, camera);
    physics(planet)
    dynamicPlane()
  }
  animationLoop();
};