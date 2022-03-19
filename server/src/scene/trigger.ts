
import { Player } from "../player/player";
import { actionHandler } from "../world";
import { MapId } from "./map-id";

/**
 * A tile that triggers an action when it is walked on
 */
export abstract class Trigger {

    public abstract walked(p: Player): void

}

export class WarpTrigger extends Trigger {
    
    private readonly mapId: MapId
    private readonly x: number
    private readonly y: number

    constructor(mapId: MapId, x: number, y: number) {
        super()

        this.mapId = mapId
        this.x = x
        this.y = y
    }

    public walked(p: Player) {
        p.goTo(this.mapId, this.x, this.y)
    }

}

export class SpecialTrigger extends Trigger {

    private readonly action: string

    constructor(action: string) {
        super()
        this.action = action
    }

    public walked(p: Player) {
        actionHandler.tileTrigger(p, this.action)
    }

}
