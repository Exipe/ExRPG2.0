
import { Player } from "../player/player"
import { Character } from "./character"
import { Task } from "./task"

export class Walking implements Task {

    private readonly character: Character

    private steps: [number, number][] = []

    private _goalX: number
    private _goalY: number

    private _goal: [() => void, boolean]
    private _idle: () => void

    public lastExecution = -1

    constructor(character: Character) {
        this.character = character
    }

    public get delay() {
        return this.character.walkDelay
    }

    private setGoalCoordinates(x: number, y: number) {
        this._goalX = x
        this._goalY = y
        this.character.taskHandler.setTask(this)
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
            this.character.taskHandler.stopTask(this)

            if(this._goal != null) {
                const [goal, persistence] = this._goal
                goal()

                if(persistence) { //do not clear goal, do not start idle task
                    return
                }

                this._goal = null
            }

            if(this._idle != null) {
                this._idle()
            }
        }
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

    public set goal(goal: () => void) {
        if(this.still) {
            goal()
            return
        }

        this._goal = [goal, false]
    }

    public set persistentGoal(goal: () => void) {
        this._goal = [goal, true]

        if(this.still) {
            goal()
        }
    }

    public set idle(idle: () => void) {
        if(this.still) {
            idle()
        }

        this._idle = idle
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