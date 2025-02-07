
// import fetch from "node-fetch";
import { SpecialTrigger, WarpTrigger } from "./trigger";
import { Scene, SceneAttrib } from "./scene";
import { isMapId, MapId, maps } from "./map-id";
import { npcHandler, objDataHandler, itemDataHandler } from "../world";

const WARP_PREFIX = "WARP: "
const TRIGGER_PREFIX = "TRIGGER: "
const NPC_PREFIX = "NPC: "
const OBJ_PREFIX = "OBJECT: "
const ITEM_PREFIX = "ITEM: "
const BLOCK_ID = "BLOCK"
const NPC_AVOID_ID = "NPC_AVOID"

export function parseAttrib(map: Scene, attrib: SceneAttrib) {
    const id = attrib.id
    const x = attrib.x
    const y = attrib.y

    if (id.startsWith(OBJ_PREFIX)) {
        const objId = id.substr(OBJ_PREFIX.length)
        const objData = objDataHandler.get(objId)
        map.addObject(x, y, objData)
    }
    else if (id.startsWith(NPC_PREFIX)) {
        const npcId = id.substr(NPC_PREFIX.length)
        npcHandler.create(npcId, map.id, x, y)
    }
    else if (id.startsWith(WARP_PREFIX)) {
        const split = id.substr(WARP_PREFIX.length).split(" ")
        const mapId = split[0]

        if (!isMapId(mapId)) {
            throw `Invalid WARP [${mapId}] in ${map.id}`
        }

        map.setTrigger(x, y, new WarpTrigger(mapId, Number(split[1]), Number(split[2])))
    }
    else if (id.startsWith(TRIGGER_PREFIX)) {
        const action = id.substr(TRIGGER_PREFIX.length)
        map.setTrigger(x, y, new SpecialTrigger(action))
    }
    else if (id.startsWith(ITEM_PREFIX)) {
        const itemId = id.substr(ITEM_PREFIX.length)
        const itemData = itemDataHandler.get(itemId)
        map.addItem(itemData, 1, x, y)
    }
    else if (id == BLOCK_ID) {
        map.block(x, y)
    }
    else if (id == NPC_AVOID_ID) {
        map.npcBlock(x, y)
    }
}

async function loadScene(path: string, mapId: MapId) {
    const mapData = await fetch(path + mapId + ".json")
        .then(res => res.json()) as any

    const map = new Scene(mapId, mapData.width, mapData.height)

    const ids = mapData.attribLayer.ids
    const grid = mapData.attribLayer.grid
    const colLength = Math.floor(Math.log10(ids.length) + 1)

    grid.forEach((row, ri) => {
        const split = row.match(new RegExp(".{" + colLength + "}", "g"))

        split.forEach((col, ci) => {
            let id = "EMPTY"

            const idx = parseInt(col, 10) - 1
            if (idx >= 0) {
                id = ids[idx]
            }

            const attrib: SceneAttrib = {
                x: ci,
                y: ri,
                id: id
            }
            map.attribs.push(attrib)
            parseAttrib(map, attrib)
        })
    })

    return map
}

export async function loadScenes(path: string) {
    const scenes = new Map<string, Scene>()

    const promises = maps.map(async s => {
        const scene = await loadScene(path + "map/", s);
        scenes.set(s, scene);
    })

    await Promise.all(promises)

    return new SceneHandler(scenes)
}

export class SceneHandler {

    private readonly scenes: Map<string, Scene>

    constructor(scenes: Map<string, Scene>) {
        this.scenes = scenes
    }

    public get(id: string) {
        return this.scenes.get(id)
    }

    public tick() {
        this.scenes.forEach(scene => scene.tick());
    }

}
