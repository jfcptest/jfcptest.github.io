let canvas = document.getElementById('renderCanvas');
let engine = new BABYLON.Engine(canvas, true);
let scene = null;

// FPS.
let divFPS = document.getElementById('fps');

window.addEventListener('DOMContentLoaded', function() {

    initialSetup();

});

function initialSetup() {

    scene = createScene();

    engine.runRenderLoop(function(){
        //scene.render();
        divFPS.innerHTML = engine.getFps().toFixed() + ' fps';
    });

    window.addEventListener('resize', function(){
        engine.resize();
    });

}

function createScene() {

    // Scene.
    let scene = new BABYLON.Scene(engine);

    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Camera.
    let camera = new BABYLON.ArcRotateCamera('camera', -1.5708, 1.0472, 700, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    camera.lowerAlphaLimit = -2.0944;
    camera.upperAlphaLimit = -1.0472;
    camera.lowerBetaLimit = 0.349066;
    camera.upperBetaLimit = 1.13446;
    camera.lowerRadiusLimit = 150;
    camera.upperRadiusLimit = 710;
    //camera.panningDistanceLimit = 710;
    //camera.pinchToPanMaxDistance = 710;

    // Light.
    let light = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(0, 90, 200), scene);
    let light2 = new BABYLON.PointLight('pointLight2', new BABYLON.Vector3(0, 90, -200), scene);

    light.intensity = 1.2;
    light.range = 600;
    light2.intensity = 0.15;
    light2.range = 600;

    // Shadows.
    let shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

    shadowGenerator.usePoissonSampling = true;
    //shadowGenerator.useExponentialShadowMap = true;
    //shadowGenerator.useBlurExponentialShadowMap = true;

    //shadowGenerator.useCloseExponentialShadowMap = true;
    //shadowGenerator.useBlurCloseExponentialShadowMap = true;

    // Physics.
    scene.enablePhysics(new BABYLON.Vector3(0,-209.81, 0), new BABYLON.OimoJSPlugin());

    // Place.
    let ground = BABYLON.MeshBuilder.CreateGround('ground', {height:500, width:500, subdivisions:1}, scene);
    let groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    //groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    //groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    //groundMaterial.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    groundMaterial.diffuseTexture = new BABYLON.Texture("/textures/floor-color.jpg", scene);
    //groundMaterial.specularTexture = new BABYLON.Texture("PATH TO IMAGE", scene);
    //groundMaterial.emissiveTexture = new BABYLON.Texture("PATH TO IMAGE", scene);
    //groundMaterial.ambientTexture = new BABYLON.Texture("PATH TO IMAGE", scene);
    groundMaterial.bumpTexture = new BABYLON.Texture("/textures/floor-normal.jpg", scene);
    groundMaterial.diffuseTexture.uScale = 2;
    groundMaterial.diffuseTexture.vScale = 2;
    groundMaterial.bumpTexture.uScale = 2;
    groundMaterial.bumpTexture.vScale = 2;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    let walls = [];
    let wallMaterial = new BABYLON.StandardMaterial('wallMat', scene);
    //wallMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    //wallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    //wallMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    wallMaterial.diffuseTexture = new BABYLON.Texture("/textures/wall-color.jpg", scene);
    wallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    //wallMaterial.emissiveColor = BABYLON.Color3.Gray();
    //wallMaterial.bumpTexture = new BABYLON.Texture("/textures/wall-normal.jpg", scene);
    //wallMaterial.diffuseTexture.uScale = 40;
    //wallMaterial.diffuseTexture.vScale = 16;
    //wallMaterial.bumpTexture.uScale = 40;
    //wallMaterial.bumpTexture.vScale = 16;

    for(let i = 0; i < 4 ; i++) {
        if(i === 2) {
            walls[i] = BABYLON.MeshBuilder.CreatePlane('wall' + (i+1), {width:500, size:30, tileSize:1}, scene);
        } else {
            walls[i] = BABYLON.MeshBuilder.CreatePlane('wall' + (i+1), {width:500, size:180, tileSize:1}, scene);
        }

        walls[i].material = wallMaterial;
        walls[i].receiveShadows = true;
    }

    walls[0].position = new BABYLON.Vector3(0, 90, 250);
    walls[1].position = new BABYLON.Vector3(250, 90, 0);
    walls[2].position = new BABYLON.Vector3(0, 15, -250);
    walls[3].position = new BABYLON.Vector3(-250, 90, 0);

    walls[0].rotation = new BABYLON.Vector3(0, 0, 0);
    walls[1].rotation = new BABYLON.Vector3(0, 1.5708, 0);
    walls[2].rotation = new BABYLON.Vector3(0, 3.14159, 0);
    walls[3].rotation = new BABYLON.Vector3(0, -1.5708, 0);

    // Place - Physics.
    ground.checkCollisions = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 1 }, scene);

    for(let wall of walls) {
        wall.checkCollisions = true;
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
    }

    // Screen.
    let tvScreen = BABYLON.MeshBuilder.CreatePlane('tv', {width:200, size:112.5, tileSize:1}, scene);
    let tvMaterial = new BABYLON.StandardMaterial('tvMat', scene);

    let tvWeek = [
        '/videos/week2.mp4',
        '/videos/week3.mp4',
        '/videos/week4.mp4',
        '/videos/week5.mp4',
        '/videos/week7.mp4',
        '/videos/week8.mp4',
        '/videos/week9.mp4'
    ]
    
    let tvTexture = [];
    
    tvTexture[0] = new BABYLON.VideoTexture('video' + 1, '/videos/static.mp4', scene, true);

    for(let i = 0; i < tvWeek.length; i++) {
        tvTexture.push(new BABYLON.VideoTexture('video' + (i+1), tvWeek[i], scene, true));
    }

    tvScreen.position = new BABYLON.Vector3(0, 90, 249);

    tvMaterial.diffuseTexture = tvTexture[0];
    tvMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    tvMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    tvScreen.material = tvMaterial;

    tvTexture[0].video.volume = 0;
    tvTexture[0].video.play();

    // Buttons - Spheres.
    let buttons = [];
    let buttonsMat = [];

    for(let i = 0; i < tvWeek.length; i++) {
        buttons[i] = new BABYLON.MeshBuilder.CreateSphere('sphere' + (i+1), {segments:16, diameter:25}, scene);
        buttons[i].actionManager = new BABYLON.ActionManager(scene);
        buttonsMat[i] = new BABYLON.StandardMaterial('buttonsMat' + (i+1), scene);
        //buttonsMat[i].diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        buttonsMat[i].specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        shadowGenerator.addShadowCaster(buttons[i]);
        buttons[i].physicsImpostor = new BABYLON.PhysicsImpostor(buttons[i], BABYLON.PhysicsImpostor.SphereImpostor, {mass:0.1}, scene);
        buttons[i].position = new BABYLON.Vector3(Math.floor(Math.random() * (-150 - 150 + 1) + 150), 100, Math.floor(Math.random() * (-150 - 150 + 1) + 150));
    }

    //buttonsMat[0].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[1].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[2].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[3].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[4].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[5].emissiveColor = BABYLON.Color3.Red();
    //buttonsMat[6].emissiveColor = BABYLON.Color3.Red();

    buttonsMat[0].diffuseColor = new BABYLON.Color3(1, 0.90588235294118, 0.29803921568627);
    buttonsMat[1].diffuseColor = new BABYLON.Color3(1, 0.34901960784314, 0.3921568627451);
    buttonsMat[2].diffuseColor = new BABYLON.Color3(1, 1, 1);
    buttonsMat[3].diffuseColor = new BABYLON.Color3(0.41960784313725, 0.94509803921569, 0.47058823529412);
    buttonsMat[4].diffuseColor = new BABYLON.Color3(0.2078431372549, 0.65490196078431, 1);
    buttonsMat[5].diffuseColor = new BABYLON.Color3(0.30588235294118, 0.25490196078431, 0.52941176470588);
    buttonsMat[6].diffuseColor = new BABYLON.Color3(0.37254901960784, 0.33333333333333, 0.4);

    for(let i = 0; i < buttons.length; i++) {
        buttons[i].material = buttonsMat[i];
    }

    // Actions.
    let previousVideo = null;
    let abducted = 0;

    for(let i = 0; i < buttons.length; i++) {
        buttons[i].actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnPickTrigger,
                },
                function () {
                    if(!previousVideo) {
                        // Do nothing.
                    } else {
                        previousVideo.video.pause();
                    }

                    tvMaterial.diffuseTexture = tvTexture[0];
                    tvScreen.material = tvMaterial;
                    tvTexture[0].video.volume = 0;
                    
                    setTimeout(function() {
                        tvMaterial.diffuseTexture = tvTexture[i+1];
                        tvScreen.material = tvMaterial;
                        tvTexture[i+1].video.volume = 0;
                        tvTexture[i+1].video.play();
                        tvTexture[i+1].video.volume = 1;
                        previousVideo = tvTexture[i+1];
                    }, 1000);

                    buttons[i].physicsImpostor.dispose();

                    let animation = new BABYLON.Animation("sphereAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

                    let nextPos = buttons[i].position.add(new BABYLON.Vector3(0, 700, 0));

                    var keysAnim = [];
                    keysAnim.push({frame: 0, value: buttons[i].position});
                    keysAnim.push({frame: 240, value: nextPos});
                    animation.setKeys(keysAnim);

                    var easingFunction = new BABYLON.CircleEase();

                    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

                    animation.setEasingFunction(easingFunction);

                    buttons[i].animations.push(animation);
                    
                    scene.beginAnimation(buttons[i], 0, 240, false);

                    abducted++;

                    if(abducted >= 7) {
                        setTimeout(function() {
                            for(let button of buttons) {
                                button.physicsImpostor = new BABYLON.PhysicsImpostor(button, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0.1}, scene);
                            }
                            abducted = 0;
                        }, 10000);
                    }

                }
            )
        );
    }

    // Events.
    let startingPoint;
    let currentMesh;

    let getGroundPosition = function () {
        let pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    let onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        let pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
        if (pickInfo.hit) {
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition(evt);

            if (startingPoint) {
                setTimeout(function () {
                    camera.detachControl(canvas);
                }, 0);
            }
        }
    }

    let onPointerUp = function () {
        if (startingPoint) {
            camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }
    }

    let onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        let current = getGroundPosition(evt);

        if (!current) {
            return;
        }

        let diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);
        
        //currentMesh.setLinearVelocity(new BABYLON.Vector3(10, 10, 10));
        //currentMesh.setAngularVelocity(new BABYLON.Quaternion(0,0,0,0));

        startingPoint = current;

    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
    }

    // Assets manager.
    let assetsManager = new BABYLON.AssetsManager(scene);
    let meshTask = assetsManager.addMeshTask("ground", "wall", "wall1", 
        "wall2", "wall3", "wall4", "tv", "sphere1", "sphere2", "sphere3", "sphere4",
        "sphere5", "sphere6", "sphere7");
    let textureTask = assetsManager.addTextureTask("groundMat", "wallMat",
        "tvMat", "video1", "video2", "video3", "video4", "video5", "video6", "video7",
        "buttonsMat1", "buttonsMat2", "buttonsMat3", "buttonsMat4", "buttonsMat5",
        "buttonsMat6","buttonsMat7");

    assetsManager.onFinish = function (tasks) {
        engine.runRenderLoop(function () {
            scene.render();
            // Check the position of the balls.
            for(let button of buttons) {
                if(button.position.y <= -100) {
                    console.log("Se salió.");
                    button.position = new BABYLON.Vector3(Math.floor(Math.random() * (-150 - 150 + 1) + 150), 200, Math.floor(Math.random() * (-150 - 150 + 1) + 150));
                }
            }
        });
    }

    engine.loadingUIBackgroundColor = "White";

    assetsManager.load();

    return scene;

}