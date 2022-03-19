import { ObjectData } from "../../object/object-data"
import { Player } from "../../player/player"
import { Colors } from "../../util/color"
import { randomChance } from "../../util/util"
import { actionHandler, itemDataHandler, objDataHandler } from "../../world"
import { Gathering } from "./gathering"

interface TreeData {
    item: string,
    stump: string,
    successChance: number,
    respawnTimer: number,
    axe: string,
    rareDrop: {
        chance: number,
        item: string
    }
}

export class Woodcutting extends Gathering {

    private readonly treeData: TreeData

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, tree: TreeData) {
        super(player, objData, objX, objY, 
            tree.axe, tree.stump, 750, 350, tree.respawnTimer, tree.successChance)
        this.treeData = tree
    }

    protected get tierList() {
        return [ 'axe_crude', 'axe_copper', 'axe_iron' ]
    }

    protected onLackTool() {
        let stronger = this.tierList.find(p => this.player.inventory.hasItem(p)) ? true : false
        this.player.sendMessage(stronger ?
            "You need a stronger axe to cut this tree." :
            "You need an axe to cut this tree.")
    }

    protected onSuccess(): void {
        const rareDrop = this.treeData.rareDrop
        if(rareDrop != null && randomChance(rareDrop.chance)) {
            this.player.inventory.add(rareDrop.item, 1)
            this.player.sendMessage(Colors.green, "An old recipe falls from the tree!")
            return
        }

        this.player.inventory.add(this.treeData.item, 1)
    }
    
}

function addTree(objectId: string, treeData: TreeData) {
    const ore = objDataHandler.get(objectId)
    if(ore == null) {
        throw `[Invalid woodcutting data] unknown object: ${objectId}`
    }

    if(!objDataHandler.get(treeData.stump)) {
        throw `[Invalid woodcutting data] unknown stump: ${treeData.stump}`
    }

    if(!itemDataHandler.get(treeData.item)) {
        throw `[Invalid woodcutting data] unknown item: ${treeData.item}`
    }

    if(!itemDataHandler.get(treeData.axe)) {
        throw `[Invalid woodcutting data] unknown axe: ${treeData.axe}`
    }

    if(treeData.rareDrop != null && !itemDataHandler.get(treeData.rareDrop.item)) {
        throw `[Invalid woodcutting data] unknown rare drop: ${treeData.rareDrop.item}`
    }

    actionHandler.onObject(objectId, (player, action, ox, oy) => {
        if(action == "chop_down") {
            new Woodcutting(player, ore, ox, oy, treeData).start()
        }
    })
}

export function initWoodcutting() {
    const commonData = {
        "item": 'log_common',
        "stump": 'stump_common',
        "respawnTimer": 10_000,
        "successChance": 3,
        "axe": 'axe_crude',
        "rareDrop": {
            "chance": 100,
            "item": 'recipe_axe_copper'
        }
    }

    addTree('tree_common', commonData)
    addTree('tree_apple', commonData)

    addTree('tree_birch', {
        "item": 'log_birch',
        "stump": 'stump_birch',
        "respawnTimer": 60_000,
        "successChance": 10,
        "axe": 'axe_copper',
        "rareDrop": {
            "chance": 250,
            "item": 'recipe_axe_iron'
        }
    })
}