const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createScene = function () {

    const scene = new BABYLON.Scene(engine);

    /* SET CAMERA & LIGHT */
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.upperBetaLimit = Math.PI / 2.2;
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

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

