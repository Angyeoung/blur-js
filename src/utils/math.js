export class Vector3 {



    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }



    static get zero()    { return new Vector3( 0,  0,  0); }
    static get one()     { return new Vector3( 1,  1,  1); }
    static get up()      { return new Vector3( 0,  1,  0); }
    static get down()    { return new Vector3( 0, -1,  0); }
    static get right()   { return new Vector3( 1,  0,  0); }
    static get left()    { return new Vector3(-1,  0,  0); }
    static get forward() { return new Vector3( 0,  0,  1); }
    static get back()    { return new Vector3( 0,  0, -1); }

    /** Gets the magnitude (length) of this vector */
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }



    /**
     * Constructs a new vector equal to `vector`
     * @param {Vector3} vector 
     * @returns {Vector3}
     */
    static copy(vector) {
        return new Vector3(vector.x, vector.y, vector.z);
    }



    /** Returns new Vector3 
     * @param {Vector3} vector
     * @param {Float32Array} transformation
     * @returns {Vector3}
     */
    static transform(vector, transformation) {
        const x = (vector.x * transformation[0]) + (vector.y * transformation[4]) + (vector.z * transformation[8])  + transformation[12];
        const y = (vector.x * transformation[1]) + (vector.y * transformation[5]) + (vector.z * transformation[9])  + transformation[13];
        const z = (vector.x * transformation[2]) + (vector.y * transformation[6]) + (vector.z * transformation[10]) + transformation[14];
        const w = (vector.x * transformation[3]) + (vector.y * transformation[7]) + (vector.z * transformation[11]) + transformation[15];
        return new Vector3(x / w, y / w, z / w);
    }



    /** 
     * Gets the cross product of `left` and `right`
     * @param {Vector3} left 
     * @param {Vector3} right
     * @returns {Vector3}
     */
    static cross(left, right) {
        return new Vector3(
            left.y * right.z - left.z * right.y,
            left.z * right.x - left.x * right.z,
            left.x * right.y - left.y * right.x
        );
    }



    /** 
     * Gets the dot product of vectors `a` and `b`
     * @param {Vector3} a
     * @param {Vector3} b
     * @returns {number}
     */
    static dot(a, b) {
        return (a.x * b.x + a.y * b.y + a.z * b.z);
    }



    /**
     * Returns true if any component in `vecor` is NaN
     * @param {Vector3} vector
     * @returns {bool}
     */
    static isNaN(vector) {
        if (vector === null || vector === undefined) return true;
        return Number.isNaN(vector.x) || Number.isNaN(vector.y) || Number.isNaN(vector.z);
    }



    /**
     * Checks if this vector and `vector` are equal
     * @param {Vector3} vector
     * @returns {bool}
     */
    equals(vector) {
        return this.x === vector.x && 
               this.y === vector.y &&
               this.z === vector.z;
    }



    toString() {
        return `X: ${this.x}, Y: ${this.y}, Z: ${this.z}`;
    }



    /**
     * Returns the difference of `this` and `vector`
     * @param {Vector3} vector 
     * @returns {Vector3}
     */
    diff(vector) {
        return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }



    /**
     * Returns the sum of `this` and `vector`
     * @param {Vector3} vector 
     * @returns {Vector3}
     */
    sum(vector) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }



    /**
     * Returns this vector scaled by `n`
     * @param {number} n 
     * @returns {Vector3}
     */
    scaled(n) {
        return new Vector3( this.x * n, this.y * n, this.z * n );
    }



    /**
     * Returns the normalization of this vector
     * @returns {Vector3}
     */
    normalized() {
        const len = this.magnitude;
        if (len === 0) return Vector3.copy(this);
        const num = 1.0 / len;
        return new Vector3(this.x * num, this.y * num, this.z * num);
    }



    /**
     * Normalizes this vector
     * @returns {this}
     */
    normalize() {
        const len = this.magnitude;
        if (len === 0) return this;
        const num = 1.0 / len;
        this.x *= num;
        this.y *= num;
        this.z *= num;
        return this;
    }



    /**
     * Adds `vector` to this vector
     * @param {Vector3} vector
     * @returns {this}
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }



    /**
     * Subtracts `vector` from this vector
     * @param {Vector3} vector
     * @returns {this}
     */
    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }


    
    /**
     * Scales this vector by `n`
     * @param {number} n 
     * @returns {Vector3}
     */
    scale(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }



    f32() {
        return new Float32Array([this.x, this.y, this.z]);
    }

}

export class Matrix {
    
