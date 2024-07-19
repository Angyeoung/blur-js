
async function loadTexture() {
    const canvas = document.querySelector('canvas')
    const gl = canvas.getContext('webgl2');
    
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -3, -1,
            2, -1,
            -3,  4,
            -3,  4,
            2, -1,
            2,  4,
        ]),
        gl.STATIC_DRAW);
    
    // Turn on the attribute
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    
    // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floating point values
    var normalize = true;  // convert from 0-255 to 0.0-1.0
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordAttributeLocation, size, type, normalize, stride, offset);
    
    // Create a texture.
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
    
    // Asynchronously load an image
    var image = await loadImage('someUrl');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
}

/**
 * @param {string} url 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

/**
 * Fetches a file from `path` and returns it in string format
 * @param {string} path
 */
export async function loadFile(path) {
    return fetch(path).then(r => r.text());
}