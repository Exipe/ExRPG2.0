
import { Quad } from "../quad";
import { Scene } from "../scene/scene";
import { ObjectEntity } from "../object/object-entity";
import { TextureTile } from "./texture-tile";
import { NpcEntity } from "../npc/npc-entity";
import { Item } from "..";

export abstract class AttribTile extends TextureTile {

    constructor(id: string, textureQuad: Quad) {
        super(id, textureQuad)
    }

    public put(x: number, y: number, update: boolean) { }

    public remove(x: number, y: number, update: boolean) { }

}

export const BLOCK_ID = "BLOCK"

export class BlockTile extends AttribTile {

    private readonly scene: Scene

    constructor(textureQuad: Quad, scene: Scene) {
        super(BLOCK_ID, textureQuad)
        this.scene = scene
    }

    public put(x: number, y: number, update: boolean) {
        this.scene.block(x, y)

        if (update) {
            this.scene.islandMap.rebuild();
        }
    }

    public remove(x: number, y: number, update: boolean) {
        this.scene.unBlock(x, y)

        if (update) {
            this.scene.islandMap.rebuild();
        }
    }

}

export const WARP_ID_PREFIX = "WARP: "

export class WarpTile extends AttribTile {

    constructor(textureQuad: Quad, mapId: string, x: number, y: number) {
        super(WARP_ID_PREFIX + mapId + " " + x + " " + y, textureQuad)
    }

}

export const TRIGGER_ID_PREFIX = "TRIGGER: "

export class TriggerTile extends AttribTile {
    constructor(textureQuad: Quad, action: string) {
        super(TRIGGER_ID_PREFIX + action, textureQuad)
    }
}

export const NPC_AVOID_ID = "NPC_AVOID"

export class NpcAvoidTile extends AttribTile {

    constructor(textureQuad: Quad) {
        super(NPC_AVOID_ID, textureQuad)
    }

}

export const OBJ_ID_PREFIX = "OBJECT: "

export class ObjectTile extends AttribTile {

    private readonly scene: Scene
    private readonly objId: string

    private objectEntity: ObjectEntity

    constructor(textureQuad: Quad, scene: Scene, objId: string) {
        super(OBJ_ID_PREFIX + objId, textureQuad)
        this.scene = scene
        this.objId = objId
    }

    public put(x: number, y: number) {
        const obj = this.scene.addObject(this.objId, x, y)
        this.objectEntity = obj

        if (!obj.data.block) {
            return
        }

        for (let i = 0; i < obj.data.width; i++) {
            for (let j = 1 - obj.data.depth; j < 1; j++) {
                this.scene.block(x + i, y + j)
            }
        }
    }

    public remove(x: number, y: number) {
        const obj = this.objectEntity
        this.objectEntity = null
        obj.destroy()

        if (!obj.data.block) {
            return
        }

        for (let i = 0; i < obj.data.width; i++) {
            for (let j = 1 - obj.data.depth; j < 1; j++) {
                this.scene.unBlock(x + i, y + j)
            }
        }
    }

}

export const NPC_ID_PREFIX = "NPC: "

export class NpcTile extends AttribTile {

    constructor(textureQuad: Quad, npcId: string) {
        super(NPC_ID_PREFIX + npcId, textureQuad)
    }

}

export class PreviewNpcTile extends NpcTile {

    private readonly scene: Scene
    private readonly npcId: string

    private npc: NpcEntity

    constructor(textureQuad: Quad, npcId: string, scene: Scene) {
        super(textureQuad, npcId)
        this.npcId = npcId
        this.scene = scene
    }

    public put(x: number, y: number) {
        this.npc = this.scene.addNpc(this.npcId, x, y)
    }

    public remove(x: number, y: number) {
        this.npc.destroy()
        this.npc = null
    }

}

export const ITEM_ID_PREFIX = "ITEM: "

export class ItemTile extends AttribTile {

    constructor(textureQuad: Quad, itemId: string) {
        super(ITEM_ID_PREFIX + itemId, textureQuad)
    }

}

export class PreviewItemTile extends ItemTile {

    private readonly scene: Scene
    private readonly itemId: string

    private item: Item

    constructor(textureQuad: Quad, itemId: string, scene: Scene) {
        super(textureQuad, itemId)
        this.scene = scene
        this.itemId = itemId
    }

    public put(x: number, y: number) {
        this.item = this.scene.createItem(this.itemId, x, y)
    }

    public remove(x: number, y: number) {
        this.scene.removeItem(this.item)
    }

}
