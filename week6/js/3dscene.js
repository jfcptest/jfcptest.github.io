import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { analyser, dataArray } from './sound.js';
import * as dat from '../datgui/dat.gui.module.js';

// DEBUG
const gui = new dat.GUI();

// INITIALIZATION - Texture Loader.
const textureLoader = new THREE.TextureLoader();

// INITIALIZATION - Canvas
const canvas = document.querySelector('#threejs_canvas');

// INITIALIZATION - Renderer.
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

// INITIALIZATION - Scene.
const scene = new THREE.Scene();
const sceneSkybox = textureLoader.load(
    './assets/hdri/nebula-hdr.png', 
    () => {
        const rt = new THREE.WebGLCubeRenderTarget(sceneSkybox.image.height);
        rt.fromEquirectangularTexture(renderer, sceneSkybox);
        scene.background = rt.texture;
    }
);

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
const dirLight1Intensity = 1;

const pointLight1Color = 0xFF0000;
const pointLight1Intensity = 10;

const dirLight1 = new THREE.DirectionalLight(dirLight1Color, dirLight1Intensity); // Directional light 1.
const pointLight1 = new THREE.PointLight(pointLight1Color, pointLight1Intensity); // Point light 1.
const ambLight = new THREE.AmbientLight(0x404040); // Ambient light.

// INITIALIZATION - Cube.
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

// INITIALIZATION - Sphere.
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x8844aa });

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

// INITIALIZATION - Octahedron.
const octaGeometry = new THREE.OctahedronGeometry(2, 0);
const octaMaterial = new THREE.MeshPhongMaterial({ color: 0xaa8844 });

const octa = new THREE.Mesh(octaGeometry, octaMaterial);

// INITIALIZATION - Cylinders.
const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });

const cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
const cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
const cylinder3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

const cylinders = [cylinder1, cylinder2, cylinder3];

// INITIALIZATION - Planet floor (Semi sphere).
const planetGeometry = new THREE.SphereGeometry(60, 64, 64);

const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x0E1116 });

const planetTextureNormal = textureLoader.load('./assets/textures/Rocks_Hexagons_001_SD/Rocks_Hexagons_001_normal.jpg');
const planetTextureDisplacement = textureLoader.load('./assets/textures/Rocks_Hexagons_001_SD/Rocks_Hexagons_001_height.png');
const planetTextureRoughness = textureLoader.load('./assets/textures/Rocks_Hexagons_001_SD/Rocks_Hexagons_001_roughness.jpg');
const planetTextures = [planetTextureNormal, planetTextureDisplacement, planetTextureRoughness];

planetMaterial.normalMap = planetTextureNormal;
planetMaterial.displacementMap = planetTextureDisplacement;
planetMaterial.displacementScale = 0;
planetMaterial.roughnessMap = planetTextureRoughness;

for(let texture of planetTextures) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 50);
}

planetTextureDisplacement.wrapS = planetTextureDisplacement.wrapT = THREE.RepeatWrapping;
planetTextureDisplacement.repeat.set(120, 60);

const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.rotation.x = 1.5708;

// INITIALIZATION - Shapes group.
const shapesRotationGroup = [cube, sphere, octa];

// SCENE - Adding the objects to the scene.
scene.add(dirLight1);
scene.add(pointLight1);
scene.add(ambLight);
scene.add(cube);
scene.add(sphere);
scene.add(octa);
for(let cylinder of cylinders) { scene.add(cylinder); };
scene.add(planet);

// CHARACTERISTICS - Positioning and editing valules from the objects in the scene.
camera.position.set(0, 0, 1);
dirLight1.position.set(4, 2, -1);
pointLight1.position.set(-20, 4.5, 13);
pointLight1.intensity = 1;
cube.position.set(0, 0, 4);
sphere.position.set(-4, 0, 0);
octa.position.set(4, 0, 0);
cylinder1.position.set(0, 0, -4);
cylinder2.position.set(-0.5, 0, -4);
cylinder3.position.set(0.5, 0, -4);
planet.position.set(0, -61, 0);

// DEBUG - dat.gui controller.
/* gui.add(pointLight1.position, 'x').step(0.5);
gui.add(pointLight1.position, 'y').step(0.5);
gui.add(pointLight1.position, 'z').step(0.5);
gui.add(pointLight1, 'intensity').step(0.25); */

export function main() {

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        shapesRotationGroup.forEach((shape, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;
            planet.rotation.y = rot/600;
        });

        // Sound.
        analyser.getByteFrequencyData(dataArray);

        let lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
        let upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

        let overallAvg = avg(dataArray);
        let lowerMax = max(lowerHalfArray);
        let lowerAvg = avg(lowerHalfArray);
        let upperMax = max(upperHalfArray);
        let upperAvg = avg(upperHalfArray);

        let lowerMaxFr = lowerMax / lowerHalfArray.length;
        let lowerAvgFr = (lowerAvg / lowerHalfArray.length);
        let upperMaxFr = (upperMax / upperHalfArray.length);
        let upperAvgFr = (upperAvg / upperHalfArray.length);

        shapesRotationGroup[0].scale.set(lowerAvgFr, lowerAvgFr, lowerAvgFr);
        shapesRotationGroup[1].scale.set(upperMaxFr, upperMaxFr, upperMaxFr);
        shapesRotationGroup[2].scale.set(upperAvgFr, upperAvgFr, upperAvgFr);
        cylinder1.scale.set(1, lowerAvgFr, 1);
        cylinder2.scale.set(1, upperMaxFr, 1);
        cylinder3.scale.set(1, upperAvgFr, 1);

        renderer.setSize(window.innerWidth, window.innerHeight);

        cameraControls.update();

        renderer.render(scene, camera);
       
        /* requestAnimationFrame(render); */
    }

    /* requestAnimationFrame(render); */
    renderer.setAnimationLoop(render);
}

// Helper functions.
function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}