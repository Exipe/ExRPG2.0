import React = require("react");
import { Button, ToggleButton } from "../../component/button";
import { useEditor } from "../editor-provider";
import { Tools } from "../../model/tool-model";

export const ToolSelectionWindow = () => {
    const { tool, setTool, selectToolMode, toolMode } = useEditor();

    const toolButtons = React.useMemo(() => {
        const elements: React.ReactElement[] = [];

        for(const t in Tools) {
            const name = Tools[t].name;
            const enabled = t !== tool;
    
            const select = () => {
                setTool(t);
            }
    
            elements.push(<Button 
                key={name} 
                enabled={enabled}
                onClick={select}
            >
                {name}
            </Button>);
        }
        return elements;
    }, [tool, setTool])

    const currentName = React.useMemo(() => tool === undefined 
        ? "None" 
        : Tools[tool].name, 
    [tool]);

    const toolModes = React.useMemo(() => {
        const modes = tool !== undefined 
            ? Tools[tool].modes 
            : [];

        return modes.map((s, i) => {
            const select = () => selectToolMode(tool, s);
            const enabled = s !== toolMode;

            return <Button
                key={i}
                enabled={enabled}
                onClick={select}
            >
                {s}
            </Button>
        })
    }, [tool, selectToolMode, tool]);

    return <div>
        Current: {currentName}

        <div id="toolSelectionButtons">
            {toolButtons}
        </div>

        <div id="toolModes">
            {toolModes.length > 0 ? toolModes : "N/A"}
        </div>
    </div>
};