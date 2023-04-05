
import { Character } from "../character/character";
import { NpcData } from "./npc-data";
import { MoveNpcPacket } from "../connection/outgoing-packet";
import { MapId } from "../scene/map-id";
import { randomChance, randomOffset } from "../util/util";
import { NpcCombatHandler } from "../combat/npc-combat";
import { ReadOnlyMap } from "../util/readonly-map";

export class NpcHandler {

    private idCount = 0
    private npcMap = new Map<number, Npc>()

    private readonly npcDataHandler: ReadOnlyMap<string, NpcData>

    constructor(npcDataHandler: ReadOnlyMap<string, NpcData>) {
        this.npcDataHandler = npcDataHandler
    }

    public get(id: number) {
        return this.npcMap.get(id)
    }

    public spawnAll() {
        this.npcMap.forEach(npc => npc.spawn())
    }

    public create(dataId: string, map: MapId, x: number, y: number) {
        const data = this.npcDataHandler.get(dataId)
        if (data == null) {
            return null
        }

        const id = this.idCount++
        const npc = new Npc(id, data, map, x, y)
        this.npcMap.set(id, npc)
        return npc
    }

}

export class Npc extends Character {

    public readonly id: number
    public readonly data: NpcData

    public readonly mapId: MapId
    private readonly spawnX: number
    private readonly spawnY: number

    constructor(id: number, data: NpcData, map: MapId, x: number, y: number) {
        super("npc", id, data.walkSpeed)
        this.mapId = map
        this.spawnX = x
        this.spawnY = y
        this.id = id
        this.data = data

        if (this.data.combatData != null) {
            this.combatHandler = new NpcCombatHandler(this)
        }
    }

    public get alive() {
        return this.map != null
    }

    public get aggressive() {
        return this.data.combatData?.agressive
            ?? false;
    }

    public tileWalkable(x: number, y: number) {
        return !this.map.isNpcBlocked(x, y)
    }

    public spawn() {
        this.goTo(this.mapId, this.spawnX, this.spawnY)
    }

    public tick() {
        super.tick();

        const radius = this.data.walkRadius
        if (this.target == null && this.aggressive) {
            for (let other of this.map.players) {
                const distX = other.x - this.x;
                const distY = other.y - this.y;

                if (Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) < 6) {
                    this.attack(other);
                    break;
                }
            }
        }

        if (this.idle && randomChance(15)) {
            const goalX = randomOffset(this.spawnX, radius)
            const goalY = randomOffset(this.spawnY, radius)

            this.walking.clear()
            this.walking.addSteps(goalX, goalY)
        }
    }

    protected enterMap() {
        this.map.addNpc(this)
    }

    protected onLeaveMap() {
        this.map.removeNpc(this)
    }

    protected onMove(delay: number) {
        this.map.broadcast(new MoveNpcPacket(this.id, this.x, this.y, delay))
    }

}