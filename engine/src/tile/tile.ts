
import { TILE_SIZE } from ".."

export class Tile {

    public readonly id: string

    constructor(id: string) {
        this.id = id
    }

    public instanceData(x: number, y: number): number[] {
        return [ 
            TILE_SIZE * x, TILE_SIZE * y
        ]
    }

}