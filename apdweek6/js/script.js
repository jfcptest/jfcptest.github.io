import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import * as dat from '../datgui/dat.gui.module.js';

let deformation = 0;

window.onload = function () {
    initializeSoundDetection();
    threejsScene();
}

function initializeSoundDetection() {

    const handleSuccess = function(stream) {

        const context = new AudioContext();

        // Analyser.
        let analyser = context.createAnalyser();
        
        analyser.fftSize = 2048;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        let source = context.createMediaStreamSource(stream).connect(analyser);
        let processor = context.createScriptProcessor(1024, 1, 1);

        source.connect(processor);
        processor.connect(context.destination);

        processor.addEventListener('audioprocess', function(e) {
            analyser.getByteTimeDomainData(dataArray);

            //console.log(dataArray);

            deformation = (((dataArray[0] - 100) * (0.8 - (-1))) / (150 - 100)) + (-1);

            console.log(deformation);
        });

    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(handleSuccess);

}

function threejsScene() {

    // DEBUG
    const gui = new dat.GUI();

    // INITIALIZATION - Texture Loader.
    const textureLoader = new THREE.TextureLoader();

    // INITIALIZATION - Canvas
    const canvas = document.querySelector('#threejs_canvas');

    // INITIALIZATION - Renderer.
    const renderer = new THREE.WebGLRenderer({ canvas });

    // INITIALIZATION - Scene.
    const scene = new THREE.Scene();

    // INITIALIZATION - Camera.
    const cameraFov = 75;
    const cameraAspect = window.innerWidth / window.innerHeight;
    const cameraNear = 0.1;
    const cameraFar = 20;

    const camera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar); // Camera.

    const cameraControls = new OrbitControls(camera, renderer.domElement); // Camera controls.
    cameraControls.update();

    // INITIALIZATION - Lights.
    const dirLight1Color = 0xFFFFFF;
    const dirLight1Intensity = 10;

    const pointLight1Color = 0xFF0000;
    const pointLight1Intensity = 10;

    const dirLight1 = new THREE.DirectionalLight(dirLight1Color, dirLight1Intensity); // Directional light 1.
    const pointLight1 = new THREE.PointLight(pointLight1Color, pointLight1Intensity); // Point light 1.
    const ambLight = new THREE.AmbientLight(0x404040); // Ambient light.

    // INITIALIZATION - Planet floor (Semi sphere).
    const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x0E1116 });

    const planetTextureNormal = textureLoader.load('./assets/Flower_Bud_001_SD/Metal_Grill_021_normal.jpg');
    const planetTextureDisplacement = textureLoader.load('./assets/Flower_Bud_001_SD/Flower_Bud_001_height.png');

    planetTextureDisplacement.wrapS = planetTextureDisplacement.wrapT = THREE.RepeatWrapping;
    planetTextureDisplacement.repeat.set(2, 1);

    //planetMaterial.normalMap = planetTextureNormal;
    planetMaterial.displacementMap = planetTextureDisplacement;
    planetMaterial.displacementScale = 0;
    planetMaterial.metalness = 0.2;
    planetMaterial.roughness = 0.6;

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // SCENE - Adding the objects to the scene.
    scene.add(dirLight1);
    scene.add(pointLight1);
    scene.add(ambLight);
    scene.add(planet);

    // CHARACTERISTICS - Positioning and editing valules from the objects in the scene.
    camera.position.set(0, 0, 4);
    dirLight1.position.set(0, 4, 0);
    pointLight1.position.set(0, -4, 0);
    planet.position.set(0, 0, 0);

    // DEBUG - dat.gui controller.
    gui.add(planetMaterial, 'displacementScale').step(0.1).min(-2).max(2);

    function main() {

        function render(time) {
            time *= 0.001;  // convert time to seconds

            planet.rotation.y += 0.0005;

            planetMaterial.displacementScale = deformation;

            renderer.setSize(window.innerWidth, window.innerHeight);

            cameraControls.update();

            renderer.render(scene, camera);
        
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }

    main();

}