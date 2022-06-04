
import { Character } from "./character"
import { Task } from "./task"

export type Goal = {
    callback: () => void,
    criteriaMet: () => boolean,
    persistent: boolean
}

export class Walking implements Task {

    private readonly character: Character

    private steps: [number, number][] = []

    private _goalX: number
    private _goalY: number

    private _goal: Goal = null

    public lastExecution = -1

    constructor(character: Character) {
        this.character = character
    }

    public get delay() {
        return this.character.walkDelay
    }

    private checkGoal() {
        if(this._goal == null || !this._goal.criteriaMet()) {
            return;
        }

        const { callback, persistent } = this._goal;
        callback();

        if(!persistent) {
            this._goal = null;
            this.character.taskHandler.stopTask(this);
        }
    }

    private setGoalCoordinates(x: number, y: number) {
        this._goalX = x;
        this._goalY = y;
        this.character.taskHandler.setTask(this);

        this.checkGoal();
    }

    public get still() {
        return this.steps.length == 0
    }

    public clear() {
        this.steps = []
        this._goalX = this.character.x
        this._goalY = this.character.y
        this._goal = null
    }

    public tick() {
        if(!this.still) {
            const step = this.steps.shift()
            this.character.walk(step[0], step[1])
        }

        if(this.still) {
            this.character.taskHandler.stopTask(this);
        }

        this.checkGoal();
    }

    private get map() {
        return this.character.map
    }

    public get goalX() {
        return this._goalX
    }

    public get goalY() {
        return this._goalY
    }

    public setGoal(callback: () => void, criteriaMet: () => boolean, persistent: boolean) {
        if(criteriaMet()) {
            callback();
            
            if(!persistent) return;
        }

        this._goal = {  callback, criteriaMet, persistent }
    }

    public set goal(goal: () => void) {
        this.setGoal(goal, () => this.still, false);
    }

    public set persistentGoal(goal: () => void) {
        this.setGoal(goal, () => this.still, true);
    }

    public followStep(x: number, y: number) {
        if(this.character.x == x && this.character.y == y) {
            this.steps = []
            return
        }

        let steps = []
        for(const step of this.steps) {
            steps.push(step)
            this._goalX = step[0]
            this._goalY = step[1]

            if(step[0] == x && step[1] == y) {
                break
            }
        }

        this.steps = steps
        this.addSteps(x, y)
    }

    public addSteps(goalX: number, goalY: number) {
        if(goalX < 0 || goalY < 0 || goalX >= this.map.width || goalY >= this.map.height) {
            return
        }

        let x = this._goalX
        let y = this._goalY

        let compare = (pos: number, goalPos: number) => {
            let diff = 0
            if(pos < goalPos) {
                diff = 1
            } else if(pos > goalPos) {
                diff = -1
            }
            return diff
        }

        while(x != goalX || y != goalY) {
            let diffX = compare(x, goalX)
            let diffY = compare(y, goalY)

            if(!this.character.walkable(x, y, diffX, diffY)) {
                break
            }

            x += diffX
            y += diffY
            this.steps.push([x, y])
        }

        this.setGoalCoordinates(x, y)
        return x == goalX && y == goalY
    }

    public stop() {}

}