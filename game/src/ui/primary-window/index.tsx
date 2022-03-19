
import { useEffect, useState } from "react";
import React = require("react");
import { Game } from "../../game/game";
import { BankWindow } from "./bank-window";
import { CraftingStation } from "./crafting-station";
import { DialogueBox } from "./dialogue-box";
import { ShopWindow } from "./shop-window";
import { TradeWindow } from "./trade-window";

export interface PrimaryWindowProps {
    game: Game
}

export function PrimaryWindow(props: PrimaryWindowProps) {
    const game = props.game
    const pwObserver = game.primaryWindow
    const [pw, setPw] = useState(pwObserver.value)

    useEffect(() => {
        pwObserver.register(setPw)
        return () => pwObserver.unregister(setPw)
    }, [])

    switch(pw) {
        case "None":
            return <></>
        case "Dialogue":
            return <DialogueBox model={game.dialogue} />
        case "Shop":
            return <ShopWindow model={game.shop} />
        case "Crafting":
            return <CraftingStation model={game.crafting} inventory={game.inventory} />
        case "Bank":
            return <BankWindow model={game.bank} ctxMenu={game.ctxMenu} />
        case "Trade":
            return <TradeWindow model={game.trade} ctxMenu={game.ctxMenu} />
    }
}
