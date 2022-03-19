
import { Layer } from "./layer";
import { DecoTile } from "../../tile/texture-tile";
import { Chunk } from "./chunk";
import { DecoChunk } from "./texture-chunk";

export class DecoLayer extends Layer<DecoTile> {

    protected createLayer(width: number, height: number): Layer<DecoTile> {
        return new DecoLayer(width, height)
    }

    protected createChunk(x: number, y: number): Chunk<DecoTile> {
        return new DecoChunk(x, y)
    }
    
}