
function matrix(x11: number, x12: number, x13: number,
                x21: number, x22: number, x23: number,
                x31: number, x32: number, x33: number) {
    return new Matrix([x11, x12, x13, x21, x22, x23, x31, x32, x33])
}

/**
 * Makes a view matrix for the specified camera details
 */
export function view(x, y, scale) {
    return scaling(scale, scale).translate(-x, -y)
    //return translation(-x, -y).scale(scale, scale)
}

/*
Makes a 2D projection matrix for the specified dimensions
Origin in the top-left
*/
export function projection(width: number, height: number): Matrix {
    /* 
    divide coords by half the width, and half the height (with the height inversed),
    (0, 0) -> (0, 0); (width, height) -> (2, -2)
    then move everything 1 step left and 1 step up (because this is how opengl expects the coords)
    */
    return scaling(2 / width, -2 / height).translate(-1, 1)
}

/*
Makes a transformation matrix that translates by the specified values
*/
export function translation(x: number, y: number) {
    return matrix(
        1, 0, x,
        0, 1, y,
        0, 0, 1
    )
}

/*
Makes a transformation matrix that scales by the specified values
*/
export function scaling(x: number, y: number) {
    return matrix(
        x, 0, 0,
        0, y, 0,
        0, 0, 1
    )
}

/*
Makes a transformation matrix that rotates by the specified degress
*/
export function rotation(degrees: number) {
    const radians = degrees * (Math.PI / 180)
    return matrix(
        Math.cos(radians), -Math.sin(radians), 0,
        Math.sin(radians), Math.cos(radians), 0,
        0, 0, 1
    )
}

export function identity() {
    return matrix(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    )
}

const COLS = 3
const ROWS = 3

/*
Represents a 3x3 matrix that can be transformed, and used in shaders
*/
export class Matrix {

    /*x11: number; x12: number; x13: number
    x21: number; x22: number; x23: number
    x31: number; x32: number; x33: number*/

    private readonly values: number[]

    constructor(values: number[]) {
        this.values = values
    }

    get(row: number, col: number) {
        return this.values[row * COLS + col]
    }

    multiply(other: Matrix): Matrix {
        const values = []

        for(let r = 0; r < ROWS; r++) {
            for(let c = 0; c < COLS; c++) {
                let value = 0;

                for(let i = 0; i < ROWS; i++) {
                    value += this.get(r, i) * other.get(i, c)
                }

                values.push(value)
            }
        }

        return new Matrix(values)

        /*return new Matrix(
            this.x11*other.x11 + this.x12*other.x21 + this.x13*other.x31, //x11
            this.x11*other.x12 + this.x12*other.x22 + this.x13*other.x32, //x12
            this.x11*other.x13 + this.x12*other.x23 + this.x13*other.x33, //x13

            this.x21*other.x11 + this.x22*other.x21 + this.x23*other.x31, //x21
            this.x21*other.x12 + this.x22*other.x22 + this.x23*other.x32, //x22
            this.x21*other.x13 + this.x22*other.x23 + this.x23*other.x33, //x23

            this.x31*other.x11 + this.x32*other.x21 + this.x33*other.x31, //x31
            this.x31*other.x12 + this.x32*other.x22 + this.x33*other.x32, //x32
            this.x31*other.x13 + this.x32*other.x23 + this.x33*other.x33, //x33
        )*/
    }

    /*
    A new matrix that is this matrix scaled
    */
    scale(x: number, y: number) {
        return scaling(x, y).multiply(this)
    }

    /*
    A new matrix that is this matrix translated
    */
    translate(x: number, y: number) {
        return translation(x, y).multiply(this)
    }

    /*
    A new matrix that is this matrix rotated
    */
    rotate(degrees: number) {
        return rotation(degrees).multiply(this)
    }

    get value(): Float32Array {
        //return new Float32Array([this.x11, this.x12, this.x13, this.x21, this.x22, this.x23, this.x31, this.x32, this.x33])
        return new Float32Array(this.values)
    }

}