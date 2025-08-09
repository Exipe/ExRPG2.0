
import { Scene } from "./scene"
import { SceneBuilder, Engine } from ".."
import { OBJ_ID_PREFIX, WARP_ID_PREFIX, NPC_ID_PREFIX, ITEM_ID_PREFIX, BLOCK_ID, NPC_AVOID_ID, TRIGGER_ID_PREFIX } from "../tile/attrib-tile"
import { GROUND_ID } from "../tile/texture-tile"
import { WATER_ID } from "../tile/water-tile"

export function loadScene(engine: Engine, save: string) {
    const parse = JSON.parse(save)
    const scene = new Scene(engine, parse.width, parse.height)
    if(parse.ambient) {
        scene.ambientLight = parse.ambient
    }

    scene.dynamicWeather = parse.dynamicWeather ?? false;
    scene.weatherEffect = parse.weatherEffect ?? "none";

    const builder = scene.builder
    parseLayer(parse.baseLayer, parseBase.bind(null, builder))
    parseLayer(parse.overLayer, parseOverlay.bind(null, builder))
    parseLayer(parse.wallLayer, parseWall.bind(null, builder))
    parseLayer(parse.attribLayer, parseAttrib.bind(null, builder))
    parseLayer(parse.decoLayer, parseDeco.bind(null, builder))

    scene.update()
    return scene
}

function parseBase(builder: SceneBuilder, id: string, x: number, y: number) {
    const split = id.split("_")
    switch(split[0]) {
        case GROUND_ID:
            builder.putGround(x, y, parseInt(split[1]), parseInt(split[2]))
            break
        case WATER_ID:
            builder.putWater(x, y)
            break
    }
}

function parseOverlay(builder: SceneBuilder, id: string, x: number, y: number) {
    const split = id.split("_").map(s => parseInt(s))
    builder.putOverlay(x, y, split[0], split[1], split[2], split[3])
}

function parseWall(builder: SceneBuilder, id: string, x: number, y: number) {
    const split = id.split("_").map(s => parseInt(s))
    builder.putWall(x, y, split[0], split[1])
}

function parseAttrib(builder: SceneBuilder, id: string, x: number, y: number) {
    if(id == BLOCK_ID) {
        builder.putBlock(x, y)
    } else if(id == NPC_AVOID_ID) {
        builder.putNpcAvoid(x, y)
    } else if(id.startsWith(OBJ_ID_PREFIX)) {
        const objId = id.substr(OBJ_ID_PREFIX.length)
        builder.putObject(x, y, objId)
    } else if(id.startsWith(NPC_ID_PREFIX)) {
        const npcId = id.substr(NPC_ID_PREFIX.length)
        builder.putNpc(x, y, npcId)
    } else if(id.startsWith(ITEM_ID_PREFIX)) {
        const itemId = id.substr(ITEM_ID_PREFIX.length)
        builder.putItem(x, y, itemId)
    } else if(id.startsWith(WARP_ID_PREFIX)) {
        const split = id.substr(WARP_ID_PREFIX.length).split(" ")
        builder.putWarp(x, y, split[0], Number(split[1]), Number(split[2]))
    } else if(id.startsWith(TRIGGER_ID_PREFIX)) {
        const split = id.substr(TRIGGER_ID_PREFIX.length)
        builder.putTrigger(x, y, split)
    }
}

function parseDeco(builder: SceneBuilder, id: string, x: number, y: number) {
    const split = id.split("_").map(s => parseInt(s))
    builder.putDeco(x, y, split[0], split[1])
}

function parseLayer(layer: any, parse: (id: string, x: number, y: number) => void) {
    if(layer == undefined) {
        return
    }

    const ids = layer.ids
    const grid = layer.grid
    const colLength = Math.floor(Math.log10(ids.length) + 1)

    let ri = 0
    grid.forEach(row => {
        const split = row.match(new RegExp(".{" + colLength + "}", "g"));
        
        let ci = 0
        split.forEach(col => {
            const idx = parseInt(col, 10) - 1
            if(idx >= 0) {
                parse(ids[idx], ci, ri)
            }
            
            ci++
        })

        ri++
    });
}
