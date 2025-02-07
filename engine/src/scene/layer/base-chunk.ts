
import { Chunk, CHUNK_SIZE } from "./chunk";
import { WATER_ID, WaterTile } from "../../tile/water-tile";
import { Engine } from "../..";
import { TileHandler } from "../../tile/tile-handler";
import { GROUND_ID, GroundTile } from "../../tile/texture-tile";

export class BaseChunk extends Chunk<WaterTile | GroundTile> {

    private groundCount = 0
    private groundVao: WebGLVertexArrayObject
    private groundInstanceVbo: WebGLBuffer

    private waterCount = 0
    private waterVao: WebGLVertexArrayObject
    private waterInstanceVbo: WebGLBuffer

    private initialized = false

    protected doUpdate(engine: Engine) {
        const groundBuffer: number[] = []
        const waterBuffer: number[] = []

        this.groundCount = 0
        this.waterCount = 0

        for(let ri = 0; ri < CHUNK_SIZE; ri++) {
            for(let ci = 0; ci < CHUNK_SIZE; ci++) {
                const t = this.get(ci, ri)
                if(t == null) {
                    continue
                }

                const x = this.x * CHUNK_SIZE + ci
                const y = this.y * CHUNK_SIZE + ri

                if(t.id == WATER_ID) {
                    waterBuffer.push(...t.instanceData(x, y))
                    this.waterCount++
                } else if(t.id.startsWith(GROUND_ID)) {
                    groundBuffer.push(...t.instanceData(x, y))
                    this.groundCount++
                }
            }
        }

        const gl = engine.gl

        if(!this.initialized) {
            this.initialize(gl, engine.tileHandler, groundBuffer, waterBuffer)
            return
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.groundInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundBuffer), gl.STATIC_DRAW)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.waterInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterBuffer), gl.STATIC_DRAW)
    }

    private initialize(gl: WebGL2RenderingContext, tileHandler: TileHandler, groundBuffer: number[], waterBuffer: number[]) {
        const tileVbo = tileHandler.tileQuad.vbo
        const groundTextureVbo = tileHandler.groundTextureQuad.vbo
        const waterTextureVbo = tileHandler.waterTextureQuad.vbo

        this.groundVao = gl.createVertexArray()
        this.groundInstanceVbo = gl.createBuffer()

        this.waterVao = gl.createVertexArray()
        this.waterInstanceVbo = gl.createBuffer()

        //prepare ground vao

        gl.bindVertexArray(this.groundVao)

        gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, groundTextureVbo)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(1)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.groundInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundBuffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 16, 0)
        gl.vertexAttribDivisor(2, 1)
        gl.enableVertexAttribArray(2)

        //texture offset
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 16, 8)
        gl.vertexAttribDivisor(3, 1)
        gl.enableVertexAttribArray(3)

        //prepare water vao

        gl.bindVertexArray(this.waterVao)

        gl.bindBuffer(gl.ARRAY_BUFFER, tileVbo)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.bindBuffer(gl.ARRAY_BUFFER, waterTextureVbo)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(1)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.waterInstanceVbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterBuffer), gl.STATIC_DRAW)

        //position offset
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(2)
        gl.vertexAttribDivisor(2, 1)

        gl.disableVertexAttribArray(3) //all water tiles have the same texture offset

        this.initialized = true
    }

    public draw(engine: Engine) {
        const gl = engine.gl

        engine.tileHandler.drawGround(engine.shaderHandler)
        gl.bindVertexArray(this.groundVao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.groundCount)

        engine.tileHandler.drawWater(true, engine.shaderHandler)
        gl.bindVertexArray(this.waterVao)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.waterCount)
    }

}
