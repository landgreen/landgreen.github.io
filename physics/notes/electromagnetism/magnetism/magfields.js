/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////
var scene, camera, renderer, controls;
scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(457, 120, 20);
camera.lookAt(new THREE.Vector3(0, 0, 0));

renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

/////////////////////////////////////////
// orbit Controller
/////////////////////////////////////////
var controls = new THREE.OrbitControls(camera);

/////////////////////////////////////////
// Trackball Controller
/////////////////////////////////////////
// controls = new THREE.TrackballControls(camera);
// controls.rotateSpeed = 1.0;
// controls.zoomSpeed = 1.2;
// controls.panSpeed = 0.2;
// controls.noZoom = false;
// controls.noPan = false;
// controls.staticMoving = true;
// controls.dynamicDampingFactor = 0.99;
// this.keys = [65 /*A*/, 83 /*S*/, 68 /*D*/];

/////////////////////////////////////////
// lines
/////////////////////////////////////////

var material = new THREE.LineBasicMaterial({ color: "#000" });
for (let j = 0; j < 5; j++) {
  for (let i = 0; i < 5; i++) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-25, i * 10, 10 * j));
    geometry.vertices.push(new THREE.Vector3(25, i * 10, 10 * j));
    var line = new THREE.Line(geometry, material);
    scene.add(line);
  }
}

//testing curves
var geometry = new THREE.Geometry();
var curve = new THREE.QuadraticBezierCurve3();
curve.v0 = new THREE.Vector3(0, 0, 50);
curve.v1 = new THREE.Vector3(100, 0, 0);
curve.v2 = new THREE.Vector3(0, 50, 0);
for (var i = 0, len = 10; i < len; i++) {
  geometry.vertices.push(curve.getPoint(i / len));
}
var material = new THREE.LineBasicMaterial({ color: "#f00" });
var line = new THREE.Line(geometry, material);
scene.add(line);

/////////////////////////////////////////
// Render Loop
/////////////////////////////////////////

// renderer.render(scene, camera);
// function render() {
//   renderer.render(scene, camera);
// }
// // Render the scene when the controls have changed.
// controls.addEventListener("change", render);

// updating the controls every requestAnimationFrame
function animationLoop() {
  requestAnimationFrame(animationLoop);
  // controls.update();
  renderer.render(scene, camera);
}
animationLoop();
