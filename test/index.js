import * as Blur from "../src/blur.js";

const scene = new Blur.Scene();
const camera = new Blur.Camera();
const renderer = new Blur.Renderer();

renderer.render(scene, camera);