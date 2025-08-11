
import { Sprite } from "../texture/sprite"
import { Engine } from ".."
import { loadTexture } from "../texture/texture"
import { PlayerSprite } from "../texture/player-sprite"
import { ShadowData } from "../entity/entity-shadow"
import { EquipmentSprite } from "../item/equipment-data"

export type NpcOption = [string, string]

export class NpcData {

    public readonly id: string
    public readonly name: string
    public readonly spritePath: string

    private sprite: Sprite = null

    public readonly options: NpcOption[]

    public readonly width: number;
    public readonly depth: number;
    public readonly flat: boolean;

    public readonly equip: [string, number][]; // [sheet, slot]

    public readonly shadowData: ShadowData = null

    public readonly rawDefinition: any;

    constructor(definition: any, spritePath: string, options: NpcOption[]) {
        this.rawDefinition = definition;
        this.id = definition.id;
        this.name = definition.name;
        this.spritePath = spritePath;
        this.options = options;
        this.equip = definition.equip ?? []

        this.width = definition.width ?? 1;
        this.depth = definition.depth ?? 1;
        this.flat = definition.flat ?? false;

        if (definition.shadow) {
            this.shadowData = {
                offsetX: definition.shadow.offsetX ?? 0,
                offsetY: definition.shadow.offsetY ?? 0
            }
        }
    }

    private async getPlayerSprite(engine: Engine, baseSprite: Sprite) {
        const itemHandler = engine.itemHandler
        const appearance = this.equip.map(eq => new EquipmentSprite(
            itemHandler.getEquipSprite(eq[0]), // preloaded sprite sheet
            eq[1] // slot
        ))

        const playerSprite = new PlayerSprite(engine, baseSprite)
        await playerSprite.setAppearanceValues(appearance)
        return playerSprite.sprite
    }

    public async getSprite(engine: Engine) {
        if (this.sprite != null) {
            return this.sprite
        }

        const texture = await loadTexture(engine.gl, this.spritePath)
        const baseSprite = new Sprite(engine, texture)

        if (this.equip.length == 0) {
            this.sprite = baseSprite;
            return baseSprite;
        }

        this.sprite = await this.getPlayerSprite(engine, baseSprite)
        return this.sprite
    }

}