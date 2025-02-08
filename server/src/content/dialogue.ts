import { Npc } from "../npc/npc"
import { Player } from "../player/player"
import { BankWindow } from "../player/window/bank-window"
import { Dialogue } from "../player/window/dialogue"
import { actionHandler, weatherHandler } from "../world"

const talkToBanker = (player: Player, npc: Npc, action: string) => {
    if(action != "talk-to") {
        return
    }

    const dialogue = new Dialogue(npc.data.name, [
        "Greetings adventurer.",
        "Would you like to access your bank?"
    ])

    dialogue.addOption("Yes please", () => {
        player.window = new BankWindow(player)
        return null
    })

    dialogue.addOption("No thanks", () => null)

    player.window = dialogue
}

const talkToMan = (player: Player, npc: Npc, action: string) => {
    if(action != "talk-to") {
        return
    }

    let message: string[]
    const timeOfDay = weatherHandler.timeOfDay

    switch(timeOfDay) {
        case "DAY":
            message = ["Good day, sir."]
            break
        case "MORNING":
            message = ["Good morning, sir."]
            break
        case "EVENING":
        case "NIGHT":
            message = ["Good evening, sir."]
            break
    }

    player.window = new Dialogue(npc.data.name, message)
}

export function initDialogue() {
    const men = [ "man_a", "man_b", "man_c", "woman_a", "woman_b", "woman_c", "woman_d" ]
    men.forEach(m => actionHandler.onNpc(m, talkToMan))
    actionHandler.onNpc("banker_a", talkToBanker)
    actionHandler.onNpc("banker_b", talkToBanker)
}