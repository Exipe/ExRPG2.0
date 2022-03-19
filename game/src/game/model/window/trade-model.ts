import { Connection } from "../../../connection/connection"
import { TradeStatusPacket, MoveItemPacket, TransferPacket } from "../../../connection/packet"
import { Observable } from "../../../util/observable"
import { PrimaryWindow } from "../../game"
import { ContainerModel, StorageContainerModel } from "../container-model"

class TradeOfferModel extends StorageContainerModel {

    private readonly connection: Connection

    public readonly observable = new Observable<ContainerModel>()

    public readonly id = "trade"

    constructor(connection: Connection) {
        super()
        this.connection = connection
    }

    public moveItem(fromSlot: number, toSlot: number) {
        this.connection.send(new MoveItemPacket(this.id, fromSlot, toSlot))
    }

}

const COOLDOWN = 5000

export class TradeModel {

    public readonly otherPlayer = new Observable("")

    private readonly connection: Connection

    private readonly primaryWindow: Observable<PrimaryWindow>

    public readonly tradeOffer: TradeOfferModel
    public readonly otherOffer = new Observable<ContainerModel>()

    private timer: NodeJS.Timeout = null
    public readonly recentChange = new Observable(false)

    private update() {
        this.recentChange.value = true

        if(this.timer != null) {
            clearTimeout(this.timer)
        }

        this.timer = setTimeout(() => this.recentChange.value = false, COOLDOWN)
    }

    constructor(primaryWindow: Observable<PrimaryWindow>, connection: Connection) {
        this.primaryWindow = primaryWindow
        this.connection = connection
        this.tradeOffer = new TradeOfferModel(connection)

        this.tradeOffer.observable.register(() => this.update())
        this.otherOffer.register(() => this.update())
    }

    public open(otherPlayer: string) {
        this.otherPlayer.value = otherPlayer

        this.otherOffer.value = new ContainerModel([])
        this.tradeOffer.observable.value = new ContainerModel([])

        this.primaryWindow.value = "Trade"
    }

    public offer(item: string, slot: number, amount?: number) {
        this.connection.send(new TransferPacket("inventory", "trade", item, slot, amount))
    }

    public remove(item: string, slot: number, amount?: number) {
        this.connection.send(new TransferPacket("trade", "inventory", item, slot, amount))
    }

    public accept() {
        this.connection.send(new TradeStatusPacket("accept"))
    }

    public decline() {
        this.connection.send(new TradeStatusPacket("decline"))
    }

}