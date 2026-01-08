
import { CombatSimulation } from "../combat/combat-simulation";
import { NpcCombatHandler } from "../combat/npc-combat";
import { db } from "../db/db";
import { attributeIds, isAttribId } from "../player/attrib";
import { Player } from "../player/player";
import { POINTS_PER_LEVEL } from "../player/player-level";
import { isSkill, MAX_SKILL_LEVEL, skills } from "../player/skills";
import { BankWindow } from "../player/window/bank-window";
import { SceneInstance } from "../scene/scene-instance";
import { Colors } from "../util/color";
import { formatStrings } from "../util/util";
import { playerHandler, itemDataHandler, commandHandler, weatherHandler, sceneHandler, npcDataHandler } from "../world";
import { CommandCallback } from "./command-handler";

function onMeTo(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: '/meto player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    player.goToMap(other.map, other.x, other.y)
}

function onToMe(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: '/tome player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    other.goToMap(player.map, player.x, player.y)
}

function onItem(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: '/item [player_name] item_id [amount]'")
        return
    }

    let toPlayer = player
    let itemArg = args[0]
    let amountArg = "1"

    if (args.length == 2) {
        amountArg = args[1]
    } else if (args.length > 2) {
        toPlayer = playerHandler.getName(args[0])
        if (toPlayer == null) {
            player.sendNotification(`Could not find player: ${args[0]}`)
            return
        }

        itemArg = args[1]
        amountArg = args[2]
    }

    const item = itemDataHandler.get(itemArg)
    if (item == null) {
        player.sendNotification(`Could not find item: ${itemArg}`)
        return
    }

    const amount = parseInt(amountArg, 10)
    if (isNaN(amount)) {
        player.sendNotification(`Amount '${amountArg}' is not a valid integer`)
        return
    }

    if (toPlayer != player) {
        player.sendNotification(`Gave ${toPlayer.name} ${amount}x ${item.name}`)
        toPlayer.sendNotification(`${player.name} gives you ${amount}x ${item.name}`)
    } else {
        player.sendNotification(`Added ${amount}x ${item.name}`)
    }

    toPlayer.inventory.addData(item, amount)
}

function onEmpty(player: Player, _: any) {
    player.inventory.empty()
    player.sendNotification("Emptied inventory")
}

function onPos(player: Player, _: string[]) {
    player.sendNotification(`Current pos: (${player.x}, ${player.y}) @ ${player.map.id}`)
}

function onSet(player: Player, args: string[]) {
    if (args.length < 2) {
        player.sendNotification("Correct usage: /set attrib_id value")
        player.sendNotification(`attrib_ids: ${formatStrings(attributeIds, "[", ", ", "]")}`)
        return
    }

    const attribId = args[0]
    const value = parseInt(args[1])

    if (!isAttribId(attribId)) {
        player.sendNotification(`attrib_id '${attribId}' is invalid`)
        player.sendNotification(`attrib_ids: ${formatStrings(attributeIds, "[", ", ", "]")}`)
        return
    }

    if (isNaN(value)) {
        player.sendNotification(`value '${value}' is not a valid integer`)
        return
    }

    player.attributes.setBase(attribId, value)
    player.sendNotification(`Set ${attribId} to ${value}`)
}

function onBrightness(player: Player, args: string[]) {
    let brightness: number

    if (args.length < 1 || isNaN(brightness = parseFloat(args[0]))) {
        player.sendNotification("Correct usage: /brightness value")
        return
    }

    player.sendNotification(`Brightness set to ${brightness}`)
    weatherHandler.brightness = brightness

    weatherHandler.enableClock = false
}

function onClock(player: Player, _: any) {
    weatherHandler.enableClock = !weatherHandler.enableClock
    player.sendNotification(`Weather clock ${weatherHandler.enableClock ? "enabled" : "disabled"}`)
}

function onWeather(player: Player, _: any) {
    weatherHandler.dynamicWeatherActive = !weatherHandler.dynamicWeatherActive
    player.sendNotification(`Dynamic weather ${weatherHandler.dynamicWeatherActive ? "activated" : "deactivated"}`)
}

function onTele(player: Player, args: string[]) {
    let xarg: any
    let yarg: any

    let map = player.map

    if (args.length == 2) {
        xarg = args[0]
        yarg = args[1]
    } else if (args.length == 3) {
        map = sceneHandler.get(args[0])
        if (map == null) {
            player.sendNotification(`map_id ${args[0]} does not exist`)
            return
        }

        xarg = args[1]
        yarg = args[2]
    } else {
        player.sendNotification("Correct usage: /tele [map_id] x y")
        return
    }

    const x = parseInt(xarg)
    const y = parseInt(yarg)

    let isNumber = !(isNaN(x) || isNaN(y))
    let isInRange = isNumber && x >= 0 && y >= 0 && x < map.width && y < map.height

    if (!isInRange) {
        player.sendNotification(`Invalid coords (${xarg}, ${yarg})`)
        return
    }

    player.goToMap(map, x, y)
}

function onPsim(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /psim player_name")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    const simulation = new CombatSimulation(player, other.combatHandler, other.name)
    simulation.simulate()
}

