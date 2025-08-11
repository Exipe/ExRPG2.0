
import { Entity } from "../entity/entity";
import { NpcData } from "./npc-data";
import { Sprite, Engine, OutlineComponent } from "..";
import { InputHandler } from "../input-handler";
import { EntityShadow } from "../entity/entity-shadow";

export class NpcEntity extends Entity {

    public readonly data: NpcData

    private sprite: Sprite = null

    constructor(engine: Engine, npcData: NpcData, tileX: number, tileY: number) {
        super(tileX, tileY, 0, 0, npcData.width);
        this.flat = npcData.flat;
        this.data = npcData;

        npcData.getSprite(engine)
        .then(sprite => {
            this.sprite = sprite
            this.setDimensions(sprite.width, sprite.height)
            this.componentHandler.add(new OutlineComponent(sprite, engine.shaderHandler))

            if(npcData.shadowData != null) {
                this.shadow = new EntityShadow(this, sprite, npcData.shadowData)
            }
        })
    }

    public get interactable() {
        return this.data.options.length > 0
    }

    protected onClick(inputHandler: InputHandler) {
        if(inputHandler.onNpcClick != null) {
            inputHandler.onNpcClick(this)
            return true
        }

        return false
    }

    protected onContext(inputHandler: InputHandler) {
        if(inputHandler.onNpcContext != null) {
            inputHandler.onNpcContext(this)
        }
    }

    public draw() {
        if(this.sprite == null) {
            return
        }

        this.sprite.draw(this.drawX, this.drawY)
    }
    
}