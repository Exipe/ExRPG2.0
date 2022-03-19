import { playerHandler } from "../world"

export class DamageCounter {

    private damageDealt = new Map<number, number>()

    public count(pid: number, damage: number) {
        let current = this.damageDealt.get(pid)
        if(current == null) {
            current = 0
        }

        this.damageDealt.set(pid, current + damage)
    }

    public determineKiller() {
        let highest = [-1, -1]

        this.damageDealt.forEach((damage, pid) => {
            if(damage > highest[0]) {
                highest = [damage, pid]
            }
        })

        this.damageDealt = new Map<number, number>()
        return playerHandler.get(highest[1])
    }

}