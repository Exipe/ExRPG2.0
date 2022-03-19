import { Engine } from "exrpg"

export type Color = [number, number, number]

export const isCycleLight = (light: Light): light is CycleLight =>
    light.type === "Cycle";

export const isAmbientLight = (light: Light): light is AmbientLight =>
    light.type === "Ambient";

export type Light = CycleLight | AmbientLight

export type CycleLight = {
    type: "Cycle",
}

export type AmbientLight = {
    type: "Ambient",
    light: [number, number, number]
}

export type LightSettings = {
    getLight: () => CycleLight | AmbientLight,
    setLight: (color: Color) => void,
    useCycle: () => void
}

export const useLightSettings = (engine: Engine): LightSettings => {
    const getLight = (): Light => {
        const ambientLight = engine.map.ambientLight;
        if(ambientLight === null) {
            return { type: "Cycle" }
        }
        return {
            type: "Ambient",
            light: ambientLight
        };
    }

    const setLight = (color: Color) => {
        engine.map.ambientLight = color;
    }

    const useCycle = () => {
        engine.map.ambientLight = null;
    }

    return {
        getLight,
        setLight,
        useCycle
    }
}