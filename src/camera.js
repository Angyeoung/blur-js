import { GameObject } from "./gameObject.js";
import { Matrix } from "./math.js";

export class Camera extends GameObject {

    _projectionUpdated = true;
    _projectionMatrix = Matrix.identity;
    
    /** @param {string} name */
    constructor(name) {
        super(name);
        this.fov = 0.90;
        this.near = 0.1;
        this.far = 20000;
    }
    /* ========================================================== */

    get aspect() { return window.innerWidth / window.innerHeight; }

    getProjectionMatrix() {
        if (this._projectionUpdated) {
            Matrix.perspectiveFovLH(this._projectionMatrix, this.fov, this.aspect, this.near, this.far);
            this._projectionUpdated = false;
        }
        return this._projectionMatrix;
    }
}