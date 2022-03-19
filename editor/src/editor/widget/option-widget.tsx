import { saveScene } from "exrpg";
import React = require("react");
import { useEngine } from "../../engine/engine-provider";
import { useWidgets } from "../../widget/widget-provider";
import { loadFile, saveFile } from "../load-save";

type OptionWindow = {
    id: string;
    title: string;
    body: React.ReactElement;
};

const optionWindows: OptionWindow[] = [
    {
        id: "new",
        title: "New",
        body: <>New</>
    },
    {
        id: "options",
        title: "Options",
        body: <>Options</>
    }
];

export const useOptionWidgets = () => {
    const widgets = useWidgets();
    const engine = useEngine();

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        widgets.createButton("load", "Load", async () => {
            const map = await loadFile();
            engine.loadMap(map);
        }, "option")

        widgets.createButton("save", "Save", async () => {
            const content = engine.saveMap();
            await saveFile(content);
        }, "option")

        optionWindows.forEach((o) => {
            widgets.createWindow(o.id, o.title, o.body, "option");
        });

        widgets.createButton("r-island", "R Island", () => {
            console.log("Reload islands");
        }, "option");

        return () => {
            widgets.removeWidget("load");
            widgets.removeWidget("save");
            optionWindows.forEach((o) => widgets.removeWidget(o.id));
            widgets.removeWidget("r-island");
        };
    }, [engine]);
}