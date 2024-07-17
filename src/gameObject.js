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
        return this;
    }



    /** @param {Vector3} vector */
    translateLocal(vector) {
        if (Vector3.isNaN(vector)) return;
        const local = Vector3.transform(vector, Matrix.rotate(Matrix.identity, this.rotation));
        this.translate(local);
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }



    /** @param {Vector3} vector */
    rotate(vector) {
        if (Vector3.isNaN(vector)) return;
        this.rotation.x = (this.rotation.x + vector.x) % 360;
        this.rotation.y = (this.rotation.y + vector.y) % 360;
        this.rotation.z = (this.rotation.z + vector.z) % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }



    /** @param {Vector3} vector */
    setPosition(vector) {
        if (Vector3.isNaN(vector)) return;
        this.position.x = vector.x;
        this.position.y = vector.y;
        this.position.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }



    /** @param {Vector3} vector */
    setRotation(vector) {
        if (Vector3.isNaN(vector)) return;
        this.rotation.x = vector.x % 360;
        this.rotation.y = vector.y % 360;
        this.rotation.z = vector.z % 360;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }



    /** @param {Vector3} vector */
    setScale(vector) {
        if (Vector3.isNaN(vector)) return;
        this.scale.x = vector.x;
        this.scale.y = vector.y;
        this.scale.z = vector.z;
        this.#worldNeedsUpdate = true;
        this.#viewNeedsUpdate = true;
        return this;
    }

}

export class Mesh {

    isBound = false;
    /** @type {WebGLVertexArrayObject?} */
    vao = null;

    /* ========================================================== */
    constructor(vertices, triangles, normals = undefined, uvs = undefined) {
        this.vertices = new Float32Array(vertices);
        this.triangles = new Uint16Array(triangles);
        this.normals = new Float32Array(normals);
        this.uvs = new Float32Array(uvs);
    }
    /* ========================================================== */

    /** @param {string} path */
    static async fromFile(path) {
        const text = await fetch(path).then(r => r.text());
        console.log(`Mesh from '${path}' Loaded!\n\n`);
        if (path.endsWith('.obj'))
            return MeshLoader.obj(text);
        return console.error("Error @ Mesh.fromFile(): Unsupported file type");
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

class MeshLoader {

    /** @param {string} text */
    static obj(text) {
        const lines = text.split('\n');
        const tris = [], verts = [], uvs = [], uvCoords = [];

        // Format and push tris and verts
        for (let line of lines) {
            if (line.length < 2) continue;
            const type = line[0] + line[1];
            
            if (type === 'v ') {
                const xyz = line.slice(2).trim().split(/\s+/).map(parseFloat);
                verts.push(...xyz);
            }
            else if (type === 'vt') {
                const xy = line.slice(2).trim().split(/\s+/).map(parseFloat);
                if (xy.length > 2) console.error("Mesh has uvs with >2 components.");
                uvCoords.push(...xy);
            }
            else if (type === 'f ') {
                const split = line.slice(2).trim().split(/\s+/).map(arr => arr.split('/'));
                const vert = split.map(i => parseInt(i[0]) - 1);
                // const norm = split.map(i => parseInt(i[1]) - 1);
                const text = split.map(i => parseInt(i[2]) - 1);
                if (split.length === 3) {
                    tris.push(vert[0], vert[1], vert[2]);
                    uvs.push(uvCoords[text[0]], uvCoords[text[1]], uvCoords[text[2]]);
                } else {
                    for (let i = 0; i < split.length - 2; i++) {
                        tris.push(vert[0], vert[i+1], vert[i+2]);
                        uvs.push(uvCoords[text[0]], uvCoords[text[i+1]], uvCoords[text[i+2]]);
                    }
                }
            }
        }

        // Add normals of adjacent faces to all verts
        const norms = Array(verts.length).fill(0);
        let p1Idx, p2Idx, p3Idx, 
            p1x, p1y, p1z,
            p2x, p2y, p2z,
            p3x, p3y, p3z,
            nx, ny, nz;
        for (let t = 0; t < tris.length; t += 3) {
            p1Idx = tris[t] * 3; p2Idx = tris[t + 1] * 3; p3Idx = tris[t + 2] * 3;
            p1x = verts[p1Idx]; p1y = verts[p1Idx + 1]; p1z = verts[p1Idx + 2];
            p2x = verts[p2Idx]; p2y = verts[p2Idx + 1]; p2z = verts[p2Idx + 2];
            p3x = verts[p3Idx]; p3y = verts[p3Idx + 1]; p3z = verts[p3Idx + 2];

            // calculate the normal of this triangle
            // add the normal to all
            nx = (p2y - p1y) * (p3z - p1z) - (p2z - p1z) * (p3y - p1y);
            ny = (p2z - p1z) * (p3x - p1x) - (p2x - p1x) * (p3z - p1z);
            nz = (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x);
            
            norms[p1Idx] += nx; norms[p1Idx + 1] += ny; norms[p1Idx + 2] += nz;
            norms[p2Idx] += nx; norms[p2Idx + 1] += ny; norms[p2Idx + 2] += nz;
            norms[p3Idx] += nx; norms[p3Idx + 1] += ny; norms[p3Idx + 2] += nz;
        }
        // Normalize normals
        let num, len;
        for (let i = 0; i < norms.length; i += 3) {
            len = Math.sqrt(norms[i] * norms[i] + norms[i + 1] * norms[i + 1] + norms[i + 2] * norms[i + 2]);
            if (len === 0) continue;
            num = 1.0 / len;
            norms[i] *= num;
            norms[i + 1] *= num;
            norms[i + 2] *= num;
        }

        return new Mesh(verts, tris, norms, uvs);
    }

}