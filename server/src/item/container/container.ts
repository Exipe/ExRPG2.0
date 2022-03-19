
import { OutgoingItem } from "../../connection/outgoing-packet"
import { itemDataHandler } from "../../world"
import { Item } from "../item"
import { ItemData } from "../item-data"

export abstract class Container {

    public readonly size: number

    protected readonly items: Item[]

    protected previousState = null as Item[]

    constructor(size: number) {
        this.size = size
        this.items = []
        for(let i = 0; i < size; i++) {
            this.items.push(null)
        }
    }

    /**
     * creates a record of the current state,
     * that can be reverted back to
     */
    public startTransaction() {
        this.previousState = this.items.map(i => i != null ? i.copy : null)
    }

    /**
     * reverts back to a previously recorded state
     * 
     * @param update whether to inform the client
     */
    public revert(update = true) {
        if(this.previousState == null) {
            return
        }

        this.previousState.forEach((item, idx) => {
            this.items[idx] = item
        })
        this.previousState = null

        if(update) {
            this.update()
        }
    }

    /**
     * removes any recorded state
     */
    public commit() {
        this.previousState = null
    }

    public get outgoingItems() {
        return this.items.map(item => (
            item != null ? ([item.id, item.amount] as OutgoingItem) : null
        ))
    }

    protected maxStack(item: string) {
        return itemDataHandler.get(item).stack
    }

    public transfer(slot: number, target: Container) {
        const item = this.emptySlot(slot, false)
        const remaining = target.add(item.id, item.amount, false)
        if(remaining > 0) {
            this.addData(item.data, remaining, false)
        }

        this.update()
        target.update()
    }

    public transferAmount(itemId: string, amount: number, target: Container) {
        const remainingRemove = this.remove(itemId, amount, false)
        amount -= remainingRemove
        
        const remaining = target.add(itemId, amount, false)
        if(remaining > 0) {
            this.add(itemId, remaining, false)
        }

        this.update()
        target.update()
    }

    public empty(update = true) {
        for(let i = 0; i < this.size; i++) {
            this.items[i] = null
        }

        if(update) {
            this.update()
        }
    }

    public hasItem(itemId: string) {
        return this.items.find(i => i != null && i.id == itemId) != null
    }

    public hasSpace() {
        for(let i = 0; i < this.size; i++) {
            if(this.items[i] == null) {
                return true
            }
        }

        return false
    }

    public abstract update(): void

    private checkRange(slot: number) {
        if(slot < 0 || slot >= this.size) {
            throw `Slot must be in range of 0-${this.size}` 
        }
    }

    public set(slot: number, id: string, amount: number, update = true) {
        this.checkRange(slot)
        this.items[slot] = new Item(id, amount, this.maxStack(id))

        if(update) {
            this.update()
        }
    }

    public get(slot: number) {
        this.checkRange(slot)

        return this.items[slot]
    }

    public getSave(slot: number) {
        this.checkRange(slot)

        return (this.previousState != null 
            ? this.previousState : this.items)[slot]
    }

    public emptySlot(slot: number, update = true) {
        this.checkRange(slot)
        
        const item = this.items[slot]
        this.items[slot] = null
        
        if(update) {
            this.update()
        }

        return item
    }

    public swap(fromSlot: number, toSlot: number, update = true) {
        this.checkRange(fromSlot)
        this.checkRange(toSlot)

        const temp = this.items[fromSlot]
        this.items[fromSlot] = this.items[toSlot]
        this.items[toSlot] = temp

        if(update) {
            this.update()
        }
    }

    public count(id: string) {
        return this.items.reduce((previous, current) => (
            previous + (current != null && current.id == id ? current.amount : 0)), 0)
    }

    public add(id: string, amount: number, update = true) {
        const itemData = itemDataHandler.get(id)
        if(itemData == null) {
            throw `Invalid item ID: ${id}`
        }

        return this.addData(itemData, amount, update)
    }

    public addData(itemData: ItemData, amount: number, update = true) {
        if(amount <= 0) {
            throw "Can't add a negative number of items"
        }

        if(this.maxStack(itemData.id) > 1) {
            amount = this.addPhaseA(itemData, amount)
        }

        amount = this.addPhaseB(itemData, amount)

        if(update) {
            this.update()
        }
        return amount
    }

    /*
    In phase A we search for existing stacks of the item, and add to those
    Returns the amount that didn't fit into existing stacks
    - This phase can be skipped for non-stackable items -
    */
    private addPhaseA(itemData: ItemData, amount: number) {
        for(let i = 0; i < this.size; i++) {
            if(amount <= 0) {
                return 0
            }

            const stack = this.items[i]
            if(stack == null || stack.id != itemData.id) {
                continue
            }

            amount = stack.add(amount)
        }

        return amount
    }

    /*
    In phase B we search for empty slots and add the item there
    Returns the amount that did not fit
    */
    private addPhaseB(itemData: ItemData, amount: number) {
        for(let i = 0; i < this.size; i++) {
            if(amount <= 0) {
                return 0
            }

            if(this.items[i] != null) {
                continue
            }

            const maxStack = this.maxStack(itemData.id)
            const item = new Item(itemData, Math.min(amount, maxStack), maxStack)
            amount -= item.amount
            this.items[i] = item
        }

        return amount
    }

    public tryRemove(id: string, amount: number, update = true) {
        return this.remove(id, amount, update) == 0
    }

    public remove(id: string, amount: number, update = true) {
        const itemData = itemDataHandler.get(id)
        if(itemData == null) {
            throw `Invalid item ID: ${id}`
        }

        return this.removeData(itemData, amount, update)
    }

    public removeData(itemData: ItemData, amount: number, update = true) {
        if(amount <= 0) {
            throw "Can't remove a negative number of items"
        }

        amount = this.removePhaseA(itemData, amount)
        if(amount > 0 && this.maxStack(itemData.id) > 1) {
            amount = this.removePhaseB(itemData, amount)
        }

        if(update) {
            this.update()
        }
        return amount
    }

    /*
    In phase A we search for stacks that can be exhausted
    Ie. stack.amount <= amount
    Returns the amount that could not be removed by exhausting stacks
    */
    private removePhaseA(itemData: ItemData, amount: number) {
        for(let i = 0; i < this.size; i++) {
            if(amount <= 0) {
                return 0
            }

            const stack = this.items[i]
            if(stack != null && stack.id == itemData.id && stack.amount <= amount) {
                amount -= stack.amount
                this.items[i] = null
            }
        }

        return amount
    }

    /*
    In phase B we look for any stack of the item and remove as much as possible from that
    If any stack remains from phase A that must mean stack.amount > amount
    Returns the amount that could not be removed
    - This phase can be skipped for non-stackable items -
    */
    private removePhaseB(itemData: ItemData, amount: number) {
        for(let i = 0; i < this.size; i++) {
            const stack = this.items[i]
            if(stack == null || stack.id != itemData.id) {
                continue
            }

            stack.remove(amount)
            return 0
        }

        return amount
    }

}
