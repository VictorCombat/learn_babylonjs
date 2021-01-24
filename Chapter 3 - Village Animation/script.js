const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createLamp = function() {
    const lampLight = new BABYLON.SpotLight("lampLight", BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -1, 0), Math.PI, 1);
    lampLight.diffuse = BABYLON.Color3.Yellow();

    // shape to extrude
    const lampShape = [];
    for (let i = 0; i < 20; i++) {
        lampShape.push(new BABYLON.Vector3(Math.cos(i * Math.PI / 10), Math.sin(i * Math.PI / 10), 0));
    }
    lampShape.push(lampShape[0]);  // close shape

    // extrusion path
    const lampPath = [];
    lampPath.push(new BABYLON.Vector3(0, 0, 0));
    lampPath.push(new BABYLON.Vector3(0, 10, 0));
    for (let i = 0; i < 20; i++) {
        lampPath.push(new BABYLON.Vector3(1 + Math.cos(Math.PI - i * Math.PI / 40), 10 + Math.sin(Math.PI - i * Math.PI / 40), 0));
    }
    lampPath.push(new BABYLON.Vector3(3, 11, 0));

    const yellowMat = new BABYLON.StandardMaterial("yellowMat");
    yellowMat.emissiveColor = BABYLON.Color3.Yellow();

    // extrude lamp
    const lamp = BABYLON.MeshBuilder.ExtrudeShape("lamp", { cap: BABYLON.Mesh.CAP_END, shape: lampShape, path: lampPath, scale: 0.5 });

    // add bulb
    const bulb = BABYLON.MeshBuilder.CreateSphere("bulb", { diameterX: 1.5, diameterZ: 0.8 });

    bulb.material = yellowMat;
    bulb.parent = lamp;
    bulb.position.x = 2;
    bulb.position.y = 10.5;

    lampLight.parent = bulb;

    return lamp;
}


