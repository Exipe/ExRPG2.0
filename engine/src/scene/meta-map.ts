import { Scene } from ".."
import { AnchorPoint, resizeOffset } from "../util"

export abstract class MetaMap<T> {

    protected readonly width: number
    protected readonly height: number

    private grid: T[][] = []

    protected abstract getDefault(): T

    protected clear() {
        this.grid = [];

        for(let ri = 0; ri < this.height; ri++) {
            const row = []
            this.grid.push(row)

            for(let ci = 0; ci < this.width; ci++) {
                row.push(this.getDefault())
            }
        }
    }

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        this.clear()
    }

    protected abstract create(width: number, height: number): MetaMap<T>

    public resize(width: number, height: number, anchorX: AnchorPoint, anchorY: AnchorPoint) {
        const resized = this.create(width, height)

        let [offsetX, offsetY] = resizeOffset(width, height, this.width, this.height, anchorX, anchorY)

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.width; y++) {
                resized.set(x+offsetX, y+offsetY, this.get(x, y))
            }
        }

        return resized
    }

    protected inBounds(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
    }

    protected get(x: number, y: number) {
        if(!this.inBounds(x, y)) {
            return this.getDefault()
        }

        return this.grid[y][x]
    }

    protected set(x: number, y: number, value: T) {
        if(!this.inBounds(x, y)) {
            return
        }

        this.grid[y][x] = value
    }

}

export class BlockMap extends MetaMap<number> {

    protected create(width: number, height: number) {
        return new BlockMap(width, height)
    }

    protected getDefault() {
        return 0
    }

    private increment(x: number, y: number, i: number) {
        const curr = this.get(x, y)
        this.set(x, y, Math.max(curr + 1, 0))
    }

    public block(x: number, y: number) {
        this.increment(x, y, 1)
    }

    public unBlock(x: number, y: number) {
        this.increment(x, y, -1)
    }

    public isBlocked(x: number, y: number) {
        return !this.inBounds(x, y) || this.get(x, y) > 0
    }

}

export class IslandMap extends MetaMap<string | undefined> {

    private scene: Scene

    constructor(scene: Scene, width = scene.width, height = scene.height) {
        super(width, height)
        this.scene = scene
    }

    protected getDefault() {
        return undefined
    }

    protected create(width: number, height: number) {
        return new IslandMap(this.scene, width, height)
    }

    private flood(id: string, x: number, y: number) {
        if(this.get(x, y) == id || this.scene.isHardBlocked(x, y)) {
            return
        }

        this.set(x, y, id)
        this.flood(id, x+1, y)
        this.flood(id, x, y+1)
        this.flood(id, x-1, y)
        this.flood(id, x, y-1)
    }

    public rebuild() {
        this.clear();

        let islandCounter = 0;
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                if(this.get(x, y) !== undefined || this.scene.isBlocked(x, y)) {
                    continue;
                }

                const islandId = this.getIslandId(islandCounter);
                islandCounter++;

                this.flood(islandId, x, y);
            }
        }
    }

    public get(x: number, y: number) {
        return super.get(x, y)
    }

    private getIslandId = (index: number) => String.fromCharCode("A".charCodeAt(0) + index);

}
