
import { ChatArea } from "./chat-box"
import { Game } from "../game/game"
import { useState } from "react"
import React = require("react")
import { ContextMenu } from "./context-menu"
import { OverlayArea } from "./overlay-area"
import { StatusArea } from "./status-area"
import { PrimaryWindow } from "./primary-window"
import { SecondaryWindow } from "./secondary-window"
import { HeldItem, HeldItemContext, HeldItemPointer } from "./held-item"

export function UiContainer(props: { game: Game }) {
    const [heldItem, setHeldItem] = useState(null as HeldItem)

    const game = props.game

    return <div id="ui">
        <OverlayArea overlayAreaModel={game.overlayArea} />

        <ContextMenu
            contextMenu={game.ctxMenu}
        />

        <HeldItemContext.Provider value={{
            item: heldItem,
            takeItem: (value) => setHeldItem(value)}}>
            {heldItem != null && <HeldItemPointer />}
            
            <StatusArea model={game.status} />

            <SecondaryWindow game={game} />

            <ChatArea chat={game.chat} />

            <PrimaryWindow game={game} />
        </HeldItemContext.Provider>
    </div>
}