const createScene = function () {

    const scene = new BABYLON.Scene(engine);

    /* SET CAMERA & LIGHT */
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.upperBetaLimit = Math.PI / 2.2;
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 0.1;

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Trees
    const spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "https://playground.babylonjs.com/textures/palm.png", 2000, { width: 512, height: 512 }, scene);

    // Create trees at random positions
    for (let i = 0; i < 500; i++) {
        const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (-30);
        tree.position.z = Math.random() * 20 + 8;
        tree.position.y = 0.5;
    }
    for (let i = 0; i < 500; i++) {
        const tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * 25 + 7;
        tree.position.z = Math.random() * -35 + 8;
        tree.position.y = 0.5;
    }

    // Animated UFO
    const spriteManagerUFO = new BABYLON.SpriteManager("UFOManager", "https://assets.babylonjs.com/environments/ufo.png", 1, { width: 128, height: 76 });
    const ufo = new BABYLON.Sprite("ufo", spriteManagerUFO);
    ufo.playAnimation(0, 16, true, 125);
    ufo.position.y = 5;
    ufo.position.z = 0;
    ufo.width = 2;
    ufo.height = 1;

    const wireMat = new BABYLON.StandardMaterial("wireMat");
    wireMat.alpha = 0;

    const hitBox = BABYLON.MeshBuilder.CreateBox("carbox", { width: 0.5, height: 0.6, depth: 4.5 });
    hitBox.material = wireMat;
    hitBox.position.x = 3.1;
    hitBox.position.y = 0.3;
    hitBox.position.z = -5;

    let carReady = false;

    BABYLON.SceneLoader.ImportMeshAsync("", "./", "valleyvillage.glb");
    BABYLON.SceneLoader.ImportMeshAsync("", "./", "car.babylon").then(() => {
        const car = scene.getMeshByName("car");
        carReady = true;
        car.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, Math.PI / 2);
        car.position.y = 0.16;
        car.position.x = 3;
        car.position.z = -8;

        const animCar = new BABYLON.Animation("carAnimation", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const carKeys = [];
        carKeys.push({
            frame: 0,
            value: 8
        });
        carKeys.push({
            frame: 150,
            value: -7
        });
        carKeys.push({
            frame: 200,
            value: -7
        });
        animCar.setKeys(carKeys);

        car.animations = [];
        car.animations.push(animCar);

        console.log(car.animations);
        scene.beginAnimation(car, 0, 200, true);

        // Wheels animation
        const wheelRB = scene.getMeshByName("wheelRB");
        const wheelRF = scene.getMeshByName("wheelRF");
        const wheelLB = scene.getMeshByName("wheelLB");
        const wheelLF = scene.getMeshByName("wheelLF");

        scene.beginAnimation(wheelRB, 0, 30, true);
        scene.beginAnimation(wheelRF, 0, 30, true);
        scene.beginAnimation(wheelLB, 0, 30, true);
        scene.beginAnimation(wheelLF, 0, 30, true);
    });

    const walk = function(turn, dist) {
        this.turn = turn;
        this.dist = dist;
    }
    const track = [];
    track.push(new walk(180, 2.5));
    track.push(new walk(0, 5));


    // Dude
    BABYLON.SceneLoader.ImportMeshAsync("him", "https://playground.babylonjs.com/scenes/Dude/", "Dude.babylon", scene).then((result) => {
        var dude = result.meshes[0];
        dude.scaling = new BABYLON.Vector3(0.008, 0.008, 0.008);
        dude.position = new BABYLON.Vector3(1.5, 0, -6.9);
        dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-90), BABYLON.Space.LOCAL);
        const startRotation = dude.rotationQuaternion.clone();

        scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

        let distance = 0;
        let step = 0.015;
        let p = 0;

        scene.onBeforeRenderObservable.add(() => {
            if (carReady) {
                if (!dude.getChildren()[1].intersectsMesh(hitBox) && scene.getMeshByName("car").intersectsMesh(hitBox)) {
                    return;
                }
            }

            dude.movePOV(0, 0, step);
            distance += step;

            if (distance > track[p].dist) {
                dude.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(track[p].turn), BABYLON.Space.LOCAL);
                p += 1;
                p %= track.length;

                if (p === 0) {
                    distance = 0;
                    dude.position = new BABYLON.Vector3(1.5, 0, -6.5);
                    dude.rotationQuaternion = startRotation.clone();
                }
            }
        });
    });

    // Lathe Fountain
    const fountainProfile = [
        new BABYLON.Vector3(0, 0, 0),
		new BABYLON.Vector3(0.5, 0, 0),
        new BABYLON.Vector3(0.5, 0.2, 0),
		new BABYLON.Vector3(0.4, 0.2, 0),
        new BABYLON.Vector3(0.4, 0.05, 0),
        new BABYLON.Vector3(0.05, 0.1, 0),
		new BABYLON.Vector3(0.05, 0.8, 0),
		new BABYLON.Vector3(0.15, 0.9, 0)
    ];
    const fountain = BABYLON.MeshBuilder.CreateLathe("fountain", { shape: fountainProfile, sideOrientation: BABYLON.Mesh.DOUBLESIDE });
    fountain.position.x = -4;
    fountain.position.z = -6;

    // Particle System
    var particleSystem = new BABYLON.ParticleSystem("particles", 5000);
    // Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png");
    // Where the particles come from
    particleSystem.emitter = new BABYLON.Vector3(-4, 0.8, -6); // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.01, 0, -0.01);  // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.01, 0, 0.01);   // To ...
    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0.0, 0.0, 0.2, 0.0);
    // Size of each particle (random between)
    particleSystem.minSize = 0.01;
    particleSystem.maxSize = 0.05;
    // Life time of each particle (random between)
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    // Emission rate
    particleSystem.emitRate = 1500;
    // Blend mode : BLENDMODE_ONEONE, or BLENMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-1, 8, 1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 8, -1);
    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    // Speed
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.6;
    particleSystem.updateSpeed = 0.01;
    // Start the particle system
    particleSystem.start();


    const pointerDown = (mesh) => {
        if (mesh === fountain) {
            switched = !switched;
            if (switched) {
                particleSystem.start();
            } else {
                particleSystem.stop();
            }
        }
    }

    let switched = false;

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh);
                }
                break;
        }
    });

    const lamp1 = createLamp();
    lamp1.scaling = new BABYLON.Vector3(0.075, 0.075, 0.075);
    lamp1.position = new BABYLON.Vector3(2, 0, 2);
    lamp1.rotation = new BABYLON.Vector3(0, -Math.PI / 4, 0);

    lamp2 = lamp1.clone("lamp2");
    lamp2.position.z = -8;

    lamp3 = lamp1.clone("lamp3");
    lamp3.position.x = -8;
    lamp3.position.z = 1.2;
    lamp3.rotation.y = Math.PI / 2;

    lamp4 = lamp3.clone("lamp4");
    lamp4.position.x = -2.7;
    lamp4.position.z = 0.8;
    lamp4.rotation.y = -Math.PI / 2;

    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});



