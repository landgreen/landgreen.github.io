(() => {
  var canvas = document.getElementById("three-potential-2-load");
  var ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.font = "30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()

const potential2 = function (id) {
  const el = document.getElementById(id);
  document.getElementById("three-potential-2-load").remove()

  const settings = {
    totalCharges: 30,
    resolutionWidth: 256,
    resolutionHeight: 128,
    width: 256 * 2, // total size of space the charges can move in range x range
    height: 128 * 2,
    window: {
      height: 300,
      width: 590
    },
    edgeBuffer: 30, // how far are walls and spawns from the edge of the fabric, the range
    fullView: false,
    cameraRange: 2000,
    pause: true
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
      camera.aspect = settings.window.width / settings.window.height;
      camera.updateProjectionMatrix();
      renderer.setSize(settings.window.width, settings.window.height);
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
  renderer.setSize(settings.window.width, settings.window.height);
  // el.appendChild(renderer.domElement);
  renderer.domElement.style.background = "#fff";

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////

  const camera = new THREE.PerspectiveCamera(50, settings.window.width / settings.window.height, 10, settings.cameraRange);
  camera.position.set(0, -settings.width * 0.2, -settings.height * 1.2);

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

  const separation = 40;
  const off = settings.width - separation / 2;
  for (let i = 0; i < Math.ceil((settings.width * 2) / separation); ++i) {
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: separation
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: 0
    });
    q[q.length] = new Charge("p", {
      x: separation * i - off,
      y: -separation
    });

    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: separation
      }, {
        x: 0,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: 0
      }, {
        x: 0,
        y: 0
      }
    );
    q[q.length] = new Charge(
      "e", {
        x: separation * i - off,
        y: -separation
      }, {
        x: 0,
        y: 0
      }
    );

  }

  // function spawnRandomCharge(type) {
  //   q[q.length] = new Charge(type, {
  //     x: 0.8 * (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5),
  //     y: 0.8 * (settings.range - settings.edgeBuffer / 2) * (Math.random() - 0.5)
  //   });
  // }
  // for (let i = 0; i < Math.floor(settings.totalCharges / 2); ++i) {
  //   spawnRandomCharge("p");
  //   spawnRandomCharge("e");
  // }




  /////////////////////////////////////////
  // spawn potential plane
  /////////////////////////////////////////

  let potentialEnergy = new THREE.PlaneGeometry(settings.width, settings.height, settings.resolutionWidth, settings.resolutionHeight);
  let material = new THREE.MeshNormalMaterial({
    //ambient: 0x44B8ED,
    // color: 0xffffff,
    // wireframe: true,
    // emissive: 0xffffff,
    side: THREE.DoubleSide, //oddly, double sided has better performance
    // side: THREE.BackSide,
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
    const edge = 0 //settings.edgeBuffer
    const w = settings.width / 2
    const h = settings.height / 2
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].canMove === true) {
        if (who[i].position.x > w - edge) {
          who[i].position.x = w - edge
          who[i].velocity.x = -Math.abs(who[i].velocity.x);
        } else if (who[i].position.x < -w - edge) {
          who[i].position.x = -w - edge
          who[i].velocity.x = Math.abs(who[i].velocity.x);
        }
        if (who[i].position.y > h - edge) {
          who[i].position.y = h - edge
          who[i].velocity.y = -Math.abs(who[i].velocity.y);
        } else if (who[i].position.y < -h - edge) {
          who[i].position.y = -h - edge
          who[i].velocity.y = Math.abs(who[i].velocity.y);
        }
      }
    }
  }
  /////////////////////////////////////////
  // teleport
  /////////////////////////////////////////
  function teleport(who) {
    const off = 100
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].canMove && who[i].position.x > settings.width - off) {
        who[i].position.x = -settings.width;
      }
    }
  }


  /////////////////////////////////////////
  // update potentialEnergyMesh
  /////////////////////////////////////////
  function renderDynamicPlane(who) {
    const depth = 11000 / settings.totalCharges //scale of the z-direction
    const minimumRadius = 6 //larger means less spiky peaks //how much of the center of a spike do we skip?
    for (let i = 0, len = potentialEnergyMesh.geometry.vertices.length; i < len; i++) {
      let v = potentialEnergyMesh.geometry.vertices[i];
      let mag = 0; //this can be nonzero to move the plane up or down relative to the camera
      for (let j = 0, len = who.length; j < len; j++) {
        const dx = who[j].position.x - v.x;
        const dy = who[j].position.y - v.y;
        const radius = Math.max(Math.sqrt(dx * dx + dy * dy), 1) + minimumRadius;
        mag -= depth * who[j].charge / radius
      }
      // v.z = mag;
      // v.z = v.z * 0.5 + mag * 0.5; // smooth changes
      v.z = v.z * 0.7 + mag * 0.3; // smooth changes
    }
    potentialEnergyMesh.geometry.computeFaceNormals(); //not sure why this command is needed, but I think it helps performance //I think it smooths out flat shading?
    potentialEnergyMesh.geometry.normalsNeedUpdate = true; //not sure why this command is needed, but I think it helps performance //I think it smooths out flat shading?
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
    // Charge.physicsAll(q);
    Charge.physicsAll(q, 0.99, 300, 50);
    teleport(q)
    // bounds(q)
    renderDynamicPlane(q)
  }
  animationLoop();
};