
import React = require("react");
import { TabArea } from "../tab-area/tab-area";
import { BankInventory } from "./bank-inventory";
import { ShopInventory } from "./shop-inventory";
import "./secondary-window.scss";
import { TradeInventory } from "./trade-inventory";
import { useObservable, usePrimaryWindow } from "../hooks";

export function SecondaryWindow() {
    const primaryWindowObservable = usePrimaryWindow();
    const pw = useObservable(primaryWindowObservable);

    switch (pw) {
        case "Shop":
            return <ShopInventory />
        case "Bank":
            return <BankInventory />
        case "Trade":
            return <TradeInventory />
        default:
            return <TabArea />
    }
}
