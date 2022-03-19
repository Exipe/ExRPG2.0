
import { Tile } from "./tile";
import { Quad } from "../quad";

export class OverlayTile extends Tile {
 
    public readonly textureQuad: Quad
    public readonly shapeQuad: Quad

    constructor(id: string, textureQuad: Quad, shapeQuad: Quad) {
        super(id)
        this.textureQuad = textureQuad
        this.shapeQuad = shapeQuad
    }

}
