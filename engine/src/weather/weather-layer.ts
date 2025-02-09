import { Engine } from "../engine";
import { Sprite } from "../texture/sprite";
import { Texture } from "../texture/texture";

export const initWeatherLayer = (engine: Engine, texture: Texture, speed: [number, number]) => {
    const sprite = new Sprite(engine, texture);
    return new WeatherLayer(engine, sprite, speed);
}

const DELAY = 1000

export class WeatherLayer {
    private timer = 0
    private readonly offset: [number, number] = [0, 0]

    constructor(
        private readonly engine: Engine,
        private readonly sprite: Sprite,
        private readonly speedModifier: [number, number]
    ) { }

    public update(dt: number) {
        this.timer += dt;
        this.offset[0] = -(this.timer / DELAY * this.speedModifier[0]) % 1;
        this.offset[1] = -(this.timer / DELAY * this.speedModifier[1]) % 1;
    }

    public draw() {
        const shader = this.engine.shaderHandler.useStandardShader();
        shader.setTexOffset(this.offset);

        const { width, height } = this.engine.camera;
        const horizontalBound = Math.ceil(width / this.sprite.width);
        const verticalBound = Math.ceil(height / this.sprite.height);

        for(let y = 0; y < verticalBound; y++) {
            for(let x = 0; x < horizontalBound; x++) {
                this.sprite.draw(x * this.sprite.width, y * this.sprite.height, shader);
            }
        }
    }
}