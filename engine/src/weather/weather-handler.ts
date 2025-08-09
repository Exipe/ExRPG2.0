import { Engine } from "../engine";

export class WeatherHandler {
    private _dynamicWeatherActive = false;

    constructor(private readonly engine: Engine) { }

    public set dynamicWeatherActive(value: boolean) {
        if (this._dynamicWeatherActive == value) {
            return;
        }

        this._dynamicWeatherActive = value;
        this.update();
    }

    public get dynamicWeatherActive() {
        return this._dynamicWeatherActive;
    }

    public update() {
        const { map, weatherEffectHandler } = this.engine;
        if(map == null) {
            return;
        }

        if (map.dynamicWeather && !this.dynamicWeatherActive) {
            weatherEffectHandler.setEffect(this.engine, "none");
        } else {
            weatherEffectHandler.setEffect(this.engine, map.weatherEffect);
        }
    }
}