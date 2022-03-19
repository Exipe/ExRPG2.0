
import { Matrix } from "../matrix"

export function loc(shader: Shader, name: string) {
    return shader.gl.getUniformLocation(shader.program, name)
}

export class Shader {

    gl: WebGL2RenderingContext
    program: WebGLProgram

    private projectionLoc: WebGLUniformLocation
    private viewLoc: WebGLUniformLocation

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        this.gl = gl
        this.program = gl.createProgram()

        gl.attachShader(this.program, vertexShader)
        gl.attachShader(this.program, fragmentShader)

        gl.linkProgram(this.program)

        if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw "Could not link program: " + gl.getProgramInfoLog(this.program)
        }

        this.projectionLoc = loc(this, "projection")
        this.viewLoc = loc(this, "view")
    }

    use() {
        this.gl.useProgram(this.program)
    }

    setSampler(name: string, texture: number) {
        this.gl.uniform1i(loc(this, name), texture)
    }
    
    setProjectionMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.projectionLoc, true, matrix.value)
    }

    setViewMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.viewLoc, true, matrix.value)
    }

}