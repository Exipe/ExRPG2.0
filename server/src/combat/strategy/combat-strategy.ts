import { Character } from "../../character/character";

export interface CombatStrategy {
    reaches(self: Character, other: Character): boolean;
    onAttack(self: Character, target: Character, delay: number): void;
    onTarget(self: Character, target: Character): void;
    onLoseTarget(self: Character): void;
}