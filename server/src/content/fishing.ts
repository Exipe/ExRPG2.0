import { PrimaryTask } from "../character/task";
import { ObjectData } from "../object/object-data";
import { Player } from "../player/player";
import { Scene } from "../scene/scene";
import { actionHandler, objDataHandler } from "../world";

export class Fishing extends PrimaryTask {
    
    private readonly player: Player
    private readonly map: Scene
    private readonly objData: ObjectData
    private readonly objX: number
    private readonly objY: number

    constructor(player: Player, objData: ObjectData, objX: number, objY: number) {
        super(player)
        this.player = player
        this.map = player.map
        this.objData = objData
        this.objX = objX
        this.objY = objY
    }

    private get reachesResource() {
        return this.map.reachesObject(this.player.x, this.player.y, this.objData, this.objX, this.objY)
    }

    get delay() {
        return 15_000
    }

    private indicator() {
        this.player.showIndicator('fishing_rod', this.delay)
    }

    public start() {
        const player = this.player
        if(!player.inventory.hasItem('fishing_rod')) {
            player.sendMessage("You need a fishing rod to fish")
            return
        }

        if(!player.inventory.hasSpace()) {
            player.sendMessage("You've got no room to carry the fish")
            return
        }

        this.player.taskHandler.setTask(this, false)
        this.indicator()
    }

    public stop() {
        this.player.removeIndicator()
    }

    tick() {
        const player = this.player

        if(!this.reachesResource || !player.inventory.hasItem('fishing_rod')) {
            player.taskHandler.stopTask(this)
            return
        }

        player.inventory.add('fish', 1)
        const cont = player.inventory.hasItem('fishing_rod') && player.inventory.hasSpace()
        if(!cont) {
            player.taskHandler.stopTask(this)
            return
        }

        this.indicator()
    }

}

function addFishingSpot(id: string) {
    const obj = objDataHandler.get(id)
    if(obj == null) {
        throw `[Invalid fishing data] unknown object: ${id}`
    }

    actionHandler.onObject(id, (p, action, ox, oy) => {
        if(action == "fish_in") {
            const task = new Fishing(p, obj, ox, oy)
            task.start()
        }
    })
}

export function initFishing() {
    addFishingSpot('fishing_spot')
    addFishingSpot('fishing_spot_up')
    addFishingSpot('fishing_spot_right')
    addFishingSpot('fishing_spot_down')
    addFishingSpot('fishing_spot_left')
}
