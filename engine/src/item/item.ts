
import { Engine, ItemData, Sprite, TILE_SIZE } from "..";
import { Hoverable } from "../hoverable";

export class Item implements Hoverable {

    public readonly data: ItemData
    public readonly x: number
    public readonly y: number

    private sprite: Sprite = null

    private outline = false

    constructor(engine: Engine, itemData: ItemData, x: number, y: number) {
        this.data = itemData
        this.x = x
        this.y = y

        itemData.getSprite(engine)
        .then(sprite => this.sprite = sprite)
    }

    startHover(): void {
        this.outline = true
    }
    
    stopHover(): void {
        this.outline = false
    }

    public inClickBox(x: number, y: number) {
        return Math.floor(x / TILE_SIZE) == this.x && Math.floor(y / TILE_SIZE) == this.y
    }

    public draw(engine: Engine) {
        if(this.sprite == null) {
            return
        }

        const drawX = (this.x + 0.5) * TILE_SIZE - Math.floor(0.5 * this.sprite.width)
        const drawY = (this.y + 0.5) * TILE_SIZE - Math.floor(0.5 * this.sprite.height)
        this.sprite.draw(drawX, drawY)

        if(!this.outline) {
            return
        }

        const shader = engine.shaderHandler.useOutlineShader()
        shader.setColor([1, 1, 1, 1])
        this.sprite.draw(drawX, drawY, shader)
    }

}