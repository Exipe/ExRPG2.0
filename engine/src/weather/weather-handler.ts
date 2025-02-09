import { Engine } from "../engine";
import { loadTexture, Texture } from "../texture/texture";
import { initWeatherLayer, WeatherLayer } from "./weather-layer";

export const initWeather = async (gl: WebGL2RenderingContext, resPath: string) => {
    const bgTexture = await loadTexture(gl, `${resPath}/rain_bg.png`);
    const fgTexture = await loadTexture(gl, `${resPath}/rain_fg.png`);
    return new WeatherHandler(bgTexture, fgTexture);
}

export class WeatherHandler {
    private layers: WeatherLayer[]

    constructor(
        private readonly bgTexture: Texture,
        private readonly fgTexture: Texture,
    ) { }

    public startEffect(engine: Engine) {
        const bgEffect = initWeatherLayer(engine, this.bgTexture, [0.85, 1.7])
        const fgEffect = initWeatherLayer(engine, this.fgTexture, [1.0, 2.0])

        this.layers = [bgEffect, fgEffect]
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
