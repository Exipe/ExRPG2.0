
import { Player } from "../player/player";
import { Trigger } from "./trigger";
import { Packet, AddPlayerPacket, LoadMapPacket, RemovePlayerPacket, AddNpcPacket, RemoveNpcPacket, AddGroundItemPacket, RemoveGroundItemPacket, SetObjectPacket } from "../connection/outgoing-packet";
import { Npc } from "../npc/npc";
import { BlockMap } from "./block-map";
import { GroundItem, itemDropStrategy, PrivateVisibilityStrategy } from "../item/ground-item";
import { ItemData } from "../item/item-data";
import { ObjectMap } from "../object/object-map";
import { ObjectData } from "../object/object-data";
import { objDataHandler } from "../world";
import { TempObject } from "../object/temp-object";
import { MapId } from "./map-id";

/**
 * An attribute read from the map file,
 * ie. object spawn, npc spawn, trigger, etc.
 */
export interface SceneAttrib {
    x: number
    y: number
    id: string
}

export class Scene {

    public readonly id: MapId
    public readonly width: number
    public readonly height: number

    public players: Player[] = []
    private npcs: Npc[] = []

    private groundItemCounter = 0
    private groundItems: GroundItem[] = []

    private tempObjects: TempObject[] = []

    private readonly blockMap: BlockMap
    private readonly objectMap: ObjectMap
    private readonly triggerGrid: Trigger[][]

    public attribs: SceneAttrib[] = []

    constructor(id: MapId, width: number, height: number) {
        this.id = id
        this.width = width
        this.height = height

        this.blockMap = new BlockMap(width, height)
        this.objectMap = new ObjectMap(this.blockMap, width, height)

        this.triggerGrid = []
        for(let ri = 0; ri < height; ri++) {
            let row = []
            this.triggerGrid.push(row)

            for(let ci = 0; ci < width; ci++) {
                row.push(null)
            }
        }
    }

    public tick() {
        this.players.forEach(p => p.tick());
        this.npcs.forEach(n => n.tick());
    }

    public addTempObj(objId: string, x: number, y: number, lifeTime = -1) {
        const obj = objDataHandler.get(objId)
        
        let temp = new TempObject(this, obj, x, y)
        this.tempObjects = this.tempObjects.filter(o => {
            if(o.x != x || o.y != y) {
                return true
            }

            temp.replacedObjData = o.replacedObjData

            if(o.timed) {
                clearTimeout(o.timeout)
            }
            return false
        })

        const replaced = this.objectMap.set(x, y, obj)
        if(temp.replacedObjData == null) {
            temp.replacedObjData = replaced
        }
        
        this.tempObjects.push(temp)

        if(lifeTime >= 0) {
            temp.setLifeTime(lifeTime)
        }

        this.broadcast(new SetObjectPacket([ [objId, x, y] ]))
    }

    public removeTempObj(temp: TempObject) {
        this.tempObjects = this.tempObjects.filter(obj => obj != temp)
        this.objectMap.set(temp.x, temp.y, temp.replacedObjData)

        this.broadcast(new SetObjectPacket([ [
            temp.replacedObjData != null ? temp.replacedObjData.id : "",
            temp.x, temp.y
        ] ]))
    }

    public addObject(x: number, y: number, objData: ObjectData) {
        this.objectMap.set(x, y, objData)
    }

    public reachesObject(fromX: number, fromY: number, objData: ObjectData, x: number, y: number) {
        return this.objectMap.reachable(fromX, fromY, x, y, objData)
    }

    public addItem(item: ItemData, amount: number, x: number, y: number) {
        const id = this.groundItemCounter++
        const groundItem = new GroundItem(this, item, id, x, y, amount)
        groundItem.spawn()
        this.groundItems.push(groundItem)
    }

    public dropItem(item: ItemData, amount: number, x: number, y: number, visiblePlayers: Player[]) {
        const id = this.groundItemCounter++
        const groundItem = new GroundItem(this, item, id, x, y, amount)
        groundItem.lifeCycleStrategy = itemDropStrategy
        groundItem.visibilityStrategy = new PrivateVisibilityStrategy(visiblePlayers.map(p => p.name))
        groundItem.spawn()
        this.groundItems.push(groundItem)
    }

    public getItem(id: number) {
        return this.groundItems.find(item => item.id == id)
    }

    public removeItem(id: number) {
        this.groundItems = this.groundItems.filter(item => item.id != id)
    }

    public block(x: number, y: number) {
        this.blockMap.block(x, y)
    }

    public npcBlock(x: number, y: number) {
        this.blockMap.npcBlock(x, y)
    }

    public isBlocked(x: number, y: number) {
        return this.blockMap.isBlocked(x, y)
    }

    public isNpcBlocked(x: number, y: number) {
        return this.blockMap.isNpcBlocked(x, y)
    }

    public setTrigger(x: number, y: number, trigger: Trigger) {
        this.triggerGrid[y][x] = trigger
    }

    public broadcast(packet: Packet) {
        this.players.forEach(p => {
            p.send(packet)
        })
    }

    public addNpc(n: Npc) {
        this.npcs.push(n)
        this.broadcast(new AddNpcPacket([ [n.id, n.data.id, n.x, n.y] ]))
    }

    public removeNpc(n: Npc) {
        this.npcs = this.npcs.filter(o => n != o)
        this.broadcast(new RemoveNpcPacket(n.id))
    }

    public addPlayer(p: Player) {
        this.broadcast(new AddPlayerPacket([ p.outgoingPlayer ]))

        p.send(new LoadMapPacket(this.id))

        this.players.push(p)
        const addPlayers = new AddPlayerPacket(
            this.players.map(o => o.outgoingPlayer)
        )
        p.send(addPlayers)

        const addNpcs = new AddNpcPacket(
            this.npcs.map(n => [ n.id, n.data.id, n.x, n.y ])
        )
        p.send(addNpcs)

        const setObjects = new SetObjectPacket(
            this.tempObjects.map(o => [ o.objData.id, o.x, o.y ])
        )
        p.send(setObjects)

        const groundItems = this.groundItems.filter(i => i.visibilityStrategy.isVisible(p))
        .map(i => i.packetData)
        const addGroundItems = new AddGroundItemPacket(groundItems)
        p.send(addGroundItems)
    }

    public removePlayer(p: Player) {
        this.players = this.players.filter(o => p != o)
        this.broadcast(new RemovePlayerPacket(p.id))
    }

    public getTrigger(x: number, y: number) {
        return this.triggerGrid[y][x]
    }
 
}