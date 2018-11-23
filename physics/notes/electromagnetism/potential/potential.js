window.onload = function () {
  fabric();
};

const fabric = function () {
  // el.onclick = null; //stops the function from running on button click

  settings = {
    range: 500,
    edgeBuffer: 100,
    totalCharges: 15,
    fullView: false,
    cameraRange: 1000,
    resolution: 256
  };

  const target = document.getElementById("three-potential");

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

  const camera = new THREE.PerspectiveCamera(50, 600 / 400, 10, settings.cameraRange);

  camera.position.set(0, -450, -350);

  // camera.lookAt(new THREE.Vector3(-settings.range / 2, -settings.range / 2, settings.range));
  // camera.position.y -= 10;
  // camera.position.z += 30;



  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableKeys = false;
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.1;

  /////////////////////////////////////////
  // lights and fog
  /////////////////////////////////////////

  // scene.add(new THREE.AmbientLight(0x111111));
  // var directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);
  // directionalLight.position.x = Math.random() - 0.5;
  // directionalLight.position.y = Math.random() - 0.5;
  // directionalLight.position.z = Math.random() - 0.5;
  // directionalLight.position.normalize();
  // scene.add(directionalLight);
  // pointLight = new THREE.PointLight(0xffffff, 1);
  // scene.add(pointLight);
  // pointLight.add(new THREE.Mesh(new THREE.SphereBufferGeometry(4, 8, 8), new THREE.MeshBasicMaterial({
  //   color: 0xffffff
  // })));


  let lightA = new THREE.AmbientLight(0xffffff);
  scene.add(lightA);


  // let dirLight = new THREE.DirectionalLight(0xffffff, 1);
  // dirLight.color.setHSL(0.1, 1, 0.95);
  // dirLight.position.set(500, 500, 500);
  // dirLight.target = new THREE.Object3D(0, 0, 0);
  // scene.add(dirLight);

  // scene.fog = new THREE.FogExp2(0x000000, 0.01);
  scene.fog = new THREE.Fog(0x000000, settings.range * 0.9, settings.range * 1.6);



  /////////////////////////////////////////
  // spawn charges 
  /////////////////////////////////////////

  const q = []; //holds the charges

  function spawnCharge(type) {
    q[q.length] = new Charge(type, {
      x: (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5),
      y: (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5)
    });
  }
  for (let i = 0; i < Math.floor(settings.totalCharges / 2); ++i) {
    spawnCharge("p");
    spawnCharge("e");
  }

  /////////////////////////////////////////
  // spawn potential plane
  /////////////////////////////////////////

  let potentialEnergy = new THREE.PlaneGeometry(settings.range, settings.range, settings.resolution, settings.resolution);
  let material = new THREE.MeshNormalMaterial({
    //ambient: 0x44B8ED,
    // color: 0xffffff,
    // wireframe: true,
    // emissive: 0xffffff,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
    // transparent: true,
    // opacity: 0.5,
  });


  let potentialEnergyMesh = new THREE.Mesh(potentialEnergy, material);
  potentialEnergyMesh.position.set(0, 0, 0);
  // potentialEnergyMesh.rotation.z = ath.PI / 2;
  scene.add(potentialEnergyMesh);


  /////////////////////////////////////////
  // Bounds
  /////////////////////////////////////////
  function bounds(who) {
    const edge = (settings.range - settings.edgeBuffer) / 2
    for (let i = 0, len = who.length; i < len; ++i) {
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
    }
  }


  /////////////////////////////////////////
  // update potentialEnergyMesh
  /////////////////////////////////////////
  function dynamicPlane(who) {
    const depth = 3000 / settings.totalCharges
    for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
      let v = potentialEnergyMesh.geometry.vertices[i];
      let mag = 0; //this should be zero but I'm using depth as 0 to center the energy mesh with the camera
      for (let j = 0, len = who.length; j < len; j++) {
        const dx = who[j].position.x - v.x;
        const dy = who[j].position.y - v.y;
        mag -= depth * who[j].charge / (Math.sqrt(dx * dx + dy * dy) + 1);
      }
      v.z = mag;
      // v.z = v.z * 0.5 + mag * 0.5; // smooth changes
    }
    potentialEnergyMesh.geometry.computeFaceNormals();
    potentialEnergyMesh.geometry.normalsNeedUpdate = true;
    potentialEnergyMesh.geometry.verticesNeedUpdate = true;
  }

  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  dynamicPlane(q)
  renderer.render(scene, camera);

  function animationLoop() {
    if (!pause) requestAnimationFrame(animationLoop);
    controls.update();
    renderer.render(scene, camera);
    Charge.physicsAll(q);
    bounds(q)
    dynamicPlane(q)
  }
  animationLoop();
};