import { Mesh } from "./gameObject.js";
import { Camera } from "./camera.js";
import { Scene } from "./scene.js";

const uTypes = {
    mat4: 35676,
}

/**
 * This class is meant to be a wrapper around webgl,
 * simplifying the complex, etc.
 */
export class Renderer {

    a = 2;

    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this._gl = canvas.getContext('webgl2');
        this._program = this._createProgram(Shader.defaultVert, Shader.defaultFrag);
        this._settings();
        this._setUniformInfo();
        this._setCanvasResolution();
        window.addEventListener('resize', () => this._setCanvasResolution());
    }

    setClearColor(r, g, b, a) {
        this._gl.clearColor(r, g, b, a);
    }

    /**
     * Render a scene
     * @param {Scene} scene
     * @param {Camera} camera
     */
    render(scene, camera) {
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        
        // Set uniforms for view and projection
        this._setUniforms({
            uView: camera.transform.getViewMatrix(),
            uProj: camera.getProjectionMatrix()
        });

        for (let gameObject of scene.children) {
            if (!gameObject.mesh) continue;
            if (!gameObject.mesh.isBound) this._setupVAO(gameObject.mesh);
            
            this._setUniforms({ uWorld: gameObject.transform.getWorldMatrix() });
            
            this._gl.bindVertexArray(gameObject.mesh.vao);
            this._gl.drawElements(this._gl.TRIANGLES, gameObject.mesh.triangles.length, this._gl.UNSIGNED_SHORT, 0);
        }
    }

    _createProgram(vertSource, fragSource) {
        const program = this._gl.createProgram();

        // Shaders
        const vertShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        const fragShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._gl.shaderSource(vertShader, vertSource);
        this._gl.shaderSource(fragShader, fragSource);
        this._gl.compileShader(vertShader);
        this._gl.compileShader(fragShader);
        if (!this._gl.getShaderParameter(vertShader, this._gl.COMPILE_STATUS))
            console.error('Vertex shader compilation failed:\n\n', this._gl.getShaderInfoLog(vertShader));
        if (!this._gl.getShaderParameter(fragShader, this._gl.COMPILE_STATUS))
            console.error('Fragment shader compilation failed:\n\n', this._gl.getShaderInfoLog(fragShader));
        this._gl.attachShader(program, vertShader);
        this._gl.attachShader(program, fragShader);
        
        // Linking
        this._gl.linkProgram(program);
        this._gl.validateProgram(program);
        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS))
            console.error('Program linking failed:\n\n', this._gl.getProgramInfoLog(program));
        if (!this._gl.getProgramParameter(program, this._gl.VALIDATE_STATUS))
            console.error('Program validation failed:\n\n', this._gl.getProgramInfoLog(program));

        this._gl.useProgram(program);
        return program;
    }

    _setCanvasResolution(mult = 1) {
        this.canvas.width = window.innerWidth * mult;
        this.canvas.height = window.innerHeight * mult;
        this._gl.viewport(0, 0, window.innerWidth * mult, window.innerHeight * mult);  
    }
    
    _settings() {
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.frontFace(this._gl.CW);
        this._gl.cullFace(this._gl.BACK);
        this.setClearColor(0.75, 0.85, 0.8, 1);
    }

    /**
     * @param {Mesh} mesh 
     */
    _setupVAO(mesh) {
        mesh.vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(mesh.vao);

        //* Vertex buffer object and attribute
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._gl.createBuffer());
        this._gl.bufferData(this._gl.ARRAY_BUFFER, mesh.vertices, this._gl.STATIC_DRAW);
        this._createAttribute('aPosition', 3, this._gl.FLOAT, false, 3*4, 0);

        //* Normal buffer object and attribute
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._gl.createBuffer());
        this._gl.bufferData(this._gl.ARRAY_BUFFER, mesh.normals, this._gl.STATIC_DRAW);
        this._createAttribute('aNormal', 3, this._gl.FLOAT, false, 3*4, 0);
        
        //* Texcoord buffer object and attribute
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._gl.createBuffer());
        this._gl.bufferData(this._gl.ARRAY_BUFFER, mesh.uvs, this._gl.STATIC_DRAW);
        this._createAttribute('aTexCoord', 2, this._gl.FLOAT, true, 2*4, 0);

        //* Element buffer object
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._gl.createBuffer());
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, mesh.triangles, this._gl.STATIC_DRAW);

        this._gl.bindVertexArray(null);
        mesh.isBound = true;
    }

    /**
     * 
     * @param {string} name - Name used in shader
     * @param {number} size - 
     * @param {number} type - `gl.FLOAT`, `gl.INT`, etc.
     * @param {boolean} normalized - idk
     * @param {number} stride - offset in bytes between the beginning of consecutive vertex attributes
     * @param {number} offset - offset in bytes of the first component in the vertex attribute array
     */
    _createAttribute(name, size, type, normalized, stride, offset) {
        const loc = this._gl.getAttribLocation(this._program, name);
        this._gl.vertexAttribPointer(loc, size, type, normalized, stride, offset);
        this._gl.enableVertexAttribArray(loc);
    }

    _setUniformInfo() {
        /** @type {{string: {location: number, size: number, type: number}}} */
        const uniforms = {};
        const numUniforms = this._gl.getProgramParameter(this._program, this._gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const info = this._gl.getActiveUniform(this._program, i);
            if (!info) continue;
            const location = this._gl.getUniformLocation(this._program, info.name);
            uniforms[info.name] = { location, size: info.size, type: info.type };
        }
        this._uniforms = uniforms;
    }

    _setUniforms(obj) {
        for (let name in obj) {
            const info = this._uniforms[name];
            if (info.type === uTypes.mat4) {
                this._gl.uniformMatrix4fv(info.location, false, obj[name]);
            }
        }
    }
}

export class Shader {
    static defaultVert = `#version 300 es
        in vec3 aPosition;
        in vec3 aNormal;

        uniform mat4 uWorld;
        uniform mat4 uView;
        uniform mat4 uProj;

        out vec4 vFragColor;

        void main() {
            vFragColor = vec4(aNormal, 1.0);
            gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
        }
    `;
    
    static defaultFrag = `#version 300 es
        precision mediump float;

        in vec4 vFragColor;
        out vec4 fragColor;

        void main() {
            fragColor = vFragColor;
        }
    `;
}
