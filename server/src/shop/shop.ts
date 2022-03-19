
import { SelectBuyPacket, SelectSellPacket, ShopPacket } from "../connection/outgoing-packet";
import { ItemData } from "../item/item-data";
import { itemDataHandler, playerHandler } from "../world";
import { Player } from "../player/player";
import { PrimaryWindow } from "../player/window/p-window";

export class Shop implements PrimaryWindow {

    public readonly id = "Shop"

    private readonly name: string
    private readonly items: ItemData[]

    private readonly buyFactor: number
    private readonly sellFactor: number

    /**
     * @param name name of the shop
     * @param items items that are offered in shop
     * @param buyFactor a factor that is added to the price, when player buys
     * @param sellFactor a factor that is added to the value, when player sells
     */
    constructor(name: string, items: ItemData[], buyFactor=1.25, sellFactor=0.75) {
        this.name = name
        this.items = items
        this.buyFactor = buyFactor
        this.sellFactor = sellFactor
    }

    private buyPrice(item: ItemData) {
        return Math.ceil(item.value*this.buyFactor)
    }

    private sellValue(item: ItemData) {
        return Math.floor(item.value*this.sellFactor)
    }

    public open(p: Player) {
        p.send(new ShopPacket(this.name, this.items.map(i => i.id)))
    }

    public selectBuy(p: Player, slot: number) {
        if(slot >= this.items.length) {
            return
        }

        const item = this.items[slot]
        const price = this.buyPrice(item)
        p.send(new SelectBuyPacket(slot, item.id, "coins", price))
    }

    public buy(p: Player, slot: any, amount: any) {
        if(slot >= this.items.length) {
            return
        }

        const item = this.items[slot]
        //p.sendMessage(`Buying ${amount}x ${item.name}`) 

        const inv = p.windowInventory('Shop')
        const money = inv.count('coins')

        const price = this.buyPrice(item)
        const affords = Math.floor(money / price)
        amount = Math.min(amount, affords)
        if(amount == 0) {
            p.sendMessage("You can't afford that")
            return
        }

        amount -= inv.addData(item, amount, false)
        inv.remove('coins', amount*price)
    }

    public selectSell(p: Player, slot: any) {
        const item = p.windowInventory('Shop').get(slot)
        let value: number
        if(item == null || (value=this.sellValue(item.data)) == 0) {
            return
        }

        p.send(new SelectSellPacket(slot, item.id, "coins", value))
    }

    sell(p: Player, item: ItemData, amount: any) {
        //p.sendMessage(`Selling ${amount}x ${item.name}`)

        const inv = p.windowInventory('Shop')
        amount -= inv.removeData(item, amount, false)
        if(amount == 0) {
            p.sendMessage("Could not find item")
            return
        }

        inv.add('coins', amount*this.sellValue(item))
    }

}