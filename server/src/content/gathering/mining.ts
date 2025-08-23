
import { ObjectData } from "../../object/object-data"
import { Player } from "../../player/player"
import { skillNames } from "../../player/skills"
import { Colors } from "../../util/color"
import { randomChance } from "../../util/util"
import { actionHandler, itemDataHandler, objDataHandler } from "../../world"
import { Gathering, GatheringTool } from "./gathering"

interface OreData {
    item: string,
    hitPoints: number,
    respawnTimer: number,
    levelReq: number,
    experience: number,
    rareDrop: {
        chance: number,
        item: string
    } | null
}

const pickaxes: GatheringTool[] = [
    {
        itemId: "pickaxe_crude",
        hitOutput: [1, 3],
    },
    {
        itemId: "pickaxe_copper",
        hitOutput: [2, 5],
    },
    {
        itemId: "pickaxe_iron",
        hitOutput: [5, 10]
    }
];

export class Mining extends Gathering {

    private readonly oreData: OreData

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, ore: OreData) {
        super(player, objData, objX, objY,
            "ore_depleted", 625, 300, ore.respawnTimer, ore.hitPoints)
        this.oreData = ore
    }

    protected get toolTierList() {
        return pickaxes;
    }

    protected onLackTool() {
        this.player.sendMessage("You need a pickaxe to mine this ore.");
    }

    protected onSuccess() {
        const rareDrop = this.oreData.rareDrop;
        if (rareDrop != null && randomChance(rareDrop.chance)) {
            this.player.inventory.add(rareDrop.item, 1);
            this.player.sendMessage(Colors.green, "You find some mysterious essence in the rubble!");
            return;
        }

        this.player.inventory.add(this.oreData.item, 1);
        this.player.skills.addExperience("mining", this.oreData.experience);
    }

}

function addOre(objectId: string, oreData: OreData) {
    const ore = objDataHandler.get(objectId)
    if (ore == null) {
        throw `[Invalid mining data] unknown object: ${objectId}`
    }

    if (!itemDataHandler.get(oreData.item)) {
        throw `[Invalid mining data] unknown item: ${oreData.item}`
    }

    if (oreData.rareDrop != null && !itemDataHandler.get(oreData.rareDrop.item)) {
        throw `[Invalid mining data] unknown rare drop: ${oreData.rareDrop.item}`
    }

    actionHandler.onObject(objectId, (player, action, ox, oy) => {
        if (action == "mine") {
            if (player.skills.getLevel("mining") < oreData.levelReq) {
                player.sendMessage(`You need a ${skillNames.mining} level of ${oreData.levelReq} to mine this ore.`);
                return;
            }

            new Mining(player, ore, ox, oy, oreData).start();
        }
    })
}

export function initMining() {
    addOre('ore_copper', {
        "item": 'ore_copper',
        "respawnTimer": 30_000,
        "hitPoints": 15,
        "levelReq": 1,
        "experience": 30,
        "rareDrop": {
            "item": "essence_miner",
            "chance": 100
        }
    })

    addOre('ore_iron', {
        "item": "ore_iron",
        "respawnTimer": 120_000,
        "hitPoints": 30,
        "levelReq": 10,
        "experience": 65,
        "rareDrop": {
            "item": "essence_miner",
            "chance": 50
        }
    })

    addOre('ore_gold', {
        "item": "ore_gold",
        "respawnTimer": 300_000,
        "hitPoints": 60,
        "levelReq": 25,
        "experience": 150,
        "rareDrop": null
    })
}