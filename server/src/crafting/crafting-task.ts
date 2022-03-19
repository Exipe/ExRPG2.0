import { PrimaryTask } from "../character/task";
import { ProgressIndicatorPacket } from "../connection/outgoing-packet";
import { Player } from "../player/player";
import { Recipe } from "./recipe";

export class CraftingTask extends PrimaryTask {

    private readonly player: Player
    private readonly recipe: Recipe

    private amount: number

    constructor(player: Player, recipe: Recipe, amount: number) {
        super(player)
        this.player = player
        this.recipe = recipe
        this.amount = amount
    }

    get delay() {
        return this.recipe.delay
    }
    
    private indicator() {
        this.player.showIndicator(this.recipe.item.id, this.recipe.delay)
    }

    public start() {
        const player = this.player
        if(!this.recipe.craftable(player)) {
            player.sendMessage("You can't craft that")
            return
        }

        this.player.taskHandler.setTask(this, false)
        this.indicator()
    }

    public tick() {
        const player = this.player

        this.amount--
        const cont = this.recipe.craft(player) && this.amount > 0
        if(!cont) {
            player.taskHandler.stopTask(this)
            return
        }

        this.indicator()
    }

    public stop() {
        this.player.removeIndicator()
    }

}