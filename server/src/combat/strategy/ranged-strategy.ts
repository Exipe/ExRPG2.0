import { Character } from "../../character/character";
import { isPlayer } from "../../player/player";
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
        const steps = Math.max(Math.abs(distX), Math.abs(distY));

        if((distX == 0 && distY == 0) || steps > this.distance) return false;
        
        const dx = distX / steps;
        const dy = distY / steps;

        for(let i = 0; i < steps; i++) {
            const previousX = self.x + Math.ceil(dx * i);
            const previousY = self.y + Math.ceil(dy * i);

            if(!self.walkable(previousX, previousY, Math.round(dx), Math.round(dy))) {
                return false;
            }
        }

        return true;
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