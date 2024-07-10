import { readFileSync, writeFileSync } from 'fs';

const INFILE  = "models/sponza.obj"
    , OUTFILE = "models/sponza.json";

const lines = readFileSync(INFILE, "utf-8").split("\n");

const set = new Set();
for (let line of lines) {
    set.add(line[0] + line[1]);
}
console.log(set.values());

console.log(parseInt('-1'));