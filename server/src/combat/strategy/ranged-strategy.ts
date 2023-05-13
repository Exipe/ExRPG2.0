import { Character } from "../../character/character";
import { ProjectilePacket } from "../../connection/outgoing-packet";
import { isPlayer } from "../../player/player";
import { calculateDamage } from "../../util/formula";
import { CombatStrategy } from "./combat-strategy";

const PROJECTILE_DELAY = 350;
const ARROWS = "arrows_crude";

export class RangedStrategy implements CombatStrategy {

    private readonly itemId: string;
    private readonly distance: number;

    private readonly projectile: string;

    constructor(itemId: string, distance: number, projectile: string) {
        this.itemId = itemId;
        this.distance = distance;
        this.projectile = projectile;
    }

    onAttack(self: Character, target: Character, _delay: number): void {
        const cb = self.combatHandler;
        const targetCb = target.combatHandler;
        
        if(isPlayer(self)) {
            const remaining = self.inventory.remove(ARROWS, 1);
            if(remaining > 0) {
                self.sendMessage("You have run out of arrows");
                self.stop();
                return;
            }
        }

        self.map.broadcast(new ProjectilePacket(
            self.identifier, target.identifier, this.projectile, PROJECTILE_DELAY));

        const { maxDamage, accuracy } = cb; // damage and accuracy before shooting
        cb.delayDamage(targetCb, () => {
            const defence = targetCb.defence; // defence when shot
            return calculateDamage(maxDamage, accuracy, defence);
        }, PROJECTILE_DELAY);
    }

    reaches(self: Character, other: Character) {
        return self.isInFieldOfVision(other, this.distance);
    }
    
    onTarget(self: Character, target: Character) {
        const { itemId } = this;

        if(isPlayer(self) && !self.inventory.hasItem("arrows_crude")) {
            self.sendMessage("You do not have any arrows on you");
            self.stop();
            return;
        }

        if(itemId != "") {
            self.pointItem(itemId, target);
        }
    }

    onLoseTarget(self: Character) {
        self.stopPointing();
    }

}