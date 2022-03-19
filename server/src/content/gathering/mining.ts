
import { ObjectData } from "../../object/object-data"
import { Player } from "../../player/player"
import { Colors } from "../../util/color"
import { randomChance } from "../../util/util"
import { actionHandler, itemDataHandler, objDataHandler } from "../../world"
import { Gathering } from "./gathering"

interface OreData {
    item: string,
    successChance: number,
    respawnTimer: number,
    pickaxe: string,
    rareDrop: {
        chance: number,
        item: string
    }
}

export class Mining extends Gathering {

    private readonly oreData: OreData

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, ore: OreData) {
        super(player, objData, objX, objY, 
            ore.pickaxe, "ore_depleted", 625, 300, ore.respawnTimer, ore.successChance)
        this.oreData = ore
    }

    protected get tierList() {
        return [ 'pickaxe_crude', 'pickaxe_copper', 'pickaxe_iron' ]
    }

    protected onLackTool() {
        let stronger = this.tierList.find(p => this.player.inventory.hasItem(p)) ? true : false
        this.player.sendMessage(stronger ?
            "You need a stronger pickaxe to mine this ore." :
            "You need a pickaxe to mine this ore.")
    }

    protected onSuccess() {
        const rareDrop = this.oreData.rareDrop
        if(rareDrop != null && randomChance(rareDrop.chance)) {
            this.player.inventory.add(rareDrop.item, 1)
            this.player.sendMessage(Colors.green, "You dig up an old recipe!")
            return
        }

        this.player.inventory.add(this.oreData.item, 1)
    }

}

function addOre(objectId: string, oreData: OreData) {
    const ore = objDataHandler.get(objectId)
    if(ore == null) {
        throw `[Invalid mining data] unknown object: ${objectId}`
    }

    if(!itemDataHandler.get(oreData.item)) {
        throw `[Invalid mining data] unknown item: ${oreData.item}`
    }

    if(!itemDataHandler.get(oreData.pickaxe)) {
        throw `[Invalid mining data] unknown pickaxe: ${oreData.pickaxe}`
    }

    if(oreData.rareDrop != null && !itemDataHandler.get(oreData.rareDrop.item)) {
        throw `[Invalid mining data] unknown rare drop: ${oreData.rareDrop.item}`
    }

    actionHandler.onObject(objectId, (player, action, ox, oy) => {
        if(action == "mine") {
            new Mining(player, ore, ox, oy, oreData).start()
        }
    })
}

export function initMining() {
    addOre('ore_copper', {
        "item": 'ore_copper',
        "respawnTimer": 30_000,
        "successChance": 10,
        "pickaxe": 'pickaxe_crude',
        "rareDrop": {
            "chance": 100,
            "item": "recipe_pickaxe_copper"
        }
    })

    addOre('ore_iron', {
        "item": "ore_iron",
        "respawnTimer": 120_000,
        "successChance": 20,
        "pickaxe": 'pickaxe_copper',
        "rareDrop": {
            "chance": 250,
            "item": "recipe_pickaxe_iron"
        }
    })

    addOre('ore_gold', {
        "item": "ore_gold",
        "respawnTimer": 300_000,
        "successChance": 40,
        "pickaxe": 'pickaxe_iron',
        "rareDrop": null
    })
}