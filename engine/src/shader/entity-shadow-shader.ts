import { SHADOW_OUTLINE } from "..";
import { Matrix } from "../matrix";
import { loc, Shader } from "./shader";

export class EntityShadowShader extends Shader {

    private readonly modelLoc: WebGLUniformLocation
    private readonly colorLoc: WebGLUniformLocation

    public readonly textureId = 0

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.modelLoc = loc(this, "model")
        this.setSampler("tex", this.textureId)

        this.colorLoc = loc(this, "color")
        this.setColor(SHADOW_OUTLINE)
    }

    setModelMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.modelLoc, true, matrix.value)
    }

    setColor(color: [number, number, number, number]) {
        this.gl.uniform4fv(this.colorLoc, new Float32Array(color))
    }

}