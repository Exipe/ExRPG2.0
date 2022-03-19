import { Player } from "../../player/player";
import { SceneInstance } from "../../scene/scene-instance";
import { sceneHandler } from "../../world";

const MAZE_WIDTH = 5
const MAZE_HEIGHT= 5

const START_X = 2
const START_Y = 0

const rooms = []

for(let i = 0; i < MAZE_WIDTH; i++) {
    const col = []
    rooms.push(col)

    for(let j = 0; j < MAZE_HEIGHT; j++) {
        col.push({
            blockUp: true,
            blockRight: true,
            blockDown: true,
            blockLeft: true,
        })
    }
}

function openUp(x: number, y: number, twoWay = true) {
    rooms[x][y].blockUp = false

    if(twoWay) { openDown(x, y-1, false) }
}

function openRight(x: number, y: number, twoWay = true) {
    rooms[x][y].blockRight = false

    if(twoWay) { openLeft(x+1, y, false) }
}

function openDown(x: number, y: number, twoWay = true) {
    rooms[x][y].blockDown = false

    if(twoWay) { openUp(x, y+1, false) }
}

function openLeft(x: number, y: number, twoWay = true) {
    rooms[x][y].blockLeft = false

    if(twoWay) { openRight(x-1, y, false) }
}

// start -> snakes
openDown(2, 0)
openLeft(2, 1)
openLeft(1, 1, false)

// start -> crossroad
openRight(2, 0)
openDown(3, 0)
openDown(3, 1)

// crossroad -> exit
openRight(3, 2)
openDown(4, 2)
openDown(4, 3)

// crossroad -> mine
openDown(3, 2)
openLeft(3, 3)
openUp(2, 3, false)

export class DesertMazeScene extends SceneInstance {

    private x: number
    private y: number

    constructor(x = START_X, y = START_Y) {
        super(sceneHandler.get('desert_maze'))
        this.x = x
        this.y = y
    }

    private goToStart(player: Player) {
        player.sendMessage("You get lost on the way")
        player.goTo('desert_maze_start', 5, 5)
    }

    private updateMap(player: Player, tileX: number, tileY: number) {
        if(this.x == 0 && this.y == 1) {
            player.goTo('snake_pit', 19, 10)
        } else if(this.x == 2 && this.y == 2) {
            player.goTo('maze_mine', 7, 15)
        } else if(this.x == 4 && this.y == 4) {
            // player.goTo('desert_town_entrance', 5, 2)
        } else {
            player.goToMap(this, tileX, tileY)
        }
    }

    public move(player: Player, x: number, y: number) {
        const room = rooms[this.x][this.y]

        let tileX = -1
        let tileY = -1

        if(y == -1 && !room.blockUp) {
            tileX = 5
            tileY = 10
        }
        else if(x == 1 && !room.blockRight) {
            tileX = 0
            tileY = 5
        } 
        else if(y == 1 && !room.blockDown) {
            tileX = 5
            tileY = 0
        }
        else if(x == -1 && !room.blockLeft) {
            tileX = 10
            tileY = 5
        } else {
            this.goToStart(player)
            return
        }

        this.x += x
        this.y += y
        player.sendNotification(`Move to: ${this.x}, ${this.y}`)
        this.updateMap(player, tileX, tileY)
    }

}