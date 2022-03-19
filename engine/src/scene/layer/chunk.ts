
import { Engine } from "../..";

export const CHUNK_SIZE = 8

export abstract class Chunk<T> {

    protected x: number
    protected y: number
    protected tiles: T[][] = []

    private needsUpdate = false

    constructor(x: number, y: number) {
        this.x = x
        this.y = y

        for(let ri = 0; ri < CHUNK_SIZE; ri++) {
            const r: T[] = [];
            this.tiles.push(r)

            for(let ci = 0; ci < CHUNK_SIZE; ci++) {
                r[ci] = null
            }
        }
    }

    public put(x: number, y: number, tile: T) {
        const replaced = this.tiles[y][x]
        this.tiles[y][x] = tile
        this.needsUpdate = true
        return replaced
    }

    public remove(x: number, y: number) {
        const removed = this.tiles[y][x]
        this.tiles[y][x] = null
        this.needsUpdate = true
        return removed
    }

    public get(x: number, y: number) {
        return this.tiles[y][x];
    }

    public update(engine: Engine) {
        if(!this.needsUpdate) return
        this.doUpdate(engine)
        this.needsUpdate = false
    }

    protected process(processTile: (t: T, x: number, y: number) => any) {
        for(let ri = 0; ri < CHUNK_SIZE; ri++) {
            for(let ci = 0; ci < CHUNK_SIZE; ci++) {
                const t = this.get(ci, ri)
                if(t == null) {
                    continue
                }

                const x = this.x * CHUNK_SIZE + ci
                const y = this.y * CHUNK_SIZE + ri

                processTile(t, x, y)
            }
        }
    }

    protected abstract doUpdate(engine: Engine): any;

    public abstract draw(engine: Engine): any;

}
