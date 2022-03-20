
import Exrpg = require("exrpg");
import React = require("react");

export type HoverData = {
    island: string,
    x: number,
    y: number
}

const defaultData: HoverData = {
    island: '-',
    x: 0,
    y: 0
}

export const useTileHover = (engine: Exrpg.Engine) => {
    const [data, setData] = React.useState(defaultData);

    const tileHover = React.useCallback((x: number, y: number) => {
        if((x === data.x && y === data.y) 
            || x < 0 || x >= engine.map.width 
            || y < 0 || y >= engine.map.height) 
        {
            return;
        }

        const island = engine.map.islandMap.get(x, y);
        setData({
            x, y, island
        });
    }, [data, setData, engine]);

    React.useEffect(() => {
        if(engine === undefined) {
            return;
        }

        engine.inputHandler.onTileHover = tileHover;
    }, [engine, tileHover]);

    return data;
}