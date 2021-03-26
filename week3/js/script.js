import * as THREE from './three.js-master/build/three.module.js';

import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

window.onload = function() {
    main();
}

function  main() {
    const canvas = document.querySelector('#threejs_canvas');
    
    // Renderer.
    const renderer = new THREE.WebGLRenderer({canvas});

    // Scene.
    const scene = new THREE.Scene();

    // Camera.
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Lights.
    const dirLight1Color = 0xFFFFFF;
    const dirLight1Intensity = 1;
    const dirLight1 = new THREE.DirectionalLight(dirLight1Color, dirLight1Intensity); // Directional light 1.
    dirLight1.position.set(-1, 2, 4);

    /*const ambLight = new THREE.AmbientLight( 0x404040 ); // Ambient light.*/
    
    scene.add(dirLight1);
    /*scene.add(ambLight);*/

    // Cube.
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x44aa88});
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    function makeCube(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
       
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
       
        cube.position.x = x;
       
        return cube;
      }

    const shapes = [
        makeCube(cubeGeometry, 0x44aa88,  0),
        makeCube(cubeGeometry, 0x8844aa, -2),
        makeCube(cubeGeometry, 0xaa8844,  2),
    ];

    // Sound.
    const audio = document.getElementById('audio_player');

    audio.src = '../assets/music/song1.mp3';
    audio.load();

    const audioContext = new AudioContext();
    let audioSrc = audioContext.createMediaElementSource(audio);
    let analyser = audioContext.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        shapes.forEach((shape, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;
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
        let lowerAvgFr = lowerAvg / lowerHalfArray.length;
        let upperMaxFr = upperMax / upperHalfArray.length;
        let upperAvgFr = upperAvg / upperHalfArray.length;

        shapes[0].scale.set(lowerAvgFr, lowerAvgFr, lowerAvgFr);
        shapes[1].scale.set(upperMaxFr, upperMaxFr, upperMaxFr);
        shapes[2].scale.set(upperAvgFr, upperAvgFr, upperAvgFr);

        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
}

// Helper functions.
function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}