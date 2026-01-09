
import { ChatArea } from "./chat-box"
import { useState } from "react"
import React = require("react")
import { ContextMenu } from "./context-menu"
import { OverlayArea } from "./overlay-area"
import { StatusArea } from "./status-area"
import { PrimaryWindow } from "./primary-window"
import { SecondaryWindow } from "./secondary-window"
import { HeldItem, HeldItemContext, HeldItemPointer } from "./held-item"
import "./ui.scss"

export function UiContainer() {
    const [heldItem, setHeldItem] = useState(null as HeldItem)

    return <div id="ui">
        <OverlayArea />
        <ContextMenu />

        <HeldItemContext.Provider value={{
            item: heldItem,
            takeItem: (value) => setHeldItem(value)
        }}>
            {heldItem != null && <HeldItemPointer />}

            <StatusArea />
            <SecondaryWindow />
            <ChatArea />
            <PrimaryWindow />
        </HeldItemContext.Provider>
    </div>
}