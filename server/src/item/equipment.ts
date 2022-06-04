
import { ItemData } from "./item-data";
import { Player } from "../player/player";
import { UpdateEquipmentPacket } from "../connection/outgoing-packet";
import { itemDataHandler } from "../world";

/*
Do note that the order in this list, is the order the equipment will be sent on appearance updates
*/
export const equipSlots = [ "legs", "plate", "helm", "shield", "sword" ] as const;

export type EquipSlot = typeof equipSlots[number];

export function isEquipSlot(slot: string): slot is EquipSlot {
    return equipSlots.includes(slot as EquipSlot)
}

export class Equipment {

    private readonly player: Player

    private equippedItems = new Map<EquipSlot, ItemData>()

    constructor(player: Player) {
        this.player = player

        equipSlots.forEach(slot => {
            this.equippedItems.set(slot, null)
        })
    }

    public update() {
        const packet = new UpdateEquipmentPacket(
            equipSlots.map(slot => 
                [slot, this.idOf(slot)])
        )

        this.player.send(packet)
    }

    public get(slot: EquipSlot) {
        return this.equippedItems.get(slot)
    }

    public get appearanceValues() {
        const equipment = [] as string[]
        equipSlots.forEach(slot => {
            const item = this.get(slot)
            if(item == null) {
                return
            }

            equipment.push(item.id)
        })

        return equipment
    }

    public idOf(slot: EquipSlot) {
        const item = this.get(slot)
        return item != null ? item.id : ""
    }

    public remove(slot: EquipSlot, update = true) {
        const old = this.get(slot)
        this.equippedItems.set(slot, null)

        if(update) {
            this.update()
        }

        return old
    }

    public setId(slot: EquipSlot, id: string, update = true) {
        const item = itemDataHandler.get(id)
        if(item == null) {
            throw `Invalid item id: ${id}`
        }

        this.set(slot, item, update)
    }

    public set(slot: EquipSlot, itemData: ItemData, update = true) {
        if(!itemData.equipable) {
            throw `Can't equip item: ${itemData.id}`
        }

        const unequipped = this.get(slot)
        this.equippedItems.set(slot, itemData)

        if(update) {
            this.update()
        }

        return unequipped
    }

}