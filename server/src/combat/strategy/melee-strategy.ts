import { Character } from "../../character/character";
import { CombatStrategy } from "./combat-strategy";

export class MeleeStrategy implements CombatStrategy {

    private readonly weaponId: string;

    constructor(weaponId = "") {
        this.weaponId = weaponId;
    }

    onAttack(self: Character, target: Character, delay: number) {
        const { weaponId } = this;
        const distX = target.x - self.x
        const distY = target.y - self.y

        if(weaponId != "") {
            self.swingItem(weaponId, distX, distY, delay / 5)
        }
    }

    reaches(self: Character, other: Character) {
        const distX = other.x - self.x;
        const distY = other.y - self.y;
        return Math.abs(distX) <= 1 && Math.abs(distY) <= 1;
    }

    onTarget(_self: Character, _target: Character) {}

    onLoseTarget(_self: Character) {}
    
}