
import { scaling } from "../matrix"
import { Quad } from "../quad"
import { LightShader } from "../shader/light-shader"

export interface LightData {
    radius: number,
    offsetX: number,
    offsetY: number,
    pulsate?: {
        factor: number,
        duration: number
    }
}

export interface Light {
    x: number,
    y: number,
    radius: number
}

export function initLightVAO(gl: WebGL2RenderingContext) {
    const quad = new Quad(-1, -1, 2, 2, gl, true)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    return vao
}

export function renderLight(gl: WebGL2RenderingContext, shader: LightShader, light: Light) {
    shader.setModelMatrix(scaling(light.radius, light.radius).translate(light.x, light.y))
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}
