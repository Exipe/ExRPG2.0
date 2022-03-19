
import { Entity, feetCoords } from "exrpg"

export class Walking {

    private readonly entity: Entity
    private readonly goalX: number
    private readonly goalY: number

    private readonly speedX: number
    private readonly speedY: number

    private timer: number

    constructor(entity: Entity, goalX: number, goalY: number, animationSpeed: number) {
        this.entity = entity
        this.goalX = goalX
        this.goalY = goalY
        this.timer = animationSpeed

        const goalCoords = feetCoords(entity, goalX, goalY)
        this.speedX = (goalCoords[0] - entity.feetX) / animationSpeed
        this.speedY = (goalCoords[1] - entity.feetY) / animationSpeed
    }

    animate(dt: number) {
        const en = this.entity

        this.timer -= dt
        if(this.timer <= 0) {
            en.moveTile(this.goalX, this.goalY)
            return true
        }

        en.moveFeet(en.feetX + this.speedX * dt, en.feetY + this.speedY * dt)
        return false
    }

}