import React = require("react");
import { useEngine } from "../../engine/engine-provider";
import { useWidgets } from "../../widget/widget-provider";
import { DetailsWindow } from "./details-window";
import { ItemWindow, NpcWindow, ObjectWindow } from "./entity-window";
import { LightWindow } from "./light-window";
import { TileWindow } from "./tile-window";
import { ToolSelectionWindow } from "./tool-selection-window";
import { TriggerWindow } from "./trigger-window";
import { WarpWindow } from "./warp-window";

type ToolWindow = {
    id: string;
    title: string;
    body: React.ReactElement;
};

const toolWindows: ToolWindow[] = [
    {
        id: "details",
        title: "Details",
        body: <DetailsWindow />
    },
    {
        id: "light",
        title: "Light",
        body: <LightWindow />
    },
    {
        id: "tool",
        title: "Tool",
        body: <ToolSelectionWindow />
    },
    {
        id: "ground",
        title: "Ground",
        body: <TileWindow texture="groundTexture" />
    },
    {
        id: "shape",
        title: "Shape",
        body: <TileWindow texture="shapeTexture" />
    },
    {
        id: "wall",
        title: "Wall",
        body: <TileWindow texture="wallTexture" />
    },
    {
        id: "decoration",
        title: "Decoration",
        body: <TileWindow texture="decoTexture" />
    },
    {
        id: "warp",
        title: "Warp",
        body: <WarpWindow />
    },
    {
        id: "trigger",
        title: "Trigger",
        body: <TriggerWindow />
    },
    {
        id: "npc",
        title: "NPC",
        body: <NpcWindow />
    },
    {
        id: "object",
        title: "Object",
        body: <ObjectWindow />
    },
    {
        id: "item",
        title: "Item",
        body: <ItemWindow />
    }
];

export const useToolWidgets = () => {
    const widgets = useWidgets();
    const { engine } = useEngine();

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        toolWindows.forEach((t) => {
            widgets.createWindow(t.id, t.title, t.body, "tool");
        })

        return () => {
            toolWindows.forEach((t) => widgets.removeWidget(t.id));
        }
    }, [engine]);
}
