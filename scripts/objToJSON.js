import { Vector3 } from '../math.js';
/**
 * Cool script to convert .obj files to .json files
 * Using JSON.parse() will result in:
 * 
 * const result = {
 *     verts: [
 *         x1, y1, z1,
 *         x2, y2, z2,
 *         ...
 *     ],
 *     norms: (same as verts but for norms)
 *     tris:  [ vertsIndex1, vertsIndex2, vertsIndex3, normsIndex1, normsIndex2, normsIndex3 ]
 * }
 */

import { readFileSync, writeFileSync } from 'fs';

const INFILE  = "models/maxwell.obj"
    , OUTFILE = "models/maxwell.json";

/** @type {string[]} */
const arr = readFileSync(INFILE, "utf-8").split("\n");

// v = vertex, vn = vert normal, vt = vert texture, f = face (tris)
// f v1/vt1/vn1 v2/vt2/vn1 v3/vt3/vn1 ...

// v   x1  y1  z1 ... (position)
// vn xn1 yn1 zn1 ... (normal)
// f v1//vn1 v2//vn2 v3//vn3 ... (indices of position, normal, texture)

// Gonna skip textures for now and just load verts and tris and norms
let mesh = { 
    verts:[], 
    tris: [], 
    norms: [] 
};
for (let line of arr) {
    const type = (line[0] + line[1]);
    if (type == 'v ') {
        // line = 'v 0.477241 0.205729 0.676920'
        const split = line.split(" ");
        mesh.verts.push(
            parseFloat(split[1]),
            parseFloat(split[2]), 
            parseFloat(split[3])
        );
    } 
    else if (type == 'f ') {
        // line = 'f 1//1 504//2 1552//3'
        // split = ['f', '1//1', '504//2', '1552//3']
        const split = line.split(" ");
        // x = [   '1', '', '1']
        // y = [ '504', '', '2']
        // z = ['1552', '', '3']
        let x = split[1].split('/'),
            y = split[2].split('/'),
            z = split[3].split('/');
        
        mesh.tris.push(
            parseInt(y[0]) - 1, // should be removed for 0-indexed files
            parseInt(x[0]) - 1, // The file I have is 1-indexed. These 1's
            parseInt(z[0]) - 1, // <--
        );
    }
}

/** @type {Vector3[]} */
let norms = new Array(mesh.verts.length / 3).fill(Vector3.zero);
for (let i = 0; i < mesh.tris.length; i += 3) {
    let aIdx = mesh.tris[i];
    let bIdx = mesh.tris[i + 1];
    let cIdx = mesh.tris[i + 2];
    let a = new Vector3(mesh.verts[aIdx * 3], mesh.verts[aIdx * 3 + 1], mesh.verts[aIdx * 3 + 2]);
    let b = new Vector3(mesh.verts[bIdx * 3], mesh.verts[bIdx * 3 + 1], mesh.verts[bIdx * 3 + 2]);
    let c = new Vector3(mesh.verts[cIdx * 3], mesh.verts[cIdx * 3 + 1], mesh.verts[cIdx * 3 + 2]);
    let p = Vector3.cross(b.minus(a), c.minus(a));
    norms[aIdx] = norms[aIdx].add(p);
    norms[bIdx] = norms[bIdx].add(p);
    norms[cIdx] = norms[cIdx].add(p);
}
// console.log(norms);
for (let i = 0; i < norms.length; i++) {
    norms[i].Normalize();
    norms[i] = norms[i].scale(-1);
    mesh.norms.push(norms[i].x, norms[i].y, norms[i].z);
}

console.log("Done!");
writeFileSync(OUTFILE, JSON.stringify(mesh), { encoding: "utf8" });