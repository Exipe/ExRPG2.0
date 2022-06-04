
import { Character } from "../character/character";
import { Walking } from "../character/walking";
import { HealthBarPacket, HitSplatPacket, HitSplatType } from "../connection/outgoing-packet";
import { calculateDamage } from "../util/formula";
import { Combat as CombatTask } from "./combat-task";
import { DamageCounter } from "./damage-counter";
import { CombatStrategy } from "./strategy/combat-strategy";

const ATTACK_DELAY = 2000

export abstract class CombatHandler {

    private readonly character: Character
    
    private damageCounter = new DamageCounter()

    public attackDelay: number

    public maxDamage: number

    public maxHealth: number

    public health: number

    constructor(character: Character, health: number, attackSpeed: number, maxDamage: number) {
        this.character = character
        this.maxHealth = this.health = health
        this.attackSpeed = attackSpeed
        this.maxDamage = maxDamage
    }

    public set attackSpeed(value: number) {
        this.attackDelay = Math.trunc(ATTACK_DELAY / value)
    }

    public abstract get strategy(): CombatStrategy

    public abstract get accuracy(): number

    public abstract get defence(): number

    protected abstract retaliate(other: Character): void

    protected abstract die(killer: Character): void;

    public target(other: Character, walking: Walking) {
        const { character: self } = this;
        self.follow(other)

        const callback = () => {
            self.taskHandler.setTask(new CombatTask(self));
        };
        const criteria = () => this.strategy.reaches(self, other);
        walking.setGoal(callback, criteria, true);

        this.strategy.onTarget(self, other);
    }

    public attack(other: CombatHandler) {
        const { character: self, strategy } = this;
        const target = other.character

        const distX = target.x - self.x
        const distY = target.y - self.y

        if((distX == 0 && distY == 0) || !strategy.reaches(self, target)) {
            return
        }

        const [type, damage] = calculateDamage(this.maxDamage, this.accuracy, other.defence)

        strategy.onAttack(self, target, this.attackDelay);
        other.retaliate(self)

        if(self.type == "player") {
            other.damageCounter.count(self.id, damage)
        }
        other.damage(damage, type)
    }

    public stop() {
        this.strategy.onLoseTarget(this.character);
    }

    public heal(value: number) {
        const self = this.character
        this.character.map.broadcast(
            new HitSplatPacket(self.type, self.id, "heal", value)
        )

        this.health = Math.min(this.health + value, this.maxHealth)
    }

    public damage(value: number, type: HitSplatType) {
        const self = this.character
        const damage = Math.min(this.health, value)

        self.map.broadcast(
            new HitSplatPacket(self.type, self.id, type, damage)
        )

        this.health -= damage
        self.map.broadcast(
            new HealthBarPacket(self.type, self.id, this.health / this.maxHealth)
        )

        if(this.health <= 0) {
            const killer = this.damageCounter.determineKiller()
            this.die(killer)
        }
    }

}