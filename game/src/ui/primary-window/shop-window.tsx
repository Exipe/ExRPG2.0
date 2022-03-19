
import { useEffect, useState } from "react";
import React = require("react");
import { ShopSelect, ShopModel } from "../../game/model/window/shop-model";
import { DisplayItem, ItemContainer, MAX_SELECT_AMOUNT, SelectDialog } from "../container/container";

export interface ShopSelectProps {
    select: ShopSelect
    onClose: () => void
    onConfirm: (amount: number) => void
}

export function ShopSelectDialog(props: ShopSelectProps) {
    const [amount, setAmount] = useState(1)
    const select = props.select

    const confirm = () => {
        if(amount == 0 || amount > MAX_SELECT_AMOUNT) {
            return
        }

        props.onConfirm(amount)
    }

    const price = amount*select.price

    return <SelectDialog
        item={[select.item, 1]}
        selectAmount={amount}
        setAmount={setAmount}
        onClose={props.onClose}>
        <div className="selectDialogButton" onClick={confirm}>
            Confirm (<img className="text-icon" src={select.currency.spritePath}/> <span>{price.toLocaleString()}</span>)
        </div>
    </SelectDialog>
}

interface ShopWindowProps {
    model: ShopModel
}

export function ShopWindow(props: ShopWindowProps) {
    const shopObservable = props.model.observable
    const selectObservable = props.model.selectedBuy
    const [shop, setShop] = useState(shopObservable.value)
    const [select, setSelect] = useState(selectObservable.value)

    useEffect(() => {
        shopObservable.register(setShop)
        selectObservable.register(setSelect)
        return () => {
            shopObservable.unregister(setShop)
            selectObservable.unregister(setSelect)
        }
    }, [])

    const selectBuy = (slot: number) => {
        props.model.selectBuy(slot)
    }

    const close = () => {
        props.model.close()
    }

    const closeSelect = () => {
        props.model.selectedBuy.value = null
    }

    const buy = (amount: number) => {
        props.model.confirmBuy(amount)
    }

    const displayItems = shop.items.map((item, idx) => {
        const selectDialog = select != null && select.slot == idx ? 
            <ShopSelectDialog onConfirm={buy} onClose={closeSelect} select={select} /> : <></>

        return <DisplayItem 
            item={[item, 1]}
            className="shopItem"
            key={idx}
            onClick={() => selectBuy(idx)}>
            {selectDialog}
        </DisplayItem>
    })

    return <div className="window box-gradient" id="shopWindow">
        <div className="closeButton top-right"
            onClick={close}></div>
        <p className="windowName">{shop.name}</p>
        <ItemContainer>{displayItems}</ItemContainer>
    </div>
}
