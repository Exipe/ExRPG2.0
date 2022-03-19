
import * as React from "react"
import { TILE_SIZE } from "exrpg"

const ZOOM = 2

const getStyle = (src: string, txtWidth: number, txtHeight: number, 
    x: number, y: number): React.CSSProperties => 
{
    const width = TILE_SIZE * ZOOM
    const height = TILE_SIZE * ZOOM

    const posX = -x * width
    const posY = -y * height
    const srcWidth = txtWidth * ZOOM
    const srcHeight = txtHeight * ZOOM

    return {
        borderWidth: ZOOM,

        width: width,
        height: height,

        backgroundImage: "url('" + src + "')",
        backgroundPosition: posX + "px " + posY + "px",
        backgroundSize: srcWidth + "px " + srcHeight + "px"
    }
}

interface TileTextureViewProps {
    src: string,
    width: number,
    height: number,
    onClick: (x: number, y: number) => void, 
    isSelected: (x: number, y: number) => boolean
}

function TileTextureGrid(props: TileTextureViewProps) {
    const textureGrid: React.ReactElement[] = [];
    const { src, width, height, onClick, isSelected } = props;

    for(let ir = 0; ir < height / TILE_SIZE; ir++) {
        const textureRow: React.ReactElement[] = [];

        for(let ic = 0; ic < width / TILE_SIZE; ic++) {
            const tile = <div
                key={ic}
                onMouseDown={() => onClick(ic, ir)}
                className={"tileTexture" 
                    + (isSelected(ic, ir) ? " selected" : "")}
                style={getStyle(src, width, height, ic, ir)}
            />;

            textureRow.push(tile);
        }

        textureGrid.push(<div className="tileRow" key={ir}>{textureRow}</div>)
    }

    return <>{textureGrid}</>
}

export const TileTextureView = React.memo(TileTextureGrid);
