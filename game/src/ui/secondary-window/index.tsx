
import { useEffect, useState } from "react";
import React = require("react");
import { Game } from "../../game/game";
import { TabArea } from "../tab-area/tab-area";
import { BankInventory } from "./bank-inventory";
import { ShopInventory } from "./shop-inventory";
import { TradeInventory } from "./trade-inventory";

export interface SecondaryWindowProps {
    game: Game,
}

export function SecondaryWindow(props: SecondaryWindowProps) {
    const game = props.game
    const pwObserver = game.primaryWindow
    const [pw, setPw] = useState(pwObserver.value)

    useEffect(() => {
        pwObserver.register(setPw)
        return () => pwObserver.unregister(setPw)
    }, [])

    switch(pw) {
        case "Shop":
            return <ShopInventory
                inventory={game.inventory}
                shop={game.shop} />
        case "Bank":
            return <BankInventory 
                ctxMenu={game.ctxMenu}
                inventory={game.inventory} 
                bank={game.bank} />
        case "Trade":
            return <TradeInventory
                ctxMenu={game.ctxMenu}
                inventory={game.inventory}
                model={game.trade} />
        default:
            return <TabArea game={game} />
    }
}
