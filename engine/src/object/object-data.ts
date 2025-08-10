
import { Sprite } from "../texture/sprite"
import { Engine } from ".."
import { ShadowData } from "../entity/entity-shadow"
import { loadStaticAnimation, StaticAnimationData } from "../animation/static-animation"
import { LightData } from "../light/light"

export type ObjectOption = [string, string]

export class ObjectData {

    public readonly id: string
    public readonly name: string

    public readonly spritePath: string

    private sprite: Sprite = null

    public readonly options: ObjectOption[]

    public readonly width: number
    public readonly depth: number
    public readonly flat: boolean

    public lightData?: LightData
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

        this.width = definition.width ?? 1;
        this.depth = definition.depth ?? 1;
        this.flat = definition.flat ?? false;

        if (definition.light !== undefined) {
            this.lightData = {
                offsetX: definition.light.offsetX ?? 0,
                offsetY: definition.light.offsetY ?? 0,
                radius: definition.light.radius,
                pulsate: definition.light.pulsate !== undefined
                    ? {
                        factor: definition.light.pulsate.factor,
                        duration: definition.light.pulsate.duration
                    }
                    : undefined
            }
        }

        if (definition.shadow) {
            this.shadowData = {
                offsetX: definition.shadow.offsetX ?? 0,
                offsetY: definition.shadow.offsetY ?? 0
            }
        }

        if (definition.animation) {
            this.animationData = {
                frames: definition.animation.frames ?? 0,
                duration: definition.animation.duration ?? Infinity
            }
        }

        this.offsetX = definition.offsetX ?? 0
        this.offsetY = definition.offsetY ?? 0

        // if the object is a door, consider it unblocked
        this.block = !(definition.door ?? false) && (definition.block ?? true);
    }

    public async getSprite(engine: Engine) {
        if (this.sprite == null) {
            const texture = await engine.loadTexture(this.spritePath + ".png");
            this.sprite = new Sprite(engine, texture)
        }

        return this.sprite
    }

    public getAnimation(engine: Engine) {
        if (this.animationData === null) {
            return null;
        }

        const { frames, duration } = this.animationData;

        return loadStaticAnimation(engine, this.spritePath, frames, duration);
    }

}