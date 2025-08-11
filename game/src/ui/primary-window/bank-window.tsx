import { ItemData } from "exrpg";
import React = require("react");
import { StorageId } from "../../game/model/container-model";
import { MenuEntry } from "../../game/model/context-menu-model";
import { ContainerSelectDialog } from "../container/container";
import { StorageContainer, ItemOverlay } from "../container/storage-container";
import { useBank, useContextMenu } from "../hooks";

interface SelectData { item: ItemData, slot: number }

export function BankWindow() {
    const model = useBank();
    const contextMenuModel = useContextMenu();
    const [select, setSelect] = React.useState(null as SelectData)

    const close = () => {
        model.close()
    }

    const onContext = (item: ItemData, slot: number, mouseX: number, mouseY: number) => {
        const ctxMenu = [] as MenuEntry[]
        const name = `/rgb(155,255,255,${item.name})`

        ctxMenu.push([
            "Quick-withdraw " + name,
            () => {
                model.withdraw(item.id, slot)
            }
        ])

        ctxMenu.push([
            "Withdraw " + name,
            () => {
                setSelect({
                    item: item,
                    slot: slot
                })
            }
        ])

        contextMenuModel.show(ctxMenu, mouseX, mouseY)
    }

    const onShiftClick = (item: ItemData, slot: number) => {
        model.withdraw(item.id, slot)
    }

    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if(source == "inventory") {
            model.deposit(item.id, slot)
        }
    }

    const closeSelect = () => { setSelect(null) }

    const widthdraw = (amount: number) => {
        model.withdraw(select.item.id, select.slot, amount)
        setSelect(null)
    }

    let itemOverlay: ItemOverlay
    if(select != null) {
        const element = <ContainerSelectDialog 
            button={'Withdraw'}
            item={select.item}
            onClose={closeSelect}
            onTransfer={widthdraw} />

        itemOverlay = {
            item: select.item,
            slot: select.slot,
            close: closeSelect,
            element: element
        }
    }

    return <div className="window box-gradient" id="bankWindow">
        <div className="closeButton top-right"
            onClick={close} />
        <p className="windowName">Bank</p>
        <StorageContainer
            model={model}
            overlay={itemOverlay}
            onContext={onContext}
            onShiftClick={onShiftClick}
            onDrag={onDrag} />
    </div>
}