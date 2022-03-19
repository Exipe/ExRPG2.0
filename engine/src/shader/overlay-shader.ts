
import { Shader, loc } from "./shader";
import { SHADOW_OUTLINE } from "..";
import { LIGHT_TEXTURE_ID } from "../light/light-handler";

export class OverlayShader extends Shader {

    get textureId() {
        return 0
    }

    get shapeTextureId() {
        return 1
    }

    private outlineColorLoc: WebGLUniformLocation
    private readonly brightnessLoc: WebGLUniformLocation

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use()

        this.brightnessLoc = loc(this, "brightness")
        this.outlineColorLoc = loc(this, "outlineColor")
        this.setOutlineColor(SHADOW_OUTLINE)

        this.setSampler("tex", this.textureId)
        this.setSampler("shape", this.shapeTextureId)
        this.setSampler("lightMap", LIGHT_TEXTURE_ID)
    }

    setOutlineColor(outline: [number, number, number, number]) {
        this.gl.uniform4fv(this.outlineColorLoc, new Float32Array(outline))
    }

    setBrightness(brightness: number) {
        this.gl.uniform1f(this.brightnessLoc, brightness)
    }

}
