import { Engine } from "../engine";
import { MergeTexture } from "../texture/merge-texture";
import { MultiTexture } from "../texture/multi-texture";
import { Sprite } from "../texture/sprite";

const LAYER_PARTITION_SIZE = 100

export type WeatherLayerDefinition = {
    texturePosition: [number, number]
    speedModifier: [number, number]
    spriteCount: number,
};

export const initWeatherLayer = (engine: Engine, texture: MultiTexture, definition: WeatherLayerDefinition) => {
    const particleSprite = new Sprite(engine, texture.get(...definition.texturePosition));
    const partitionTexture = new MergeTexture(engine, LAYER_PARTITION_SIZE, LAYER_PARTITION_SIZE);
    const partitionSprite = new Sprite(engine, partitionTexture.texture);

    const gridSize = Math.ceil(Math.sqrt(definition.spriteCount));
    const cellSize = LAYER_PARTITION_SIZE / gridSize;

    let freeCells: [number, number][] = []
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            freeCells.push([x, y]);
        }
    }

    partitionTexture.bind(); // draw to the offscreen texture

    for (let i = 0; i < definition.spriteCount; i++) {
        const cellIdx = Math.floor(Math.random() * freeCells.length);
        const cellPos = freeCells[cellIdx];
        freeCells = freeCells.filter((_, idx) => idx !== cellIdx);

        const offsetX = Math.floor(Math.random() * (cellSize - particleSprite.width));
        const offsetY = Math.floor(Math.random() * (cellSize - particleSprite.height));

        particleSprite.draw(cellPos[0] * cellSize + offsetX, cellPos[1] * cellSize + offsetY);
    }

    partitionTexture.unbind();
    return new WeatherLayer(engine, partitionSprite, definition.speedModifier);
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
        this.offset[0] = this.speedModifier[0] > 0
            ? -(this.timer / DELAY * this.speedModifier[0]) % 1
            : 0;
        this.offset[1] = this.speedModifier[1] > 0
            ? -(this.timer / DELAY * this.speedModifier[1]) % 1
            : 0;
    }

    public draw() {
        const shader = this.engine.shaderHandler.useStandardShader();
        shader.setTexOffset(this.offset);

        const { width, height } = this.engine.camera;
        const horizontalBound = Math.ceil(width / this.sprite.width);
        const verticalBound = Math.ceil(height / this.sprite.height);

        for (let y = 0; y < verticalBound; y++) {
            for (let x = 0; x < horizontalBound; x++) {
                this.sprite.draw(x * this.sprite.width, y * this.sprite.height, shader);
            }
        }
    }
}