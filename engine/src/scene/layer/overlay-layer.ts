
import { Layer } from "./layer";
import { OverlayTile } from "../../tile/overlay-tile";
import { OverlayChunk } from "./overlay-chunk";

export class OverlayLayer extends Layer<OverlayTile> {

    protected createLayer(width: number, height: number): Layer<OverlayTile> {
        return new OverlayLayer(width, height)
    }

    protected createChunk(x: number, y: number): OverlayChunk {
        return new OverlayChunk(x, y)
    }

}