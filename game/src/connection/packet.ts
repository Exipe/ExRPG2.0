import { AttribId } from "../game/model/tab/equipment/attributes"
import { StorageId } from "../game/model/container-model"

export interface Packet {
    id: string,
    data: any
}

export class LoginPacket implements Packet {
    public readonly id = "LOGIN"
    public readonly data: any

    constructor(username: string, password: string) {
        this.data = {
            username: username,
            password: password
        }
    }
}

export class RegisterPacket implements Packet {
    public readonly id = "REGISTER"
    public readonly data: any

    constructor(username: string, password: string) {
        this.data = {
            username: username,
            password: password
        }
    }
}

export class ReadyPacket implements Packet {
    public readonly id = "READY"
    public readonly data = null
}

export class WalkPacket implements Packet {
    public readonly id = "WALK"
    public readonly data: any

    constructor(steps: [number, number][]) {
        this.data = steps
    }
}

export class SayPacket implements Packet {
    public readonly id = "SAY"
    public readonly data: any

    constructor(message: string) {
        this.data = message
    }
}

export class CommandPacket implements Packet {
    public readonly id = "COMMAND"
    public readonly data: any

    constructor(message: string) {
        this.data = message
    }
}

export class MoveItemPacket implements Packet {
    public readonly id = "MOVE_ITEM"
    public readonly data: any

    constructor(container: StorageId, fromSlot: number, toSlot: number) {
        this.data = {
            container: container,
            fromSlot: fromSlot,
            toSlot: toSlot
        }
    }
}

export class UseItemPacket implements Packet {
    public readonly id = "USE_ITEM"
    public readonly data: any

    constructor(action: string, id: string, slot: number) {
        this.data = {
            action: action,
            id: id,
            slot: slot
        }
    }
}

export class TakeItemPacket implements Packet {
    public readonly id = "TAKE_ITEM"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class UnequipItemPacket implements Packet {
    public readonly id = "UNEQUIP_ITEM"
    public readonly data: any

    constructor(id: string, slot: string) {
        this.data = {
            id: id,
            slot: slot
        }
    }
}

export class TransferPacket implements Packet {
    public readonly id = "TRANSFER"
    public readonly data: any

    constructor(from: StorageId, to: StorageId, item: string, slot: number, amount?: number) {
        this.data = {
            from: from,
            to: to,
            item: item,
            slot: slot,
            amount: amount
        }
    }
}

export class TradeStatusPacket implements Packet {
    public readonly id = "TRADE_STATUS"
    public readonly data: string

    constructor(status: "accept" | "decline") {
        this.data = status
    }
}

export class SpendPointsPacket implements Packet {
    public readonly id = "SPEND_POINTS"
    public readonly data: [AttribId, number][]

    constructor(pointsSpent: [AttribId, number][]) {
        this.data = pointsSpent
    }
}

export class ObjectActionPacket implements Packet {
    public readonly id = "OBJECT_ACTION"
    public readonly data: any

    constructor(id: string, action: string, x: number, y: number) {
        this.data = {
            id: id,
            action: action,
            x: x,
            y: y
        }
    }
}

export class PlayerActionPacket implements Packet {
    public readonly id = "PLAYER_ACTION"
    public readonly data: any

    constructor(id: number, action: string) {
        this.data = {
            id: id,
            action: action
        }
    }
}

export class FollowPlayerPacket implements Packet {
    public readonly id = "FOLLOW_PLAYER"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class AttackPlayerPacket implements Packet {
    public readonly id = "ATTACK_PLAYER"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class NpcActionPacket implements Packet {
    public readonly id = "NPC_ACTION"
    public readonly data: any

    constructor(id: number, action: string) {
        this.data = {
            id: id,
            action: action
        }
    }
}

export class DialogueOptionPacket implements Packet {
    public readonly id = "DIALOGUE_OPTION"
    public readonly data: any

    constructor(id: number, index: number) {
        this.data = {
            id: id,
            index: index
        }
    }
}

export class SelectBuyPacket implements Packet {
    public readonly id = "SELECT_BUY"
    public readonly data: any

    constructor(slot: number) {
        this.data = slot
    }
}

export class ConfirmBuyPacket implements Packet {
    public readonly id = "CONFIRM_BUY"
    public readonly data: any

    constructor(slot: number, amount: number) {
        this.data = {
            slot: slot,
            amount: amount
        }
    }
}

export class SelectSellPacket implements Packet {
    public readonly id = "SELECT_SELL"
    public readonly data: any

    constructor(slot: number) {
        this.data = slot
    }
}

export class ConfirmSellPacket implements Packet {
    public readonly id = "CONFIRM_SELL"
    public readonly data: any

    constructor(item: string, amount: number) {
        this.data = {
            item: item,
            amount: amount
        }
    }
}

export class CraftPacket implements Packet {
    public readonly id = "CRAFT"
    public readonly data: any

    constructor(item: string, amount: number) {
        this.data = {
            item: item,
            amount: amount
        }
    }
}
