
import { Connection } from "../../../connection/connection"

import { MoveItemPacket, UseItemPacket } from "../../../connection/packet"
import { Game } from "../../game"
import { ContainerModel, Item, StorageContainerModel } from "../container-model"

export function initInventory(game: Game) {
    const connection = game.connection
    const engine = game.engine

    connection.on("INVENTORY", (data: [string, number][]) => {
        const items: Item[] = data.map(item => (
            item != null ? [engine.itemHandler.get(item[0]), item[1]] : null
        ))
        game.inventory.observable.value = new ContainerModel(items)
    })
}

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