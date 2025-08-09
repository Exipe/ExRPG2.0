import { Engine } from "exrpg";
import { WeatherData } from "../model/weather-model";
import React = require("react");

export type WeatherSettings = {
    getWeatherSettings: () => WeatherData,
    setWeatherSettings: (weatherData: WeatherData) => void
};

export const useWeatherSettings = (engine: Engine): WeatherSettings => {
    const getWeatherSettings = React.useCallback((): WeatherData => ({
        dynamicWeather: engine.map.dynamicWeather,
        effect: engine.map.weatherEffect
    }), [engine]);

    const setWeatherSettings = React.useCallback((weatherData: WeatherData) => {
        engine.map.dynamicWeather = weatherData.dynamicWeather;
        engine.map.weatherEffect = weatherData.effect;

        engine.weatherHandler.update();
    }, [engine]);

    return {
        getWeatherSettings,
        setWeatherSettings
    }
}