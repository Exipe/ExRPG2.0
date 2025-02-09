
import { Shader, loc } from "./shader";
import { Matrix } from "../matrix";
import { LIGHT_TEXTURE_ID } from "../light/light-handler";

export class StandardShader extends Shader {

    private readonly enableLightLoc: WebGLUniformLocation
    private readonly texOffsetLoc: WebGLUniformLocation
    private readonly modelLoc: WebGLUniformLocation

    get textureId() {
        return 0
    }

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.enableLightLoc = loc(this, "enableLight")
        this.setEnableLight(true)

        this.texOffsetLoc = loc(this, "texOffset")
        this.setTexOffset([0, 0]);

        this.modelLoc = loc(this, "model")
        this.setSampler("tex", this.textureId)
        this.setSampler("lightMap", LIGHT_TEXTURE_ID)
    }

    setModelMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.modelLoc, true, matrix.value)
    }

    setEnableLight(enableLight: boolean) {
        this.gl.uniform1i(this.enableLightLoc, enableLight ? 1 : 0)
    }

    setTexOffset(offset: [number, number]) {
        this.gl.uniform2f(this.texOffsetLoc, offset[0], offset[1])
    }

}