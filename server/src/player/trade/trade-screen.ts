import { OpenTradePacket } from "../../connection/outgoing-packet";
import { Container } from "../../item/container/container";
import { Player } from "../player";
import { PrimaryWindow } from "../window/p-window";
import { TradeSession } from "./trade-session";

export class TradeScreen implements PrimaryWindow {

    public readonly id = "Trade"

    public readonly container: Container
    private readonly session: TradeSession
    private readonly otherPlayer: string

    public constructor(container: Container, session: TradeSession, otherPlayer: string) {
        this.container = container
        this.session = session
        this.otherPlayer = otherPlayer
    }

    public open(p: Player) {
        p.send(new OpenTradePacket(this.otherPlayer))
    }

    public close(p: Player) {
        p.inventory.revert()
        this.session.stop()
    }

    public accept(p: Player) {
        this.session.accept(p)
    }

}