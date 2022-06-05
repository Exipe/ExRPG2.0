
import { PrimaryTask } from "../character/task";

export class Combat extends PrimaryTask {

    public get delay() {
        return this.character.combatHandler.attackDelay
    }

    tick() {
        const self = this.character
        const target = self.target

        if(target == null ||!self.combatHandler.strategy.reaches(self, target)) {
            self.taskHandler.stopTask(this)
            return
        }

        self.combatHandler.attack(target.combatHandler)
    }

    stop() {
        this.character.combatHandler.stop();
    }

}