
type BlockCell = [number, number] //player, npc
const PLAYER_BLOCK = 0
const NPC_BLOCK = 1

export class BlockMap {

    private readonly width: number
    private readonly height: number

    private readonly grid: BlockCell[][] = []

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        for(let ri = 0; ri < height; ri++) {
            const row = []
            this.grid.push(row)

            for(let ci = 0; ci < width; ci++) {
                row.push([0, 0])
            }
        }
    }

    private inBounds(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
    }

    private set(x: number, y: number, idx: number, diff: number) {
        if(!this.inBounds(x, y)) {
            return
        }

        const curr = this.grid[y][x][idx]
        this.grid[y][x][idx] = Math.max(curr+diff, 0)
    }

    public block(x: number, y: number) {
        this.set(x, y, PLAYER_BLOCK, 1)
        this.set(x, y, NPC_BLOCK, 1)
    }

    public unBlock(x: number, y: number) {
        this.set(x, y, PLAYER_BLOCK, -1)
        this.set(x, y, NPC_BLOCK, -1)
    }

    public npcBlock(x: number, y: number) {
        this.set(x, y, NPC_BLOCK, 1)
    }

    public npcUnBlock(x: number, y: number) {
        this.set(x, y, NPC_BLOCK, -1)
    }

    public isBlocked(x: number, y: number) {
        return !this.inBounds(x, y) || this.grid[y][x][PLAYER_BLOCK] > 0
    }

    public isNpcBlocked(x: number, y: number) {
        return !this.inBounds(x, y) || this.grid[y][x][NPC_BLOCK] > 0
    }

}