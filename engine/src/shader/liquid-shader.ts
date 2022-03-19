
import { LIGHT_TEXTURE_ID } from "../light/light-handler";
import { Shader, loc } from "./shader";

export class LiquidShader extends Shader {

    private texOffsetLoc: WebGLUniformLocation

    get textureId() {
        return 0
    }

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.texOffsetLoc = loc(this, "texOffset")
        this.setSampler("tex", this.textureId)
        this.setSampler("lightMap", LIGHT_TEXTURE_ID)
    }

    setOffset(offset: [number, number]) {
        this.gl.uniform2fv(this.texOffsetLoc, new Float32Array(offset))
    }

}
