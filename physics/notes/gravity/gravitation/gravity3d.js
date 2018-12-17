(() => {
  var canvas = document.getElementById("gravity3d-load");
  var ctx = canvas.getContext("2d");
  canvas.width = document.getElementsByTagName("article")[0].clientWidth;
  ctx.font = "30px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("click to start simulation", canvas.width / 2, canvas.height / 2);
})()

const gravity3d = function (id) {
  const el = document.getElementById(id);
  document.getElementById("gravity3d-load").remove()

  const settings = {
    width: 200, // total size of space the charges can move in range x range
    height: 100,
    depth: 100,
    window: {
      height: 400,
      width: 590
    },
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
  renderer.domElement.style.background = "#000";
  let material, geometry

  /////////////////////////////////////////
  // camera and controls
  /////////////////////////////////////////

  const camera = new THREE.PerspectiveCamera(50, settings.window.width / settings.window.height, 10, settings.cameraRange);
  camera.position.set(0, 0, settings.width * 1);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableKeys = false;
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.1;

  /////////////////////////////////////////
  // lights and fog
  /////////////////////////////////////////

  let lightA = new THREE.AmbientLight(0x111111);
  scene.add(lightA);

  // let dirLight = new THREE.DirectionalLight(0xffffff, 1);
  // dirLight.color.setHSL(0.1, 1, 0.95);
  // dirLight.position.set(500, 500, 500);
  // dirLight.el = new THREE.Object3D(0, 0, 0);
  // scene.add(dirLight);

  // scene.fog = new THREE.FogExp2(0x000000, 0.0013);
  // scene.fog = new THREE.Fog(0x000000, settings.range * 0.9, settings.range * 1.6);


  /////////////////////////////////////////
  // spawn stars 
  /////////////////////////////////////////
  geometry = new THREE.Geometry();
  let x, y, z;
  for (let i = 0; i < 3000; ++i) {
    const scale = 500;
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
    color: 0x996666,
    size: 1,
    sizeAttenuation: false
  });
  let stars = new THREE.Points(geometry, material);
  scene.add(stars);


  /////////////////////////////////////////
  // spawn masses 
  /////////////////////////////////////////
  let radius, index;
  const mass = [];

  const line = [];

  function addLine(pos) {
    material = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    const lineIndex = line.length
    line[lineIndex] = new THREE.Line(geometry, material);
    scene.add(line[lineIndex]);
  }

  function updateLine() {
    // for (let i = 0; i < line.length; i++) {
    console.log(line[0].geometry.vertices)
    const where = mass[0 + 1].position //plus one on i to skip the sun
    console.log(line[0].geometry.vertices)
    // console.log(where)
    // const v = THREE.Vector3(where.x, where.y, where.z)
    // console.log(v)
    line[0].geometry.vertices.push(where)
    line[0].geometry.verticesNeedUpdate = true;

    // }
    // geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, pos.z));
  }

  //sun
  index = mass.length
  radius = 10
  // geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  geometry = new THREE.SphereGeometry(radius, 32, 32);
  material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    // color: 0xadc8d3,    // color: 0xaa6633,    // wireframe: true,    // shading: THREE.FlatShading,    // transparent: true,    // opacity: 0.7,
    //ambient: 0x44B8ED,
    emissive: 0xffffff,
  });
  mass[index] = new THREE.PointLight(0xffffff, 1, 0, 2);
  mass[index].add(new THREE.Mesh(geometry, material));
  // mass[index] = new THREE.Mesh(geometry, material);
  mass[index].radius = radius
  mass[index].mass = radius * radius * 10
  mass[index].position.set(0, 0, 0);
  mass[index].velocity = {
    x: 0,
    y: 0,
    z: 0,
  };
  scene.add(mass[index]);

  //planet
  material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    // color: 0xadc8d3,    // color: 0xaa6633,    // wireframe: true,    // shading: THREE.FlatShading,    // transparent: true,    // opacity: 0.7,
  });

  for (let i = 0; i < 3; i++) {
    index = mass.length
    radius = 1 + 0.9 * (Math.random() - 0.5)
    geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
    mass[index] = new THREE.Mesh(geometry, material);
    mass[index].radius = radius
    mass[index].mass = radius * radius
    mass[index].position.set(35 + i * 4, 0, 0);
    mass[index].velocity = {
      x: 0.03 * (Math.random() - 0.5),
      y: 0.2 + 0.01 * (Math.random() - 0.5) - 0.005 * i,
      z: 0.03 * (Math.random() - 0.5),
    };
    scene.add(mass[index]);

    addLine(mass[index].position) //  add a new line for the planet
  }
  // index = mass.length
  // mass[index] = new THREE.Mesh(geometry, material);
  // mass[index].radius = radius
  // mass[index].mass = radius
  // mass[index].position.set(50, 0, 0);
  // mass[index].velocity = {
  //   x: 0,
  //   y: 0.2,
  //   z: 0,
  // };
  // scene.add(mass[index]);

  // index = mass.length
  // mass[index] = new THREE.Mesh(geometry, material);
  // mass[index].radius = radius
  // mass[index].mass = radius
  // mass[index].position.set(30, 0, 0);
  // mass[index].velocity = {
  //   x: 0,
  //   y: 0.2,
  //   z: 0,
  // };
  // scene.add(mass[index]);

  //random masses
  // for (let i = mass.length; i < 20; ++i) {
  //   const range = settings.width * 2
  //   const radius = 1 + 20 * Math.random() * Math.random() * Math.random()
  //   geometry = new THREE.IcosahedronBufferGeometry(radius, 1);
  //   // mass[i] = new THREE.PointLight(0xffffff, 0.1, 0, 2);
  //   // mass[i].add(new THREE.Mesh(geometry, material));
  //   mass[i] = new THREE.Mesh(geometry, material);
  //   mass[i].radius = radius
  //   mass[i].mass = radius * radius
  //   mass[i].position.set(range * (Math.random() - 0.5), range * (Math.random() - 0.5), range * (Math.random() - 0.5));
  //   mass[i].velocity = {
  //     x: 0.1 * (Math.random() - 0.5),
  //     y: 0.1 * (Math.random() - 0.5),
  //     z: 0.1 * (Math.random() - 0.5),
  //   };
  //   scene.add(mass[i]);
  // }

  /////////////////////////////////////////
  // spawn walls 
  /////////////////////////////////////////
  const side = settings.width
  // geometry = new THREE.BoxGeometry(side * 2, side * 2, side * 2);
  material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.06,
  });
  // var cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  material = new THREE.LineBasicMaterial({
    color: 0x002266,

  });
  geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(side, side, side));
  geometry.vertices.push(new THREE.Vector3(-side, side, side));
  geometry.vertices.push(new THREE.Vector3(-side, -side, side));
  geometry.vertices.push(new THREE.Vector3(side, -side, side));
  geometry.vertices.push(new THREE.Vector3(side, side, side));
  geometry.vertices.push(new THREE.Vector3(side, -side, side));
  geometry.vertices.push(new THREE.Vector3(side, -side, -side));
  geometry.vertices.push(new THREE.Vector3(side, side, -side));
  geometry.vertices.push(new THREE.Vector3(-side, side, -side));
  geometry.vertices.push(new THREE.Vector3(-side, -side, -side));
  geometry.vertices.push(new THREE.Vector3(side, -side, -side));
  geometry.vertices.push(new THREE.Vector3(-side, -side, -side));
  geometry.vertices.push(new THREE.Vector3(-side, -side, side));
  geometry.vertices.push(new THREE.Vector3(-side, side, side));
  geometry.vertices.push(new THREE.Vector3(-side, side, -side));
  geometry.vertices.push(new THREE.Vector3(side, side, -side));
  geometry.vertices.push(new THREE.Vector3(side, side, side));
  var box = new THREE.Line(geometry, material);
  scene.add(box);

  /////////////////////////////////////////
  // Physics
  /////////////////////////////////////////
  function physics(who) {
    //change position from velocity
    const len = who.length;
    for (let i = 0; i < len; ++i) {
      // move
      who[i].position.x += who[i].velocity.x;
      who[i].position.y += who[i].velocity.y;
      who[i].position.z += who[i].velocity.z;
      // walls
      if (who[i].position.x > settings.width - who[i].radius) {
        who[i].position.x = settings.width - who[i].radius
        who[i].velocity.x = -Math.abs(who[i].velocity.x);
      } else if (who[i].position.x < -settings.width + who[i].radius) {
        who[i].position.x = -settings.width + who[i].radius
        who[i].velocity.x = Math.abs(who[i].velocity.x);
      }
      if (who[i].position.y > settings.width - who[i].radius) {
        who[i].position.y = settings.width - who[i].radius
        who[i].velocity.y = -Math.abs(who[i].velocity.y);
      } else if (who[i].position.y < -settings.width + who[i].radius) {
        who[i].position.y = -settings.width + who[i].radius
        who[i].velocity.y = Math.abs(who[i].velocity.y);
      }
      if (who[i].position.z > settings.width - who[i].radius) {
        who[i].position.z = settings.width - who[i].radius
        who[i].velocity.z = -Math.abs(who[i].velocity.z);
      } else if (who[i].position.z < -settings.width + who[i].radius) {
        who[i].position.z = -settings.width + who[i].radius
        who[i].velocity.z = Math.abs(who[i].velocity.z);
      }
      //accelerate velocity from gravity
      for (let j = i + 1; j < len; ++j) {
        const gravityConst = 0.002;
        const dx = who[i].position.x - who[j].position.x;
        const dy = who[i].position.y - who[j].position.y;
        const dz = who[i].position.z - who[j].position.z;
        rads = who[i].radius + who[j].radius
        const d2 = Math.max(dx * dx + dy * dy + dz * dz, rads * rads);
        const mag = gravityConst / d2 / Math.sqrt(d2);
        who[i].velocity.x -= mag * dx * who[j].mass / who[i].radius;
        who[i].velocity.y -= mag * dy * who[j].mass / who[i].radius;
        who[i].velocity.z -= mag * dz * who[j].mass / who[i].radius;
        who[j].velocity.x += mag * dx * who[i].mass / who[j].radius;
        who[j].velocity.y += mag * dy * who[i].mass / who[j].radius;
        who[j].velocity.z += mag * dz * who[i].mass / who[j].radius;
      }
    }
  }
  /////////////////////////////////////////
  // trace path of masses
  /////////////////////////////////////////

  //spawn



  //update




  /////////////////////////////////////////
  // Render Loop
  /////////////////////////////////////////
  function animationLoop() {
    if (!settings.pause) {
      requestAnimationFrame(animationLoop);
      controls.update();
      renderer.render(scene, camera);
      physics(mass)
      updateLine()
    }
  }
  animationLoop();
};