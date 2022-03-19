
import { Quad } from "../quad"

export class Texture {

    private readonly gl: WebGL2RenderingContext
    private readonly texture: WebGLTexture

    public readonly x: number
    public readonly y: number

    public readonly width: number
    public readonly height: number

    public readonly sourceWidth: number
    public readonly sourceHeight: number

    public readonly quad: Quad

    constructor(gl: WebGL2RenderingContext, texture: WebGLTexture, width: number, height: number, sourceWidth=width, sourceHeight=height, x=0, y=0) {
        this.gl = gl;
        this.texture = texture

        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.sourceWidth = sourceWidth
        this.sourceHeight = sourceHeight

        this.quad = new Quad(x / sourceWidth, y / sourceHeight, width / sourceWidth, height / sourceHeight)
    }

    bind(textureId: number) {
        textureId += this.gl.TEXTURE0
        this.gl.activeTexture(textureId)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    }

    subTexture(x: number, y: number, width: number, height: number): Texture {
        return new Texture(this.gl, this.texture, width, height, this.sourceWidth, this.sourceHeight, this.x+x, this.y+y)
    }

}

export function loadTexture(gl: WebGL2RenderingContext, url: string, glFilter: number = gl.NEAREST): Promise<Texture> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = ''

        img.onload = () => {
            const texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img) //load the image data into the texture

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, glFilter)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, glFilter)

            resolve(new Texture(gl, texture, img.width, img.height))
        }
        img.src = url
    })
}
