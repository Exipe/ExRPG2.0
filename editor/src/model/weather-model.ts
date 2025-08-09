import { WEATHER_EFFECTS, WeatherEffect } from "exrpg";

export type WeatherSetting = "static" | "dynamic" | "none";

export type WeatherData = {
    effect: WeatherEffect,
    dynamicWeather: boolean;
}

export type SelectableEffect = Exclude<WeatherEffect, "none">;
export const SELECTABLE_EFFECTS = WEATHER_EFFECTS.filter(x => x !== "none") as ReadonlyArray<SelectableEffect>;