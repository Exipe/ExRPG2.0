import { ObjectData } from "../../object/object-data"
import { Player } from "../../player/player"
import { Colors } from "../../util/color"
import { randomChance } from "../../util/util"
import { actionHandler, itemDataHandler, objDataHandler } from "../../world"
import { Gathering, GatheringTool } from "./gathering"

interface TreeData {
    item: string,
    stump: string,
    hitPoints: number,
    respawnTimer: number,
    levelReq: number,
    experience: number,
    rareDrop: {
        chance: number,
        item: string
    } | null
}

const axes: GatheringTool[] = [
    {
        itemId: "axe_crude",
        hitOutput: [1, 2]
    },
    {
        itemId: "axe_copper",
        hitOutput: [2, 3]
    },
    {
        itemId: "axe_iron",
        hitOutput: [3, 5]
    }
];

export class Woodcutting extends Gathering {
    private readonly treeData: TreeData

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, tree: TreeData) {
        super(player, objData, objX, objY,
            tree.stump, 750, 350, tree.respawnTimer, tree.hitPoints)
        this.treeData = tree
    }

    protected get toolTierList() {
        return axes;
    }

    protected onLackTool() {
        this.player.sendMessage("You need an axe to cut this tree.");
    }

    protected onSuccess(): void {
        const rareDrop = this.treeData.rareDrop;
        if (rareDrop != null && randomChance(rareDrop.chance)) {
            this.player.inventory.add(rareDrop.item, 1);
            this.player.sendMessage(Colors.green, "Some mysterious essence falls from the tree!");
            return;
        }

        this.player.inventory.add(this.treeData.item, 1);
        this.player.skills.addExperience("woodcutting", this.treeData.experience);
    }

}

function addTree(objectId: string, treeData: TreeData) {
    const ore = objDataHandler.get(objectId)
    if (ore == null) {
        throw `[Invalid woodcutting data] unknown object: ${objectId}`
    }

    if (!objDataHandler.get(treeData.stump)) {
        throw `[Invalid woodcutting data] unknown stump: ${treeData.stump}`
    }

    if (!itemDataHandler.get(treeData.item)) {
        throw `[Invalid woodcutting data] unknown item: ${treeData.item}`
    }

    if (treeData.rareDrop != null && !itemDataHandler.get(treeData.rareDrop.item)) {
        throw `[Invalid woodcutting data] unknown rare drop: ${treeData.rareDrop.item}`
    }

    actionHandler.onObject(objectId, (player, action, ox, oy) => {
        if (action == "chop_down") {
            if (player.skills.getLevel("woodcutting") < treeData.levelReq) {
                player.sendMessage(`You need a woodcutting level of ${treeData.levelReq} to cut this tree.`);
                return;
            }

            new Woodcutting(player, ore, ox, oy, treeData).start();
        }
    })
}

export function initWoodcutting() {
    const commonData = {
        "item": 'log_common',
        "stump": 'stump_common',
        "respawnTimer": 10_000,
        "hitPoints": 5,
        "levelReq": 1,
        "experience": 15,
        "rareDrop": null
    }

    addTree('tree_common', commonData)
    addTree('tree_apple', commonData)

    addTree('tree_birch', {
        "item": 'log_birch',
        "stump": 'stump_birch',
        "respawnTimer": 60_000,
        "hitPoints": 10,
        "levelReq": 10,
        "experience": 35,
        "rareDrop": null
    })
}