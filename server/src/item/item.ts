
import { ItemData } from "./item-data";
import { itemDataHandler } from "../world";

export class Item {

    public readonly data: ItemData
    private readonly maxStack: number
    private _amount: number

    constructor(id: string | ItemData, amount = 1, maxStack: number) {
        if(typeof id == "string") {
            id = itemDataHandler.get(id)
        }

        if(id == null) {
            throw "Must provide a valid item id"
        }

        if(amount <= 0) {
            throw "Must provide a positive amount"
        }

        this.data = id
        this._amount = amount

        this.maxStack = maxStack
    }

    public get copy() {
        return new Item(this.data, this.amount, this.maxStack)
    }

    public get amount() {
        return this._amount
    }

    public get id() {
        return this.data.id
    }

    public get equipable() {
        return this.data.equipable
    }

    public add(add: number) {
        if(add <= 0) {
            throw "Amount must be positive"
        }

        const holds = this.maxStack - this._amount
        this._amount += Math.min(add, holds)

        return add - holds
    }

    public remove(remove: number) {
        if(remove <= 0) {
            throw "Amount must be positive"
        }

        const remaining = remove - this._amount
        this._amount -= remove

        return remaining
    }

}