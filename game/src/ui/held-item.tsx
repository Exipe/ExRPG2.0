import React = require("react");
import { ItemModel, StorageId } from "../game/model/container-model";

export interface HeldItem {
    mouseX: number,
    mouseY: number,
    item: ItemModel,
    slot: number,
    source: StorageId
}

export const HeldItemContext = React.createContext({
    item: null as HeldItem,
    takeItem: null as (item: HeldItem) => void
})

export function HeldItemPointer(_: any) {
    const item = React.useContext(HeldItemContext).item
    const pointerRef = React.useRef(null as HTMLDivElement)

    React.useEffect(() => {
        const mouseMove = (ev: MouseEvent) => {
            const style = pointerRef.current.style

            style.left = `${ev.clientX}px`
            style.top = `${ev.clientY}px`
        }

        document.addEventListener("mousemove", mouseMove)
        return () => {
            document.removeEventListener("mousemove", mouseMove)
        }
    }, [])

    return <div className="scaleIcon" id="heldItem"
        ref={pointerRef}
        style={ {
            backgroundImage: `url('${ item.item[0].spritePath }')`,
            left: item.mouseX,
            top: item.mouseY
        } } />
}
