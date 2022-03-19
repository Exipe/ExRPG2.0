
import { ItemData } from "./item-data";
import { Scene } from "../scene/scene";
import { Player } from "../player/player";
import { AddGroundItemPacket, RemoveGroundItemPacket } from "../connection/outgoing-packet";

export interface LifeCycleStrategy {
    start: (item: GroundItem) => void
    stop: (item: GroundItem) => void
    respawn: (item: GroundItem) => void
}

export interface VisibilityStrategy {
    getVisiblePlayers: (item: GroundItem) => Player[]
    isVisible: (player: Player) => boolean
}

/*
world item spawns that are loaded on server startup
*/
const itemSpawnStrategy: LifeCycleStrategy = {

    start(_item: GroundItem) {},
    stop(_item: GroundItem) {},

    respawn(item: GroundItem) {
        setTimeout(() => {
            item.scene.addItem(item.itemData, item.amount, item.x, item.y)
        }, 60_000)
    }

}

/*
items that are visible for a short time, then removed
*/
const temporaryItemStrategy: LifeCycleStrategy = {

    start(item: GroundItem) {
        item.setLifeTime(60_000)
    },

    stop(item: GroundItem) {
        item.remove()
    },

    respawn(_item: GroundItem) {}

}

/*
items that are dropped by a player, or for a player (by for example an npc)
*/
export const itemDropStrategy: LifeCycleStrategy = {

    start(item: GroundItem) {
        item.setLifeTime(60_000)
    },

    stop(item: GroundItem) {
        const oldPlayers = item.visibilityStrategy.getVisiblePlayers(item)
        // dont send the add_item packet to the player who dropped the item
        // (this would duplicate the item)
        const players = publicVisibilityStrategy
                        .getVisiblePlayers(item)
                        .filter(p => !oldPlayers.includes(p))
        item.visibilityStrategy = publicVisibilityStrategy
        item.lifeCycleStrategy = temporaryItemStrategy
        item.spawn(players)
    },

    respawn(_item: GroundItem) {}

}

export class PrivateVisibilityStrategy implements VisibilityStrategy {

    private readonly players: string[]

    constructor(players: string[]) {
        this.players = players
    }

    public getVisiblePlayers(item: GroundItem) {
        return item.scene.players.filter(p => this.isVisible(p))
    }

    public isVisible(player: Player) {
        return this.players.includes(player.name)
    }

}

const publicVisibilityStrategy: VisibilityStrategy = {

    getVisiblePlayers(item: GroundItem) {
        return item.scene.players
    },

    isVisible(_player: Player) {
        return true
    }

}

export class GroundItem {

    public readonly scene: Scene

    public readonly itemData: ItemData
    private timeout: NodeJS.Timeout = null

    public visibilityStrategy = publicVisibilityStrategy
    public lifeCycleStrategy = itemSpawnStrategy

    public readonly id: number
    public readonly x: number
    public readonly y: number

    public readonly amount: number

    constructor(scene: Scene, itemData: ItemData, id: number, x: number, y: number, amount: number) {
        this.scene = scene
        this.itemData = itemData
        this.id = id
        this.x = x
        this.y = y
        this.amount = amount
    }

    public isVisible(player: Player) {
        return this.visibilityStrategy.isVisible(player)
    }

    public get packetData(): [number, string, number, number] {
        return [ this.id, this.itemData.id, this.x, this.y ]
    }

    public setLifeTime(ms: number) {
        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            this.lifeCycleStrategy.stop(this)
        }, ms)
    }

    public spawn(players = this.visibilityStrategy.getVisiblePlayers(this)) {
        players.forEach(p =>
            p.send(new AddGroundItemPacket([this.packetData])))
        this.lifeCycleStrategy.start(this)
    }

    public remove() {
        clearTimeout(this.timeout)

        this.scene.removeItem(this.id)
        this.visibilityStrategy.getVisiblePlayers(this).forEach(p =>
            p.send(new RemoveGroundItemPacket(this.id)))
        this.lifeCycleStrategy.respawn(this)
    }

}
