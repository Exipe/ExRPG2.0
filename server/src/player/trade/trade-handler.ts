import { Colors } from "../../util/color";
import { Player } from "../player";
import { TradeScreen } from "./trade-screen";
import { TradeSession } from "./trade-session";

export class TradeHandler {

    private readonly player: Player

    constructor(player: Player) {
        this.player = player
    }

    private outgoingRequest: TradeHandler
    private incomingRequest: TradeHandler

    private stop() {
        this.outgoingRequest = null
        this.incomingRequest = null
    }

    private start(otherTh: TradeHandler) {
        this.stop()
        otherTh.stop()

        if(!this.player.isAdjacent(otherTh.player)) {
            this.player.sendMessage(`${Colors.yellow}`, 'You are too far away to trade.')
            return
        }

        const session = new TradeSession(this.player, otherTh.player)
        session.start()
    }

    public trade(otherTh: TradeHandler) {
        if(this.incomingRequest != null && this.incomingRequest == otherTh) {
            this.start(otherTh)
            return
        } else if(otherTh.outgoingRequest != null && otherTh.outgoingRequest == this) {
            this.start(otherTh)
            return
        }

        const player = this.player
        const other = otherTh.player
        player.sendMessage(`${Colors.yellow} {}`, 'Sending trade request to:', other.name)
        this.outgoingRequest = otherTh

        other.sendMessage(`${Colors.yellow} {}`, 'Incoming trade request from:', player.name)
        other.sendMessage(`${Colors.yellow} '{}' ${Colors.yellow}`, 'Type', '/accept', 'to accept the request.')
        otherTh.incomingRequest = this
    }

    public acceptRequest() {
        if(this.incomingRequest == null) {
            this.player.sendMessage(Colors.yellow, 'You have no pending trade requests.')
            return
        }

        this.trade(this.incomingRequest)
    }

}