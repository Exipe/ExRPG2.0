import { SELECTABLE_EFFECTS, SelectableEffect, WeatherData, WeatherSetting } from "../model/weather-model"

export type SetSetting = {
    type: "SET_SETTING",
    setting: WeatherSetting
}

export type SetEffect = {
    type: "SET_EFFECT",
    effect: SelectableEffect
}

export const WeatherReducer = (state: WeatherData, action: SetSetting | SetEffect) => {
    const weatherData = { ...state };

    switch(action.type) {
        case "SET_SETTING":
            if(action.setting === "none") {
                weatherData.effect = "none";
                weatherData.dynamicWeather = false;
            }
            else {
                weatherData.effect = SELECTABLE_EFFECTS[0];
                weatherData.dynamicWeather = action.setting === "dynamic";
            }
            break;
        case "SET_EFFECT":
            weatherData.effect = action.effect;
            break;
    }

    return weatherData;
}