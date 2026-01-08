
import { Entity, feetCoords } from "exrpg"

export class Walking {
    private readonly entity: Entity;
    private readonly goalX: number;
    private readonly goalY: number;

    private readonly speedX: number;
    private readonly speedY: number;

    private readonly startX: number;
    private readonly startY: number;

    private animationSpeed: number;
    private timer = 0;

    constructor(entity: Entity, goalX: number, goalY: number, animationSpeed: number) {
        this.entity = entity;
        this.goalX = goalX;
        this.goalY = goalY;

        this.startX = entity.feetX;
        this.startY = entity.feetY;
        this.animationSpeed = animationSpeed;

        const goalCoords = feetCoords(entity, goalX, goalY);
        this.speedX = (goalCoords[0] - this.startX) / animationSpeed;
        this.speedY = (goalCoords[1] - this.startY) / animationSpeed;
    }

    animate(dt: number) {
        const en = this.entity;

        this.timer += dt;
        if(this.timer >= this.animationSpeed) {
            en.moveTile(this.goalX, this.goalY);
            return true;
        }

        en.moveFeet(
            this.startX + this.speedX * this.timer, 
            this.startY + this.speedY * this.timer
        );
        return false;
    }
}
