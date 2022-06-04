import { Character } from "../../character/character";
import { CombatStrategy } from "./combat-strategy";

export class RangedStrategy implements CombatStrategy {

    private readonly itemId: string;
    private readonly distance: number;

    constructor(itemId: string, distance: number) {
        this.itemId = itemId;
        this.distance = distance;
    }

    onAttack(self: Character, target: Character, delay: number): void {
        // to-do: shoot projectile
        return;
    }

    reaches(self: Character, other: Character) {
        const distX = other.x - self.x;
        const distY = other.y - self.y;

        return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) <= this.distance;
    }
    
    onTarget(self: Character, target: Character) {
        const { itemId } = this;
        if(itemId != "") {
            self.pointItem(itemId, target);
        }
    }

    onLoseTarget(self: Character) {
        self.stopPointing();
    }

}