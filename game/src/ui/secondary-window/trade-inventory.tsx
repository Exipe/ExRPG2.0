import { ItemData } from "exrpg";
import React = require("react");
import { StorageId } from "../../game/model/container-model";
import { ContextMenuModel, MenuEntry } from "../../game/model/context-menu-model";
import { InventoryModel } from "../../game/model/tab/inventory-model";
import { TradeModel } from "../../game/model/window/trade-model";
import { ContainerSelectDialog } from "../container/container";
import { ItemOverlay, StorageContainer } from "../container/storage-container"

interface TradeInventoryProps {
    model: TradeModel,
    inventory: InventoryModel,
    ctxMenu: ContextMenuModel
}

interface SelectData { item: ItemData, slot: number }

export function TradeInventory(props: TradeInventoryProps) {
    const model = props.model
    const [select, setSelect] = React.useState(null as SelectData)

    const onContext = (item: ItemData, slot: number, mouseX: number, mouseY: number) => {
        const ctxMenu = [] as MenuEntry[]
        const name = `/rgb(155,255,255,${item.name})`

        ctxMenu.push([
            "Quick offer " + name,
            () => {
                model.offer(item.id, slot)
            }
        ])

        ctxMenu.push([
            "Offer " + name,
            () => {
                setSelect({
                    item: item,
                    slot: slot
                })
            }
        ])
        props.ctxMenu.show(ctxMenu, mouseX, mouseY)
    }

    const closeSelect = () => { setSelect(null) }

    const offer = (amount: number) => {
        model.offer(select.item.id, select.slot, amount)
        setSelect(null)
    }

    const onShiftClick = (item: ItemData, slot: number) => {
        model.offer(item.id, slot)
    }
    
    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if(source == "trade") {
            model.remove(item.id, slot)
        }
    }

    let itemOverlay: ItemOverlay
    if(select != null) {
        const element = <ContainerSelectDialog
            button={'Offer'}
            item={select.item}
            onClose={closeSelect}
            onTransfer={offer} />

        itemOverlay = {
            item: select.item,
            slot: select.slot,
            close: closeSelect,
            element: element
        }
    }

    return <StorageContainer
        id="inventory"
        className="box-gradient secondary-window"
        model={props.inventory}
        overlay={itemOverlay}
        onContext={onContext}
        onDrag={onDrag}
        onShiftClick={onShiftClick} />
}