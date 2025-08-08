
import { Chunk, CHUNK_SIZE } from "./chunk";
import { Engine } from "../..";
import { Tile } from "../../tile/tile";
import { AnchorPoint, resizeOffset } from "../../util";

function sameTile(a: Tile, b: Tile) {
    if(a == null || b == null) {
        return a == b
    } else {
        return a.id == b.id
    }
}

export abstract class Layer<T extends Tile> {

    public readonly width: number
    public readonly height: number

    private readonly chunks: Chunk<T>[][] = []
    private readonly hchunks: number
    private readonly vchunks: number

    public visible = true

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        this.hchunks = Math.ceil(width / CHUNK_SIZE)
        this.vchunks = Math.ceil(height / CHUNK_SIZE)

        for(let ri = 0; ri < this.vchunks; ri++) {
            const r: Chunk<T>[] = [] 
            this.chunks.push(r)

            for(let ci = 0; ci < this.hchunks; ci++) {
                r.push(this.createChunk(ci, ri))
            }
        }
    }

    public resize(width: number, height: number, anchorX: AnchorPoint, anchorY: AnchorPoint) {
        let [offsetX, offsetY] = resizeOffset(width, height, this.width, this.height, anchorX, anchorY)

        const layerNew = this.createLayer(width, height)

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const tile = this.get(x, y)
                if(tile == null) {
                    continue
                }
                
                layerNew.put(x + offsetX, y + offsetY, tile)
            }
        }

        return layerNew
    }

    public fill(x: number, y: number, replacement: T, replace: T = undefined) {
        const current = this.get(x, y)
        if(current === undefined) { //out of bounds
            return
        } else if(replace === undefined) {
            replace = current
        } else if(!sameTile(current, replace)) {
            return
        }
        
        this.put(x, y, replacement)

        this.fill(x, y-1, replacement, replace)
        this.fill(x+1, y, replacement, replace)
        this.fill(x, y+1, replacement, replace)
        this.fill(x-1, y, replacement, replace)
    }

    private getChunk(x: number, y: number): Chunk<T> {
        if(x < 0 || y < 0 || x >= this.width || y >= this.height) return null

        const chunkX = Math.trunc(x / CHUNK_SIZE)
        const chunkY = Math.trunc(y / CHUNK_SIZE)

        return this.chunks[chunkY][chunkX]
    }

    protected didReplace(x: number, y: number, tile: T, update: boolean) {}

    protected didRemove(x: number, y: number, tile: T, update: boolean) {}

    protected didPut(x: number, y: number, tile: T, update: boolean) {}

    public put(x: number, y: number, tile: T, update = false, engine: Engine = null) {
        const chunk = this.getChunk(x, y)
        if(chunk == null) return

        const replaced = chunk.put(x % CHUNK_SIZE, y % CHUNK_SIZE, tile)
        if(replaced != null) {
            this.didReplace(x, y, replaced, update)
        }
        this.didPut(x, y, tile, update)

        if(update) chunk.update(engine)
    }

    public remove(x: number, y: number, update = false, engine: Engine = null) {
        const chunk = this.getChunk(x, y)
        if(chunk == null) return

        const removed = chunk.remove(x % CHUNK_SIZE, y % CHUNK_SIZE)
        if(removed != null) {
            this.didRemove(x, y, removed, update)
        }

        if(update) chunk.update(engine)
    }

    public get(x: number, y: number): T {
        const chunk = this.getChunk(x, y)
        if(chunk == null) return

        return chunk.get(x % CHUNK_SIZE, y % CHUNK_SIZE)
    }

    public update(engine: Engine) {
        this.chunks.forEach(r => {
            r.forEach(c => c.update(engine))
        })
    }

    public draw(engine: Engine, firstX: number, firstY: number, lastX: number, lastY: number) {
        if(!this.visible) {
            return
        }

        for(let xi = Math.max(0, firstX); xi <= Math.min(this.hchunks - 1, lastX); xi++) {
            for(let yi = Math.max(0, firstY); yi <= Math.min(this.vchunks - 1, lastY); yi++) {
                this.chunks[yi][xi].draw(engine)
            }
        }
    }

    protected abstract createLayer(width: number, height: number): Layer<T>;

    protected abstract createChunk(x: number, y: number): Chunk<T>;

}
