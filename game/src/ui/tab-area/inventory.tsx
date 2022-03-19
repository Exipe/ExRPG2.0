
import React = require("react");
import { MenuEntry } from "../../game/model/context-menu-model";
import { InventoryModel } from "../../game/model/tab/inventory-model";
import { StorageContainer } from "../container/storage-container";
import { ItemData } from "exrpg";

interface InventoryProps {
    showCtxMenu: (entries: MenuEntry[], x: number, y: number) => void,
    inventory: InventoryModel
}

function openContext(inventory: InventoryModel, item: ItemData, idx: number) {
    let ctxMenu = [] as MenuEntry[]

    const name = `/rgb(155,255,255,${item.name})`

    if(item.equipable) {
        ctxMenu.push([
            "Equip " + name, 
            () => { inventory.useItem("equip", item.id, idx) }
        ])
    }

    item.options.forEach(option => {
        ctxMenu.push([
            `${option[0]} ${name}`, 
            () => { inventory.useItem(option[1], item.id, idx) }
        ])
    })

    ctxMenu.push([
        "Drop " + name, 
        () => { inventory.useItem("drop", item.id, idx) }
    ])

    return ctxMenu
}

export function InventoryTab(props: InventoryProps) {
    const inventory = props.inventory
    
    const onContext = (item: ItemData, idx: number, mouseX: number, mouseY: number) => {
        const ctxMenu = openContext(inventory, item, idx)
        props.showCtxMenu(ctxMenu, mouseX, mouseY)
    }

    const onShiftClick = (item: ItemData, idx: number) => {
        if(item.equipable) {
            inventory.useItem("equip", item.id, idx)
        }
    }

    return <StorageContainer 
        className="box-standard"
        id="inventory"
        onContext={onContext} 
        onShiftClick={onShiftClick} 
        model={inventory} />
}