import {
    Camera,
    Clock,
    GameObject,
    Mesh,
    Renderer,
    Scene,
    Vector3,
    Input,
    Material,
    InspectorWindow
} from "../src/blur.js";



const renderer = new Renderer(document.querySelector('canvas'));
const scene = new Scene();
const input = new Input(1, 4);
const clock = new Clock();
const inspector = new InspectorWindow("Window");
inspector.slider("Position", 0, 0, 100);

const camera = new Camera("Main")
    .setPosition(new Vector3(0, 0, -5));

const monkey = new GameObject("Monkey")
    .setMesh(await Mesh.fromFile('../models/monkey.obj'))
    .rotate(new Vector3(0, 180, 0))
    .setPosition(new Vector3(0, 0, 0));

const maxwell = new GameObject("maxwell")
    .setMesh(await Mesh.fromFile('../models/maxwell.obj'))
    .rotate(new Vector3(-90, 180, 0))
    .setPosition(new Vector3(3, -.5, 0))
    .setScale(new Vector3(0.05, 0.05, 0.05));

const girl = new GameObject("girl").setMesh(await Mesh.fromFile('../models/girl/girl.obj'))
    .rotate(new Vector3(0, 180, 0))
    .setPosition(new Vector3(-3, -1.5, 0))
    .setScale(new Vector3(2, 2, 2));

const mtl = Material.fromFile('../models/girl/girl.mtl');

scene.add(monkey, maxwell, girl);

console.log(monkey)


let deltaTime = 0;
function update() {
    requestAnimationFrame(update);
    deltaTime = clock.getDelta();

    camera.translateLocal(input.movement.scaled(deltaTime * input.speed));
    camera.rotate(input.rotation.scaled(deltaTime * 120));
    monkey.rotate(new Vector3(0, 10 * deltaTime, 0));

    renderer.render(scene, camera);
}

update();