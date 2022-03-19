
import { Layer } from "./layer";
import { BaseChunk } from "./base-chunk";
import { Tile } from "../../tile/tile";

export class BaseLayer extends Layer<Tile> {

    protected createLayer(width: number, height: number): Layer<Tile> {
        return new BaseLayer(width, height)
    }

    protected createChunk(x: number, y: number): BaseChunk {
        return new BaseChunk(x, y)
    }

}