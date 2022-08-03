import { isPlayer } from "../player/player";
import { Character } from "./character";
import { PrimaryTask } from "./task";

type SequenceStep<T extends Character> = {
    delay: number,
    action: (c: T) => void;
};

export class SequenceTask<T extends Character> extends PrimaryTask {

    private readonly steps: SequenceStep<T>[];

    private iterator: number = 0;

    public constructor(character: T, steps: SequenceStep<T>[], interruptible: boolean) {
        super(character);
        this.steps = steps;
        this.interruptible = interruptible;
    }

    tick() {
        const { steps, character } = this;

        const step = steps[this.iterator];
        step.action(character as T);
        this.iterator++;

        if(this.iterator >= steps.length) {
            character.taskHandler.stopTask(this);
        }
    }

    stop() {}

    get delay() {
        return this.steps[this.iterator].delay;
    }

}

export class SequenceBuilder<T extends Character> {

    private readonly steps: SequenceStep<T>[] = [];
    public character: T;
    public interruptible = true;

    private nextDelay = 0;

    public sleep(ms: number) {
        if(ms < -1) {
            throw "ms must be a positive number";
        }

        this.nextDelay = this.nextDelay + ms;
        return this;
    }

    public then(action: (character: T) => void) {
        const step: SequenceStep<T> = {
            action,
            delay: this.nextDelay
        };

        this.nextDelay = 0;
        this.steps.push(step);

        return this;
    }

    public build() {
        return new SequenceTask<T>(this.character, this.steps, this.interruptible);
    }

}