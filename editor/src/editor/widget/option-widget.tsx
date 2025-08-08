import React = require("react");
import { useEngine } from "../../engine/engine-provider";
import { useWidgets } from "../../widget/widget-provider";
import { loadFile, saveFile } from "../load-save";
import { OptionsWindow } from "./options-window";
import { NewWindow } from "./new-windows";
import { useEditor } from "../editor-provider";

type OptionWindow = {
    id: string;
    title: string;
    body: React.ReactElement;
};

const optionWindows: OptionWindow[] = [
    {
        id: "new",
        title: "New",
        body: <NewWindow />
    },
    {
        id: "options",
        title: "Options",
        body: <OptionsWindow />
    }
];

export const useOptionWidgets = () => {
    const widgets = useWidgets();
    const { fileName, setFileName } = useEditor();
    const { engine, loadMap, saveMap } = useEngine();

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        widgets.createButton("load", "Load", async () => {
            const mapFile = await loadFile();
            loadMap(mapFile.jsonContent);
            setFileName(mapFile.fileName);
        }, "option")

        widgets.createButton("save", "Save", async () => {
            const content = saveMap();
            await saveFile(fileName, content);
        }, "option")

        optionWindows.forEach((o) => {
            widgets.createWindow(o.id, o.title, o.body, "option");
        });

        return () => {
            widgets.removeWidget("load");
            widgets.removeWidget("save");
            optionWindows.forEach((o) => widgets.removeWidget(o.id));
            widgets.removeWidget("r-island");
        };
    }, [engine, loadMap, saveMap, fileName, setFileName]);
}