
import { Sprite } from "../texture/sprite"
import { Engine, Light } from ".."
import { loadTexture } from "../texture/texture"
import { ShadowData } from "../entity/entity-shadow"

export type ObjectOption = [string, string]

function ifPresent(value: any, def: any) {
    return value != undefined ? value: def
}

export class ObjectData {

    public readonly id: string
    public readonly name: string

    public readonly spritePath: string
    
    private sprite: Sprite = null

    public readonly options: ObjectOption[]

    public readonly light: number
    public readonly width: number
    public readonly depth: number

    public readonly shadowData = null as ShadowData

    public readonly offsetX: number
    public readonly offsetY: number

    public readonly block: boolean

    constructor(definition: any, spritePath: string, options: ObjectOption[]) {
        this.id = definition.id
        this.name = definition.name
        this.spritePath = spritePath
        this.options = options

        this.light = ifPresent(definition.light, 0)
        this.width = ifPresent(definition.width, 1)
        this.depth = ifPresent(definition.depth, 1)

        if(definition.shadow) {
            this.shadowData = {
                offsetX: ifPresent(definition.shadow.offsetX, 0),
                offsetY: ifPresent(definition.shadow.offsetY, 0)
            }
        }

        this.offsetX = ifPresent(definition.offsetX, 0)
        this.offsetY = ifPresent(definition.offsetY, 0)

        // if the object is a door, consider it unblocked
        this.block = !ifPresent(definition.door, false) && ifPresent(definition.block, true)
    }

    public async getSprite(engine: Engine) {
        if(this.sprite == null) {
            const texture = await loadTexture(engine.gl, this.spritePath)
            this.sprite = new Sprite(engine, texture)
        }

        return this.sprite
    }

}