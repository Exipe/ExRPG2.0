import { Engine } from "../engine";
import { MultiTexture } from "../texture/multi-texture";
import { loadTexture } from "../texture/texture";
import { initWeatherLayer, WeatherLayer, WeatherLayerDefinition } from "./weather-layer";

export type WeatherEffect = "rain" | "snow" | "none";

const WEATHER_EFFECTS: Record<WeatherEffect, WeatherLayerDefinition[]> = {
    rain: [
        {
            texturePosition: [0, 0],
            speedModifier: [1.0, 2.0],
            spriteCount: 3
        },
        {
            texturePosition: [1, 0],
            speedModifier: [0.85, 1.7],
            spriteCount: 6
        }
    ],
    snow: [
        {
            texturePosition: [2, 0],
            speedModifier: [0, 0.5],
            spriteCount: 3
        },
        {
            texturePosition: [3, 0],
            speedModifier: [0, 0.3],
            spriteCount: 4
        }
    ],
    none: []
};

const PARTICLE_SIZE = 4;

export const initWeather = async (gl: WebGL2RenderingContext, resPath: string) => {
    const particleTexture = await loadTexture(gl, `${resPath}/particle.png`)
        .then(texture => new MultiTexture(texture, PARTICLE_SIZE, PARTICLE_SIZE));
    return new WeatherHandler(particleTexture);
}

export class WeatherHandler {
    private layers: WeatherLayer[]

    constructor(
        private readonly particleTexture: MultiTexture
    ) { }

    public setEffect(engine: Engine, effect: WeatherEffect) {
        this.layers = WEATHER_EFFECTS[effect].map(def =>
            initWeatherLayer(engine, this.particleTexture, def)
        );
    }

    public update(dt: number) {
        if (!this.layers) {
            return;
        }


        this.layers.forEach(effect => effect.update(dt));
    }

    public draw(engine: Engine) {
        if (!this.layers) {
            return;
        }

        engine.shaderHandler.setView(0, 0, engine.camera.scale);
        const shader = engine.shaderHandler.useStandardShader();
        shader.setEnableLight(false);

        this.layers.forEach(layer => layer.draw());

        shader.setTexOffset([0, 0]);
        shader.setEnableLight(true);
        engine.camera.resetView();
    }
}
