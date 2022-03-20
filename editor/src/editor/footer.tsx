import React = require("react")
import { useEngine } from "../engine/engine-provider"

export const Footer = () => {
    const { hoverData: data } = useEngine();

    return <div id="footer">
        Hovering tile: ({data.x}, {data.y}) Island: {data.island}
    </div>;
}