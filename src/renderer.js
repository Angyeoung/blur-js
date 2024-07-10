import { Mesh } from "./gameObject.js";
import { Camera } from "./camera.js";
import { Scene } from "./scene.js";

const DEFAULT_VERT_SRC = `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    out vec3 _fragColor;

    void main() {
        _fragColor = aNormal;
        gl_Position = mProj * mView * mWorld * vec4(aPosition, 1.0);
}`;

const DEFAULT_FRAG_SRC = `#version 300 es
    precision mediump float;

    in vec3 _fragColor;
    out vec4 fragColor;

    void main() {
        fragColor = vec4(_fragColor, 1.0);
}`;

/**
 * This class is meant to be a wrapper around webgl,
 * simplifying the complex, etc.
 */
export class Renderer {

    vertShader;
    fragShader;

    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this._gl = canvas.getContext('webgl2');
        this._program = this._gl.createProgram();
        this.vertShader = this._setShader(this._gl.VERTEX_SHADER, DEFAULT_VERT_SRC);
        this.fragShader = this._setShader(this._gl.FRAGMENT_SHADER, DEFAULT_FRAG_SRC);
        this._linkProgram();
        this._gl.useProgram(this._program);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);
        this._gl.frontFace(this._gl.CCW);
        this._gl.cullFace(this._gl.BACK);
        this.setClearColor(0.75, 0.85, 0.8, 1);
        // TODO: Make this better?
        this._uniformLocations = {
            mWorld: this._gl.getUniformLocation(this._program, 'mWorld'),
            mView: this._gl.getUniformLocation(this._program, 'mView'),
            mProj: this._gl.getUniformLocation(this._program, 'mProj')
        }
        this._setCanvasResolution();
        window.addEventListener('resize', () => this._setCanvasResolution());
    }

    setVertShader(source = DEFAULT_VERT_SRC) {
        this._setShader(this._gl.VERTEX_SHADER, source);
        this._linkProgram();
    }

    setFragShader(source = DEFAULT_FRAG_SRC) {
        this._setShader(this._gl.FRAGMENT_SHADER, source);
        this._linkProgram();
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
        this._gl.uniformMatrix4fv(this._uniformLocations.mView, false, camera.transform.getViewMatrix());
        this._gl.uniformMatrix4fv(this._uniformLocations.mProj, false, camera.getProjectionMatrix());

        // TODO: Scene implement and fix this garbage
        for (let gameObject of scene.children) {
            if (!gameObject.mesh) continue;
            if (!gameObject.mesh.isBound) this._setupVAO(gameObject.mesh);

            this._gl.uniformMatrix4fv(this._uniformLocations.mWorld, false, gameObject.transform.getWorldMatrix());
            
            this._gl.bindVertexArray(gameObject.mesh.vao);
            this._gl.drawElements(this._gl.TRIANGLES, gameObject.mesh.triangles.length, this._gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Create a shader and attach it to the current program
     * @param {GLenum} shaderType - `gl.FRAGMENT_SHADER` | `gl.VERTEX_SHADER` 
     * @param {string} source
     */
    _setShader(shaderType, source) {
        
        // Create and compile the shader
        const shader = this._gl.createShader(shaderType);
        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);
        
        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS))
            console.error('Shader compilation failed:\n\n', this._gl.getShaderInfoLog(shader));
        
        // Detach previous shader if needed
        if (shaderType === this._gl.FRAGMENT_SHADER && this.fragShader)
            this._gl.detachShader(this._program, this.fragShader);
        else if (shaderType === this._gl.VERTEX_SHADER && this.vertShader)
            this._gl.detachShader(this._program, this.vertShader);
        
        // Attach the new shader
        this._gl.attachShader(this._program, shader);

        return shader;
    }

    _linkProgram() {
        this._gl.linkProgram(this._program);
        this._gl.validateProgram(this._program);
        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS))
            console.error('Program linking failed:\n\n', this._gl.getProgramInfoLog(this._program));
        if (!this._gl.getProgramParameter(this._program, this._gl.VALIDATE_STATUS))
            console.error('Program validation failed:\n\n', this._gl.getProgramInfoLog(this._program));
    }

    _setCanvasResolution(mult = 1) {
        this.canvas.width = window.innerWidth * mult;
        this.canvas.height = window.innerHeight * mult;
        this._gl.viewport(0, 0, window.innerWidth * mult, window.innerHeight * mult);  
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
}
