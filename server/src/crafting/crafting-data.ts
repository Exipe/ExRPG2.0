import { ItemData } from "../item/item-data";
import { itemDataHandler } from "../world";
import { CraftingStation } from "./crafting-station";
import { Recipe } from "./recipe";
import fs from "fs"
import { ReadOnlyMap } from "../util/readonly-map";
import { isSkill, Skill } from "../player/skills";

export function loadCraftingData() {
    const stationMap = new Map<string, CraftingStation>()
    const data = JSON.parse(fs.readFileSync("data/crafting.json", "utf-8"))

    data.forEach((station: any) => {
        if (stationMap.get(station.name) != null) {
            throw "IMPORTANT - duplicate crafting station name" + station.name
        }

        const recipeData = station.recipes
        const recipes: Recipe[] = recipeData.map((r: any) => {
            const item = itemDataHandler.get(r.item)
            if (item == null) {
                throw `IMPORTANT - Invalid recipe ${r.id} in station: ${station.name}`
            }

            const materials: [ItemData, number][] = r.materials.map((m: any) => {
                const item = itemDataHandler.get(m[0])
                if (item == null) {
                    throw `IMPORTANT - Invalid material ${m[0]} on recipe: ${r.item}`
                }

                const amount = m[1]
                return [item, amount]
            })

            const skillRequirements: [Skill, number][] = r.skillRequirements ?? [];
            const experienceRewards: [Skill, number][] = r.experienceRewards ?? [];
            const unlockable = r.unlockable ?? false;

            return new Recipe(unlockable, item, materials, skillRequirements, experienceRewards, r.delay)
        })

        stationMap.set(station.name, new CraftingStation(station.name, recipes))
    });

    return new ReadOnlyMap(stationMap)
}
