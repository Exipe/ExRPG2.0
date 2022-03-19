
import { OutgoingItem, UpdateBankPacket } from "../../connection/outgoing-packet"
import { Player } from "../../player/player"
import { Container } from "./container"

export const BANK_SIZE = 48

export const MAX_STACK = 1000_000_000

export class Bank extends Container {

    private readonly player: Player

    constructor(player: Player) {
        super(BANK_SIZE)
        this.player = player
    }

    public update() {
        const itemIds = this.items.map(item => (
            item != null ? ([item.id, item.amount] as OutgoingItem) : null
        ))
        this.player.send(new UpdateBankPacket(itemIds))
    }

    protected maxStack(_: string) {
        return MAX_STACK
    }

}
