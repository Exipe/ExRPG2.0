
import { Entity, Light } from "..";
import { Component } from "../entity/component";
import { LightData } from "./light";
import { LightHandler } from "./light-handler";

export const LIGHT_COMPONENT = "LIGHT"

export class LightComponent extends Component {

    private readonly entity: Entity
    private readonly lightHandler: LightHandler

    private lightData: LightData;
    private light?: Light

    private pulsateTimer = 0;

    constructor(entity: Entity, lightHandler: LightHandler, lightData: LightData) {
        super(LIGHT_COMPONENT)
        this.entity = entity
        this.lightHandler = lightHandler
        this.lightData = { ...lightData };
    }

    public set radius(value: number) {
        this.light.radius = this.lightData.radius = value;
    }

    public initialize() {
        const [x, y] = this.entity.centerCoords

        this.light = {
            x: x + this.lightData.offsetX,
            y: y + this.lightData.offsetY,
            radius: this.lightData.radius
        }
        this.lightHandler.addLight(this.light)
    }

    public destroy() {
        this.lightHandler.removeLight(this.light)
    }

    public movePx() {
        const [x, y] = this.entity.centerCoords;

        if (this.light !== undefined) {
            this.light.y = y + this.lightData.offsetY;
            this.light.x = x + this.lightData.offsetX;
        }
    }

    public animate(dt: number) {
        if (!this.lightData.pulsate) return;

        this.pulsateTimer = (this.pulsateTimer + dt) % this.lightData.pulsate.duration;
        const animationProgress = this.pulsateTimer / this.lightData.pulsate.duration;

        const t = 1 - Math.abs(2 * animationProgress - 1);
        const scale = 1 + (this.lightData.pulsate.factor - 1) * t;

        this.light.radius = this.lightData.radius * scale;
    }

    public moveTile() { }
    public draw() { }

}