import { TextureId, Texture, TileTextures } from "../model/tile-texture-model";

export type SetTexture = {
    type: "SET_TEXTURE",
    id: TextureId,
    texture: Omit<Texture, "selectX" | "selectY">
};

export type SelectTexture = {
    type: "SELECT_TEXTURE",
    id: TextureId,
    x: number,
    y: number
};

export const TileTextureReducer = (state: TileTextures, 
    action: SetTexture | SelectTexture) => 
{
    const tileTextures = { ...state };
    
    switch(action.type) {
        case "SET_TEXTURE":
            tileTextures[action.id] = { 
                ...action.texture, 
                selectX: 0, 
                selectY: 0 
            }
            break;
        case "SELECT_TEXTURE":
            tileTextures[action.id] = {
                ...tileTextures[action.id],
                selectX: action.x,
                selectY: action.y
            }
            break;
    }

    return tileTextures;
};
