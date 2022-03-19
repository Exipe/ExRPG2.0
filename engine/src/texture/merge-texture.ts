import { Engine } from ".."
import { Texture } from "./texture"
import { identity, scaling } from "../matrix"

export class MergeTexture {

    private readonly engine: Engine

    private readonly filter: number
    private readonly width: number
    private readonly height: number

    private glTexture: WebGLTexture
    private fb: WebGLFramebuffer

    constructor(engine: Engine, width: number, height: number, filter = engine.gl.NEAREST) {
        this.engine = engine
        this.filter = filter
        this.width = width
        this.height = height
        this.init()
    }

    public get texture() {
        return new Texture(this.engine.gl, this.glTexture, this.width, this.height)
    }

    private init() {
        const engine = this.engine
        const gl = engine.gl

        this.glTexture = gl.createTexture()

        gl.bindTexture(gl.TEXTURE_2D, this.glTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter)

        this.fb = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glTexture, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    public bind() {
        const engine = this.engine
        const gl = engine.gl

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
        gl.viewport(0, 0, this.width, this.height)
        
        engine.shaderHandler.setProjectionMatrix(scaling(2 / this.width, 2 / this.height).translate(-1, -1))
        engine.shaderHandler.setViewMatrix(identity())

        gl.clearColor(0, 0, 0, 0)
        gl.clear(engine.gl.COLOR_BUFFER_BIT)

        const shader = engine.shaderHandler.useStandardShader()
        shader.setEnableLight(false)
    }

    public unbind() {
        const engine = this.engine
        const camera = engine.camera

        engine.unbindFB()
        camera.resetProjection()
        camera.resetView()

        const shader = engine.shaderHandler.useStandardShader()
        shader.setEnableLight(true)
    }

}