function onMsim(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /msim monster_id")
        return
    }

    const npc = npcDataHandler.get(args[0])
    if (npc == null) {
        player.sendNotification(`Invalid monster_id (${args[0]})`)
        return
    }

    if (npc.combatData == null) {
        player.sendNotification(`Monster (${args[0]}) is not attackable`)
        return
    }

    const combatHandler = new NpcCombatHandler(null, npc.combatData)
    const simulation = new CombatSimulation(player, combatHandler, npc.name)
    simulation.simulate()
}

function onLevel(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /level target_level")
        return
    }

    const targetArg = args[0]
    const target = parseInt(targetArg)

    if (isNaN(target) || target <= 0) {
        player.sendNotification(`${targetArg} is not a valid level`)
        return
    }

    player.level.experience = 0
    player.level.setLevel(target)

    attributeIds.forEach(a => player.attributes.setBase(a, 0, false))
    player.attributes.setPoints((target - 1) * POINTS_PER_LEVEL)
}

function onSkill(player: Player, args: string[]) {
    if (args.length < 2) {
        player.sendNotification("Correct usage: /skill skill_id target_level");
        return;
    }

    const skillId = args[0];
    if (!isSkill(skillId)) {
        player.sendNotification(`skill_id '${skillId}' is invalid`);
        player.sendNotification(`skill_ids: ${formatStrings(skills, "[", ", ", "]")}`);
        return
    }

    const targetArg = args[1];
    const target = parseInt(targetArg);
    if (isNaN(target) || target <= 0 || target > MAX_SKILL_LEVEL) {
        player.sendNotification(`'${targetArg}' is not a valid skill level`)
        return
    }

    player.skills.setProgress(skillId, target, 0);
}

function onSkillXp(player: Player, args: string[]) {
    if (args.length < 2) {
        player.sendNotification("Correct usage: /skillxp skill_id experience");
        return;
    }

    const skillId = args[0];
    if (!isSkill(skillId)) {
        player.sendNotification(`skill_id '${skillId}' is invalid`);
        player.sendNotification(`skill_ids: ${formatStrings(skills, "[", ", ", "]")}`);
        return
    }

    const xpArg = args[1];
    const xp = parseInt(xpArg);
    if (isNaN(xp) || xp <= 0) {
        player.sendNotification(`'${xpArg}' is not a valid, positive integer`)
        return
    }

    player.skills.addExperience(skillId, xp);
}

function onKick(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /kick player_name")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    player.sendNotification(`Kicked player: ${other.name}`)
    other.sendMessage(Colors.red, "You are kicked from the server.")
    other.kick()
}

function onBan(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /ban player_name")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    player.sendNotification(`Banned player: ${other.name}`)
    other.sendMessage(Colors.red, "You are banned. GG")
    other.kick()
    db.users.ban(other.persistentId)
}

function onMute(player: Player, args: string[]) {
    if (args.length == 0) {
        player.sendNotification("Correct usage: /mute player_name")
        return
    }

    const other = playerHandler.getName(args[0])
    if (other == null) {
        player.sendNotification(`Could not find player: ${args[0]}`)
        return
    }

    player.sendNotification(`Muted player: ${other.name}`)
    other.sendNotification("You have been muted")
    other.mute = true
}

function onSprite(player: Player, args: string[]) {
    if(args.length < 2) {
        player.sendNotification("Correct usage: /sprite [player_name] folder sprite");
        return;
    }

    let target = player;
    let folderArg = args[0];
    let spriteArg = args[1];

    if(args.length > 2) {
        target = playerHandler.getName(args[0]);
        if(target == null) {
            player.sendNotification(`Could not find player: ${args[0]}`);
            return;
        }
        folderArg = args[1];
        spriteArg = args[2];
    }

    const folders = ["char", "item", "obj" ];
    if(!folders.some(x => x === folderArg)) {
        player.sendNotification(`folder '${folderArg}' is invalid`);
        player.sendNotification(`folders: ${formatStrings(folders, "[", ", ", "]")}`);
        return;
    }

    target.tempSprite = `${folderArg}/${spriteArg}.png`;
}

export function initCommands() {
    const ch = commandHandler
    const playerCommand = (command: string, callback: CommandCallback) => {
        ch.on(command, callback, 0)
    }
    const devCommand = (command: string, callback: CommandCallback) => {
        ch.on(command, callback, 1)
    }

    playerCommand("players", p => {
        p.sendNotification(`There are ${playerHandler.count} players online`)
    })

    playerCommand("accept", p => {
        p.tradeHandler.acceptRequest()
    })

    devCommand("bank", (p) => {
        p.window = new BankWindow(p)
    })

    devCommand("msim", onMsim)
    devCommand("psim", onPsim)
    devCommand("item", onItem)
    devCommand("empty", onEmpty)
    devCommand("pos", onPos)
    devCommand("set", onSet)
    devCommand("meto", onMeTo)
    devCommand("tome", onToMe)
    devCommand("brightness", onBrightness)
    devCommand("clock", onClock)
    devCommand("weather", onWeather)
    devCommand("tele", onTele)
    devCommand("level", onLevel)
    devCommand("skill", onSkill);
    devCommand("skillxp", onSkillXp);
    devCommand("kick", onKick)
    devCommand("ban", onBan)
    devCommand("mute", onMute)
    devCommand("sprite", onSprite);
}