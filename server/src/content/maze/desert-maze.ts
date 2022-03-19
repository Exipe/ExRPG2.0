import { Player } from "../../player/player"
import { Dialogue } from "../../player/window/dialogue"
import { yellow } from "../../util/color"
import { actionHandler } from "../../world"
import { DesertMazeScene } from "./desert-maze-scene"

const START_MAZE = "start_maze"
const MOVE_UP = "maze_up"
const MOVE_RIGHT = "maze_right"
const MOVE_DOWN = "maze_down"
const MOVE_LEFT = "maze_left"
const EXIT_SNAKE_PIT = "exit_snake_pit"
const EXIT_MAZE_MINE = "exit_maze_mine"
const EXIT_DESERT_TOWN = "exit_desert_town"

function moveTrigger(player: Player, action: string) {
    const map = player.map
    let x = 0
    let y = 0

    switch(action) {
        case MOVE_UP:
            y = -1
            break
        case MOVE_RIGHT:
            x = 1
            break
        case MOVE_DOWN:
            y = 1
            break
        case MOVE_LEFT:
            x = -1
            break
    }

    if(!(map instanceof DesertMazeScene)) {
        return
    }

    map.move(player, x, y)
}

export function initDesertMaze() {
    actionHandler.onObject("ladder_maze", (player) => {
        player.goTo('desert', 24, 44)
    })

    actionHandler.onTrigger(MOVE_UP, moveTrigger)
    actionHandler.onTrigger(MOVE_RIGHT, moveTrigger)
    actionHandler.onTrigger(MOVE_DOWN, moveTrigger)
    actionHandler.onTrigger(MOVE_LEFT, moveTrigger)

    actionHandler.onTrigger(START_MAZE, (player) => {
        player.goToMap(new DesertMazeScene(), 5, 0)
    })

    actionHandler.onTrigger(EXIT_SNAKE_PIT, (player) => {
        player.goToMap(new DesertMazeScene(1, 1), 0, 5)
    })

    actionHandler.onTrigger(EXIT_MAZE_MINE, (player) => {
        player.goToMap(new DesertMazeScene(2, 3), 5, 0)
    })

    actionHandler.onTrigger(EXIT_DESERT_TOWN, (player) => {
        player.goToMap(new DesertMazeScene(4, 3), 5, 10)
    })

    actionHandler.onNpc('old_man', (player, npc) => {
        const notEnoughDialogue = new Dialogue(npc.data.name, [
            'You do not seem to have enough coins.',
            'Quit wasting my time.'
        ])

        const dialogue = new Dialogue(npc.data.name, [
            'Are you having trouble finding your way through the maze?',
            'If you would like, I can take you to the other end for the fair price of 200 coins.'
        ])

        dialogue.addOption('Yes please', () => {
            const inv = player.inventory
            const coins = inv.count('coins')

            if(coins >= 200) {
                inv.remove('coins', 200)
                // player.goTo('desert_town_entrance', 5, 2)
                player.sendNotification('You are blindfolded and lead through the maze', yellow)
                return null
            }

            return notEnoughDialogue
        })

        dialogue.addOption('No thanks', () => {
            return null
        })

        player.window = dialogue
    })
}