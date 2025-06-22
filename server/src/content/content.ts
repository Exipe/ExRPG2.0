
import { actionHandler, craftingHandler, objDataHandler, shopHandler } from "../world"
import { Dialogue } from "../player/window/dialogue"
import { randomChance, randomInt } from "../util/util"
import { initFood } from "./food"
import { initDrops } from "./drops"
import { green, red } from "../util/color"
import { initMining } from "./gathering/mining"
import { initDialogue } from "./dialogue"
import { initDesertMaze } from "./maze/desert-maze"
import { initFishing } from "./fishing"
import { initCraftingUnlocks } from "./crafting-unlock"
import { initWoodcutting } from "./gathering/woodcutting"
import { SequenceBuilder } from "../character/sequence-task"
import { Player } from "../player/player"
import { initNewbieCave } from "./newbie-cave"

export function initContent() {
    initFood()
    initDrops()
    initCraftingUnlocks()
    initMining()
    initWoodcutting()
    initFishing()
    initDialogue()
    initDesertMaze()
    initNewbieCave()

    const rope = objDataHandler.get("rope");
    actionHandler.onObject(rope.id, (player, _action, objX, bottom) => {
        const top = bottom - rope.depth + 1;
        
        let startY: number, endY: number;
        let direction: string;
        
        if(player.y <= top) {
            startY = top - 1;
            endY = bottom + 1;
            direction = "down";
        } else {
            startY = bottom + 1;
            endY = top - 1;
            direction = "up";
        }
        
        const sequence = new SequenceBuilder<Player>();
        sequence.interruptible = false;
        sequence.character = player;

        if(player.x != objX || player.y != startY) {
            sequence
            .sleep(500)
            .then((p) => p.move(objX, startY, true, 500))
            .sleep(500);
        }

        sequence
        .sleep(500)
        .then((p) => p.move(objX, endY, true, 2500))
        .sleep(2500)
        .then((p) => p.sendMessage(`You climb ${direction} the rope`));

        player.taskHandler.setTask(sequence.build(), false);
    });

    actionHandler.onObject("cactus", (player) => {
        player.sendChatBubble("Ow! >.<")
        player.combatHandler.applyDamage(1, "hit")
        player.sendMessage("You sting yourself on the cactus. Why did you think that was a good idea..?")
    })

    actionHandler.onObject("ladder_dungeon", (player) => {
        player.goTo('newbie_capital', 10, 3)
    })

    actionHandler.onObject("door_skeleton_boss", (player) => {
        if(!player.inventory.hasItem('key_skeleton_dungeon')) {
            player.sendNotification("You need a key to unlock this door", red)
            return
        }

        const dialoge = new Dialogue("Warning", [
            "You are about to enter Ikkedoden's chamber.",
            [red.toString(), "Players below level 30 are adviced to stay away."]
        ])
        dialoge.addOption("Enter chamber", () => {
            if(player.inventory.remove('key_skeleton_dungeon', 1) == 0) {
                player.goTo('skeleton_boss_chamber', 4, 9)
            }

            return null
        })
        dialoge.addOption("Never mind", () => {
            return null
        })
        player.window = dialoge
    })

    actionHandler.onObject("door_open", (player, _action, ox, oy) => {
        player.map.addTempObj("door_closed", ox, oy)
    })

    actionHandler.onObject("door_closed", (player, _action, ox, oy) => {
        player.map.addTempObj("door_open", ox, oy)
    })
    
    actionHandler.onObject("fence_open", (player, _action, ox, oy) => {
        player.map.addTempObj("fence_closed", ox, oy)
    })

    actionHandler.onObject("fence_closed", (player, _action, ox, oy) => {
        player.map.addTempObj("fence_open", ox, oy)
    })

    actionHandler.onObject("anvil", player => {
        player.window = craftingHandler.get("Anvil")
    })

    actionHandler.onObject("furnace", player => {
        player.window = craftingHandler.get("Furnace")
    })

    actionHandler.onObject("range", player => {
        player.window = craftingHandler.get("Range")
    })

    actionHandler.onObject("fountain", player => {
        if(!player.inTimeLimit(120_000)) {
            return
        }

        const ch = player.combatHandler
        ch.heal(ch.maxHealth-ch.health)
        player.sendNotification("You drink from the fountain and feel rejuvenated", green)
    })

    actionHandler.onObject("car", (player, action) => {
        if(action == "drive") {
            player.sendMessage("Car racing - coming soon™!")
        }
    })

    actionHandler.onObject("crate_small", (player, action) => {
        if(action != "search" || !player.inTimeLimit(60_000)) {
            return
        }

        if(randomChance(2)) {
            player.sendMessage("You find an apple.")
            player.inventory.add("apple", 1)
        } else {
            player.sendMessage("You find some coins.")
            player.inventory.add("coins", randomInt(1, 3))
        }
    })

    const appleTree = objDataHandler.get("tree_apple")
    actionHandler.onObject(appleTree.id, (player, action, ox, oy) => {
        if(action != 'pick_from') {
            return
        }

        player.map.addTempObj('tree_common', ox, oy, 10_000)
        player.sendNotification("You pick an apple", green)
        player.inventory.add('apple', 1)
    })

    actionHandler.onObject('bush_strawberry', (player, _, ox, oy) => {
        player.map.addTempObj('bush', ox, oy, 10_000)
        player.sendNotification("You pick a strawberry", green)
        player.inventory.add('strawberry', 1)
    })

    actionHandler.onNpc("t_t_c", (player, npc, action) => {
        if(action != "talk-to") {
            return
        }

        const dialogue = new Dialogue(npc.data.name, [
            `Hello, ${player.name}.`, "What can I help you with?"
        ])

        dialogue.addOption("Let's trade", () => {
            player.window = shopHandler.get("Tony's Tools for Aspiring Adventurers")
            return null
        })

        dialogue.addOption("Never mind", () => null)

        player.window = dialogue
    })

    actionHandler.onNpc("carl_armor", (player, npc, action) => {
        const shop = shopHandler.get("Carl's Armor")
        
        const dialogue = new Dialogue(npc.data.name, [
            "Greetings adventurer.",
            "Would you like to see my selection of armor?"
        ])

        dialogue.addOption("Yes please", () => {
            player.window = shop
            return null
        })

        dialogue.addOption("I'm fine", () => null)

        switch(action) {
            case "trade":
                player.window = shop
                break
            case "talk-to":
                player.window = dialogue
                break
        }
    })

    actionHandler.onNpc("lewis_archery", (player, npc, action) => {
        const shop = shopHandler.get("Lewis's Archery Goods");
        const dialogue = new Dialogue(npc.data.name, [
            "Hello there!",
            "You look like you might be interested in archery.",
            "May I show you my goods?"
        ]);

        dialogue.addOption("Sure, I'll have a look!", () => {
            player.window = shop;
            return null;
        });

        dialogue.addOption("No thanks, I'll be on my way", () => null);

        switch(action) {
            case "trade":
                player.window = shop
                break
            case "talk-to":
                player.window = dialogue
                break
        }
    })

    actionHandler.onNpc("cat_white", (player, npc, action) => {
        if(action != "pet") {
            return
        }

        const dialogue = randomChance(50) ? 
            new Dialogue("猫", [ "にゃー。" ]) :
            new Dialogue(npc.data.name, [ "Meow." ])
        player.window = dialogue
    })
}
