
import { Scene } from "./scene";
import { Engine } from "..";

export class SceneBuilder {

    private scene: Scene
    private engine: Engine

    constructor(scene: Scene, engine: Engine) {
        this.scene = scene
        this.engine = engine
    }

    public fillWater(x: number, y: number) {
        const tile = this.engine.tileHandler.waterTile()
        this.scene.baseLayer.fill(x, y, tile)
        this.scene.baseLayer.update(this.engine)
    }

    public fillGround(posX: number, posY: number, texX: number, texY: number) {
        const tile = this.engine.tileHandler.groundTile(texX, texY)
        this.scene.baseLayer.fill(posX, posY, tile)
        this.scene.baseLayer.update(this.engine)
    }

    public fillWall(posX: number, posY: number, texX: number, texY: number) {
        const tile = this.engine.tileHandler.wallTile(texX, texY)
        this.scene.wallLayer.fill(posX, posY, tile)
        this.scene.wallLayer.update(this.engine)
    }

    public removeBase(x: number, y: number) {
        this.scene.baseLayer.remove(x, y, this.autoUpdate, this.engine)
    }

    public putGround(posX: number, posY: number, texX: number, texY: number) {
        const tile = this.engine.tileHandler.groundTile(texX, texY)
        this.scene.baseLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public putWater(posX: number, posY: number) {
        const tile = this.engine.tileHandler.waterTile()
        this.scene.baseLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public removeOverlay(x: number, y: number) {
        this.scene.overlayLayer.remove(x, y, this.autoUpdate, this.engine)
    }

    public putOverlay(posX: number, posY: number, texX: number, texY: number, shapeX: number, shapeY: number) {
        const tile = this.engine.tileHandler.overlayTile(texX, texY, shapeX, shapeY)
        this.scene.overlayLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public removeWall(x: number, y: number) {
        this.scene.wallLayer.remove(x, y, this.autoUpdate, this.engine)
    }

    public putWall(posX: number, posY: number, texX: number, texY: number) {
        const tile = this.engine.tileHandler.wallTile(texX, texY)
        this.scene.wallLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public removeDeco(x: number, y: number) {
        this.scene.decoLayer.remove(x, y, this.autoUpdate, this.engine)
    }

    public putDeco(posX: number, posY: number, texX: number, texY: number) {
        const tile = this.engine.tileHandler.decoTile(texX, texY)
        this.scene.decoLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public removeAttrib(x: number, y: number) {
        this.scene.attribLayer.remove(x, y, this.autoUpdate, this.engine)
    }

    public putBlock(x: number, y: number) {
        const tile = this.engine.tileHandler.blockTile(this.scene)
        this.scene.attribLayer.put(x, y, tile, this.autoUpdate, this.engine)
    }

    public putNpcAvoid(x: number, y: number) {
        const tile = this.engine.tileHandler.npcAvoidTile()
        this.scene.attribLayer.put(x, y, tile, this.autoUpdate, this.engine)
    }

    public putWarp(posX: number, posY: number, mapId: string, toX: number, toY: number) {
        const tile = this.engine.tileHandler.warpTile(mapId, toX, toY)
        this.scene.attribLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public putTrigger(posX: number, posY: number, action: string) {
        const tile = this.engine.tileHandler.triggerTile(action)
        this.scene.attribLayer.put(posX, posY, tile, this.autoUpdate, this.engine)
    }

    public putObject(x: number, y: number, id: string) {
        const tile = this.engine.tileHandler.objectTile(this.scene, id)
        this.scene.attribLayer.put(x, y, tile, this.autoUpdate, this.engine)
    }

    public putNpc(x: number, y: number, id: string) {
        const tile = this.engine.tileHandler.npcTile(this.scene, id)
        this.scene.attribLayer.put(x, y, tile, this.autoUpdate, this.engine)
    }

    public putItem(x: number, y: number, id: string) {
        const tile = this.engine.tileHandler.itemTile(this.scene, id)
        this.scene.attribLayer.put(x, y, tile, this.autoUpdate, this.engine)
    }

    private get autoUpdate() {
        return this.scene.finishedLoading;
    }
}
