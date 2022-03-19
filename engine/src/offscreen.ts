import { Engine, identity, scaling } from ".";
import { Sprite } from "./texture/sprite";
import { Texture } from "./texture/texture";

/**
 * Enables rendering the game to an offscreen buffer,
 * which we then use to enable pixel scaling
 */
export class OffscreenHandler {

    private readonly engine: Engine

    private width: number
    private height: number

    private glTexture: WebGLTexture
    private fb: WebGLFramebuffer

    private sprite: Sprite

    constructor(engine: Engine) {
        this.engine = engine
        this.init()
    }

    private init() {
        const engine = this.engine
        const gl = engine.gl

        this.glTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.glTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        this.fb = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glTexture, 0)
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    public bind() {
        const gl = this.engine.gl

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
        gl.viewport(0, 0, this.width, this.height)
    }

    public resize(width: number, height: number) {
        this.width = width
        this.height = height
    
        const gl = this.engine.gl
        this.sprite = new Sprite(this.engine, 
            new Texture(gl, this.glTexture, width, height))

        gl.bindTexture(gl.TEXTURE_2D, this.glTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

    public render() {
        const engine = this.engine
        const gl = engine.gl

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, engine.camera.realWidth, engine.camera.realHeight)
        
        const shader = engine.shaderHandler.useScaleShader()
        shader.setTexSize(this.width, this.height)
        shader.setScale(engine.camera.scale)
        this.sprite.draw(0, 0, shader)
    }

}