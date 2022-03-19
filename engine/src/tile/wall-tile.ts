
import { Tile } from "./tile";
import { Quad } from "../quad";
import { TILE_SIZE } from "..";

export class WallTile extends Tile {

    public readonly textureQuad: Quad

    private shadowTop = false
    private shadowRight = false
    private shadowBottom = false
    private shadowLeft = false

    constructor(id: string, textureQuad: Quad) {
        super(id)
        this.textureQuad = textureQuad
    }

    update(check: (x: number, y: number) => boolean) {
        this.shadowTop = check(0, -1)
        this.shadowRight = check(1, 0)
        this.shadowBottom = check(0, 1)
        this.shadowLeft = check(-1, 0)
    }

    public shadowInstanceData(x: number, y: number): [number, number[]] {
        const data: number[] = []

        if(this.shadowTop) {
            data.push(x * TILE_SIZE, y * TILE_SIZE - 1, TILE_SIZE, 1)
        }
        if(this.shadowRight) {
            data.push((x + 1) * TILE_SIZE, y * TILE_SIZE, 1, TILE_SIZE)
        }
        if(this.shadowBottom) {
            data.push(x * TILE_SIZE, (y + 1) * TILE_SIZE, TILE_SIZE, 1)
        }
        if(this.shadowLeft) {
            data.push(x * TILE_SIZE - 1, y * TILE_SIZE, 1, TILE_SIZE)
        }

        return [ data.length / 4, data ]
    }
    
}
