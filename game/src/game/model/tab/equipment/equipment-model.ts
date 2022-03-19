
import { Connection } from "../../../../connection/connection";
import { ItemData } from "exrpg";
import { SpendPointsPacket, UnequipItemPacket } from "../../../../connection/packet";
import { AttribId, Attributes } from "./attributes";
import { Observable } from "../../../../util/observable";

export class EquipmentModel {

    private readonly connection: Connection

    public readonly equippedItems = new Observable(new Map<string, ItemData>())

    public readonly attributes = new Observable(new Attributes())

    constructor(connection: Connection) {
        this.connection = connection
    }

    public spendPoints(points: [AttribId, number][]) {
        this.connection.send(new SpendPointsPacket(points))
    }

    public unequipItem(id: string, slot: string) {
        this.connection.send(new UnequipItemPacket(id, slot))
    }

}