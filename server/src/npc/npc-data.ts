import { maxDamage, speedBonus } from "../util/formula"
import { ReadOnlyMap } from "../util/readonly-map"

const DEFAULT_RESPAWN_TIME = 15
const DEFAULT_WALK_SPEED = 1
const DEFAULT_WALK_RADIUS = 0 // don't move

export const isAgressive = (id: string) => {
    switch (id) {
        case "skeleton":
        case "red_slime":
            return true;
        default:
            return false;
    }
}

export interface NpcCombatData {
    weapon: string
    respawnTime: number
    health: number
    attackSpeed: number
    maxHit: number
    accuracy: number
    defence: number
    experience: number
    agressive: boolean
}

export interface NpcData {
    id: string
    name: string
    walkRadius: number
    walkSpeed: number
    actions: string[]
    combatData: NpcCombatData
}

export async function loadNpcData(resPath: string) {
    const npcDataMap = new Map<string, NpcData>()
    const data = await fetch(resPath + "data/npc.json")
        .then(res => res.json()) as any[]

    const combatAttrib = (value: number) => value ? value : 0

    data.forEach((npc: any) => {
        if (npcDataMap.get(npc.id) != null) {
            throw "IMPORTANT - duplicate NPC ID: " + npc.id
        }

        const actions = npc.options ? npc.options.map((action: string) =>
            action.toLowerCase().replace(" ", "_")) : []

        let combatData = null as NpcCombatData
        const cb = npc.combat

        if (cb != null) {
            const attackSpeed = speedBonus(combatAttrib(cb.attackSpeed))
            const maxHit = maxDamage(combatAttrib(cb.damage))

            combatData = {
                weapon: cb.weapon ? cb.weapon : "",
                respawnTime: cb.respawnTime ? cb.respawnTime : DEFAULT_RESPAWN_TIME,
                health: cb.health,
                attackSpeed: attackSpeed,
                maxHit: maxHit,
                accuracy: combatAttrib(cb.accuracy),
                defence: combatAttrib(cb.defence),
                agressive: isAgressive(npc.id),
                experience: cb.experience ? cb.experience : cb.health
            }
        }

        const npcData = {
            id: npc.id,
            name: npc.name,
            walkRadius: npc.walkRadius ? npc.walkRadius : DEFAULT_WALK_RADIUS,
            walkSpeed: npc.walkSpeed ? npc.walkSpeed : DEFAULT_WALK_SPEED,
            actions: actions,
            combatData: combatData
        }
        npcDataMap.set(npc.id, npcData)
    })

    return new ReadOnlyMap(npcDataMap)
}
