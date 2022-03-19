
import { ItemData } from "exrpg";
import React = require("react");
import { BankModel } from "../../game/model/window/bank-model";
import { StorageId } from "../../game/model/container-model";
import { InventoryModel } from "../../game/model/tab/inventory-model";
import { ContextMenuModel, MenuEntry } from "../../game/model/context-menu-model";
import { StorageContainer, ItemOverlay } from "../container/storage-container";
import { ContainerSelectDialog } from "../container/container";

interface BankInventoryProps {
    bank: BankModel
    inventory: InventoryModel
    ctxMenu: ContextMenuModel
}

interface SelectData { item: ItemData, slot: number }

export function BankInventory(props: BankInventoryProps) {
    const bank = props.bank
    const [select, setSelect] = React.useState(null as SelectData)

    const onContext = (item: ItemData, slot: number, mouseX: number, mouseY: number) => {
        const ctxMenu = [] as MenuEntry[]
        const name = `/rgb(155,255,255,${item.name})`

        ctxMenu.push([
            "Quick-deposit " + name,
            () => {
                bank.deposit(item.id, slot)
            }
        ])

        ctxMenu.push([
            "Deposit " + name,
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

    const deposit = (amount: number) => {
        bank.deposit(select.item.id, select.slot, amount)
        setSelect(null)
    }

    const onShiftClick = (item: ItemData, slot: number) => {
        bank.deposit(item.id, slot)
    }

    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if(source == "bank") {
            bank.withdraw(item.id, slot)
        }
    }

    let itemOverlay: ItemOverlay
    if(select != null) {
        const element = <ContainerSelectDialog 
            button={'Deposit'}
            item={select.item}
            onClose={closeSelect}
            onTransfer={deposit} />

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
        onShiftClick={onShiftClick}
        onDrag={onDrag} />
}