import { Entity, ITEM_SIZE, Sprite, translation } from "exrpg";
import { Component } from "exrpg/dist/entity/component";

export const ITEM_POINT_COMPONENT = "ITEM_POINT";

export class ItemPointComponent extends Component {

    private readonly entity: Entity;
    private readonly target: Entity;

    private sprite: Sprite = null;

    constructor(spritePromise: Promise<Sprite>, entity: Entity, target: Entity) {
        super(ITEM_POINT_COMPONENT);
        spritePromise.then(sprite => this.sprite = sprite);
        this.entity = entity;
        this.target = target;
    }

    postDraw() {
        const { entity, target, sprite } = this;
        const [x, y] = entity.centerCoords;
        const [x2, y2] = target.centerCoords;

        if(sprite == null) {
            return;
        }

        const angle = Math.atan2(x2-x, y-y2) * 180 / Math.PI;

        const matrix = translation(-sprite.width / 2, -ITEM_SIZE -sprite.height / 2)
        .rotate(angle)
        .translate(x, y);

        this.sprite.drawMatrix(matrix);
    }

}