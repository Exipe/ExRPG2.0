
import { ItemData } from "exrpg"
import { ItemHandler } from "exrpg/dist/item/item-handler"
import { Connection } from "../../../connection/connection"
import { ConfirmBuyPacket, ConfirmSellPacket, SelectBuyPacket, SelectSellPacket } from "../../../connection/packet"
import { PrimaryWindow } from "../../game"
import { Observable } from "../../../util/observable"

export class Shop {

    public readonly name: string
    public readonly items: ItemData[]

    constructor(name: string, items: ItemData[]) {
        this.name = name
        this.items = items
    }

}

export class ShopSelect {

    public readonly slot: number

    public readonly item: ItemData
    public readonly currency: ItemData
    public readonly price: number

    constructor(slot: number, item: ItemData, currency: ItemData, price: number) {
        this.slot = slot
        this.item = item
        this.currency = currency
        this.price = price
    }

}

export class ShopModel {

    private readonly primaryWindow: Observable<PrimaryWindow>
    private readonly connection: Connection

    public readonly observable = new Observable<Shop>()
    public readonly selectedBuy = new Observable<ShopSelect>()
    public readonly selectedSell = new Observable<ShopSelect>()

    constructor(primaryWindow: Observable<PrimaryWindow>, connection: Connection) {
        this.primaryWindow = primaryWindow
        this.connection = connection
    }

    public open(shop: Shop) {
        this.observable.value = shop
        this.selectedBuy.value = null
        this.selectedSell.value = null
        this.primaryWindow.value = "Shop"
    }

    public close() {
        this.primaryWindow.value = "None"
    }

    public selectBuy(slot: number) {
        this.connection.send(new SelectBuyPacket(slot))
    }

    public confirmBuy(amount: number) {
        const selected = this.selectedBuy.value
        this.selectedBuy.value = null
        this.connection.send(new ConfirmBuyPacket(selected.slot, amount))
    }

    public selectSell(slot: number) {
        this.connection.send(new SelectSellPacket(slot))
    }

    public confirmSell(amount: number) {
        const selected = this.selectedSell.value
        this.selectedSell.value = null
        this.connection.send(new ConfirmSellPacket(selected.item.id, amount))
    }

}