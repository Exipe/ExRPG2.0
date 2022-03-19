import { Matrix } from "..";
import { loc, Shader } from "./shader";

export class ScaleShader extends Shader {

    get textureId() {
        return 0;
    }

    private readonly modelLoc: WebGLUniformLocation
    private readonly texSizeLoc: WebGLUniformLocation
    private readonly scaleLoc: WebGLUniformLocation

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        super(gl, vertexShader, fragmentShader)
        this.use();
        this.modelLoc = loc(this, "model")
        this.setSampler("tex", this.textureId)
        this.texSizeLoc = loc(this, "texSize")
        this.scaleLoc = loc(this, "XBR_SCALE")
    }

    setModelMatrix(matrix: Matrix) {
        this.gl.uniformMatrix3fv(this.modelLoc, true, matrix.value)
    }

    setTexSize(width: number, height: number) {
        this.gl.uniform2f(this.texSizeLoc, width, height);
    }

    setScale(scale: number) {
        this.gl.uniform1f(this.scaleLoc, scale)
    }

}