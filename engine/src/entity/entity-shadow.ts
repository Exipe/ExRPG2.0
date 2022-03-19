
import { Entity, Sprite, translation } from "..";
import { EntityShadowShader } from "../shader/entity-shadow-shader";

const ROTATION = 30

export interface ShadowData {
    offsetX: number,
    offsetY: number
}

export class EntityShadow {

    private readonly entity: Entity
    private readonly sprite: Sprite

    private readonly offsetX: number;
    private readonly offsetY: number;

    constructor(entity: Entity, sprite: Sprite, shadowData: ShadowData) {
        this.entity = entity
        this.sprite = sprite
        this.offsetX = shadowData.offsetX
        this.offsetY = shadowData.offsetY
    }

    draw(shader: EntityShadowShader) {
        this.sprite.draw(this.entity.drawX, this.entity.drawY, shader)
    }

    drawShadow(shader: EntityShadowShader) {
        const matrix = translation(-this.sprite.width, -this.sprite.height)
        .rotate(ROTATION)
        .translate(
            this.entity.drawX + this.sprite.width + this.offsetX, 
            this.entity.drawY + this.sprite.height + this.offsetY)
        
        this.sprite.drawMatrix(matrix, shader)
    }

}