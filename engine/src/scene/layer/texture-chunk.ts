
import { Chunk } from "./chunk";
import { Engine } from "../..";
import { TileHandler } from "../../tile/tile-handler";
import { TextureTile, DecoTile } from "../../tile/texture-tile";
import { AttribTile } from "../../tile/attrib-tile";
import { ShaderHandler } from "../../shader/shader-handler";
import { Quad } from "../../quad";

abstract class TextureChunk<T extends TextureTile> extends Chunk<T> {

    private count = 0
    private vao: WebGLVertexArrayObject
    private instanceVbo: WebGLBuffer

    private initialized = false

    protected abstract getTextureQuad(tileHandler: TileHandler): Quad;

    protected abstract initDraw(tileHandler: TileHandler, shaderHandler: ShaderHandler): any;

    protected doUpdate(engine: Engine) {
        const buffer: number[] = []
        this.count = 0

        this.process((t, x, y) => {
            buffer.push(...t.instanceData(x, y))
            this.count++
        })

        const gl = engine.gl

        if(!this.initialized) {
            this.initialize(gl, engine.tileHandler, buffer)
            return
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW)
    }

    initialize(gl: WebGL2RenderingContext, tileHandler: TileHandler, buffer: number[]) {
        const tileVbo = tileHandler.tileQuad.vbo
        const textureVbo = this.getTextureQuad(tileHandler).vbo

        this.vao = gl.createVertexArray()
        this.instanceVbo = gl.createBuffer()

        gl.bindVertexArray(this.vao)

        gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, textureVbo)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(1)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 16, 0)
        gl.vertexAttribDivisor(2, 1)
        gl.enableVertexAttribArray(2)

        //texture offset
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 16, 8)
        gl.vertexAttribDivisor(3, 1)
        gl.enableVertexAttribArray(3)
    }

    public draw(engine: Engine) {
        const gl = engine.gl

        this.initDraw(engine.tileHandler, engine.shaderHandler)
        gl.bindVertexArray(this.vao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count)
    }
    
}

export class AttribChunk extends TextureChunk<AttribTile> {

    protected getTextureQuad(tileHandler: TileHandler): Quad {
        return tileHandler.attribTextureQuad
    }

    protected initDraw(tileHandler: TileHandler, shaderHandler: ShaderHandler) {
        tileHandler.drawAttrib(shaderHandler)
    }
    
}

export class DecoChunk extends TextureChunk<DecoTile> {

    protected getTextureQuad(tileHandler: TileHandler): Quad {
        return tileHandler.decoTextureQuad
    }

    protected initDraw(tileHandler: TileHandler, shaderHandler: ShaderHandler) {
        tileHandler.drawDeco(shaderHandler)
    }

}
