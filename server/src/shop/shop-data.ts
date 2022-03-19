
import { Shop } from "./shop";
import fs from "fs"
import { ItemData } from "../item/item-data";
import { itemDataHandler } from "../world";
import { ReadOnlyMap } from "../util/readonly-map";

export function loadShopData() {
    const shopMap = new Map<string, Shop>()
    const data = JSON.parse(fs.readFileSync("data/shop.json", "utf-8"))

    data.forEach((shop: any) => {
        if(shopMap.get(shop.name) != null) {
            throw "IMPORTANT - duplicate shop name" + shop.name
        }

        const itemData = shop.items
        const items: ItemData[] = itemData.map((i: any) => {
            const item = itemDataHandler.get(i)
            if(item == null) {
                throw `IMPORTANT - Invalid item ${i} in shop: ${shop.name}`
            }
            
            return item
        })

        shopMap.set(shop.name, new Shop(shop.name, items, shop.buyFactor, shop.sellFactor))
    });

    return new ReadOnlyMap(shopMap)
}