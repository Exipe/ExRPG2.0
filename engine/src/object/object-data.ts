
import { Sprite } from "../texture/sprite"
import { Engine } from ".."
import { loadTexture } from "../texture/texture"
import { ShadowData } from "../entity/entity-shadow"
import { loadStaticAnimation, StaticAnimationData } from "../animation/static-animation"

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
    public readonly flat: boolean

    public readonly shadowData = null as ShadowData
    public readonly animationData = null as StaticAnimationData

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
        this.flat = ifPresent(definition.flat, false)

        if(definition.shadow) {
            this.shadowData = {
                offsetX: ifPresent(definition.shadow.offsetX, 0),
                offsetY: ifPresent(definition.shadow.offsetY, 0)
            }
        }

        if(definition.animation) {
            this.animationData = {
                frames: ifPresent(definition.animation.frames, 0),
                duration: ifPresent(definition.animation.duration, Infinity)
            }
        }

        this.offsetX = ifPresent(definition.offsetX, 0)
        this.offsetY = ifPresent(definition.offsetY, 0)

        // if the object is a door, consider it unblocked
        this.block = !ifPresent(definition.door, false) && ifPresent(definition.block, true)
    }

    public async getSprite(engine: Engine) {
        if(this.sprite == null) {
            const texture = await engine.loadTexture(this.spritePath + ".png");
            this.sprite = new Sprite(engine, texture)
        }

        return this.sprite
    }

    public getAnimation(engine: Engine) {
        if(this.animationData === null) {
            return null;
        }

        const { frames, duration } = this.animationData;

        return loadStaticAnimation(engine, this.spritePath, frames, duration);
    }

}