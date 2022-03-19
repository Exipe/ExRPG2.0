
import { Player } from "./player";
import { UpdateAttribPacket } from "../connection/outgoing-packet";
import { ItemData } from "../item/item-data";

export type AttribId = "accuracy" | "damage" | "defence" | "speed_attack" | "speed_move"

const attributes = [
    ['accuracy', "Accuracy"],
    ['damage', "Damage"],
    ['defence', "Defence"],
    ['speed_attack', "Attack speed"],
    ['speed_move', "Movement"]
] as [AttribId, string][]

export const attributeIds = attributes.map(a => a[0])
export function properAttrib(id: AttribId) {
    return attributes.find(a => a[0] == id)[1]
}

export function isAttribId(id: string): id is AttribId {
    return attributeIds.includes(id as AttribId)
}

interface PlayerAttrib {
    base: number,
    armor: number
}

export type ChangeListener = (value: number) => void

export class PlayerAttribHandler {

    private readonly player: Player

    private points = 0

    private attribs = new Map<AttribId, PlayerAttrib>()
    private listeners = new Map<AttribId, ChangeListener>()

    public constructor(player: Player) {
        this.player = player

        attributeIds.forEach(attribId => {
            this.attribs.set(attribId, {
                base: 0,
                armor: 0
            })
        })
    }

    public onChange(id: AttribId, listener: ChangeListener) {
        this.listeners.set(id, listener)
    }

    public get(id: AttribId): number {
        const attrib = this.attribs.get(id)
        return attrib.base + attrib.armor
    }

    public getBase(id: AttribId): number {
        return this.attribs.get(id).base
    }

    public update() {
        this.player.send(new UpdateAttribPacket(this.points, attributeIds.map(attribId => {
            const attrib = this.attribs.get(attribId)
            return [attribId, attrib.base, attrib.armor]
        })))
    }

    private didChange(id: AttribId) {
        const listener = this.listeners.get(id)
        if(listener == null) {
            return
        }

        const attrib = this.attribs.get(id)
        listener(attrib.base + attrib.armor)
    }

    public setArmor(itemData: ItemData, update = true) {
        itemData.equipBonuses.forEach(bonus => {
            this.attribs.get(bonus[0]).armor += bonus[1]
            this.didChange(bonus[0])
        })

        if(update) {
            this.update()
        }
    }

    public unsetArmor(itemData: ItemData, update = true) {
        itemData.equipBonuses.forEach(bonus => {
            this.attribs.get(bonus[0]).armor -= bonus[1]
            this.didChange(bonus[0])
        })

        if(update) {
            this.update()
        }
    }
    
    public setBase(id: AttribId, value: number, update = true) {
        this.attribs.get(id).base = value
        this.didChange(id)

        if(update) {
            this.update()
        }
    }

    public spendPoints(id: AttribId, amount: number, update = true) {
        if(amount > this.points) {
            throw `[Failure to spend points] not enough points ${amount} > ${this.points}`
        }

        this.setPoints(this.getPoints() - amount, false)
        this.setBase(id, this.getBase(id) + amount, false)

        if(update) {
            this.update()
        }
    }

    public getPoints() {
        return this.points
    }

    public setPoints(points: number, update = true) {
        this.points = points

        if(update) {
            this.update()
        }
    }

}