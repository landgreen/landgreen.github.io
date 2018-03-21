const orbitals = function() {
  settings = {
    range: 100,
    planetNumber: 25,
    planetSize: 3,
    planetSpeed: 0.1,
    darkView: true
  };

  let pause = true;
  document.getElementById("three-orbit").addEventListener("mouseleave", function() {
    pause = true;
  });
  document.getElementById("three-orbit").addEventListener("mouseenter", function() {
    if (pause) {
      pause = false;
      requestAnimationFrame(animationLoop);
    }
  });

  //hacky full scren mode
  document.getElementById("three-orbit").addEventListener("dblclick", function() {
    if (settings.darkView) {
      settings.darkView = false;
      //full screen
      document.getElementById("three-orbit").classList.add("full-page");
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      //light
      // renderer.domElement.style.background = "#fff";
      // sun.children[0].material.color = { r: 1, g: 0.9, b: 0 };
      // lightA.color = { r: 0.5, g: 0.5, b: 0.5 };
    } else {
      settings.darkView = true;
      //not full screen
      document.getElementById("three-orbit").classList.remove("full-page");
      camera.aspect = 600 / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(600, 400);
      //dark
      // renderer.domElement.style.background = "#000";
      // sun.children[0].material.color = { r: 1, g: 1, b: 1 };
      // lightA.color = { r: 0.1333, g: 0.1333, b: 0.1333 };
    }
  });
  /////////////////////////////////////////
  // Scene Setup
  /////////////////////////////////////////
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(600, 400);
  document.getElementById("three-orbit").appendChild(renderer.domElement);
  renderer.domElement.style.background = "#000";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////
  const camera = new THREE.PerspectiveCamera(60, 600 / 400, 1, 2000);
  camera.position.set(settings.range * 0.75, settings.range * 0.25, settings.range * 0.2);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  /////////////////////////////////////////
  // lights and fog
  /////////////////////////////////////////
  var lightA = new THREE.AmbientLight(0x222222); // soft white light
  scene.add(lightA);

  // scene.fog = new THREE.FogExp2(0x000000, 0.008);

  /////////////////////////////////////////
  // things
  /////////////////////////////////////////
  //sun
  geometry = new THREE.SphereGeometry(7, 24, 24);
  material = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  let sun = new THREE.PointLight(0xffffcc, 1, 0, 2);
  sun.add(new THREE.Mesh(geometry, material));
  sun.position.set(0, 0, 0);
  scene.add(sun);

  //planets
  const planet = [];
  for (let i = 0; i < 250; ++i) {
    const radius = 1 + Math.random() * Math.random() * Math.random() * 2;
    geometry = new THREE.SphereGeometry(radius, 16, 16);
    material = new THREE.MeshLambertMaterial({
      // transparent: true,
      // opacity: 0.7,
      // color: 0x44ccff,
      color: randomColor({
        luminosity: "bright",
        hue: "green"
      })
    });
    planet[i] = new THREE.Mesh(geometry, material);
    planet[i].radius = radius;
    //planet[i].frequency = 0.01 + (Math.random() - 0.5) * 0.005;
    // planet[i].frequency = Math.sqrt(0.01 / planet[i].radius);
    // planet[i].position.set(planet[i].radius, 0, 0);
    const pos = 10 + 150 * Math.random();
    // const angle = 2 * Math.PI * Math.random();
    // planet[i].position.set(mag * Math.cos(angle), 0, mag * Math.sin(angle));
    planet[i].position.set(pos, 0, 0);
    planet[i].velocity = {
      x: 0,
      y: 0,
      z: Math.sqrt(5 / pos)
    };
    scene.add(planet[i]);
  }

  /////////////////////////////////////////
  // physics
  /////////////////////////////////////////
  function physics() {
    for (let i = 0, len = planet.length; i < len; ++i) {
      //move
      planet[i].position.x += planet[i].velocity.x;
      planet[i].position.y += planet[i].velocity.y;
      planet[i].position.z += planet[i].velocity.z;

      //friction
      // planet[i].velocity.x *= 0.999;
      // planet[i].velocity.y *= 0.999;
      // planet[i].velocity.z *= 0.999;

      //walls
      // if (planet[i].position.x +planet[i].radius> settings.range) {
      //   planet[i].velocity.x = -Math.abs(planet[i].velocity.x);
      // } else if (planet[i].position.x -planet[i].radius< -settings.range) {
      //   planet[i].velocity.x = Math.abs(planet[i].velocity.x);
      // }
      // if (planet[i].position.y +planet[i].radius> settings.range) {
      //   planet[i].velocity.y = -Math.abs(planet[i].velocity.y);
      // } else if (planet[i].position.y -planet[i].radius< -settings.range) {
      //   planet[i].velocity.y = Math.abs(planet[i].velocity.y);
      // }
      // if (planet[i].position.z +planet[i].radius> settings.range) {
      //   planet[i].velocity.z = -Math.abs(planet[i].velocity.z);
      // } else if (planet[i].position.z -planet[i].radius< -settings.range) {
      //   planet[i].velocity.z = Math.abs(planet[i].velocity.z);
      // }

      //spin
      // planet[i].rotation.x +=0.01
      // planet[i].rotation.y +=0.01
      // planet[i].rotation.z +=0.01

      //gravity
      // for (let j = 0, len = planet.length; j < len; ++j) {
      //   if (i != j) {
      //     let iPos = new THREE.Vector3(planet[i].position.x,planet[i].position.y,planet[i].position.z)
      //     let jPos = new THREE.Vector3(planet[j].position.x,planet[j].position.y,planet[j].position.z)
      //     let dist2 = iPos.distanceToSquared(jPos)+500
      //     let mag = 0.1*planet[j].radius/dist2
      //     let d = new THREE.Vector3().subVectors(planet[i].position,planet[j].position)
      //     d.normalize()
      //     d.multiplyScalar(-mag)
      //     let iVel = new THREE.Vector3(planet[i].velocity.x,planet[i].velocity.y,planet[i].velocity.z)
      //     iVel.add(d)
      //     planet[i].velocity = iVel
      //   }
      // }

      //just sun gravity
      let iPos = new THREE.Vector3(planet[i].position.x, planet[i].position.y, planet[i].position.z);
      let jPos = new THREE.Vector3(sun.position.x, sun.position.y, sun.position.z);
      let dist2 = iPos.distanceToSquared(jPos) + 1;
      let mag = 5 / dist2;
      let d = new THREE.Vector3().subVectors(planet[i].position, sun.position);
      d.normalize();
      d.multiplyScalar(-mag);
      let iVel = new THREE.Vector3(planet[i].velocity.x, planet[i].velocity.y, planet[i].velocity.z);
      iVel.add(d);
      planet[i].velocity = iVel;
    }
  }

  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  renderer.render(scene, camera);
  let cycle = 0;
  function animationLoop() {
    cycle++;
    if (!pause) requestAnimationFrame(animationLoop);
    physics();
    // sun.rotation.y += 0.01
    // for (let i = 0; i < planet.length; ++i) {
    //   // planet[i].rotation.y +=0.01
    //   planet[i].position.x = planet[i].radius * Math.cos(cycle * planet[i].frequency);
    //   planet[i].position.z = planet[i].radius * Math.sin(cycle * planet[i].frequency);
    // }
    controls.update();
    renderer.render(scene, camera);
  }
  animationLoop();
};
window.onload = function() {
  orbitals();
};
