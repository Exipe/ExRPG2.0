import { CombatStrategy } from "./combat-strategy";
import { RangedStrategy } from "./ranged-strategy";

export const npcStrategies: Record<string, CombatStrategy> = {
    "imp": new RangedStrategy("", 3, "spell")
};