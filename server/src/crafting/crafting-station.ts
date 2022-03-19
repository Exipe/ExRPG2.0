import { CraftingPacket } from "../connection/outgoing-packet";
import { ItemData } from "../item/item-data";
import { itemDataHandler } from "../world";
import { Player } from "../player/player";
import { PrimaryWindow } from "../player/window/p-window";
import { Recipe } from "./recipe";
import { CraftingTask } from "./crafting-task";

export class CraftingStation implements PrimaryWindow {

    public readonly id = "Crafting";

    private readonly name: string
    private readonly recipes: Recipe[]

    constructor(name: string, recipes: Recipe[]) {
        this.name = name
        this.recipes = recipes
    }

    open(p: Player) {
        p.send(new CraftingPacket(this.name, this.recipes.map(r => r.getOutgoing(p))))
    }

    craft(p: Player, item: ItemData, amount: number) {
        const recipe = this.recipes.find(r => r.item == item)
        if(recipe == null) {
            return
        }

        //p.sendMessage(`Crafting ${amount}x ${item.name}`)
        p.closeWindow()
        const task = new CraftingTask(p, recipe, amount)
        task.start()
    }

}