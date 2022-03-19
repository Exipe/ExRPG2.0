
import { Entity } from "exrpg";
import { Component } from "exrpg/dist/entity/component";
import { ItemHandler } from "exrpg/dist/item/item-handler";
import { OverlayAreaModel, ProgressIndicatorModel } from "../../model/overlay-model";

export const PROGRESS_INDICATOR_COMPONENT = "PROGRESS_INDICATOR"

export class ProgressIndicatorComponent extends Component {

    private indicator = null as ProgressIndicatorModel
    private readonly overlayArea: OverlayAreaModel
    private readonly itemHandler: ItemHandler
    private readonly entity: Entity

    constructor(entity: Entity, itemHandler: ItemHandler, overlayArea: OverlayAreaModel) {
        super(PROGRESS_INDICATOR_COMPONENT)
        this.entity = entity
        this.itemHandler = itemHandler
        this.overlayArea = overlayArea
    }

    public addIndicator(itemId: string, duration: number) {
        const item = this.itemHandler.get(itemId)
        if(this.indicator == null) {
            this.indicator = this.overlayArea.addProgressIndicator(item.spritePath, duration, ...this.entity.centerAboveCoords)
            return
        }

        this.indicator.sprite = item.spritePath
        this.indicator.duration = duration
        this.indicator.resetCounter.value++ // force react to restart timer
    }

    public removeIndicator() {
        if(this.indicator != null) {
            this.overlayArea.removeOverlay(this.indicator)
            this.indicator = null
        }
    }

    public movePx() {
        if(this.indicator != null) {
            this.indicator.move(...this.entity.centerAboveCoords)
        }
    }

    public destroy() {
        if(this.indicator != null) {
            this.overlayArea.removeOverlay(this.indicator)
            this.indicator = null
        }
    }

}