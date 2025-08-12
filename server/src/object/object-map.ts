
import { ObjectData } from "./object-data"
import { BlockMap } from "../scene/block-map"
import { reachable } from "../util/util"

export class ObjectMap {

    private readonly blockMap: BlockMap
    private readonly grid: ObjectData[][] = []

    constructor(blockMap: BlockMap, width: number, height: number) {
        this.blockMap = blockMap

        for (let ri = 0; ri < height; ri++) {
            const row = new Array(width)
            for (let ci = 0; ci < width; ci++) {
                row.push(null)
            }

            this.grid.push(row)
        }
    }

    public set(x: number, y: number, objData: ObjectData) {
        let old = this.grid[y][x]
        this.grid[y][x] = objData

        if (old != null && old.block) {
            for (let i = 0; i < objData.width; i++) {
                this.blockMap.unBlock(x + i, y)
            }
        }

        if (objData == null || !objData.block) {
            return old
        }

        for (let i = 0; i < objData.width; i++) {
            for (let j = 1 - objData.depth; j < 1; j++) {
                this.blockMap.block(x + i, y + j)
            }
        }

        return old
    }

    public reachable(fromX: number, fromY: number, x: number, y: number, objData: ObjectData) {
        if (this.grid[y][x] == null || this.grid[y][x] != objData) {
            return false
        }

        return reachable(
            { x: fromX, y: fromY, width: 1, depth: 1 },
            { x, y, width: objData.width, depth: objData.depth }
        );
    }

}