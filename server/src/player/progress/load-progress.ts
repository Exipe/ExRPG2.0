
import { Player, SPAWN_POINT } from "../player";
import { Progress, SaveItem } from "./progress";
import { itemDataHandler } from "../../world";
import { isEquipSlot } from "../../item/equipment";
import { isAttribId } from "../attrib";
import { isMapId } from "../../scene/map-id";
import { Container } from "../../item/container/container";

function loadContainer(container: Container, save: SaveItem[]) {
    if(!save) { return }

    for(let i = 0; i < save.length; i++) {
        const saveItem = save[i]
        if(saveItem == null) {
            continue
        }
        
        container.set(i, saveItem.id, saveItem.amount, false)
    }
}

export function loadProgress(player: Player, progress: Progress) {
    player.level.setLevel(progress.level, false)
    player.level.experience = progress.experience

    player.rank = progress.rank
    player.mute = progress.mute

    player.combatHandler.health = progress.health

    loadContainer(player.inventory, progress.inventory)
    loadContainer(player.bank, progress.bank)

    for(let equip of progress.equipment) {
        const item = itemDataHandler.get(equip.id)
        if(item == null || !isEquipSlot(equip.slot)) {
            continue
        }

        player.equipment.set(equip.slot, item, false)
        player.attributes.setArmor(item, false)
    }

    player.attributes.setPoints(progress.points, false)

    for(let attrib of progress.attributes) {
        if(!isAttribId(attrib.id)) {
            continue
        }

        player.attributes.setBase(attrib.id, attrib.base, false)
    }

    player.inventory.update()
    player.equipment.update()
    player.attributes.update()
    
    const position = progress.position

    if(isMapId(position.map)) {
        player.goTo(position.map, position.x, position.y)
    } else {
        player.goTo(...SPAWN_POINT)
    }

    if(progress.unlockedRecipes) {
        player.unlockedRecipes = progress.unlockedRecipes
    }
}