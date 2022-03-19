import React = require("react");
import { ToolId, Tools } from "../model/tool-model";

export type ToolModes = Record<ToolId, string>;
export type SelectToolMode = (id: ToolId, mode: string) => void;

export const useToolModes = (): [ToolModes, SelectToolMode] => {
    const initialModes = React.useMemo(() => {
        const modes: ToolModes = {};
        
        for(const id in Tools) {
            modes[id] = Tools[id].modes[0];
        }

        return modes;
    }, []);

    const [toolModes, setToolModes] = React.useState(initialModes);

    const selectMode: SelectToolMode = (id: ToolId, mode: string) => {
        setToolModes(modes => {
            const newModes = { ...modes };
            newModes[id] = mode;
            return newModes;
        });
    }

    return [toolModes, selectMode];
};