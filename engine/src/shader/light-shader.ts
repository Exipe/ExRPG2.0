
import { Matrix } from "../matrix";
import { loc, Shader } from "./shader";

export class LightShader extends Shader {

    private readonly modelLoc: WebGLUniformLocation

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.modelLoc = loc(this, "model")
    }

    setModelMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.modelLoc, true, matrix.value)
    }

}