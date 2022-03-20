import React = require("react")
import Exrpg = require("exrpg");
import { useEngine } from "./engine-provider";

export const Graphics = () => {
    const { engine, hoverData } = useEngine();

    const [cursor, setCursor] = React.useState<Exrpg.Sprite | undefined>();

    React.useEffect(() => {
        engine.loadTexture("tile/cursor.png").then((texture) => {
            const cursor = new Exrpg.Sprite(engine, texture);
            setCursor(cursor);
        });
    }, [engine]);

    const render = React.useCallback(() => {
        if(cursor === undefined) {
            return;
        }

        cursor.draw(hoverData.x * Exrpg.TILE_SIZE, 
            hoverData.y * Exrpg.TILE_SIZE);
    }, [cursor, hoverData]);

    React.useEffect(() => {
        engine.onDraw = render;
    }, [engine, render]);

    return <></>;
}