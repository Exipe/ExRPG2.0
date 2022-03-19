import { Character } from "./character"

export interface Task {
    tick: () => void,
    stop: () => void,
    delay: number,
    lastExecution: number
}

/**
 * Represents a character's primary task
 * this is used for things like combat and skilling, which share a common timer
 * (ie. you can not cut a tree one millisecond, then mine a rock the very next one)
 */
export abstract class PrimaryTask implements Task {

    protected readonly character: Character

    constructor(character: Character) {
        this.character = character
    }

    abstract tick(): void
    abstract stop(): void
    
    abstract get delay(): number

    public set lastExecution(lastExecution: number) {
        this.character.lastPrimaryExecution = lastExecution
    }

    public get lastExecution() {
        return this.character.lastPrimaryExecution
    }

}