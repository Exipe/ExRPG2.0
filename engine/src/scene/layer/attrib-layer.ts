
import { Layer } from "./layer";
import { AttribTile } from "../../tile/attrib-tile";
import { Chunk } from "./chunk";
import { AttribChunk } from "./texture-chunk";

export class AttribLayer extends Layer<AttribTile> {

    protected createLayer(width: number, height: number): Layer<AttribTile> {
        return new AttribLayer(width, height)
    }

    protected createChunk(x: number, y: number): Chunk<AttribTile> {
        return new AttribChunk(x, y)
    }

    protected didPut(x: number, y: number, t: AttribTile) {
        t.put(x, y)
    }

    protected didRemove(x: number, y: number, t: AttribTile) {
        t.remove(x, y)
    }

    protected didReplace(x: number, y: number, t: AttribTile) {
        this.didRemove(x, y, t)
    }

}