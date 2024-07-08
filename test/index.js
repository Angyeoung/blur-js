import {
    Camera,
    GameObject,
    Mesh,
    Renderer,
    Scene,
    Vector3
} from "../src/blur.js";



const renderer = new Renderer(document.querySelector('canvas'));
const camera = new Camera("Main");
const scene = new Scene();
const monkey = new GameObject("Monkey").setMesh(await Mesh.fromFile('monkey'));
scene.add(monkey);
camera.transform.setPosition(new Vector3(0, 0, -5));
monkey.transform.rotate(new Vector3(0, 180, 0));

function update() {
    requestAnimationFrame(update);
    renderer.render(scene, camera);
}

update(performance.now());