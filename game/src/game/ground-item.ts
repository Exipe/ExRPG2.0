
import { Item, Engine } from "exrpg";

export class GroundItem extends Item {

    public readonly id: number

    constructor(engine: Engine, id: number, dataId: string, tileX: number, tileY: number) {
        super(engine, engine.itemHandler.get(dataId), tileX, tileY)
        this.id = id
    }

}