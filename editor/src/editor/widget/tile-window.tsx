import React = require("react");
import { TileTextureView } from "../../component/tile-texture";
import { useEditor } from "../editor-provider";
import { TextureId } from "../../model/tile-texture-model";

type TileWindowProps = {
    texture: TextureId;
};

export const TileWindow = (props: TileWindowProps) => {
    const { tileTextures, selectTexture } = useEditor();

    const texture = tileTextures[props.texture];

    if(texture === undefined) {
        return <></>;
    }

    const select = (x: number, y: number) => {
        selectTexture(props.texture, x, y);
    };

    const isSelected = (x: number, y: number) => {
        return x === texture.selectX && y === texture.selectY;
    };

    return <div className="tileWindow">
        <TileTextureView 
            src={texture.src} 
            isSelected={isSelected} 
            onClick={select}
            width={texture.width}
            height={texture.height}
        />
    </div>
};
