import { Scene, AnimateCallback, DrawCallback, TILE_SIZE, BACKGROUND } from "."
import { Camera } from "./camera"
import { InputHandler } from "./input-handler"
import { ItemHandler } from "./item/item-handler"
import { LightHandler } from "./light/light-handler"
import { NpcHandler } from "./npc/npc-handler"
import { ObjectHandler } from "./object/object-handler"
import { OffscreenHandler } from "./offscreen"
import { ShaderHandler } from "./shader/shader-handler"
import { loadTexture } from "./texture/texture"
import { TileHandler } from "./tile/tile-handler"

export type EngineDeps = {
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    resPath: string,
    tileHandler: TileHandler,
    shaderHandler: ShaderHandler,
    objectHandler: ObjectHandler,
    npcHandler: NpcHandler,
    itemHandler: ItemHandler
}

export class Engine {

    public readonly gl: WebGL2RenderingContext

    public readonly resPath: string

    public readonly inputHandler: InputHandler
    public readonly shaderHandler: ShaderHandler
    public readonly tileHandler: TileHandler
    public readonly objectHandler: ObjectHandler
    public readonly npcHandler: NpcHandler
    public readonly itemHandler: ItemHandler

    private scene: Scene

    public lightHandler: LightHandler

    public readonly offscreenHandler: OffscreenHandler
    public camera: Camera

    public onAnimate: AnimateCallback = null
    public onDraw: DrawCallback = null

    constructor(deps: EngineDeps) 
    {
        const { 
            canvas, gl, resPath, 
            shaderHandler, tileHandler, 
            objectHandler, npcHandler, itemHandler,
        } = deps;

        this.gl = gl
        this.resPath = resPath

        this.shaderHandler = shaderHandler
        this.tileHandler = tileHandler
        this.objectHandler = objectHandler
        this.npcHandler = npcHandler
        this.itemHandler = itemHandler

        this.lightHandler = new LightHandler(gl)
        this.offscreenHandler = new OffscreenHandler(this)
        this.camera = new Camera(this)
        this.inputHandler = new InputHandler(canvas, this.camera)

        gl.enable(gl.BLEND)
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE)

        this.lightHandler.brightness = 1
        this.camera.setDimensions(canvas.width, canvas.height)
        this.camera.scale = 3

        const now = Date.now()
        requestAnimationFrame(() => { this.update(now) })
    }

    async loadTexture(url: string) {
        return await loadTexture(this.gl, this.resPath + "/" + url)
    }

    public set map(map: Scene) {
        this.scene = map
        this.inputHandler.scene = map

        let minX = -Infinity
        let minY = -Infinity
        let maxX = Infinity
        let maxY = Infinity

        if(map != null) {
            minX = 0
            minY = 0
            maxX = map.width * TILE_SIZE
            maxY = map.height * TILE_SIZE
        }
        
        this.camera.setBoundaries(minX, minY, maxX, maxY)
    }

    public get map() {
        return this.scene
    }

    unbindFB() {
        const gl = this.gl

        if(this.camera.enablePixelScaling) {
            this.offscreenHandler.bind()
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0, 0, this.camera.realWidth, this.camera.realHeight)
        }
    }

    resize(width: number, height: number) {
        this.camera.setDimensions(width, height)
    }

    update(lastUpdate: number) {
        const now = Date.now()
        const dt = Date.now() - lastUpdate

        this.tileHandler.animateWater(dt)

        if(this.onAnimate != null) {
            this.onAnimate(dt)
        }

        const offscreen = this.camera.enablePixelScaling
        if(offscreen) {
            this.offscreenHandler.bind() // render to offscreen texture, to scale up later
        }

        this.gl.clearColor(BACKGROUND[0], BACKGROUND[1], BACKGROUND[2], 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        if(this.scene != null) {
            const [mouseX, mouseY] = this.camera.translateClick(
                this.inputHandler.mouseX, this.inputHandler.mouseY)
            this.scene.updateHover(mouseX, mouseY)
            this.scene.animate(dt)

            this.lightHandler.render(this, this.scene)
            this.scene.draw()
        }

        if(offscreen) {
            this.offscreenHandler.render()
        }

        if(this.onDraw != null) {
            this.onDraw()
        }

        requestAnimationFrame(() => { this.update(now) })
    }

}
