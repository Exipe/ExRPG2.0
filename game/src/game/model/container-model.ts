import { ItemData } from "exrpg"
import { Observable } from "../../util/observable"

export type ItemModel = [ItemData, number]

export class ContainerModel {
    
    public readonly items: ItemModel[]

    public count(item: ItemData) {
        return this.items.reduce((sum, current) => (
            sum + (current != null && current[0] == item ? current[1] : 0)), 0)
    }

    constructor(items: ItemModel[]) {
        this.items = items
    }

}

export type StorageId = "inventory" | "bank" | "trade"

export abstract class StorageContainerModel {

    public readonly observable = new Observable<ContainerModel>(new ContainerModel([]))

    public abstract moveItem(fromSlot: number, toSlot: number): void

    public abstract get id(): StorageId

}
