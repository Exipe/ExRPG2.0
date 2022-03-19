
import { Entity, Light } from "..";
import { Component } from "../entity/component";
import { LightHandler } from "./light-handler";

export const LIGHT_COMPONENT = "LIGHT"

export class LightComponent extends Component {

    private readonly entity: Entity
    private readonly lightHandler: LightHandler

    private _radius: number
    private light: Light

    constructor(entity: Entity, lightHandler: LightHandler, radius: number) {
        super(LIGHT_COMPONENT)
        this.entity = entity
        this.lightHandler = lightHandler
        this._radius = radius
    }

    public set radius(value: number) {
        this.light.radius = this._radius = value
    }

    public initialize() {
        const [x, y] = this.entity.centerCoords

        this.light = {
            x: x,
            y: y,
            radius: this._radius
        }
        this.lightHandler.addLight(this.light)
    }

    public destroy() {
        this.lightHandler.removeLight(this.light)
    }

    public movePx() {
        const [x, y] = this.entity.centerCoords
        this.light.x = x
        this.light.y = y
    }

    public moveTile() {}
    public animate(_dt: number) {}
    public draw() {}

}