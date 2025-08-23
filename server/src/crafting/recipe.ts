
import { OutgoingRecipe } from "../connection/outgoing-packet";
import { ItemData } from "../item/item-data";
import { Player } from "../player/player";
import { Skill, skillNames } from "../player/skills";
import { Colors } from "../util/color";

export class Recipe {

    constructor(
        public readonly unlockable: boolean,
        public readonly item: ItemData,
        public readonly materials: [ItemData, number][],
        public readonly skillRequirements: [Skill, number][],
        public readonly experienceRewards: [Skill, number][],
        public readonly delay: number
    ) { }

    private isUnlocked(player: Player) {
        return !this.unlockable || player.unlockedRecipes.includes(this.item.id)
    }

    private meetsSkillRequirements(player: Player) {
        return this.skillRequirements.every(req => player.skills.getLevel(req[0]) >= req[1]);
    }

    private meetsRequirements(player: Player) {
        return this.isUnlocked(player) && this.meetsSkillRequirements(player);
    }

    public craftable(player: Player) {
        const inventory = player.inventory
        return this.meetsRequirements(player)
            && this.materials.every(m => inventory.count(m[0].id) >= m[1])
    }

    public craft(player: Player) {
        if (!this.craftable(player)) {
            return false
        }

        const inventory = player.inventory

        this.materials.forEach(m => {
            inventory.removeData(m[0], m[1], false)
        })

        inventory.addData(this.item, 1)
        this.experienceRewards.forEach(xpReward => {
            player.skills.addExperience(xpReward[0], xpReward[1]);
        });
        return true
    }

    public examine(player: Player) {
        const requirements: [string, boolean][] = [];
        if (this.unlockable) {
            requirements.push([
                "Unlock the recipe",
                this.isUnlocked(player)
            ]);
        }

        this.skillRequirements.forEach(req => {
            requirements.push([
                `Reach level ${req[1]} ${skillNames[req[0]]}`,
                player.skills.getLevel(req[0]) >= req[1]
            ]);
        });

        player.sendMessage(`To craft the ${Colors.yellow} you must:`, this.item.name);
        requirements.forEach(([message, requirementMet]) => {
            const format = requirementMet
                ? '* /strike({})'
                : '* {}'
            player.sendMessage(format, message);
        })
    }

    public getOutgoing(player: Player): OutgoingRecipe {
        return {
            item: this.item.id,
            unlocked: this.meetsRequirements(player),
            materials: this.materials.map(m => [m[0].id, m[1]])
        }
    }

}