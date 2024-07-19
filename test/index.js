import {
    Camera,
    Clock,
    GameObject,
    Mesh,
    Renderer,
    Scene,
    Vector3,
    Input,
    Material
} from "../src/blur.js";



const renderer = new Renderer(document.querySelector('canvas'));
const camera = new Camera("Main");
const scene = new Scene();
const input = new Input(1, 4);
const clock = new Clock();

const monkey = new GameObject("Monkey").setMesh(await Mesh.fromFile('../models/monkey.obj'));
const maxwell = new GameObject("maxwell").setMesh(await Mesh.fromFile('../models/maxwell.obj'));
const girl = new GameObject("girl").setMesh(await Mesh.fromFile('../models/girl/girl.obj'));

const mtl = Material.fromFile('../models/girl/girl.mtl');

scene.add(monkey, maxwell, girl);
camera.transform.setPosition(new Vector3(0, 0, -5));

monkey.transform.rotate(new Vector3(0, 180, 0));
maxwell.transform.rotate(new Vector3(-90, 180, 0));
girl.transform.rotate(new Vector3(0, 180, 0));

monkey.transform.setPosition(new Vector3(0, 0, 0));
maxwell.transform.setPosition(new Vector3(3, -.5, 0))
girl.transform.setPosition(new Vector3(-3, -1.5, 0));

maxwell.transform.setScale(new Vector3(0.05, 0.05, 0.05));
girl.transform.setScale(new Vector3(2, 2, 2));

let deltaTime = 0;
function update() {
    requestAnimationFrame(update);
    deltaTime = clock.getDelta();

    camera.transform.translateLocal(input.movement.scaled(deltaTime * input.speed));
    camera.transform.rotate(input.rotation.scaled(deltaTime * 120));
    monkey.transform.rotate(new Vector3(0, 10 * deltaTime, 0));

    renderer.render(scene, camera);
}

update();