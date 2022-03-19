import { UpdateTradePacket } from "../../connection/outgoing-packet";
import { Container } from "../../item/container/container";
import { Player } from "../player";
import { TradeSession } from "./trade-session";

export const TRADE_SIZE = 16

export class TradeContainer extends Container {

    private readonly self: Player
    private readonly other: Player

    private readonly session: TradeSession

    constructor(self: Player, other: Player, session: TradeSession) {
        super(TRADE_SIZE)
        this.self = self
        this.other = other
        this.session = session
    }

    public update() {
        this.session.updated()

        const items = this.outgoingItems
        // send update to self
        this.self.send(new UpdateTradePacket(items, "self"))

        // send update to other
        this.other.send(new UpdateTradePacket(items, "other"))
    }

}