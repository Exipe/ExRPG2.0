import React = require("react");
import { Button } from "../../component/button";
import { WeatherReducer } from "../weather-reducer";
import { SELECTABLE_EFFECTS, SelectableEffect, WeatherSetting } from "../../model/weather-model";
import { useEngine } from "../../engine/engine-provider";

export const WeatherWindow = () => {
    const { weatherSettings } = useEngine();
    const initialValue = React.useMemo(() => weatherSettings.getWeatherSettings(), []);
    
    const [weatherData, weatherDataDispatch] = React.useReducer(WeatherReducer, initialValue);
    const setting = React.useMemo<WeatherSetting>(() => {
        if (weatherData.effect === "none") return "none";
        else if (weatherData.dynamicWeather) return "dynamic";
        else return "static";
    }, [weatherData]);
    const showEffectDropdown = React.useMemo(() => setting !== "none", [setting]);

    const update = React.useCallback(() => {
        weatherSettings.setWeatherSettings(weatherData);
    }, [weatherData, weatherSettings]);

    return <div>
        <div className="optionsGrid">
            <div>Weather setting:</div>
            <select
                value={setting}
                onChange={(e) => weatherDataDispatch({
                    type: "SET_SETTING",
                    setting: e.target.value as WeatherSetting
                })}>
                <option value="none">Disabled</option>
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
            </select>
            {showEffectDropdown && <>
                <div>Effect:</div>
                <select
                    value={weatherData.effect}
                    onChange={(e) => weatherDataDispatch({
                        type: "SET_EFFECT",
                        effect: e.target.value as SelectableEffect
                    })}>
                    {SELECTABLE_EFFECTS.map(value =>
                        <option value={value} key={value}>{value}</option>
                    )}
                </select>
            </>}
        </div>
        <br />
        <Button enabled={true} onClick={update}>Update</Button>
    </div>
}