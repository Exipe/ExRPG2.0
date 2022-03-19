import React = require("react");
import { Editor } from "./editor/editor-view";
import { EditorProvider } from "./editor/editor-provider";
import { EngineProvider } from "./engine/engine-provider";
import { WidgetProvider } from "./widget/widget-provider";
import { WindowProvider } from "./widget/window-provider";

export const App = () => {
    return <EngineProvider>
        <EditorProvider>
            <WindowProvider>
                <WidgetProvider>
                    <Editor />
                </WidgetProvider>
            </WindowProvider>
        </EditorProvider>
    </EngineProvider>
};