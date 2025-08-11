
import React = require("react")
import { DisplayItem, ItemContainer } from "../container/container"
import { ShopSelectDialog } from "../primary-window/shop-window"
import { useInventory, useObservable, useShop } from "../hooks"

export function ShopInventory() {
    const inventoryModel = useInventory();

    const inventory = useObservable(inventoryModel.observable);
    const items = inventory.items

    const shopModel = useShop();
    const select = useObservable(shopModel.selectedSell)

    const selectSell = (slot: number) => {
        if(items[slot] == null) {
            return
        }

        shopModel.selectSell(slot)
    }

    const closeSelect = () => {
        shopModel.selectedSell.value = null
    }

    const sell = (amount: number) => {
        shopModel.confirmSell(amount)
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