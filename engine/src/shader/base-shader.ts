
import { LIGHT_TEXTURE_ID } from "../light/light-handler";
import { loc, Shader } from "./shader";

export class BaseShader extends Shader {

    get textureId() {
        return 0
    }

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.setSampler("tex", this.textureId)
        this.setSampler("lightMap", LIGHT_TEXTURE_ID)

        gl.uniform1i(loc(this, "enableLight"), 1);
    }

}
