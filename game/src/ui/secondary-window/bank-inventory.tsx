
import { ItemData } from "exrpg";
import React = require("react");
import { StorageId } from "../../game/model/container-model";
import { MenuEntry } from "../../game/model/context-menu-model";
import { StorageContainer, ItemOverlay } from "../container/storage-container";
import { ContainerSelectDialog } from "../container/container";
import { useBank, useInventory, useContextMenu } from "../hooks";

interface SelectData { item: ItemData, slot: number }

export function BankInventory() {
    const bankModel = useBank();
    const inventoryModel = useInventory();
    const contextMenuModel = useContextMenu();
    const [select, setSelect] = React.useState(null as SelectData)

    const onContext = (item: ItemData, slot: number, mouseX: number, mouseY: number) => {
        const ctxMenu = [] as MenuEntry[]
        const name = `/rgb(155,255,255,${item.name})`

        ctxMenu.push([
            "Quick-deposit " + name,
            () => {
                bankModel.deposit(item.id, slot)
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
        contextMenuModel.show(ctxMenu, mouseX, mouseY)
    }

    const closeSelect = () => { setSelect(null) }

    const deposit = (amount: number) => {
        bankModel.deposit(select.item.id, select.slot, amount)
        setSelect(null)
    }

    const onShiftClick = (item: ItemData, slot: number) => {
        bankModel.deposit(item.id, slot)
    }

    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if(source == "bank") {
            bankModel.withdraw(item.id, slot)
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
        model={inventoryModel} 
        overlay={itemOverlay}
        onContext={onContext} 
        onShiftClick={onShiftClick}
        onDrag={onDrag} />
}