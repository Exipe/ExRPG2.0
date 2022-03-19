
import { Chunk, CHUNK_SIZE } from "./chunk";
import { OverlayTile } from "../../tile/overlay-tile";
import { Engine } from "../..";
import { TileHandler } from "../../tile/tile-handler";

export class OverlayChunk extends Chunk<OverlayTile> {

    private count = 0
    private vao: WebGLVertexArrayObject
    private instanceVbo: WebGLBuffer

    private initialized = false

    protected doUpdate(engine: Engine) {
        const buffer: number[] = []
        this.count = 0

        for(let ri = 0; ri < CHUNK_SIZE; ri++) {
            for(let ci = 0; ci < CHUNK_SIZE; ci++) {
                const t = this.get(ci, ri)
                if(t == null) {
                    continue
                }

                const x = this.x * CHUNK_SIZE + ci
                const y = this.y * CHUNK_SIZE + ri

                const data = t.instanceData(x, y).concat([t.textureQuad.x, t.textureQuad.y, t.shapeQuad.x, t.shapeQuad.y])
                buffer.push(...data)
                this.count++
            }
        }

        const gl = engine.gl

        if(!this.initialized) {
            this.initialize(gl, engine.tileHandler, buffer)
            return
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW)
    }

    private initialize(gl: WebGL2RenderingContext, tileHandler: TileHandler, buffer: number[]) {
        const tileVbo = tileHandler.tileQuad.vbo
        const groundTextureVbo = tileHandler.groundTextureQuad.vbo
        const shapeTextureVbo = tileHandler.shapeTextureQuad.vbo

        this.vao = gl.createVertexArray()
        this.instanceVbo = gl.createBuffer()

        gl.bindVertexArray(this.vao)

        gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, groundTextureVbo)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(1)

        gl.bindBuffer(gl.ARRAY_BUFFER, shapeTextureVbo)
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(2)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 24, 0)
        gl.vertexAttribDivisor(3, 1)
        gl.enableVertexAttribArray(3)

        //texture offset
        gl.vertexAttribPointer(4, 2, gl.FLOAT, false, 24, 8)
        gl.vertexAttribDivisor(4, 1)
        gl.enableVertexAttribArray(4)

        //shape offset
        gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 24, 16)
        gl.vertexAttribDivisor(5, 1)
        gl.enableVertexAttribArray(5)

        this.initialized = true
    }

    public draw(engine: Engine) {
        const gl = engine.gl

        engine.tileHandler.drawOverlay(engine.shaderHandler)
        gl.bindVertexArray(this.vao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.count)
    }
    
}