import { Container } from "../../item/container/container";
import { Colors } from "../../util/color";
import { currentTime, timeSince } from "../../util/util";
import { Player } from "../player";
import { TradeContainer, TRADE_SIZE } from "./trade-container";
import { TradeScreen } from "./trade-screen";

interface Participant {
    player: Player
    container: Container
    accepted: boolean
}

const FAIL_MESSAGE_SELF = "You do not have enough inventory space to make this trade"
const FAIL_MESSAGE_OTHER = "Other player did not have enough inventory space"

const COOLDOWN = 5_000

export class TradeSession {

    private readonly participantA: Participant
    private readonly participantB: Participant

    private get playerA() { return this.participantA.player }
    private get playerB() { return this.participantB.player }

    private get containerA() { return this.participantA.container }
    private get containerB() { return this.participantB.container }

    private lastUpdate: number

    private getParticipant(player: Player) {
        if(this.playerA == player) {
            return this.participantA
        } else if(this.playerB == player) {
            return this.participantB
        }

        throw new Error(`Participant "${player.name}" not in trade`)
    }

    private getOppositeParticipant(player: Player) {
        if(this.playerA == player) {
            return this.participantB
        } else if(this.playerB == player) {
            return this.participantA
        }

        throw new Error(`Participant "${player.name}" not in trade`)
    }

    constructor(playerA: Player, playerB: Player) {
        this.participantA = {
            player: playerA,
            container: new TradeContainer(playerA, playerB, this),
            accepted: false
        }

        this.participantB = {
            player: playerB,
            container: new TradeContainer(playerB, playerA, this),
            accepted: false
        }
    }

    public updated() {
        this.lastUpdate = currentTime()
        this.participantA.accepted = false
        this.participantB.accepted = false
    }

    public start() {
        this.playerA.window = new TradeScreen(this.containerA, this, this.playerB.name)
        this.playerB.window = new TradeScreen(this.containerB, this, this.playerA.name)

        // start inventory transaction
        this.playerA.windowInventory("Trade").startTransaction()
        this.playerB.windowInventory("Trade").startTransaction()
    }

    public stop() {
        this.playerA.closeWindow("Trade")
        this.playerB.closeWindow("Trade")
    }

    private finalizeTrade() {
        let success = true

        const inventoryA = this.playerA.windowInventory("Trade")
        const inventoryB = this.playerB.windowInventory("Trade")

        for(let i = 0; i < TRADE_SIZE; i++) {
            const itemA = this.containerA.get(i)
            const itemB = this.containerB.get(i)

            if(itemB != null && 
                inventoryA.add(itemB.id, itemB.amount) > 0)
            {
                success = false
                this.playerA.sendMessage(`${Colors.red}`, FAIL_MESSAGE_SELF)
                this.playerB.sendMessage(`${Colors.red}`, FAIL_MESSAGE_OTHER)
                break
            }

            if(itemA != null &&
                inventoryB.add(itemA.id, itemA.amount) > 0) 
            {
                success = false
                this.playerB.sendMessage(`${Colors.red}`, FAIL_MESSAGE_SELF)
                this.playerA.sendMessage(`${Colors.red}`, FAIL_MESSAGE_OTHER)
                break
            }
        }

        if(!success) {
            this.containerA.empty()
            this.containerB.empty()
            inventoryA.revert()
            inventoryB.revert()
            return
        }

        this.playerA.sendMessage(`${Colors.green}`, "Trade complete")
        this.playerB.sendMessage(`${Colors.green}`, "Trade complete")

        inventoryA.commit()
        inventoryB.commit()
        this.stop()
    }

    public accept(player: Player) {
        if(timeSince(this.lastUpdate) < COOLDOWN) {
            player.sendMessage(`${Colors.yellow}`, "The trade just changed. Please wait a few seconds.")
            return
        }

        this.getParticipant(player).accepted = true
        const opposite = this.getOppositeParticipant(player)

        if(opposite.accepted) {
            try {
                this.finalizeTrade()
            } catch(e) {
                this.stop()
                throw e
            }
        } else {
            opposite.player.sendMessage(`${Colors.yellow}`, "Other player has accepted the trade")
        }
    }

}