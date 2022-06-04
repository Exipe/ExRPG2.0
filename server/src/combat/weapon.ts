import { itemDataHandler } from "../world";
import { CombatStrategy } from "./strategy/combat-strategy";
import { MeleeStrategy } from "./strategy/melee-strategy";
import { RangedStrategy } from "./strategy/ranged-strategy";

export const weaponStrategies: Record<string, CombatStrategy> = {};

function addBow(item: string, distance: number) {
    if(itemDataHandler.get(item) == null) {
        throw `[Invalid weapon data] unknown item: ${item}`;
    }

    if(distance <= 0) {
        throw `[Invalid weapon data] distance must be > 0: ${item}`;
    }

    weaponStrategies[item] = new RangedStrategy(item, distance);
}

function addSword(item: string) {
    if(itemDataHandler.get(item) == null) {
        throw `[Invalid weapon data] unknown item: ${item}`;
    }

    weaponStrategies[item] = new MeleeStrategy(item);
}

export function initWeapons() {
    addBow("bow_crude", 5);
    
    addSword("axe_obsidian");
    addSword("sword_gold");
    addSword("sword_iron");
    addSword("sword_copper");
    addSword("dagger_crude");
}