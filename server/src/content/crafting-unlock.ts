import { Dialogue } from "../player/window/dialogue";
import { cyan, yellow } from "../util/color";
import { actionHandler, itemDataHandler } from "../world";

const LEARN_ACTION = "learn"

function addCraftingUnlock(recipeId: string, itemId: string) {
    const recipeItem = itemDataHandler.get(recipeId)
    const item = itemDataHandler.get(itemId)

    if(!recipeItem) {
        throw `[Invalid crafting unlock] unknown recipe item: ${recipeId}`
    }

    if(!item) {
        throw `[Invalid crafting unlock] unknown item: ${recipeId}`
    }

    actionHandler.onItem(recipeId, (p, action) => {
        if(action != LEARN_ACTION) {
            return
        }

        const dialog = new Dialogue([cyan.toString(), recipeItem.name], [
            [`Do you want to unlock the recipe for ${cyan}?`, item.name],
            ["You will lose this scroll in the process."]
        ])

        dialog.addOption("Yes", () => {
            if(p.inventory.tryRemove(recipeId, 1)) {
                p.unlockedRecipes.push(itemId)
                p.sendNotification(`You unlock the recipe for ${item.name}`, yellow)
            }
            
            return null
        })

        dialog.addOption("No", () => null)
        p.window = dialog
    })
}

export function initCraftingUnlocks() {
    addCraftingUnlock('recipe_sword_iron', 'sword_iron')
    addCraftingUnlock('recipe_helm_iron', 'helm_iron')
    addCraftingUnlock('recipe_plate_iron', 'plate_iron')
    addCraftingUnlock('recipe_legs_iron', 'legs_iron')
    addCraftingUnlock('recipe_shield_iron', 'shield_iron')
    
    addCraftingUnlock('recipe_sword_gold', 'sword_gold')
    addCraftingUnlock('recipe_helm_gold', 'helm_gold')
    addCraftingUnlock('recipe_plate_gold', 'plate_gold')
    addCraftingUnlock('recipe_legs_gold', 'legs_gold')
    addCraftingUnlock('recipe_shield_gold', 'shield_gold')
}