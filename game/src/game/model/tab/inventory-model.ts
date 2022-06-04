
import { Connection } from "../../../connection/connection"

import { MoveItemPacket, UseItemPacket } from "../../../connection/packet"
import { StorageContainerModel } from "../container-model"

const INVENTORY_SIZE = 30

export class InventoryModel extends StorageContainerModel {

    private readonly connection: Connection

    public readonly id = "inventory"

    constructor(connection: Connection) {
        super()
        this.connection = connection

        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this.observable.value.items.push(null)
        }
    }

    public moveItem(fromSlot: number, toSlot: number) {
        this.connection.send(new MoveItemPacket(this.id, fromSlot, toSlot))
    }

    public useItem(action: string, id: string, slot: number) {
        this.connection.send(new UseItemPacket(action, id, slot))
    }

}