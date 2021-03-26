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
    const cameraFov = 75;
    const cameraAspect = window.innerWidth/window.innerHeight;
    const cameraNear = 0.1;
    const cameraFar = 100;
    const camera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);

    const cameraControls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 0, 1);
    cameraControls.update();

    // Lights.
    const dirLight1Color = 0xFFFFFF;
    const dirLight1Intensity = 1;
    const dirLight1 = new THREE.DirectionalLight(dirLight1Color, dirLight1Intensity); // Directional light 1.
    dirLight1.position.set(-1, 2, 4);

    const ambLight = new THREE.AmbientLight( 0x404040 ); // Ambient light.
    
    scene.add(dirLight1);
    scene.add(ambLight);

    // Cube.
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x44aa88});
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    scene.add(cube);
    cube.position.set(0, 0, 4);

    // Sphere.
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({color: 0x8844aa});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial );
    
    scene.add(sphere);
    sphere.position.set(-4, 0, 0);

    // Octahedron.
    const octaGeometry = new THREE.OctahedronGeometry(2, 0);
    const octaMaterial = new THREE.MeshPhongMaterial({color: 0xaa8844});
    const octa = new THREE.Mesh(octaGeometry, octaMaterial);
    
    scene.add(octa);
    octa.position.set(4, 0, 0);

    // Cylinders.
    const cylinderGeometry1 = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
    const cylinderMaterial1 = new THREE.MeshPhongMaterial( {color: 0xffff00} );
    const cylinder1 = new THREE.Mesh(cylinderGeometry1, cylinderMaterial1);
    const cylinder2 = new THREE.Mesh(cylinderGeometry1, cylinderMaterial1);
    const cylinder3 = new THREE.Mesh(cylinderGeometry1, cylinderMaterial1);
    
    scene.add(cylinder1);
    scene.add(cylinder2);
    scene.add(cylinder3);
    cylinder1.position.set(0, 0, -4);
    cylinder2.position.set(-0.5, 0, -4);
    cylinder3.position.set(0.5, 0, -4);

    // Floor.
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    const planeMaterial = new THREE.MeshPhongMaterial({color: 0x242424, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    scene.add(plane);
    plane.position.set(0, -4, 0);
    plane.rotation.x = 1.5708;

    const shapes = [cube, sphere, octa];

    // Sound.
    const audio = document.getElementById('audio_player');

    audio.src = '../assets/music/song2.mp3';
    audio.load();

    const audioContext = new AudioContext();
    let audioSrc = audioContext.createMediaElementSource(audio);
    let analyser = audioContext.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    // Lows, mids, highs.
    let low = audioContext.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 320.0;
    low.gain.value = 0.0;
    low.connect(audioContext.destination);

    let mid = audioContext.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000.0;
    mid.Q.value = 0.5;
    mid.gain.value = 0.0;
    mid.connect(low);

    let high = audioContext.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 3200.0;
    high.gain.value = 0.0;
    high.connect(mid);

    audioSrc.connect(analyser);

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

        //console.log(lowerMax, lowerAvg, upperMax, upperAvg);
        //console.log(lowerMaxFr, lowerAvgFr, upperMaxFr, upperAvgFr);

        console.log(low, mid, high);

        shapes[0].scale.set(lowerAvgFr, lowerAvgFr, lowerAvgFr);
        shapes[1].scale.set(upperMaxFr, upperMaxFr, upperMaxFr);
        shapes[2].scale.set(upperAvgFr, upperAvgFr, upperAvgFr);
        cylinder1.scale.set(1, lowerAvgFr, 1);
        cylinder2.scale.set(1, upperMaxFr, 1);
        cylinder3.scale.set(1, upperAvgFr, 1);

        renderer.setSize(window.innerWidth, window.innerHeight);

        cameraControls.update();

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