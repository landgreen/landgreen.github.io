// const fabric = function () {
settings = {
  range: 100,
  totalPlanets: 10,
  planetRadius: 2,
  fullView: false,
  cameraRange: 2000,
  dimensions: 100,
  resolution: 20
};
const target = document.getElementById("three-fabric");

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
  // alpha: true,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(600, 400);
target.appendChild(renderer.domElement);
renderer.domElement.style.background = "#000";

/////////////////////////////////////////
// camera and controls
/////////////////////////////////////////
const camera = new THREE.PerspectiveCamera(50, 600 / 400, 1, settings.cameraRange);
camera.position.set(0, 0, settings.range);
camera.lookAt(new THREE.Vector3(-settings.range / 2, -settings.range / 2, 0));
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enableKeys = false;
// controls.enableDamping = true;
// controls.dampingFactor = 0.08;

/////////////////////////////////////////
// lights and fog
/////////////////////////////////////////
let lightA = new THREE.AmbientLight(0xffffff);
scene.add(lightA);


// let dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
// dirLight.color.setHSL(0.1, 1, 0.95);
// dirLight.position.set(0, 0, settings.range);
// dirLight.target = new THREE.Object3D(-settings.range / 2, -settings.range / 2, 0);
// scene.add(dirLight);

// scene.fog = new THREE.FogExp2(0x000000, 0.015);
// scene.fog = new THREE.Fog(0x000000, 50, 200);


/////////////////////////////////////////
// spawn things
/////////////////////////////////////////
let mesh, material, geometry

//random planets
const planet = [];
for (let i = 0; i < settings.totalPlanets; ++i) {
  const radius = settings.planetRadius + settings.planetRadius * (Math.random() - 0.5)
  // geometry = new THREE.SphereGeometry(radius, 12, 12);
  geometry = new THREE.IcosahedronBufferGeometry(radius, 1);

  material = new THREE.MeshLambertMaterial({
    // color: 0xadc8d3,
    color: 0xff0000,
    // color: 0xaa6633,
    // wireframe: true,
    // transparent: true,
    // opacity: 0.5,
  });
  planet[i] = new THREE.Mesh(geometry, material);
  planet[i].radius = radius
  planet[i].position.set(settings.range * (Math.random() - 0.5), settings.range * (Math.random() - 0.5), -5);
  planet[i].velocity = {
    x: 0.1 * (Math.random() - 0.5),
    y: 0.1 * (Math.random() - 0.5),
    z: 0
  };
  scene.add(planet[i]);
}


// potential energy plane
var potentialEnergy = new THREE.PlaneGeometry(settings.dimensions, settings.dimensions, settings.resolution, settings.resolution);

material = new THREE.MeshLambertMaterial({
  //ambient: 0x44B8ED,
  color: 0xffffff,
  wireframe: true,
  // emissive: 0xffffff,
  // side: THREE.DoubleSide,
  // shading: THREE.FlatShading,
  // transparent: true,
  // opacity: 0.5,
});

var potentialEnergyMesh = new THREE.Mesh(potentialEnergy, material);
potentialEnergyMesh.position.set(0, 0, 0);
// potentialEnergyMesh.rotation.z = ath.PI / 2;
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
    // move
    who[i].position.x += who[i].velocity.x;
    who[i].position.y += who[i].velocity.y;

    // walls
    if (who[i].position.x > edge) {
      who[i].position.x = edge
      who[i].velocity.x = -Math.abs(who[i].velocity.x);
    } else if (who[i].position.x < -edge) {
      who[i].position.x = -edge
      who[i].velocity.x = Math.abs(who[i].velocity.x);
    }
    if (who[i].position.y > edge) {
      who[i].position.y = edge
      who[i].velocity.y = -Math.abs(who[i].velocity.y);
    } else if (who[i].position.y < -edge) {
      who[i].position.y = -edge
      who[i].velocity.y = Math.abs(who[i].velocity.y);
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

  // const depth = 100 / planet.length
  // for (let i = 0; i < len; ++i) {
  //   let mag = 0;
  //   for (let j = 0; j < len; ++j) {
  //     if (i !== j) {
  //       const dx = who[i].position.x - who[j].position.x;
  //       const dy = who[i].position.y - who[j].position.y;
  //       mag -= depth * planet[j].radius * planet[j].radius / (Math.max(Math.sqrt(dx * dx + dy * dy), planet[j].radius));
  //     }
  //   }
  //   planet[i].position.z = mag
  // }
}


/////////////////////////////////////////
// move potentialEnergyMesh
/////////////////////////////////////////
function dynamicPlane() {
  // compute and draw gravitational potential
  const depth = 100 / planet.length
  for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
    let v = potentialEnergyMesh.geometry.vertices[i];
    let mag = 0;
    for (let j = 0, len = planet.length; j < len; j++) {
      const dx = planet[j].position.x - v.x;
      const dy = planet[j].position.y - v.y;
      mag -= depth * planet[j].radius * planet[j].radius / (Math.max(Math.sqrt(dx * dx + dy * dy), planet[j].radius));
    }
    // v.z = mag;
    v.z = v.z * 0.95 + mag * 0.05; // smooth changes
  }
  potentialEnergyMesh.geometry.computeFaceNormals();
  potentialEnergyMesh.geometry.normalsNeedUpdate = true;
  potentialEnergyMesh.geometry.verticesNeedUpdate = true;
}

/////////////////////////////////////////
// Render Loop
/////////////////////////////////////////
renderer.render(scene, camera);

function animationLoop() {
  if (!pause) requestAnimationFrame(animationLoop);
  controls.update();
  renderer.render(scene, camera);
  physics(planet)
  dynamicPlane()
}
animationLoop();
// };

// window.onload = function () {
//   fabric();
// };