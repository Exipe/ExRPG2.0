import { randomChance } from "../util/util";
import { actionHandler, itemDataHandler, npcDataHandler, sceneHandler } from "../world";

function addDrop(npcId: string, probability: number, item: string, amount: number) {
    if(!npcDataHandler.get(npcId)) {
        throw `[Invalid NPC drop] unknown NPC: ${npcId}`
    }

    if(!itemDataHandler.get(item)) {
        throw `[Invalid NPC drop] unknown item: ${item}`
    }

    actionHandler.onNpcDeath(npcId, (killer, npc) => {
        if(!randomChance(probability)) {
            return
        }

        sceneHandler.get(npc.mapId)
        .dropItem(itemDataHandler.get(item), amount, npc.x, npc.y, [killer])
    })
}

export function initDrops() {
    addDrop("slime_weak", 3, "coins", 5)
    addDrop("slime_weak", 5, "pickaxe_crude", 1)

    addDrop("goblin_weak", 20, "potion_health_weak", 1)
    addDrop("goblin_weak", 8, "helm_copper", 1)

    addDrop("bear", 3, "fish", 1)
    addDrop("bear", 12, "plate_copper", 1)
    addDrop("bear", 12, "legs_copper", 1)
	
	addDrop("imp", 5, "key_imp_treasure", 1)

    addDrop('skeleton', 100, 'key_skeleton_dungeon', 1)
    addDrop('skeleton', 12, 'sword_copper', 1)
    addDrop('skeleton', 12, 'helm_copper', 1)
    addDrop('skeleton', 12, 'plate_copper', 1)
    addDrop('skeleton', 12, 'legs_copper', 1)
    addDrop('skeleton', 12, 'shield_copper', 1)
    
    addDrop('scorpion', 300, 'essence_gold', 1)
    addDrop('scorpion', 300, 'essence_gold', 1)
    addDrop('scorpion', 15, 'shield_iron', 1)

    addDrop('snake_weak', 500, 'essence_gold', 1)
    addDrop('snake_weak', 500, 'essence_gold', 1)
    addDrop('snake_weak', 15, 'helm_iron', 1)

    addDrop('skeleton_boss', 3, 'plate_iron', 1)
    addDrop('skeleton_boss', 3, 'legs_iron', 1)
    addDrop('skeleton_boss', 10, 'shield_gold', 1)
    addDrop('skeleton_boss', 10, 'sword_gold', 1)
    addDrop('skeleton_boss', 3, 'essence_gold', 1)
}