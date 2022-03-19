import { Entity } from "exrpg";
import { Component } from "exrpg/dist/entity/component";
import { HealthBarModel, OverlayAreaModel } from "../../model/overlay-model";

export const HEALTHBAR_COMPONENT = "HEALTH_BAR"

const HIDE_HEALTHBAR_TIME = 5_000

export class HealthBarComponent extends Component {

    private healthBar = null as HealthBarModel
    private healthBarTimeout = -1

    private entity: Entity
    private overlayArea: OverlayAreaModel

    constructor(entity: Entity, overlayArea: OverlayAreaModel) {
        super(HEALTHBAR_COMPONENT)
        this.entity = entity
        this.overlayArea = overlayArea
    }

    private removeHealthBar() {
        this.overlayArea.removeOverlay(this.healthBar)
        this.healthBar = null
        this.healthBarTimeout = -1
    }

    public set healthRatio(value: number) {
        if(this.healthBar != null) {
            this.healthBar.ratio = value
            clearTimeout(this.healthBarTimeout)
        } else {
            this.healthBar = this.overlayArea.addHealthBar(value, ...this.entity.centerBelowCoords)
        }

        this.healthBarTimeout = window.setTimeout(() => {
            this.removeHealthBar()
        }, HIDE_HEALTHBAR_TIME)
    }

    movePx() {
        if(this.healthBar != null) {
            this.healthBar.move(...this.entity.centerBelowCoords)
        }
    }

    destroy() {
        if(this.healthBar != null) {
            clearTimeout(this.healthBarTimeout)
            this.removeHealthBar()
        }
    }

    moveTile() {}

    animate(_dt: number) {}

    draw() {}

    initialize() {}


}