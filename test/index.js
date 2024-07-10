import {
    Camera,
    Clock,
    GameObject,
    Mesh,
    Renderer,
    Scene,
    Vector3,
    Input
} from "../src/blur.js";



const renderer = new Renderer(document.querySelector('canvas'));
const camera = new Camera("Main");
const scene = new Scene();
const input = new Input();
const clock = new Clock();

const monkey = new GameObject("Monkey").setMesh(await Mesh.fromFile('monkey'));
const maxwell = new GameObject("maxwell").setMesh(await Mesh.fromFile('maxwell'));
scene.add(monkey, maxwell);
camera.transform.setPosition(new Vector3(0, 0, -5));
monkey.transform.rotate(new Vector3(0, 180, 0));
monkey.transform.setPosition(new Vector3(-5, 0, 0));
maxwell.transform.setScale(new Vector3(0.05, 0.05, 0.05));
console.log(maxwell.mesh)

let deltaTime = 0;
function update() {
    requestAnimationFrame(update);
    deltaTime = clock.getDelta();

    camera.transform.translateLocal(input.movement.scaled(deltaTime * 40));
    camera.transform.rotate(input.rotation.scaled(deltaTime * 120));

    renderer.render(scene, camera);
}

update(performance.now());