const orbitals = function (el) {
  el.onclick = null; //stops the function from running on button click

  settings = {
    range: 100,
    planetNumber: 25,
    planetSize: 3,
    planetSpeed: 0.1,
    fullView: false,
    cameraRange: 2000
  };
  const target = document.getElementById("three-orbit");

  let pause = true;
  target.addEventListener("mouseleave", function () {
    pause = true;
  });
  target.addEventListener("mouseenter", function () {
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

  let requestFullscreen = function (ele) {
    if (ele.requestFullscreen) {
      ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
      ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
      ele.msRequestFullscreen();
    } else {
      console.log("Fullscreen API is not supported.");
    }
  };

  let exitFullscreen = function () {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else {
      console.log("Fullscreen API is not supported.");
    }
  };

  //full screen mode
  target.addEventListener("dblclick", function () {
    if (settings.fullView) {
      settings.fullView = false;
      //not full screen
      // exitFullscreen();
      target.classList.remove("full-page");
      camera.aspect = 600 / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(600, 400);
      document.body.style.overflow = "auto";
    } else {
      settings.fullView = true;
      //full screen
      // requestFullscreen(target);
      target.classList.add("full-page");
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
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(600, 400);
  target.appendChild(renderer.domElement);
  renderer.domElement.style.background = "#000";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////
  const camera = new THREE.PerspectiveCamera(60, 600 / 400, 1, settings.cameraRange);
  camera.position.set(settings.range * 0.75, settings.range * 0.25, settings.range * 0.2);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableKeys = false;
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.08;

  /////////////////////////////////////////
  // lights and fog
  /////////////////////////////////////////
  // let lightA = new THREE.AmbientLight(0x222222); // soft white light
  // scene.add(lightA);
  // scene.fog = new THREE.FogExp2(0x000000, 0.008);

  /////////////////////////////////////////
  // things
  /////////////////////////////////////////
  let material, geometry, radius;
  //stars
  geometry = new THREE.Geometry();
  let x, y, z;
  for (let i = 0; i < 3000; ++i) {
    const scale = settings.cameraRange / 2;
    x = Math.random() - 0.5;
    y = Math.random() - 0.5;
    z = Math.random() - 0.5;
    const normalize = 1 / Math.sqrt(x * x + y * y + z * z);
    x *= normalize * scale;
    y *= normalize * scale;
    z *= normalize * scale;
    geometry.vertices.push(new THREE.Vector3(x, y, z));
  }
  material = new THREE.PointsMaterial({
    color: 0xbbbbbb,
    size: 1.25,
    sizeAttenuation: false
  });
  let stars = new THREE.Points(geometry, material);
  scene.add(stars);

  //sun
  radius = 7;
  geometry = new THREE.SphereGeometry(radius, 24, 24);
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff
    // vertexColors: "THREE.FaceColors"
    // transparent: true,
    // opacity: 0.9
  });
  let sun = new THREE.PointLight(0xffffff, 1, 0, 2);
  sun.add(new THREE.Mesh(geometry, material));
  sun.position.set(0, 0, 0);
  sun.radius = radius;
  scene.add(sun);
  //sun's corona
  geometry = new THREE.SphereGeometry(7.5, 24, 24);
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.6
  });
  let corona = new THREE.Mesh(geometry, material);
  scene.add(corona);

  //random planets
  const planet = [];
  for (let i = 0; i < 200; ++i) {
    const radius = 0.5 + Math.random() * Math.random() * Math.random() * Math.random() * Math.random() * 4;
    geometry = new THREE.SphereGeometry(radius, 16, 16);
    material = new THREE.MeshLambertMaterial({
      // transparent: true,
      // opacity: 0.7,
      color: 0xffffff
      // color: randomColor({
      //   luminosity: "light",
      //   hue: "monochrome"
      // })
    });
    planet[i] = new THREE.Mesh(geometry, material);
    planet[i].radius = radius;
    //planet[i].frequency = 0.01 + (Math.random() - 0.5) * 0.005;
    // planet[i].frequency = Math.sqrt(0.01 / planet[i].radius);
    // planet[i].position.set(planet[i].radius, 0, 0);
    const pos = 30 - 20 * Math.random() + 120 * Math.random() * Math.random() * Math.random();
    // const angle = 2 * Math.PI * Math.random();
    // planet[i].position.set(mag * Math.cos(angle), 0, mag * Math.sin(angle));
    planet[i].position.set(pos, 4 * (Math.random() - 0.5), 4 * (Math.random() - 0.5));
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

      //checks done on all other planets
      // for (let j = 0, len = planet.length; j < len; ++j) {
      //   if (i != j) {
      //     //gravity
      //     let iPos = new THREE.Vector3(planet[i].position.x, planet[i].position.y, planet[i].position.z);
      //     let jPos = new THREE.Vector3(planet[j].position.x, planet[j].position.y, planet[j].position.z);
      //     let dist2 = iPos.distanceToSquared(jPos);
      //     let mag = 0.01 * planet[j].radius / (dist2 + 500);
      //     let d = new THREE.Vector3().subVectors(planet[i].position, planet[j].position);
      //     d.normalize();
      //     d.multiplyScalar(-mag);
      //     let iVel = new THREE.Vector3(planet[i].velocity.x, planet[i].velocity.y, planet[i].velocity.z);
      //     iVel.add(d);
      //     planet[i].velocity = iVel;

      //     //if touching
      //     // const limit = planet[j].radius + planet[i].radius;
      //     // if (dist2 < limit * limit) {
      //     //   //push away
      //     //   d.normalize();
      //     //   d.multiplyScalar(-mag * 100);
      //     //   iVel = new THREE.Vector3(planet[i].velocity.x, planet[i].velocity.y, planet[i].velocity.z);
      //     //   iVel.add(d);
      //     //   planet[i].velocity = iVel;
      //     //   //slow a little bit
      //     //   planet[i].velocity.x *= 0.999;
      //     //   planet[i].velocity.y *= 0.999;
      //     //   planet[i].velocity.z *= 0.999;
      //     //   //combine

      //     //   //remove
      //     //   // scene.remove(planet[j]);
      //     //   // planet.splice(j, 1);
      //     // }
      //   }
      // }

      //just sun gravity
      let iPos = new THREE.Vector3(planet[i].position.x, planet[i].position.y, planet[i].position.z);
      let jPos = new THREE.Vector3(sun.position.x, sun.position.y, sun.position.z);
      let dist2 = iPos.distanceToSquared(jPos);
      let mag = 5 / (dist2 + 1);
      let d = new THREE.Vector3().subVectors(planet[i].position, sun.position);
      d.normalize();
      d.multiplyScalar(-mag);
      let iVel = new THREE.Vector3(planet[i].velocity.x, planet[i].velocity.y, planet[i].velocity.z);
      iVel.add(d);
      planet[i].velocity = iVel;

      //touching sun
      // const dr = sun.radius + planet[i].radius;
      // if (dist2 < dr * dr) {
      //   //slow a little bit
      //   planet[i].velocity.x *= 0.999;
      //   planet[i].velocity.y *= 0.999;
      //   planet[i].velocity.z *= 0.999;
      //   //push away
      //   // d.normalize();
      //   // d.multiplyScalar(-mag * 10);
      //   // iVel = new THREE.Vector3(planet[i].velocity.x, planet[i].velocity.y, planet[i].velocity.z);
      //   // iVel.add(d);
      //   // planet[i].velocity = iVel;
      //   //remove
      //   if (dist2 < sun.radius * sun.radius) {
      //     scene.remove(planet[i]);
      //     planet.splice(i, 1);
      //   }
      // }
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

    // corona.rotation.x += 0.01;
    // corona.rotation.y += 0.01;
    // corona.rotation.z += 0.01;
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

// var loader = new THREE.TextureLoader();
// loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/464612/Bmo.png", function(texture) {
//   var geometry = new THREE.SphereGeometry(1000, 20, 20);
//   var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
//   var mesh = new THREE.Mesh(geometry, material);
//   scene.add(mesh);
// });

// window.onload = function() {
//   orbitals();
// };