import { Entity, ITEM_SIZE, Sprite, TILE_SIZE, translation } from "exrpg";
import { Component } from "exrpg/dist/entity/component";

export const ITEM_SWING_COMPONENT = "ITEM_SWING"

const SWING_DEGREES = 90 / 2
const CENTER_OFFSET = ITEM_SIZE / 2

export class ItemSwingComponent extends Component {

    private readonly entity: Entity

    private sprite: Sprite = null
    private readonly duration: number

    private timer = 0
    private speed: number

    private readonly initialRotation: number
    private readonly offsetX: number
    private readonly offsetY: number

    constructor(spritePromise: Promise<Sprite>, entity: Entity, offX: number, offY: number, duration: number) {
        super(ITEM_SWING_COMPONENT)
        this.entity = entity
        this.duration = duration
        this.speed = (SWING_DEGREES * 2) / duration

        if (offY == -1) {
            this.initialRotation = 45 * offX
        } else if (offY == 0) {
            this.initialRotation = 90 * offX
        } else if (offY == 1) {
            this.initialRotation = 180 + offX * -45
        }

        // Calculate vector length
        const length = Math.sqrt(offX * offX + offY * offY);

        // If the length is greater than 1, normalize it
        if (length > 1) {
            offX /= length;
            offY /= length;
        }

        this.offsetX = offX * TILE_SIZE
        this.offsetY = offY * TILE_SIZE

        spritePromise.then(sprite => this.sprite = sprite)
    }

    animate(dt: number) {
        this.timer += dt

        if (this.timer >= this.duration) {
            this.entity.componentHandler.remove(ITEM_SWING_COMPONENT)
        }
    }

    postDraw() {
        if (this.sprite == null) {
            return
        }

        const swungDegrees = -SWING_DEGREES + this.timer * this.speed
        const matrix = translation(-CENTER_OFFSET, -CENTER_OFFSET)
            .rotate(this.initialRotation)
            .translate(this.offsetX, this.offsetY)
            .rotate(swungDegrees)
            .translate(this.entity.feetX + CENTER_OFFSET, this.entity.feetY + CENTER_OFFSET)

        this.sprite.drawMatrix(matrix)
    }

} 