import { ItemData } from "exrpg";
import { useEffect } from "react";
import React = require("react");
import { StorageId } from "../../game/model/container-model";
import { MenuEntry } from "../../game/model/context-menu-model";
import { ContainerSelectDialog, DisplayItem, ItemContainer } from "../container/container";
import { ItemOverlay, StorageContainer } from "../container/storage-container";
import { useContextMenu, useObservable, useTrade } from "../hooks";

interface SelectData { item: ItemData, slot: number }

export function TradeWindow() {
    const model = useTrade();
    const contextMenuModel = useContextMenu();

    const [select, setSelect] = React.useState(null as SelectData)
    const [accepted, setAccepted] = React.useState(false)
    const [recentChange, setRecentChange] = React.useState(false)

    const otherOffer = useObservable(model.otherOffer);
    const otherPlayer = useObservable(model.otherPlayer);

    useEffect(() => {
        const onChange = (recentChange: boolean) => {
            setRecentChange(recentChange)

            if (recentChange) {
                setAccepted(false)
            }
        }
        model.recentChange.register(onChange)

        return () => {
            model.recentChange.unregister(onChange)
        }
    }, [])

    const onContext = (item: ItemData, slot: number, mouseX: number, mouseY: number) => {
        const ctxMenu = [] as MenuEntry[]
        const name = `/rgb(155,255,255,${item.name})`

        ctxMenu.push([
            "Quick-remove " + name,
            () => {
                model.remove(item.id, slot)
            }
        ])

        ctxMenu.push([
            "Remove " + name,
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
        model.remove(item.id, slot)
    }

    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if (source == "inventory") {
            model.offer(item.id, slot)
        }
    }

    const closeSelect = () => { setSelect(null) }

    const remove = (amount: number) => {
        model.remove(select.item.id, select.slot, amount)
        setSelect(null)
    }

    const decline = () => model.decline()

    const accept = () => {
        setAccepted(true)
        model.accept()
    }

    let itemOverlay: ItemOverlay
    if (select != null) {
        const element = <ContainerSelectDialog
            button={'Remove'}
            item={select.item}
            onClose={closeSelect}
            onTransfer={remove} />

        itemOverlay = {
            item: select.item,
            slot: select.slot,
            close: closeSelect,
            element: element
        }
    }

    let buttons: JSX.Element
    if (recentChange) {
        buttons = <>
            <p>Please review the trade.</p></>
    } else {
        let acceptButton: JSX.Element
        if (accepted) {
            acceptButton = <div className="trade-button" id="trade-accepted" onClick={accept}>Accepted</div>
        } else {
            acceptButton = <div className="trade-button" id="trade-accept" onClick={accept}>Accept</div>
        }

        buttons = <>
            {acceptButton}
            <div className="trade-button" id="trade-decline" onClick={decline}>Decline</div></>
    }

    return <div className="window box-gradient" id="trade-window">
        <p className="window-name">Trading with {otherPlayer}</p>
        <p className="trade-header">Your offer:</p>
        <StorageContainer
            overlay={itemOverlay}
            onContext={onContext}
            onShiftClick={onShiftClick}
            onDrag={onDrag}
            model={model.tradeOffer} />

        <p className="trade-header">Their offer:</p>
        <ItemContainer>
            {otherOffer.items.map((i, idx) => <DisplayItem key={idx} item={i} />)}
        </ItemContainer>

        <div id="trade-buttons">
            {buttons}
        </div>
    </div>
}