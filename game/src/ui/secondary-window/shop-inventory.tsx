
import { useEffect, useState } from "react"
import React = require("react")
import { InventoryModel } from "../../game/model/tab/inventory-model"
import { ShopModel } from "../../game/model/window/shop-model"
import { DisplayItem, ItemContainer } from "../container/container"
import { ShopSelectDialog } from "../primary-window/shop-window"

interface ShopInventoryProps {
    shop: ShopModel
    inventory: InventoryModel
}

export function ShopInventory(props: ShopInventoryProps) {
    const observable = props.inventory.observable
    const selectObservable = props.shop.selectedSell
    const [inventory, setInventory] = useState(observable.value)
    const items = inventory.items
    const [select, setSelect] = useState(selectObservable.value)

    useEffect(() => {
        observable.register(setInventory)
        selectObservable.register(setSelect)
        return () => {
            observable.unregister(setInventory)
            selectObservable.unregister(setSelect)
        }
    }, [])

    const selectSell = (slot: number) => {
        if(items[slot] == null) {
            return
        }

        props.shop.selectSell(slot)
    }

    const closeSelect = () => {
        selectObservable.value = null
    }

    const sell = (amount: number) => {
        props.shop.confirmSell(amount)
    }

    const displayItems = items.map((item, idx) => {
        const selectDialog = select != null && select.slot == idx ?
            <ShopSelectDialog onConfirm={sell} onClose={closeSelect} select={select} /> : <></>

        return <DisplayItem 
            item={item}
            onClick={() => selectSell(idx)}
            key={idx}
            className={item != null ? "shopItem" : ""}>
            {selectDialog}
        </DisplayItem>
    })

    return <ItemContainer className="box-gradient secondary-window" id="inventory">
        {displayItems}
    </ItemContainer>
}