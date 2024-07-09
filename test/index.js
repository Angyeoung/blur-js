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
const sponza = new GameObject("Sponza").setMesh(await Mesh.fromFile('sponza'));
scene.add(monkey, sponza);
camera.transform.setPosition(new Vector3(0, 0, -5));
monkey.transform.rotate(new Vector3(0, 180, 0));
sponza.transform.setScale(new Vector3(0.01, 0.01, 0.01));

let deltaTime = 0;
function update() {
    requestAnimationFrame(update);
    deltaTime = clock.getDelta();

    camera.transform.translateLocal(input.movement.scaled(deltaTime * 40));
    camera.transform.rotate(input.rotation.scaled(deltaTime * 120));

    renderer.render(scene, camera);
}

update(performance.now());