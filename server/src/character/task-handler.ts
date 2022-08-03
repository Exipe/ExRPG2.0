
import { currentTime } from "../util/util"
import { Task } from "./task"

export class TaskHandler {

    private task: Task

    private timeout: NodeJS.Timeout = null

    private setTimeout(timer: number) {
        this.timeout = setTimeout(() => this.executeTask(), timer)
    }

    public setTask(task: Task, instant=true) {
        if(this.task == task) {
            return
        }

        this.stopTask();
        this.task = task

        if(!instant) {
            this.setTimeout(task.delay)
            return
        }

        const timePassed = currentTime() - task.lastExecution
        if(timePassed >= task.delay) {
            this.setTimeout(0)
        } else {
            this.setTimeout(task.delay - timePassed)
        }
    }

    public stopTask(task = this.task) {
        if(this.task != task) {
            return
        }

        if(this.task != null) {
            this.task.stop()
        }

        clearTimeout(this.timeout)
        this.task = null
    }

    private executeTask() {
        const { task } = this;

        task.lastExecution = currentTime()
        task.tick()
        
        if(this.task == task) {
            this.setTimeout(this.task.delay)
        }
    }

    public get stopped() {
        return this.task == null;
    }

    public get interruptible() {
        return this.task?.interruptible ?? true;
    }

    public isRunning(task: Task) {
        return this.task == task;
    }

}