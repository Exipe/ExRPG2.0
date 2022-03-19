
import { Sprite } from "../texture/sprite"
import { Engine } from ".."
import { loadTexture } from "../texture/texture"
import { EquipmentData } from "./equipment-data"

export type ItemOption = [string, string]

export class ItemData {

    public readonly id: string
    public readonly name: string
    public readonly spritePath: string

    public readonly equipData: EquipmentData

    public readonly options: ItemOption[]

    private sprite: Sprite = null

    constructor(id: string, name: string, spritePath: string, equipData: EquipmentData, options: ItemOption[]) {
        this.id = id
        this.name = name
        this.spritePath = spritePath
        this.equipData = equipData
        this.options = options
    }

    public async getSprite(engine: Engine) {
        if(this.sprite == null) {
            const texture = await loadTexture(engine.gl, this.spritePath)
            this.sprite = new Sprite(engine, texture)
        }

        return this.sprite
    }

    public get equipable() {
        return this.equipData != null
    }

}