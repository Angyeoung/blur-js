import { Matrix, Vector3 } from "../utils/math.js";


export class GameObject {

    #worldNeedsUpdate = true;
    #viewNeedsUpdate = true;
    #worldMatrix = Matrix.identity;
    #viewMatrix = Matrix.identity;

    position = Vector3.zero;
    rotation = Vector3.zero;
    scale = Vector3.one;

    /** @type {GameObject} */
    parent = null;
    /** @type {GameObject[]} */
    children = [];

    /** @param {string} name */
    constructor(name) {
        this.name = name;
        this.mesh = new Mesh('name');
    }

    get forward() {
        return Vector3.transform(Vector3.forward, Matrix.rotate(Matrix.identity, this.rotation))
    }

    /** @param {Vector3} v  */
    set position(v) {
        console.log("Setting position:", v)
        this.position.x = v.x;
        this.position.y = v.y;
        this.position.z = v.z;
        this.#viewNeedsUpdate = true;
        this.#worldNeedsUpdate = true;
    }

    /** @param {Mesh} mesh */
    setMesh(mesh) {
        this.mesh = mesh;
        return this;
    }

    /** @param {Material} material */
    setMaterial(material) {
        this.mesh.material = material;
        return this;
    }

    /** @param {...GameObject} children */
    add(...children) {
        for (let child of children) {
            if (!(child instanceof GameObject)) continue;
            this.children.push(child);
            child.parent = this;
        }
        return this;
    }

    getWorldMatrix() {
        if (this.#worldNeedsUpdate) {
            Matrix.setScaled(this.#worldMatrix, this.scale);
            Matrix.rotate(this.#worldMatrix, this.rotation);
            Matrix.multiply(this.#worldMatrix, Matrix.translation(this.position));
            this.#worldNeedsUpdate = false;
        }
        return this.#worldMatrix;
    }

    getViewMatrix() {
        if (this.#viewNeedsUpdate) {
            Matrix.lookAt(this.#viewMatrix, this.position, this.position.sum(this.forward));
            this.#viewNeedsUpdate = false;
        }
        return this.#viewMatrix;
    }

    /** @param {Vector3} vector */
    translate(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        this.position.x += vector.x;
        this.position.y += vector.y;
        this.position.z += vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /** @param {Vector3} vector */
    translateLocal(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        const local = Vector3.transform(vector, Matrix.rotate(Matrix.identity, this.rotation));
        this.translate(local);
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /** @param {Vector3} vector */
    rotate(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        this.rotation.x = (this.rotation.x + vector.x) % 360;
        this.rotation.y = (this.rotation.y + vector.y) % 360;
        this.rotation.z = (this.rotation.z + vector.z) % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /** @param {Vector3} vector */
    setPosition(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        this.position.x = vector.x;
        this.position.y = vector.y;
        this.position.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /**
     * 
     * @param {0|1|2} component 0-2
     * @param {number} value 
     * @returns 
     */
    setPositionComponent(component, value) {
        if (isNaN(value) || isNaN(component)) 
            return this;
        if (component === 0)
            this.position.x = value;
        else if (component === 1)
            this.position.y = value;
        else if (component === 2)
            this.position.z = value;
        else {
            console.log("Invalid component value");
            return this;
        }
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /** @param {Vector3} vector */
    setRotation(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        this.rotation.x = vector.x % 360;
        this.rotation.y = vector.y % 360;
        this.rotation.z = vector.z % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /**
     * 
     * @param {0|1|2} component 0-2
     * @param {number} value 
     * @returns 
     */
    setRotationComponent(component, value) {
        if (isNaN(value) || isNaN(component)) 
            return this;
        if (component === 0)
            this.rotation.x = value;
        else if (component === 1)
            this.rotation.y = value;
        else if (component === 2)
            this.rotation.z = value;
        else {
            console.log("Invalid component value");
            return this;
        }
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /** @param {Vector3} vector */
    setScale(vector) {
        if (Vector3.isNaN(vector)) 
            return this;
        this.scale.x = vector.x;
        this.scale.y = vector.y;
        this.scale.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

    /**
     * 
     * @param {0|1|2} component 0-2
     * @param {number} value 
     * @returns 
     */
    setScaleComponent(component, value) {
        if (isNaN(value) || isNaN(component)) 
            return this;
        if (component === 0)
            this.scale.x = value;
        else if (component === 1)
            this.scale.y = value;
        else if (component === 2)
            this.scale.z = value;
        else {
            console.log("Invalid component value");
            return this;
        }
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

}



export class Mesh {

    isBound = false;

    /** @param {string} name */
    constructor(name) {
        this.name = name;
        /** @type {Material} */
        this.material = null;
        this.vertices = null;
        this.triangles = null;
        this.normals = null;
        this.uvs = null;
    }

    recalculateNormals() {
        // Add normals of adjacent faces to all verts
        this.normals = new Float32Array(this.vertices.length).fill(0);
        let p1Idx, p2Idx, p3Idx, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, nx, ny, nz;
        for (let t = 0; t < this.triangles.length; t += 3) {
            p1Idx = this.triangles[t] * 3; p2Idx = this.triangles[t + 1] * 3; p3Idx = this.triangles[t + 2] * 3;
            p1x = this.vertices[p1Idx]; p1y = this.vertices[p1Idx + 1]; p1z = this.vertices[p1Idx + 2];
            p2x = this.vertices[p2Idx]; p2y = this.vertices[p2Idx + 1]; p2z = this.vertices[p2Idx + 2];
            p3x = this.vertices[p3Idx]; p3y = this.vertices[p3Idx + 1]; p3z = this.vertices[p3Idx + 2];
            nx = (p2y - p1y) * (p3z - p1z) - (p2z - p1z) * (p3y - p1y);
            ny = (p2z - p1z) * (p3x - p1x) - (p2x - p1x) * (p3z - p1z);
            nz = (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x);
            this.normals[p1Idx] += nx; this.normals[p1Idx + 1] += ny; this.normals[p1Idx + 2] += nz;
            this.normals[p2Idx] += nx; this.normals[p2Idx + 1] += ny; this.normals[p2Idx + 2] += nz;
            this.normals[p3Idx] += nx; this.normals[p3Idx + 1] += ny; this.normals[p3Idx + 2] += nz;
        }
        // Normalize normals
        let num, len;
        for (let i = 0; i < this.normals.length; i += 3) {
            len = Math.sqrt(this.normals[i] * this.normals[i] + this.normals[i + 1] * this.normals[i + 1] + this.normals[i + 2] * this.normals[i + 2]);
            if (len === 0) continue;
            num = 1.0 / len;
            this.normals[i] *= num;
            this.normals[i + 1] *= num;
            this.normals[i + 2] *= num;
        }
    }
}



export class Material {

    
    shininess = 400 // Ns
    ambient = [0, 0, 0] // Ka
    diffuse = [1, 1, 1] // Kd
    specular = [1, 1, 1] // Ks
    opacity = 1 // d
    emmisive = null // Ke
    optical = null // Ni
    illum = null // illum mode

    constructor(name) {
        this.name = name;
    }

    static default = new Material('default');

}

