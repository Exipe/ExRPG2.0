import { ItemData } from "exrpg";
import { useState } from "react";
import React = require("react");
import { ContainerModel, Item, StorageContainerModel } from "../../game/model/container-model";
import { HeldItemContext } from "../held-item";
import { DisplayItem, ItemContainer } from "./container";

export interface ItemOverlay {
    item: ItemData,
    slot: number,
    element: JSX.Element,
    close: () => void
}

export interface StorageContainerProps {
    model: StorageContainerModel,
    className?: string,
    id?: string,
    overlay?: ItemOverlay
    onContext?: (item: ItemData, idx: number, mouseX: number, mouseY: number) => void
    onShiftClick?: (item: ItemData, idx: number) => void
    onDrag?: (item: ItemData, idx: number, source: string) => void
}

export function StorageContainer(props: StorageContainerProps) {
    const model = props.model
    const observable = model.observable
    const [items, setItems] = useState(observable.value.items)

    const overlay = props.overlay

    const heldItemCtx = React.useContext(HeldItemContext)
    const heldItem = heldItemCtx.item

    React.useEffect(() => {
        const observer = (container: ContainerModel) => {
            const items = container.items
            if(heldItem != null && items[heldItem.slot] != heldItem.item) {
                heldItemCtx.takeItem(null)
            }

            setItems(items)
        }

        observable.register(observer)

        return () => observable.unregister(observer)
    }, [])

    /*
    checks and handles movement between 2 different containers
    */
    function clickContainer(): boolean {
        if(heldItem == null || heldItem.source == model.id) {
            return false // no external movement
        }

        heldItemCtx.takeItem(null)
        if(props.onDrag) {
            props.onDrag(heldItem.item[0], heldItem.slot, heldItem.source)
        }
        return true
    }

    function contextItem(idx: number, mouseX: number, mouseY: number) {
        heldItemCtx.takeItem(null)

        const item = items[idx]
        if(item == null) {
            return
        }

        if(props.onContext) {
            props.onContext(item[0], idx, mouseX, mouseY)
        }
    }

    function shiftClickItem(idx: number) {
        const item = items[idx]
        if(item == null) {
            return
        }

        if(props.onShiftClick) {
            props.onShiftClick(item[0], idx)
        }
    }

    function clickItem(idx: number, mouseX: number, mouseY: number) {
        if(clickContainer()) {
            return
        }

        const oldItem = items[idx]

        if(heldItem != null) {
            if(heldItem.slot == idx) {
                heldItemCtx.takeItem(null)
                return
            }

            model.moveItem(heldItem.slot, idx)

            const copyItems = [...items]
            copyItems[heldItem.slot] = oldItem
            copyItems[idx] = heldItem.item
            setItems(copyItems)
        }

        if(oldItem == null) {
            heldItemCtx.takeItem(null)
            return
        }

        heldItemCtx.takeItem({
            mouseX: mouseX,
            mouseY: mouseY,
            item: oldItem,
            slot: heldItem != null ? heldItem.slot : idx,
            source: model.id
        })
    }

    let foundOverlay = false
    const displayItems = items.map((item, idx) => {
        if(heldItem != null && heldItem.source == model.id && heldItem.slot == idx) {
            item = null
        }

        const onClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            if(e.shiftKey) {
                shiftClickItem(idx)
            } else {
                clickItem(idx, e.clientX, e.clientY) 
            }
        }

        const onContext = (e: React.MouseEvent) => { 
            contextItem(idx, e.clientX, e.clientY) 
        }

        let overlayElement = <></>

        if(overlay 
            && item != null 
            && overlay.item == item[0] 
            && overlay.slot == idx) 
        {
            overlayElement = overlay.element
            foundOverlay = true
        }
    
        return <DisplayItem key={idx} item={item} onClick={onClick} onContext={onContext}>
            {overlayElement}
        </DisplayItem>
    })

    if(overlay && !foundOverlay) {
        overlay.close()
    }

    const onClick = () => {
        clickContainer()
    }

    return <ItemContainer 
        onClick={onClick}
        className={props.className}
        id={props.id}>
        {displayItems}
    </ItemContainer>
}
