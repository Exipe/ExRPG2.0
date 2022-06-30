import { Character } from "../../character/character";
import { ProjectilePacket } from "../../connection/outgoing-packet";
import { isPlayer } from "../../player/player";
import { calculateDamage } from "../../util/formula";
import { CombatStrategy } from "./combat-strategy";

const PROJECTILE_DELAY = 350;

export class RangedStrategy implements CombatStrategy {

    private readonly itemId: string;
    private readonly distance: number;

    constructor(itemId: string, distance: number) {
        this.itemId = itemId;
        this.distance = distance;
    }

    onAttack(self: Character, target: Character, _delay: number): void {
        const cb = self.combatHandler;
        const targetCb = target.combatHandler;
        
        self.map.broadcast(new ProjectilePacket(
            self.identifier, target.identifier, "arrow", PROJECTILE_DELAY));

        const { maxDamage, accuracy } = cb; // damage and accuracy before shooting
        cb.delayDamage(targetCb, () => {
            const defence = targetCb.defence; // defence when shot
            return calculateDamage(maxDamage, accuracy, defence);
        }, PROJECTILE_DELAY);
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