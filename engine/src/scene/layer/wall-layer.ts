
import { Layer } from "./layer";
import { WallTile } from "../../tile/wall-tile";
import { WallChunk } from "./wall-chunk";

export class WallLayer extends Layer<WallTile> {

    protected createLayer(width: number, height: number): Layer<WallTile> {
        return new WallLayer(width, height)
    }

    protected createChunk(x: number, y: number): WallChunk {
        return new WallChunk(x, y)
    }

    private updateShadow(tx: number, ty: number) {
        [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]].forEach(n => {
            const x = n[0] + tx, y = n[1] + ty

            const w = this.get(x, y)
            if(w == null) return

            w.update((offX, offY) => this.get(x + offX, y + offY) == null)
        })
    }

    protected didRemove(tx: number, ty: number, tile: WallTile, update: boolean) {
        this.updateShadow(tx, ty)
    }

    protected didPut(tx: number, ty: number, tile: WallTile, update: boolean) {
        this.updateShadow(tx, ty)
    }
    
}