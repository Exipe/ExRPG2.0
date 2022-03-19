import { OutgoingItem, UpdateInventoryPacket } from "../../connection/outgoing-packet"
import { Player } from "../../player/player"
import { Container } from "./container"

export const INVENTORY_SIZE = 30

export class Inventory extends Container {

    private readonly player: Player

    constructor(player: Player) {
        super(INVENTORY_SIZE)
        this.player = player
    }

    public update() {
        const itemIds = this.items.map(item => (
            item != null ? ([item.id, item.amount] as OutgoingItem) : null
        ))
        this.player.send(new UpdateInventoryPacket(itemIds))
    }

}
