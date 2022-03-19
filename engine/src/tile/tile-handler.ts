
import { MultiTexture } from "../texture/multi-texture";
import { Engine, TILE_SIZE } from "..";
import { loadTexture, Texture } from "../texture/texture";
import { ShaderHandler } from "../shader/shader-handler";
import { WaterTile } from "./water-tile";
import { Quad } from "../quad";
import { OverlayTile } from "./overlay-tile";
import { WallTile } from "./wall-tile";
import { BlockTile, ObjectTile, WarpTile, PreviewNpcTile, NpcTile, PreviewItemTile, ItemTile, NpcAvoidTile, IslandTile, TriggerTile } from "./attrib-tile";
import { Scene } from "../scene/scene";
import { GroundTile, DecoTile } from "./texture-tile";

export async function initTileTextures(gl: WebGL2RenderingContext, texPath: string, previewMode: boolean) {
    async function loadTileTexture(name: string) {
        return loadTexture(gl, texPath + "/" + name + ".png").then(texture => new MultiTexture(texture, TILE_SIZE, TILE_SIZE));
    }

    const waterTexture = loadTexture(gl, texPath + "/water.png", gl.LINEAR)
    const groundTexture = loadTileTexture("ground")
    const shapeTexture = loadTileTexture("shape")
    const wallTexture = loadTileTexture("wall")
    const attribTexture = loadTileTexture("attrib")
    const decoTexture = loadTileTexture("deco")

    const results = await Promise.all([waterTexture, groundTexture, shapeTexture, wallTexture, attribTexture, decoTexture])

    return new TileHandler(gl, results[0], results[1], results[2], results[3], results[4], results[5], previewMode)
}

export class TileHandler {

    private liquidTimer = 0
    private offset: number

    private gl: WebGL2RenderingContext

    private waterTexture: Texture
    private groundTexture: MultiTexture
    private shapeTexture: MultiTexture
    private wallTexture: MultiTexture
    private attribTexture: MultiTexture
    private decoTexture: MultiTexture

    public readonly tileQuad: Quad
    public readonly shadowQuad: Quad

    public readonly groundTextureQuad: Quad
    public readonly waterTextureQuad: Quad
    public readonly shapeTextureQuad: Quad
    public readonly wallTextureQuad: Quad
    public readonly attribTextureQuad: Quad
    public readonly decoTextureQuad: Quad

    private readonly previewMode: boolean

    constructor(gl: WebGL2RenderingContext, waterTexture: Texture, groundTexture: MultiTexture, 
        shapeTexture: MultiTexture, wallTexture: MultiTexture, 
        attribTexture: MultiTexture, decoTexture: MultiTexture,
        previewMode: boolean)
    {
        this.gl = gl
        this.waterTexture = waterTexture
        this.groundTexture = groundTexture
        this.shapeTexture = shapeTexture
        this.wallTexture = wallTexture
        this.attribTexture = attribTexture
        this.decoTexture = decoTexture
        this.previewMode = previewMode

        this.tileQuad = new Quad(0, 0, TILE_SIZE, TILE_SIZE, gl, true)
        this.shadowQuad = new Quad(0, 0, 1, 1, gl, true)

        this.groundTextureQuad = this.groundTexture.get(0, 0).quad.copy(gl, true)
        this.shapeTextureQuad = this.shapeTexture.get(0, 0).quad.copy(gl, true)
        this.waterTextureQuad = this.waterTexture.quad.copy(gl, true)
        this.wallTextureQuad = this.wallTexture.get(0, 0).quad.copy(gl, true)
        this.attribTextureQuad = this.attribTexture.get(0, 0).quad.copy(gl, true)
        this.decoTextureQuad = this.decoTexture.get(0, 0).quad.copy(gl, true)
    }

    public animateWater(dt: number) {
        this.liquidTimer += dt
        this.offset = Math.sin(this.liquidTimer / 1000)
    }

    public drawWater(animate: boolean, shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useBaseShader()
        const offset = animate ? this.offset : 0
        this.gl.vertexAttrib2f(3, offset, offset)
        this.waterTexture.bind(shader.textureId)
    }

    public drawGround(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useBaseShader()
        this.groundTexture.base.bind(shader.textureId)
    }

    public drawOverlay(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useOverlayShader()
        this.groundTexture.base.bind(shader.textureId)
        this.shapeTexture.base.bind(shader.shapeTextureId)
    }

    public drawWall(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useBaseShader()
        this.wallTexture.base.bind(shader.textureId)
    }

    public drawShadow(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useShadowShader()
    }

    public drawAttrib(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useBaseShader()
        this.attribTexture.base.bind(shader.textureId)
    }

    public drawDeco(shaderHandler: ShaderHandler) {
        const shader = shaderHandler.useBaseShader()
        this.decoTexture.base.bind(shader.textureId)
    }

    public waterTile() {
        return new WaterTile()
    }

    public groundTile(texX: number, texY: number) {
        const quad = this.groundTexture.get(texX, texY).quad
        return new GroundTile(quad, texX, texY)
    }

    public overlayTile(texX: number, texY: number, shapeX: number, shapeY: number) {
        return new OverlayTile(texX + "_" + texY + "_" + shapeX + "_" + shapeY,
                                this.groundTexture.get(texX, texY).quad, 
                                this.shapeTexture.get(shapeX, shapeY).quad)
    }

    public wallTile(texX: number, texY: number) {
        return new WallTile(texX + "_" + texY, this.wallTexture.get(texX, texY).quad)
    }

    public decoTile(texX: number, texY: number) {
        const quad = this.decoTexture.get(texX, texY).quad
        return new DecoTile(quad, texX, texY)
    }

    public blockTile(scene: Scene) {
        return new BlockTile(this.attribTexture.get(0, 0).quad, scene)
    }

    public npcAvoidTile() {
        return new NpcAvoidTile(this.attribTexture.get(5, 0).quad)
    }

    public islandTile(scene: Scene) {
        return new IslandTile(this.attribTexture.get(0, 1).quad, scene)
    }

    public warpTile(mapId: string, toX: number, toY: number) {
        return new WarpTile(this.attribTexture.get(2, 0).quad, mapId, toX, toY)
    }

    public triggerTile(action: string) {
        return new TriggerTile(this.attribTexture.get(1, 1).quad, action)
    }

    public objectTile(scene: Scene, objId: string) {
        return new ObjectTile(this.attribTexture.get(1, 0).quad, scene, objId)
    }

    public npcTile(scene: Scene, npcId: string) {
        const texQuad = this.attribTexture.get(3, 0).quad
        return this.previewMode ? new PreviewNpcTile(texQuad, npcId, scene) : new NpcTile(texQuad, npcId)
    }

    public itemTile(scene: Scene, itemId: string) {
        const texQuad = this.attribTexture.get(4, 0).quad
        return this.previewMode ? new PreviewItemTile(texQuad, itemId, scene) : new ItemTile(texQuad, itemId)
    }

}