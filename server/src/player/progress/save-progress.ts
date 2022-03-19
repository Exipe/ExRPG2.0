
import { Player } from "../player";
import { Progress, SaveAttrib, SaveEquip, SaveItem } from "./progress";
import { EQUIP_SLOTS } from "../../item/equipment";
import { attributeIds } from "../attrib";
import { Container } from "../../item/container/container";

const saveContainer = (container: Container): SaveItem[] => Array.from(
    { length: container.size }, (_, slot) => {
        const item = container.getSave(slot)
        return item != null ? {
            id: item.id,
            amount: item.amount
        } : null
    })

export function saveProgress(player: Player): Progress {
    const position = {
        x: player.x,
        y: player.y,
        map: player.map.id
    }

    const inventory = saveContainer(player.inventory)
    const bank = saveContainer(player.bank)
    
    const equipment: SaveEquip[] = EQUIP_SLOTS.map(slot => ({
        slot: slot,
        id: player.equipment.idOf(slot)
    }))

    const attributes: SaveAttrib[] = attributeIds.map(attrib => ({
        id: attrib,
        base: player.attributes.getBase(attrib)
    }))

    return {
        level: player.level.level,
        experience: player.level.experience,
        rank: player.rank,
        mute: player.mute,
        health: player.combatHandler.health,
        position: position,
        inventory: inventory,
        bank: bank,
        equipment: equipment,
        attributes: attributes,
        points: player.attributes.getPoints(),
        unlockedRecipes: player.unlockedRecipes
    }
}