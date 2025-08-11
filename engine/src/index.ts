
import { initShaders } from "./shader/shader-handler"
import { initTileTextures } from "./tile/tile-handler"
import { Scene } from "./scene/scene"
import { SceneBuilder } from "./scene/scene-builder"
import { saveScene } from "./scene/save"
import { loadScene } from "./scene/load"
import { Sprite } from "./texture/sprite"
import { initObjects } from "./object/object-handler"
import { initNpcs } from "./npc/npc-handler"
import { feetCoords, Entity } from "./entity/entity"
import { NpcEntity } from "./npc/npc-entity"
import { NpcData } from "./npc/npc-data"
import { initItems } from "./item/item-handler"
import { ItemData } from "./item/item-data"
import { Item } from "./item/item"
import { MergeTexture } from "./texture/merge-texture"
import { EquipmentData } from "./item/equipment-data"
import { ObjectEntity } from "./object/object-entity"
import { Light } from "./light/light"
import { LightComponent } from "./light/light-component"
import { EntityShadow } from "./entity/entity-shadow"
import { PlayerSprite } from "./texture/player-sprite"
import { OutlineComponent } from "./entity/outline-component"
import { EngineDeps, Engine } from "./engine"
import { Camera } from "./camera"
import { Layer } from "./scene/layer/layer"
import { initWeather, WEATHER_EFFECTS, WeatherEffect } from "./weather/weather-effect-handler"
import { Component } from "./entity/component"

export { Engine, Camera }
export { Scene, Layer, SceneBuilder, loadScene, saveScene, feetCoords }
export { Sprite, PlayerSprite, MergeTexture }
export { Entity, NpcEntity, NpcData, ObjectEntity, EntityShadow, Component }
export { Item, ItemData, EquipmentData }
export { Light, LightComponent }
export { OutlineComponent }
export { WeatherEffect, WEATHER_EFFECTS }

export const TILE_SIZE = 16
export const ITEM_SIZE = 16
export const PLAYER_SIZE = [24, 32] as [number, number]
export const SHADOW_OUTLINE = [0, 0, 0, 0.20] as [number, number, number, number]
export const BACKGROUND = [0.08, 0.06, 0.05] as [number, number, number]

export * from "./matrix"

export type AnimateCallback = (dt: number) => void

export type DrawCallback = () => void

export async function initEngine(canvas: HTMLCanvasElement, resPath: string, previewMode = false) {
    const gl = canvas.getContext("webgl2")
    if (gl == null) throw "Could not initialize WebGL"

    const results = await Promise.all([
        initTileTextures(gl, resPath + "/tile", previewMode),
        initWeather(gl, resPath),
        initShaders(gl, resPath + "/shader"),
        initObjects(resPath),
        initNpcs(resPath),
        initItems(resPath)
    ])

    const [tileHandler, weatherEffectHandler, shaderHandler, objectHandler, npcHandler, itemHandler] = results;

    const dependencies: EngineDeps = {
        canvas, gl, resPath,
        tileHandler, shaderHandler, weatherEffectHandler,
        objectHandler, npcHandler, itemHandler
    }
    return new Engine(dependencies)
}
