
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
    const buildEntryText = (option: string) => [`${option} /rgb(155,255,255,{})`, item.name];

    if (item.equipable) {
        ctxMenu.push([
            buildEntryText("Equip"),
            () => { inventory.useItem("equip", item.id, idx) }
        ])
    }

    item.options.forEach(option => {
        ctxMenu.push([
            buildEntryText(option[0]),
            () => { inventory.useItem(option[1], item.id, idx) }
        ])
    })

    ctxMenu.push([
        buildEntryText("Drop"),
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
        if (item.equipable) {
            inventory.useItem("equip", item.id, idx)
        }
    }

    return <div id="inventory-container" className="box-standard tab-content">
        <StorageContainer
            id="inventory"
            onContext={onContext}
            onShiftClick={onShiftClick}
            model={inventory} />
    </div>
}