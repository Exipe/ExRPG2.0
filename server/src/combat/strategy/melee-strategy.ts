import { Character } from "../../character/character";
import { calculateDamage } from "../../util/formula";
import { CombatStrategy } from "./combat-strategy";

export class MeleeStrategy implements CombatStrategy {

    private readonly weaponId: string;

    constructor(weaponId = "") {
        this.weaponId = weaponId;
    }

    onAttack(self: Character, target: Character, delay: number) {
        const { weaponId } = this;
        const cb = self.combatHandler;
        const targetCb = target.combatHandler;
        
        const damage = calculateDamage(cb.maxDamage, cb.accuracy, targetCb.defence);
        
        if(weaponId != "") {
            const distX = target.x - self.x;
            const distY = target.y - self.y;
            self.swingItem(weaponId, distX, distY, delay / 5);
        }
        cb.damage(targetCb, damage);
    }

    reaches(self: Character, other: Character) {
        const diffX = other.x - self.x;
        const diffY = other.y - self.y;
        return !(diffX == 0 && diffY == 0) 
            && Math.abs(diffX) <= 1 && Math.abs(diffY) <= 1
            && self.walkable(self.x, self.y, diffX, diffY);
    }

    onTarget(_self: Character, _target: Character) {}

    onLoseTarget(_self: Character) {}
    
}