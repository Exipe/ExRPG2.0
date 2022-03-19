import { ItemData } from "exrpg";
import { useEffect, useState } from "react";
import React = require("react");
import { StorageId } from "../../game/model/container-model";
import { ContextMenuModel, MenuEntry } from "../../game/model/context-menu-model";
import { TradeModel } from "../../game/model/window/trade-model";
import { ContainerSelectDialog, DisplayItem, ItemContainer } from "../container/container";
import { ItemOverlay, StorageContainer } from "../container/storage-container";

interface TradeWindowProps {
    model: TradeModel,
    ctxMenu: ContextMenuModel
}

interface SelectData { item: ItemData, slot: number }

export function TradeWindow(props: TradeWindowProps) {
    const [select, setSelect] = React.useState(null as SelectData)
    const [accepted, setAccepted] = React.useState(false)
    const [recentChange, setRecentChange] = React.useState(false)
    const model = props.model

    const otherOfferObservable = model.otherOffer
    const otherPlayerObservable = model.otherPlayer
    const [otherOffer, setOtherOffer] = useState(otherOfferObservable.value)
    const [otherPlayer, setOtherPlayer] = useState(model.otherPlayer.value)

    useEffect(() => {
        otherOfferObservable.register(setOtherOffer)
        otherPlayerObservable.register(setOtherPlayer)
        const onChange = (recentChange: boolean) => {
            setRecentChange(recentChange)

            if(recentChange) {
                setAccepted(false)
            }
        }
        model.recentChange.register(onChange)

        return () => {
            otherOfferObservable.unregister(setOtherOffer)
            otherPlayerObservable.unregister(setOtherPlayer)
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

        props.ctxMenu.show(ctxMenu, mouseX, mouseY)
    }

    const onShiftClick = (item: ItemData, slot: number) => {
        model.remove(item.id, slot)
    }

    const onDrag = (item: ItemData, slot: number, source: StorageId) => {
        if(source == "inventory") {
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
    if(select != null) {
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
    if(recentChange) {
        buttons = <>
            <p>Please review the trade.</p></>
    } else {
        let acceptButton: JSX.Element
        if(accepted) {
            acceptButton = <div className="tradeButton" id="tradeAccepted" onClick={accept}>Accepted</div>
        } else {
            acceptButton = <div className="tradeButton" id="tradeAccept" onClick={accept}>Accept</div>
        }

        buttons = <>
            {acceptButton}
            <div className="tradeButton" id="tradeDecline" onClick={decline}>Decline</div></>
    }

    return <div className="window box-gradient" id="tradeWindow">
        <p className="windowName">Trading with {otherPlayer}</p>
        <p className="tradeHeader">Your offer:</p>
        <StorageContainer
            overlay={itemOverlay}
            onContext={onContext}
            onShiftClick={onShiftClick}
            onDrag={onDrag}
            model={props.model.tradeOffer}/>
        
        <p className="tradeHeader">Their offer:</p>
        <ItemContainer>
            {otherOffer.items.map((i, idx) => <DisplayItem key={idx} item={i} />)}
        </ItemContainer>

        <div id="tradeButtons">
            {buttons}
        </div>
    </div>
}