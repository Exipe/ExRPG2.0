
import { Shader } from "./shader"
import { projection, scaling, translation, view, Matrix } from "../matrix"
import { ShadowShader as ShadowShader } from "./shadow-shader"
import { OverlayShader as OverlayShader } from "./overlay-shader"
import { BaseShader } from "./base-shader"
import { StandardShader } from "./standard-shader"
import { LightShader } from "./light-shader"
import { EntityShadowShader } from "./entity-shadow-shader"
import { ScaleShader } from "./scale-shader"

/**
 * Loads shader source code and compiles an OpenGL shader
 */
async function loadGlShader(gl: WebGL2RenderingContext, srcPath: string, srcFile: string, type: number) {
    return fetch(srcPath + "/" + srcFile + ".glsl").then(res => res.text()).then(source => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw "Could not make shader (" + srcFile + "): " + gl.getShaderInfoLog(shader)
        }

        return shader
    })
}

/**
 * Initializes a ShaderHandler
 * 
 * @param gl
 *      WebGL instance
 * 
 * @param srcPath 
 *      path to find the necessary GLSL source files
 */
export async function initShaders(gl: WebGL2RenderingContext, srcPath: string) {
    const vert = (file: string) => loadGlShader(gl, srcPath, file, gl.VERTEX_SHADER)
    const frag = (file: string) => loadGlShader(gl, srcPath, file, gl.FRAGMENT_SHADER)

    const results = await Promise.all([
        vert("standard-vert"),
        frag("standard-frag"),
        vert("base-vert"),
        vert("overlay-vert"),
        frag("overlay-frag"),
        vert("shadow-vert"),
        frag("shadow-frag"),
        vert("light-vert"),
        frag("light-frag"),
        vert("entity-shadow-vert"),
        frag("entity-shadow-frag"),
        frag("outline-frag"),
        vert("scale-vert"),
        frag("scale-frag")
    ])

    return new ShaderHandler({
        standardShader: new StandardShader(gl, results[0], results[1]),
        baseShader: new BaseShader(gl, results[2], results[1]),
        overlayShader: new OverlayShader(gl, results[3], results[4]),
        shadowShader: new ShadowShader(gl, results[5], results[6]),
        lightShader: new LightShader(gl, results[7], results[8]),
        entityShadowShader: new EntityShadowShader(gl, results[9], results[10]),
        outlineShader: new EntityShadowShader(gl, results[9], results[11]),
        scaleShader: new ScaleShader(gl, results[12], results[13])
    })
}

interface Shaders {
    standardShader: StandardShader
    baseShader: BaseShader
    overlayShader: OverlayShader
    shadowShader: ShadowShader
    lightShader: LightShader
    entityShadowShader: EntityShadowShader
    outlineShader: EntityShadowShader
    scaleShader: ScaleShader
}

export class ShaderHandler {

    private current: Shader
    
    private standardShader: StandardShader
    private baseShader: BaseShader
    private overlayShader: OverlayShader
    private shadowShader: ShadowShader
    private lightShader: LightShader
    private entityShadowShader: EntityShadowShader
    private outlineShader: EntityShadowShader
    private scaleShader: ScaleShader

    private all: Shader[]

    constructor(shaders: Shaders) 
    {
        this.standardShader = shaders.standardShader
        this.baseShader = shaders.baseShader
        this.overlayShader = shaders.overlayShader
        this.shadowShader = shaders.shadowShader
        this.lightShader = shaders.lightShader
        this.entityShadowShader = shaders.entityShadowShader
        this.outlineShader = shaders.outlineShader
        this.scaleShader = shaders.scaleShader

        /*
        Light shader + Scale shader purposefully excluded, as they use their own view/projection matrices
        */
        this.all = [ this.standardShader, this.baseShader, this.overlayShader, 
            this.shadowShader, this.entityShadowShader, this.outlineShader ]
    }

    private setCurrent(shader: Shader) {
        if(this.current == shader) return

        this.current = shader
        shader.use()
    }

    useStandardShader() {
        this.setCurrent(this.standardShader)
        return this.standardShader
    }

    useBaseShader() {
        this.setCurrent(this.baseShader)
        return this.baseShader
    }

    useOverlayShader() {
        this.setCurrent(this.overlayShader)
        return this.overlayShader
    }

    useShadowShader() {
        this.setCurrent(this.shadowShader)
        return this.shadowShader
    }

    useLightShader() {
        this.setCurrent(this.lightShader)
        return this.lightShader
    }

    useEntityShadowShader() {
        this.setCurrent(this.entityShadowShader)
        return this.entityShadowShader
    }

    useOutlineShader() {
        this.setCurrent(this.outlineShader)
        return this.outlineShader
    }

    useScaleShader() {
        this.setCurrent(this.scaleShader)
        return this.scaleShader
    }

    setProjection(width: number, height: number) {
        const projectionMatrix = projection(width, height);
        this.setProjectionMatrix(projectionMatrix)
        this.useScaleShader().setProjectionMatrix(scaling(2 / width, 2 / height).translate(-1, -1))
    }

    setProjectionMatrix(matrix: Matrix) {
        this.all.forEach(shader => {
            this.setCurrent(shader)
            shader.setProjectionMatrix(matrix)
        })
    }

    setView(x: number, y: number, scale: number) {
        const viewMatrix = view(x, y, scale)
        this.setViewMatrix(viewMatrix)
    }

    setViewMatrix(matrix: Matrix) {
        this.all.forEach(shader => {
            this.setCurrent(shader)
            shader.setViewMatrix(matrix)
        })
    }

}
