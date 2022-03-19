
import { Shader, loc } from "./shader";
import { SHADOW_OUTLINE } from "..";

export class ShadowShader extends Shader {

    private colorLoc: WebGLUniformLocation

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.colorLoc = loc(this, "color")
        this.setColor(SHADOW_OUTLINE)
    }

    setColor(color: [number, number, number, number]) {
        this.gl.uniform4fv(this.colorLoc, new Float32Array(color))
    }

}
