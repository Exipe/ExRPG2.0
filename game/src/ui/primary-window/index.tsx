
import { useEffect, useState } from "react";
import React = require("react");
import { BankWindow } from "./bank-window";
import { CraftingStation } from "./crafting-station";
import "./window.scss";
import "./bank.scss";
import "./crafting.scss";
import "./dialogue.scss";
import "./shop.scss";
import "./trade.scss";
import { DialogueBox } from "./dialogue-box";
import { ShopWindow } from "./shop-window";
import { TradeWindow } from "./trade-window";
import { useGame } from "../game-provider";

export function PrimaryWindow() {
    const game = useGame();
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
            return <DialogueBox />
        case "Shop":
            return <ShopWindow />
        case "Crafting":
            return <CraftingStation />
        case "Bank":
            return <BankWindow />
        case "Trade":
            return <TradeWindow />
    }
}
