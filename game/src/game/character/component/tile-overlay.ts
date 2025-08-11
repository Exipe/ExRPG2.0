import { Component, Entity, TILE_SIZE } from "exrpg";
import { OverlayAreaModel, TileOverlayModel, TileOverlayTile } from "../../model/overlay-model";
import { Character } from "../character";

export const TILE_OVERLAY_COMPONENT = "TILE_OVERLAY";

export class TileOverlayComponent extends Component {
    private tileOverlay?: TileOverlayModel;

    private readonly character: Character;
    private readonly overlayArea: OverlayAreaModel;

    constructor(character: Character, overlayArea: OverlayAreaModel) {
        super(TILE_OVERLAY_COMPONENT);
        this.character = character;
        this.overlayArea = overlayArea;
    }

    initialize(): void {
        this.tileOverlay = this.overlayArea.addTileOverlay(this.tiles, TILE_SIZE, ...this.coords);
    }

    moveTile(): void {
        this.tileOverlay.move(...this.coords);
    }

    destroy(): void {
        if (this.tileOverlay !== undefined) {
            this.overlayArea.removeOverlay(this.tileOverlay);
        }
    }

    private get coords(): [number, number] {
        const x = this.character.tileX * TILE_SIZE;
        const y = (this.character.tileY - this.character.getDepth() + 1) * TILE_SIZE;

        return [x, y];
    }

    private get tiles(): ReadonlyArray<TileOverlayTile> {
        let tiles: TileOverlayTile[] = [];
        for (let x = 0; x < this.character.tileSpan; x++) {
            for (let y = 0; y < this.character.getDepth(); y++) {
                tiles.push({
                    offsetX: x * TILE_SIZE,
                    offsetY: y * TILE_SIZE
                });
            }
        }

        return tiles;
    }
}