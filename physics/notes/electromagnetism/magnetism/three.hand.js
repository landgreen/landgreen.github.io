(() => {
    var canvas = document.getElementById("three-hand-load");
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

const hand = function (id) {
    const el = document.getElementById(id);
    document.getElementById("three-hand-load").remove()

    const settings = {
        width: 600, // total size of space the charges can move in range x range
        height: 240,
        window: {
            height: 300,
            width: 590
        },
        edgeBuffer: 30, // how far are walls and spawns from the edge of the fabric, the range
        fullView: false,
        cameraRange: 2000,
        pause: true
    };

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

    /////////////////////////////////////////
    // camera and controls
    /////////////////////////////////////////

    const camera = new THREE.PerspectiveCamera(50, settings.window.width / settings.window.height, 10, settings.cameraRange);
    camera.position.set(0, -settings.width * 0.5, -settings.height * 1.2);

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
    // Render Loop
    /////////////////////////////////////////
    function animationLoop() {
        if (!settings.pause) {
            requestAnimationFrame(animationLoop);
            controls.update();
            renderer.render(scene, camera);
            // Charge.physicsAll(q);
        }
    }
    animationLoop();
};