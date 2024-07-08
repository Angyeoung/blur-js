import { Matrix, Vector3 } from "./math.js";


export class GameObject {

    /** @type {Mesh} */
    mesh = null;
    transform = new Transform();

    parent = null;
    /** @type {GameObject[]} */
    children = [];

    /** @param {string} name */
    constructor(name) {
        this.name = name;
    }

    get position() { return this.transform.position; }
    get rotation() { return this.transform.rotation; }
    get scale()    { return this.transform.scale;    }
    get forward()  { return this.transform.forward;  }

    /** @param {Mesh} mesh */
    setMesh(mesh) {
        this.mesh = mesh;
        return this;
    }

    /**
     * @param {...GameObject} children 
     */
    add(...children) {
        for (let child of children) {
            if (!(child instanceof GameObject)) continue;
            this.children.push(child);
        }
    }

}

export class Transform {

    #worldNeedsUpdate = true;
    #viewNeedsUpdate = true;
    #worldMatrix = Matrix.identity;
    #viewMatrix = Matrix.identity;

    /* ========================================================== */

    /** 
     * @param {Vector3} position
     * @param {Vector3} rotation
     * @param {Vector3} scale
     */
    constructor(position = Vector3.zero, rotation = Vector3.zero, scale = Vector3.one) {
        this.position = position;
        this.rotation = rotation;
        this.scale    = scale;
        this.getWorldMatrix();
        this.getViewMatrix();
    }

    /* ========================================================== */

    get forward() {
        return Vector3.transform(Vector3.forward, Matrix.rotate(Matrix.identity, this.rotation))
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
        if (Vector3.isNaN(vector)) return;
        this.position.x += vector.x;
        this.position.y += vector.y;
        this.position.z += vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }



    /** @param {Vector3} vector */
    translateLocal(vector) {
        if (Vector3.isNaN(vector)) return;
        const local = Vector3.transform(vector, Matrix.rotate(Matrix.identity, this.rotation));
        this.translate(local);
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }



    /** @param {Vector3} vector */
    rotate(vector) {
        if (Vector3.isNaN(vector)) return;
        this.rotation.x = (this.rotation.x + vector.x) % 360;
        this.rotation.y = (this.rotation.y + vector.y) % 360;
        this.rotation.z = (this.rotation.z + vector.z) % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }



    /** @param {Vector3} vector */
    setPosition(vector) {
        if (Vector3.isNaN(vector)) return;
        this.position.x = vector.x;
        this.position.y = vector.y;
        this.position.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }



    /** @param {Vector3} vector */
    setRotation(vector) {
        if (Vector3.isNaN(vector)) return;
        this.rotation.x = vector.x % 360;
        this.rotation.y = vector.y % 360;
        this.rotation.z = vector.z % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }



    /** @param {Vector3} vector */
    setScale(vector) {
        if (Vector3.isNaN(vector)) return;
        this.scale.x = vector.x;
        this.scale.y = vector.y;
        this.scale.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
    }

}

export class Mesh {

    isBound = false;
    /** @type {WebGLVertexArrayObject?} */
    vao = null;

    /* ========================================================== */
    constructor(vertices, triangles, normals = undefined) {
        this.vertices = new Float32Array(vertices);
        this.triangles = new Uint16Array(triangles);
        this.normals = new Float32Array(normals);
        // todo textures
        // todo materials
    }
    /* ========================================================== */

    static async fromFile(name) {
        const { verts, tris, norms } = await (await fetch('../models/' + name + '.json')).json();
        console.log(`Mesh '${name}' Loaded!\n\n`);
        return new Mesh(verts, tris, norms);
    }

    static createSharedMesh(meshes) {
        
        const sharedMesh = new Mesh();

        // Step 1: Define shared arrays
        let vLength = 0, nLength = 0, tLength = 0;
        for (let mesh of meshes) {
            vLength += mesh.vertices.length;
            nLength += mesh.normals.length;
            tLength += mesh.triangles.length;
        }
        sharedMesh.vertices  = new Float32Array(vLength);
        sharedMesh.normals   = new Float32Array(nLength);
        sharedMesh.triangles = new Uint16Array(tLength);
        // Set first mesh as it doesn't need changes or offsets
        sharedMesh.vertices.set(meshes[0].vertices);
        sharedMesh.normals.set(meshes[0].normals);
        sharedMesh.triangles.set(meshes[0].triangles);
        // Set the offset
        let vOffset = meshes[0].vertices.length;
        let nOffset = meshes[0].normals.length;
        let tOffset = meshes[0].triangles.length;
        let offset = meshes[0].vertices.length / 3;
        for (let i = 1; i < meshes.length; i++) {
    
            sharedMesh.vertices.set(meshes[i].vertices, vOffset);
            sharedMesh.normals.set(meshes[i].normals, nOffset);
            // For each index in meshes[i]
            for (let j = 0; j < meshes[i].triangles.length; j++) {
                // Set the correct index with offset applied
                sharedMesh.triangles[j + tOffset] = meshes[i].triangles[j] + offset;
            }
    
            vOffset += meshes[i].vertices.length;
            nOffset += meshes[i].normals.length;
            tOffset += meshes[i].triangles.length;
            offset += meshes[i].vertices.length / 3; // Assuming vertices are 3 components per vertex
        }
        
        return sharedMesh;
    
    }
}