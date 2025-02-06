import { SequenceBuilder } from "../character/sequence-task"
import { ChatBubblePacket } from "../connection/outgoing-packet"
import { ObjectData } from "../object/object-data"
import { Player } from "../player/player"
import { Colors, green, red } from "../util/color"
import { randomChance, randomInt } from "../util/util"
import { actionHandler, itemDataHandler, npcDataHandler, objDataHandler, tickCount } from "../world"

export const initNewbieCave = () => {
    const ladder = objDataHandler.get("ladder_newbie_cave")
    const door = objDataHandler.get("door_newbie_cave")
    const chest = objDataHandler.get("chest_newbie_cave")
    const sleepingImp = npcDataHandler.get("sleepy_imp");

    actionHandler.onObject(ladder.id, (player) => {
        player.goTo('newbie_north_route', 8, 5)
    })

    actionHandler.onObject(door.id, unlockDoors)
    actionHandler.onObject(chest.id, openChest)

    actionHandler.onNpcTick(sleepingImp.id, (npc) => {
        if(tickCount % 50 != 0) {
            return;
        }

        npc.sendChatBubble("Zzz")
    })
}

const unlockDoors = (player: Player) => {
    if(!player.inventory.hasItem("key_imp_treasure")) {
        player.sendNotification("You need the right key to unlock the door", red)
        return
    }

    const sequence = new SequenceBuilder<Player>()
    sequence.character = player

    player.sendMessage("You fiddle around with the lock...")

    sequence
    .sleep(2500)
    .then((p) => {
        if(!p.inventory.tryRemove("key_imp_treasure", 1)) {
            p.stop()
        }
    })
    
    if(randomChance(2)) {
        sequence
        .then((p) => {
            p.sendMessage("The key breaks as the lock clicks open")
            p.sendMessage("You begin to push the heavy doors open...")
        })
        .sleep(2500)
        .then((p) => {
            p.goTo("newbie_cave_entrance", 2, 23)
            p.setVar("treasure_chest_open", true)
            p.sendNotification("You pass through the doors", green)
        })
    } else {
        sequence.then((p) => {
            p.sendNotification("The key breaks to no avail", red)
        })
    }

    player.taskHandler.setTask(sequence.build(), false)
}

const openChest = (player: Player) => {
    const treasureChestOpen = player.getVar<boolean>("treasure_chest_open") ?? false
    if(!treasureChestOpen) {
        player.sendNotification("The chest won't open again", red)
        return
    }

    player.setVar("treasure_chest_open", false)
    player.sendMessage("You start rummaging around the chest...")

    const sequence = new SequenceBuilder<Player>()
    sequence.character = player

    const closeLid = (p: Player) => {
        if(p.inventory.hasSpace() && randomChance(2)) {
            return
        }

        player.sendNotification("The lid slams shut on your fingers", red)
        player.sendChatBubble("Fricking heck!!")
        player.combatHandler.applyDamage(2, "hit")
        player.stop()
    }

    const arrows = itemDataHandler.get("arrows_crude")
    const coins = itemDataHandler.get("coins")
    const goldIngot = itemDataHandler.get("ingot_gold")
    const pirateHat = itemDataHandler.get("pirate_hat")

    sequence.sleep(2500)
    .then(closeLid)
    .then((p) => {
        const amount = randomInt(1, 10)
        p.inventory.add(arrows.id, amount)
        p.sendMessage(`You find ${amount}x ${arrows.name}`)
        p.sendMessage("You continue searching...")
    })
    .sleep(2500)
    .then(closeLid)
    .then((p) => {
        const amount = randomInt(250, 500)
        p.inventory.add(coins.id, amount)
        p.sendMessage(`You find ${amount}x ${coins.name}`)
        p.sendMessage("You continue searching...")
    })
    .sleep(2500)
    .then(closeLid)
    .then((p) => {
        p.inventory.add(goldIngot.id, 1)
        p.sendMessage(`You find a ${goldIngot.name}`)
        p.sendMessage("You continue searching...")
    })
    .sleep(2500)
    .then(closeLid)
    .then((p) => {
        p.inventory.add(pirateHat.id, 1)
        p.sendNotification(`You find the ${pirateHat.name}!`, green)
    })

    player.taskHandler.setTask(sequence.build(), false)
}