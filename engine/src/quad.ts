
export class Quad {

    public readonly x: number
    public readonly y: number
    public readonly width: number
    public readonly height: number

    public readonly vbo: WebGLBuffer

    constructor(x: number, y: number, width: number, height: number, gl: WebGL2RenderingContext = null, initVbo = false) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        if(initVbo) {
            this.vbo = this.getVbo(gl)
        }
    }

    public copy(gl: WebGL2RenderingContext = null, initVbo = false) {
        return new Quad(this.x, this.y, this.width, this.height, gl, initVbo)
    }

    private getVbo(gl: WebGL2RenderingContext): WebGLBuffer {
        const top = this.y
        const right = this.x + this.width
        const bottom = this.y + this.height
        const left = this.x

        const vertices = [
            left, top,
            right, top,
            left, bottom,

            right, top,
            right, bottom,
            left, bottom
        ]

        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        return vbo
    }

}
