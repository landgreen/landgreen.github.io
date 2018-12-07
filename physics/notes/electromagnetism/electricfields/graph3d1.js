(() => {
  var canvas = document.getElementById("three-graph-1-load");
  var ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()

const graph3d1 = function (id) {
  const el = document.getElementById(id);
  document.getElementById("three-graph-1-load").remove()
  // el.onclick = null; //stops the function from running on button click

  const settings = {
    totalCharges: 30,
    resolution: 256,
    range: 300, // total size of space the charges can move in range x range
    edgeBuffer: 30, // how far are walls and spawns from the edge of the fabric, the range
    minimumRadius: 6, //larger means less spiky peaks
    fullView: false,
    cameraRange: 10000,
    pause: false
  };

  el.addEventListener("mouseleave", function () {
    settings.pause = true;
  });
  el.addEventListener("mouseenter", function () {
    if (settings.pause) {
      settings.pause = false;
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
      el.classList.remove("full-page");
      camera.aspect = 600 / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(600, 400);
      document.body.style.overflow = "auto";
    } else {
      settings.fullView = true;
      //full screen
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
  // el.appendChild(renderer.domElement);

  // renderer.domElement.style.background = "#fff";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////

  const camera = new THREE.PerspectiveCamera(45, 600 / 400, 10, settings.cameraRange);
  camera.position.set(0, -settings.range * 0.9, -settings.range * 0.6);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableKeys = false;
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.1;

  /////////////////////////////////////////
  // lights and fog
  /////////////////////////////////////////

  // let lightA = new THREE.AmbientLight(0xffffff);
  // scene.add(lightA);

  // let dirLight = new THREE.DirectionalLight(0xffffff, 1);
  // dirLight.color.setHSL(0.1, 1, 0.95);
  // dirLight.position.set(500, 500, 500);
  // dirLight.el = new THREE.Object3D(0, 0, 0);
  // scene.add(dirLight);

  // scene.fog = new THREE.FogExp2(0x000000, 0.01);
  // scene.fog = new THREE.Fog(0x000000, settings.range * 0.9, settings.range * 1.6);


  let material, geometry
  /////////////////////////////////////////
  // spawn x y z axis
  /////////////////////////////////////////

  material = new THREE.LineBasicMaterial({
    color: 0x000000
  });
  geometry = new THREE.Geometry();


  //x-axis
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(settings.range, 0, 0));

  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, settings.range, 0));

  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 0, settings.range));
  // geometry.vertices.push(new THREE.Vector3(0, 0, settings.range));
  var axis = new THREE.Line(geometry, material);
  scene.add(axis);

  //x letter
  letterScale = 10
  geometry.vertices.push(new THREE.Vector3(settings.range + 10, letterScale, 0));
  geometry.vertices.push(new THREE.Vector3(settings.range + 10, 0, letterScale));
  geometry.vertices.push(new THREE.Vector3(settings.range + 10, -letterScale, 0));
  geometry.vertices.push(new THREE.Vector3(settings.range + 10, 0, -letterScale));
  var letterX = new THREE.Line(geometry, material);
  scene.add(letterX);

  /////////////////////////////////////////
  // spawn potential plane
  /////////////////////////////////////////

  let potentialEnergy = new THREE.PlaneGeometry(settings.range, settings.range, settings.resolution, settings.resolution);
  material = new THREE.MeshNormalMaterial({
    //ambient: 0x44B8ED,
    // color: 0xffffff,
    // wireframe: true,
    // emissive: 0xffffff,
    side: THREE.DoubleSide,
    flatShading: true,
    // transparent: true,
    // opacity: 0.5,
  });

  let potentialEnergyMesh = new THREE.Mesh(potentialEnergy, material);
  potentialEnergyMesh.position.set(settings.range / 2, settings.range / 2, 0);
  // potentialEnergyMesh.rotation.z = Math.PI / 2;
  scene.add(potentialEnergyMesh);


  /////////////////////////////////////////
  // update potentialEnergyMesh
  /////////////////////////////////////////
  function renderDynamicPlane() {
    for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
      let v = potentialEnergyMesh.geometry.vertices[i];
      // const x = i % settings.range
      // const y = i / settings.range
      // v.z = 50 * Math.sin(x * 0.0005)
      // v.z = 50 * Math.sin(v.y * 0.1)
      // v.z = 50 * Math.sin(v.x * 0.1)
      // v.z = 50 * Math.sin(v.x * 0.05) + 50 * Math.sin(v.y * 0.1)
      const k = 5000;
      result = k * v.y / v.x / v.x
      result = Math.max(Math.min(result, settings.range), -settings.range)
      v.z = result

    }
    potentialEnergyMesh.geometry.computeFaceNormals();
    potentialEnergyMesh.geometry.normalsNeedUpdate = true;
    potentialEnergyMesh.geometry.verticesNeedUpdate = true;
  }

  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  // renderDynamicPlane(q)
  renderer.render(scene, camera);
  renderDynamicPlane()

  function animationLoop() {
    if (!settings.pause) requestAnimationFrame(animationLoop);
    controls.update();
    renderer.render(scene, camera);
  }
  animationLoop();
};