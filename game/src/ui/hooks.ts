import React = require("react");
import { Observable } from "../util/observable"
import { useGame } from "./game-provider";

export function useObservable<T>(observable: Observable<T>): T {
    const [state, setState] = React.useState(observable.value);
    React.useEffect(() => {
        observable.register(setState);
        return () => observable.unregister(setState);
    }, [observable]);

    return state;
}

export const useOverlayArea = () => useGame().overlayArea;
export const useContextMenu = () => useGame().ctxMenu;
export const useStatus = () => useGame().status;
export const useChat = () => useGame().chat;
export const useDebugMode = () => useGame().debugMode;
export const usePrimaryWindow = () => useGame().primaryWindow;
export const useInventory = () => useGame().inventory;
export const useShop = () => useGame().shop;
export const useBank = () => useGame().bank;
export const useTrade = () => useGame().trade;
export const useDialogue = () => useGame().dialogue;
export const useCrafting = () => useGame().crafting;
