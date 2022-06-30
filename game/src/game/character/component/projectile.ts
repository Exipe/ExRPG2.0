import { Entity, Sprite, translation } from "exrpg";
import { Component } from "exrpg/dist/entity/component";

function GenerateId() {
    const number = Math.floor(Math.random() * 1_000_000_000);
    return `PROJECTILE:${number}`;
}

const PIXEL_OFFSET = 12;

export class ProjectileComponent extends Component {
    private readonly startX: number;
    private readonly startY: number;
    private readonly delay: number;

    private readonly entity: Entity;
    private sprite: Sprite = null;

    private timer = 0;

    constructor(spritePromise: Promise<Sprite>, entity: Entity, subject: Entity, delay: number) {
        super(GenerateId());
        this.entity = entity;

        const [x, y] = subject.centerCoords;
        this.startX = x;
        this.startY = y;
        this.delay = delay;

        spritePromise.then(sprite => this.sprite = sprite);
    }

    animate(dt: number): void {
        this.timer += dt;

        if(this.timer >= this.delay) {
            this.entity.componentHandler.remove(this.id);
        }
    }

    postDraw(): void {
        const {startX, startY, timer, delay, entity, sprite} = this;
        const [x2, y2] = entity.centerCoords;

        if(sprite == null) {
            return;
        }

        const dx = x2-startX;
        const dy = y2-startY;
        const length = Math.sqrt(dx*dx+dy*dy);
        const initialOffset = PIXEL_OFFSET / length;
        const offset = initialOffset + (timer / delay) * (1-initialOffset);
        const rotation = Math.atan2(x2-startX, startY-y2) * 180 / Math.PI;

        const matrix = translation(-sprite.width / 2, -sprite.height / 2)
        .rotate(rotation)
        .translate(startX + dx*offset, startY + dy*offset);

        this.sprite.drawMatrix(matrix);
    }

}