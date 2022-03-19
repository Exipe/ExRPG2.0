
import { Chunk, CHUNK_SIZE } from "./chunk";
import { WallTile } from "../../tile/wall-tile";
import { Engine } from "../..";
import { TileHandler } from "../../tile/tile-handler";

export class WallChunk extends Chunk<WallTile> {

    private wallCount = 0
    private wallVao: WebGLVertexArrayObject
    private wallInstanceVbo: WebGLBuffer

    private shadowCount = 0
    private shadowVao: WebGLVertexArrayObject
    private shadowInstanceVbo: WebGLBuffer

    private initialized = false

    protected doUpdate(engine: Engine) {
        const wallBuffer: number[] = []
        const shadowBuffer: number[] = []
        this.wallCount = 0
        this.shadowCount = 0

        for(let ri = 0; ri < CHUNK_SIZE; ri++) {
            for(let ci = 0; ci < CHUNK_SIZE; ci++) {
                const t = this.get(ci, ri)
                if(t == null) {
                    continue
                }

                const x = this.x * CHUNK_SIZE + ci
                const y = this.y * CHUNK_SIZE + ri

                const data = t.instanceData(x, y).concat([t.textureQuad.x, t.textureQuad.y])
                wallBuffer.push(...data)
                this.wallCount++

                const shadowData = t.shadowInstanceData(x, y)
                shadowBuffer.push(...shadowData[1])
                this.shadowCount += shadowData[0]
            }
        }

        const gl = engine.gl

        if(!this.initialized) {
            this.initialize(gl, engine.tileHandler, wallBuffer, shadowBuffer)
            return
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.wallInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallBuffer), gl.STATIC_DRAW)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadowInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shadowBuffer), gl.STATIC_DRAW)
    }
    
    private initialize(gl: WebGL2RenderingContext, tileHandler: TileHandler, wallBuffer: number[], shadowBuffer: number[]) {
        const tileVbo = tileHandler.tileQuad.vbo
        const shadowVbo = tileHandler.shadowQuad.vbo
        const wallTextureVbo = tileHandler.wallTextureQuad.vbo

        this.wallVao = gl.createVertexArray()
        this.wallInstanceVbo = gl.createBuffer()

        this.shadowVao = gl.createVertexArray()
        this.shadowInstanceVbo = gl.createBuffer()

        //prepare wall vao

        gl.bindVertexArray(this.wallVao)

        gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, wallTextureVbo)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(1)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.wallInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wallBuffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 16, 0)
        gl.vertexAttribDivisor(2, 1)
        gl.enableVertexAttribArray(2)

        //texture offset
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 16, 8)
        gl.vertexAttribDivisor(3, 1)
        gl.enableVertexAttribArray(3)

        //prepare shadow vao

        gl.bindVertexArray(this.shadowVao)

        gl.bindBuffer(gl.ARRAY_BUFFER, shadowVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadowInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shadowBuffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 0)
        gl.vertexAttribDivisor(1, 1)
        gl.enableVertexAttribArray(1)

        //side length
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 16, 8)
        gl.vertexAttribDivisor(2, 1)
        gl.enableVertexAttribArray(2)

        this.initialized = true
    }

    public draw(engine: Engine) {
        const gl = engine.gl

        engine.tileHandler.drawWall(engine.shaderHandler)
        gl.bindVertexArray(this.wallVao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.wallCount)

        engine.tileHandler.drawShadow(engine.shaderHandler)
        gl.bindVertexArray(this.shadowVao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.shadowCount)
    }

}