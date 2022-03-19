
export type Texture = {
    src: string;
    width: number;
    height: number;
    selectX: number;
    selectY: number;
};

export type TileTextures = {
    groundTexture?: Texture;
    shapeTexture?: Texture;
    wallTexture?: Texture;
    decoTexture?: Texture;
};

export type TextureId = keyof TileTextures;