    /** Returns a new Float32Array identity matrix */
    static get identity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }



    /** Returns a new Float32Array zero matrix */
    static get zero() {
        return new Float32Array([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }



    /**
     * Sets `m` to the identity matrix
     * @param {Float32Array} m 
     * @returns {Float32Array} `m`
     */
    static setIdentity(m) {
        m[0]  = 1; m[1]  = 0; m[2]  = 0; m[3]  = 0;
        m[4]  = 0; m[5]  = 1; m[6]  = 0; m[7]  = 0;
        m[8]  = 0; m[9]  = 0; m[10] = 1; m[11] = 0;
        m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
        return m;
    }


    /**
     * Sets `m` to a scale matrix
     * @param {Float32Array} m 
     * @param {Vector3} vector 
     * @returns {Float32Array}
     */
    static setScaled(m, vector) {
        m[0] = vector.x;
        m[5] = vector.y;
        m[10] = vector.z;
        m[15] = 1; 
        m[1]  = m[2]  = m[3]  = m[4]  = 
        m[6]  = m[7]  = m[8]  = m[9]  = 
        m[11] = m[12] = m[13] = m[14] = 0;
        return m;
    }



    /**
     * Sets `m` to a view matrix
     * @param {Float32Array} m - Matrix to apply to
     * @param {Vector3} eye - Position of the viewer
     * @param {Vector3} target - Target the viewer is looking at in world space
     * @param {Vector3} up - `[0, 1, 0]` by default
     * @returns {Float32Array} `m`
     */
    static lookAt(m, eye, target, up = Vector3.up) {
        const zAxis = target.diff(eye).normalize();
        const xAxis = Vector3.cross(up, zAxis).normalize();
        const yAxis = Vector3.cross(zAxis, xAxis).normalize();
        const ex = -Vector3.dot(xAxis, eye);
        const ey = -Vector3.dot(yAxis, eye);
        const ez = -Vector3.dot(zAxis, eye);
        m[0] = xAxis.x; m[1] = yAxis.x;  m[2] = zAxis.x;  m[3] = 0;
        m[4] = xAxis.y; m[5] = yAxis.y;  m[6] = zAxis.y;  m[7] = 0;
        m[8] = xAxis.z; m[9] = yAxis.z; m[10] = zAxis.z; m[11] = 0;
        m[12] = ex;    m[13] = ey;      m[14] = ez;      m[15] = 1;
        return m;
    }



    /**
     * Sets `m` to a projection matrix
     * @param {Float32Array} m
     * @param {number} fov 
     * @param {number} aspect 
     * @param {number} znear 
     * @param {number} zfar
     * @returns {Float32Array} `m`
     */
    static perspectiveFovLH(m, fov, aspect, near, far) {
        const tan = 1.0 / (Math.tan(fov * 0.5));
        m[1] = m[2] = m[3] =
        m[4] = m[6] = m[7] =
        m[8] = m[9] = m[12] =
        m[13] = m[15] = 0;
        m[0]  = tan / aspect;
        m[5]  = tan;
        m[10] = -far / (near - far);
        m[11] = 1.0;
        m[14] = (near * far) / (near - far);
        return m;
    }

    // TODO: Update rotation to quaternions?

    /**
     * Rotates `m` by an Euler rotation `vector`
     * @param {Float32Array} m
     * @param {Vector3} vector
     * @returns {Float32Array} `m`
     */
    static rotate(m, vector) {
        Matrix.rotateX(m, vector.x);
        Matrix.rotateY(m, vector.y);
        Matrix.rotateZ(m, vector.z);
        return m;
    }



    /**
     * Rotates `m` about the x-axis by an Euler rotation `vector`
     * @param {Float32Array} m
     * @param {number} angle
     * @returns {Float32Array} `m`
     */
    static rotateX(m, angle) {
        const r = toRadians(angle);
        const s = Math.sin(r);
        const c = Math.cos(r);
        return Matrix.multiply(m, new Float32Array([
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1
        ]));
    }



    /**
     * Rotates `m` about the y-axis by an Euler rotation `vector`
     * @param {Float32Array} m
     * @param {number} angle
     * @returns {Float32Array} `m`
     */
    static rotateY(m, angle) {
        const r = toRadians(angle);
        const s = Math.sin(r);
        const c = Math.cos(r);
        return Matrix.multiply(m, new Float32Array([
            c, 0, -s, 0,
            0, 1,  0, 0,
            s, 0,  c, 0,
            0, 0,  0, 1
        ]));
    }



    /**
     * Rotates `m` about the z-axis by an Euler rotation `vector`
     * @param {Float32Array} m
     * @param {number} angle
     * @returns {Float32Array} `m`
     */
    static rotateZ(m, angle) {
        const r = toRadians(angle);
        const s = Math.sin(r);
        const c = Math.cos(r);
        return Matrix.multiply(m, new Float32Array([
            c, -s, 0, 0,
            s,  c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ]));
    }



    /** Creates a new translation matrix
     * @param {Vector3} vector
     */
    static translation(vector) {
        const r = Matrix.identity;
        r[12] = vector.x;
        r[13] = vector.y;
        r[14] = vector.z;
        return r;
    }



    /**
     * Multiplies matrix `a` by matrix `b` and returns a
     * @param {Float32Array} a 
     * @param {Float32Array} b 
     * @returns {Float32Array} `a`
     */
    static multiply(a, b) {
        let w = a[0] * b[0] + a[1] * b[4] + a[2] * b[8]  + a[3] * b[12];
        let x = a[0] * b[1] + a[1] * b[5] + a[2] * b[9]  + a[3] * b[13];
        let y = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
        let z = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
        a[0] = w;
        a[1] = x;
        a[2] = y;
        a[3] = z;

        w = a[4] * b[0] + a[5] * b[4] + a[6] * b[8]  + a[7] * b[12];
        x = a[4] * b[1] + a[5] * b[5] + a[6] * b[9]  + a[7] * b[13];
        y = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
        z = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
        a[4] = w;
        a[5] = x;
        a[6] = y;
        a[7] = z;

        w = a[8] * b[0] + a[9] * b[4] + a[10] * b[8]  + a[11] * b[12];
        x = a[8] * b[1] + a[9] * b[5] + a[10] * b[9]  + a[11] * b[13];
        y = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
        z = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
        a[8] = w;
        a[9] = x;
        a[10] = y;
        a[11] = z;

        w = a[12] * b[0] + a[13] * b[4] + a[14] * b[8]  + a[15] * b[12];
        x = a[12] * b[1] + a[13] * b[5] + a[14] * b[9]  + a[15] * b[13];
        y = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
        z = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
        a[12] = w;
        a[13] = x;
        a[14] = y;
        a[15] = z;

        return a;
    }



    /**
     * Inverts matrix `m`
     * @param {Float32Array} m 
     * @returns {Float32Array} `m`
     */
    static invert(m) {
        const l1 = m[0];   const l2 = m[1];   const l3 = m[2];   const l4 = m[3];
        const l5 = m[4];   const l6 = m[5];   const l7 = m[6];   const l8 = m[7]; 
        const l9 = m[8];   const l10 = m[9];  const l11 = m[10]; const l12 = m[11];
        const l13 = m[12]; const l14 = m[13]; const l15 = m[14]; const l16 = m[15];

        const l17 = (l11 * l16) - (l12 * l15); const l18 = (l10 * l16) - (l12 * l14);
        const l19 = (l10 * l15) - (l11 * l14); const l20 = (l9 * l16) - (l12 * l13);
        const l21 = (l9 * l15) - (l11 * l13);  const l22 = (l9 * l14) - (l10 * l13);

        const l23 = ((l6 * l17) - (l7 * l18)) + (l8 * l19);
        const l24 = -(((l5 * l17) - (l7 * l20)) + (l8 * l21));
        const l25 = ((l5 * l18) - (l6 * l20)) + (l8 * l22);
        const l26 = -(((l5 * l19) - (l6 * l21)) + (l7 * l22));
        const l27 = 1.0 / ((((l1 * l23) + (l2 * l24)) + (l3 * l25)) + (l4 * l26));

        const l28 = (l7 * l16) - (l8 * l15); const l29 = (l6 * l16) - (l8 * l14);
        const l30 = (l6 * l15) - (l7 * l14); const l31 = (l5 * l16) - (l8 * l13);
        const l32 = (l5 * l15) - (l7 * l13); const l33 = (l5 * l14) - (l6 * l13);
        const l34 = (l7 * l12) - (l8 * l11); const l35 = (l6 * l12) - (l8 * l10);
        const l36 = (l6 * l11) - (l7 * l10); const l37 = (l5 * l12) - (l8 * l9);
        const l38 = (l5 * l11) - (l7 * l9);  const l39 = (l5 * l10) - (l6 * l9);
        m[0] = l23 * l27; m[4] = l24 * l27; 
        m[8] = l25 * l27; m[12] = l26 * l27;
        m[1] = -(((l2 * l17) - (l3 * l18)) + (l4 * l19)) * l27;
        m[5] = (((l1 * l17) - (l3 * l20)) + (l4 * l21)) * l27;
        m[9] = -(((l1 * l18) - (l2 * l20)) + (l4 * l22)) * l27;
        m[13] = (((l1 * l19) - (l2 * l21)) + (l3 * l22)) * l27;
        m[2] = (((l2 * l28) - (l3 * l29)) + (l4 * l30)) * l27;
        m[6] = -(((l1 * l28) - (l3 * l31)) + (l4 * l32)) * l27;
        m[10] = (((l1 * l29) - (l2 * l31)) + (l4 * l33)) * l27;
        m[14] = -(((l1 * l30) - (l2 * l32)) + (l3 * l33)) * l27;
        m[3] = -(((l2 * l34) - (l3 * l35)) + (l4 * l36)) * l27;
        m[7] = (((l1 * l34) - (l3 * l37)) + (l4 * l38)) * l27;
        m[11] = -(((l1 * l35) - (l2 * l37)) + (l4 * l39)) * l27;
        m[15] = (((l1 * l36) - (l2 * l38)) + (l3 * l39)) * l27;
        return m;
    }



    /**
     * Returns a copy of matrix `m`
     * @param {Float32Array} m 
     * @returns {Float32Array}
     */
    static copy(m) {
        return new Float32Array(m);
    }

}


export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
