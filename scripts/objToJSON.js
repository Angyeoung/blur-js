import { Vector3 } from '../src/math.js';
import { readFileSync, writeFileSync } from 'fs';

const NAME = 'monkey';
const INFILE = 'models/' + NAME + '.obj';
const OUTFILE = 'models/' + NAME + '.json';

/** @type {string[]} */
const lines = readFileSync(INFILE, "utf-8").split("\n");

const verts = [];
const tris = [];
const norms = [];

for (let line of lines.slice(0, 20)) {
    const type = (line[0] + line[1]);
    if (type == 'v ')
        handleVertexLine(line);
    else if (type == 'f ')
        handleFaceLine(line);
}

calculateNormals();
console.log("Done!");
writeFileSync(OUTFILE, JSON.stringify({verts, tris, norms}), { encoding: "utf8" });



/** @param {string} line */
function handleVertexLine(line) {
    let arr = line.slice(2).trim().split(/\s+/);
    let x = parseFloat(arr[0]);
    let y = parseFloat(arr[1]);
    let z = parseFloat(arr[2]);
    console.log(x, y, z);
    verts.push(x, y, z);
}

/** @param {string} line */
function handleFaceLine(line) {
    let arr = line.slice(2).trim().split(/\s+/);
    if (arr.length > 4 || arr.length < 3)
        return console.log('Error@HandleFaceLine: Invalid count\n', line, arr);

    let p1info = arr[0].split('/');
    let p2info = arr[1].split('/');
    let p3info = arr[2].split('/');
    let p1vert = parseInt(p1info[0]) - 1;
    let p2vert = parseInt(p2info[0]) - 1;
    let p3vert = parseInt(p3info[0]) - 1;
    tris.push(p1vert, p3vert, p2vert);

    if (arr.length > 3) {
        let p4info = arr[3].split('/');
        let p4vert = parseInt(p4info[0]) - 1;
        tris.push(p1vert, p4vert, p3vert);
    }
}

function calculateNormals() {
    /** @type {Vector3[]} */
    const normals = new Array(verts.length / 3).fill(Vector3.zero);
    for (let i = 0; i < tris.length; i += 3) {
    // for (let i = 0; i < 20; i += 3) {
        let p1Idx = tris[i];
        let p2Idx = tris[i + 1];
        let p3Idx = tris[i + 2];
        let a = new Vector3(verts[p1Idx * 3], verts[p1Idx * 3 + 1], verts[p1Idx * 3 + 2]);
        let b = new Vector3(verts[p2Idx * 3], verts[p2Idx * 3 + 1], verts[p2Idx * 3 + 2]);
        let c = new Vector3(verts[p3Idx * 3], verts[p3Idx * 3 + 1], verts[p3Idx * 3 + 2]);
        let p = Vector3.cross(b.diff(a), c.diff(a));

        normals[p1Idx].add(p);
        normals[p2Idx].add(p);
        normals[p3Idx].add(p);
    }

    for (let i = 0; i < normals.length; i++) {
        if (!normals[i]) console.log("error")
        normals[i].normalize();
        normals[i].scale(-1);
        norms.push(normals[i].x, normals[i].y, normals[i].z);
    }
}
