import { ItemData } from "exrpg"
import { CraftPacket, ExamineRecipePacket } from "../../../connection/packet"
import { Game, PrimaryWindow } from "../../game"
import { Observable } from "../../../util/observable"

export type CraftingMaterial = [ItemData, number]

export interface Recipe {

    item: ItemData,
    unlocked: boolean,
    materials: CraftingMaterial[]

}

export class CraftingStation {

    public readonly name: string
    public readonly recipes: Recipe[]

    constructor(name: string, recipes: Recipe[]) {
        this.name = name
        this.recipes = recipes
    }
    
}

export class CraftingModel {

    public readonly observable = new Observable<CraftingStation>()

    private readonly game: Game

    constructor(game: Game) {
        this.game = game
    }

    public select(recipe: Recipe) {
        if(!recipe.unlocked) {
            this.game.connection.send(new ExamineRecipePacket(recipe.item.id));
            return null
        }

        return recipe
    }

    public craft(recipe: Recipe, amount: number) {
        this.game.connection.send(new CraftPacket(recipe.item.id, amount))
    }

    public open(station: CraftingStation) {
        this.observable.value = station
        this.game.primaryWindow.value = "Crafting"
    }

    public close() {
        this.game.primaryWindow.value = "None"
    }

}