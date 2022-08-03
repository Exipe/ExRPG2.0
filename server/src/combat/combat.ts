
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

    private previousStrategy: CombatStrategy

    public updateStrategy() {
        const { character: self, previousStrategy, strategy } = this;
        this.previousStrategy = strategy;
        const other = self.target;

        if(previousStrategy != null) {
            previousStrategy.onLoseTarget(self);
        }
        
        if(self.target != null) {
            strategy.onTarget(self, other);
        }
    }

    public target(other: Character, walking: Walking) {
        const { character: self } = this;
        self.follow(other)

        const callback = () => {
            self.taskHandler.setTask(new CombatTask(self));
        };
        const criteria = () => this.strategy.reaches(self, other);
        walking.setGoal(callback, criteria, true);

        this.updateStrategy();
    }

    public attack(other: CombatHandler) {
        this.strategy.onAttack(this.character, other.character, this.attackDelay);
    }

    private damageTimeout: NodeJS.Timeout = null;

    public leaveMap() {
        const { damageTimeout } = this;

        if(damageTimeout != null) {
            clearTimeout(damageTimeout);
        }
    }

    public stop() {
        const { strategy, character } = this;
        strategy.onLoseTarget(character);
    }

    public heal(value: number) {
        const self = this.character
        this.character.map.broadcast(
            new HitSplatPacket(self.type, self.id, "heal", value)
        )

        this.health = Math.min(this.health + value, this.maxHealth)
    }

    public delayDamage(other: CombatHandler, callback: () => [HitSplatType, number], delay: number) {
        other.damageTimeout = setTimeout(() => {
            const damage = callback();
            this.damage(other, damage);
        }, delay);
    }

    public damage(other: CombatHandler, damage: [HitSplatType, number]) {
        const { character: self } = this;
        const [type, value] = damage;

        other.retaliate(self);
        if(self.type == "player") {
            other.damageCounter.count(self.id, value);
        }
        other.applyDamage(value, type);
    }

    public applyDamage(value: number, type: HitSplatType) {
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