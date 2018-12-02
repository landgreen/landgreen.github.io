(() => {
  var canvas = document.getElementById("three-potential-1-load");
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

const potential1 = function (id) {
  const el = document.getElementById(id);
  document.getElementById("three-potential-1-load").remove()
  // el.onclick = null; //stops the function from running on button click

  const settings = {
    totalCharges: 30,
    resolution: 256,
    range: 300, // total size of space the charges can move in range x range
    edgeBuffer: 30, // how far are walls and spawns from the edge of the fabric, the range
    minimumRadius: 6, //larger means less spiky peaks
    fullView: false,
    cameraRange: 2000,
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
  renderer.domElement.style.background = "#000";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////

  const camera = new THREE.PerspectiveCamera(50, 600 / 400, 10, settings.cameraRange);
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

  /////////////////////////////////////////
  // spawn charges 
  /////////////////////////////////////////

  const q = []; //holds the charges

  function spawnRandomCharge(type) {
    q[q.length] = new Charge(type, {
      x: 0.8 * (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5),
      y: 0.8 * (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5)
    });
  }
  for (let i = 0; i < Math.floor(settings.totalCharges / 2); ++i) {
    spawnRandomCharge("p");
    spawnRandomCharge("e");
  }
  // const side = 30;
  // const apothem = side * 0.866; //vertical distance between rows
  // const rows = 6; // y
  // const columns = 4; // x
  // const hexLeft = 0 - side * ((columns * 3) / 4);
  // const hexTop = 0 - apothem * (rows / 2);
  // for (let y = 1; y < rows; ++y) {
  //   let xOff = 0;
  //   if (y % 2) {} else {
  //     xOff = 0.5; //odd
  //   }
  //   for (let x = -1, i = 0; i < columns; ++i) {
  //     if (i % 2) {
  //       //even
  //       x++;
  //       xOff = Math.abs(xOff);
  //     } else {
  //       //odd
  //       x += 2;
  //       xOff = -Math.abs(xOff);
  //     }
  //     q[q.length] = new Charge("p", {
  //       x: hexLeft + (x + xOff) * side,
  //       y: hexTop + y * apothem
  //     });
  //   }
  // }




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
    flatShading: true,
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
  function renderDynamicPlane(who) {
    const depth = 10000 / settings.totalCharges
    for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
      let v = potentialEnergyMesh.geometry.vertices[i];
      let mag = 0; //this should be zero but I'm using depth as 0 to center the energy mesh with the camera
      for (let j = 0, len = who.length; j < len; j++) {
        const dx = who[j].position.x - v.x;
        const dy = who[j].position.y - v.y;
        const radius = Math.max(Math.sqrt(dx * dx + dy * dy), 1) + settings.minimumRadius;
        mag -= depth * who[j].charge / radius
      }
      v.z = mag;
      // v.z = Math.max(Math.min(mag, limit), -limit);
      // v.z = v.z * 0.5 + mag * 0.5; // smooth changes
    }
    potentialEnergyMesh.geometry.computeFaceNormals();
    potentialEnergyMesh.geometry.normalsNeedUpdate = true;
    potentialEnergyMesh.geometry.verticesNeedUpdate = true;
  }

  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  renderDynamicPlane(q)
  renderer.render(scene, camera);

  function animationLoop() {
    if (!settings.pause) requestAnimationFrame(animationLoop);
    controls.update();
    renderer.render(scene, camera);
    Charge.physicsAll(q);
    bounds(q)
    renderDynamicPlane(q)
  }
  animationLoop();
};