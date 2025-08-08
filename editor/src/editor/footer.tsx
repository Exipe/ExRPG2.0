import React = require("react")
import { useEngine } from "../engine/engine-provider"
import { useEditor } from "./editor-provider";

export const Footer = () => {
    const { fileName } = useEditor();
    const { hoverData: data } = useEngine();

    return <div id="footer">
        <div>Editing file: <span className="footerData">{fileName ?? '-'}</span></div>
        <div>Hovering tile: <span className="footerData">({data.x}, {data.y})</span> Island: <span className="footerData">{data.island ?? '-'}</span></div>
    </div>;
}