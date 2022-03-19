
import { Tile } from "./tile"
import { Quad } from "../quad"

export const GROUND_ID = "GROUND"

export class TextureTile extends Tile {

    protected readonly textureQuad: Quad

    constructor(id: string, textureQuad: Quad) {
        super(id)
        this.textureQuad = textureQuad
    }

    instanceData(x: number, y: number): number[] {
        return super.instanceData(x, y).concat([this.textureQuad.x, this.textureQuad.y])
    }

}

export class GroundTile extends TextureTile {

    constructor(textureQuad: Quad, texX: number, texY: number) {
        super(GROUND_ID + "_" + texX + "_" + texY, textureQuad)
    }

}

export class DecoTile extends TextureTile {

    constructor(textureQuad: Quad, texX: number, texY: number) {
        super(texX + "_" + texY, textureQuad)
    }

}
