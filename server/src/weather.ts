import { WeatherPacket } from "./connection/outgoing-packet"
import { randomChance } from "./util/util"
import { playerHandler } from "./world"

const TICK_DELAY = 1000
const TICKS_PER_CYCLE = 60 * 60
const SUNRISE_DURATION = 5 * 60
const SUNSET_DURATION = 5 * 60

const DAY_START = SUNRISE_DURATION
const DAY_END = TICKS_PER_CYCLE / 2
const NIGHT_START = TICKS_PER_CYCLE / 2 + SUNSET_DURATION

const MIN_BRIGHTNESS = 0.25, MAX_BRIGHTNESS = 0.75

const DYNAMIC_WEATHER_ACTIVATE_PROBABILITY = 1000
const DYNAMIC_WEATHER_DEACTIVATE_PROBABILITY = 60
const DYNAMIC_WEATHER_MINIMUM_DURATION = 120

export function initWeather() {
    const weatherHandler = new WeatherHandler()
    weatherHandler.updateBrightness()

    setInterval(() => {
        weatherHandler.tick()
    }, TICK_DELAY)
    return weatherHandler
}

export type TimeOfDay = "MORNING" | "DAY" | "EVENING" | "NIGHT"

export class WeatherHandler {

    public enableClock = true

    private _dynamicWeatherActive = false
    private _brightness: number

    private dynamicWeatherActivatedTick = -Infinity;
    private tickCounter = 0

    public set brightness(brightness: number) {
        this._brightness = brightness;
        this.sendUpdatePacket();
    }

    public get brightness() {
        return this._brightness
    }

    public set dynamicWeatherActive(active: boolean) {
        this._dynamicWeatherActive = active
        if (active) {
            this.dynamicWeatherActivatedTick = this.tickCounter;
        }

        this.sendUpdatePacket();
    }

    public get dynamicWeatherActive() {
        return this._dynamicWeatherActive
    }

    public get timeOfDay(): TimeOfDay {
        if (this.tickInCycle < DAY_START) {
            return "MORNING"
        } else if (this.tickInCycle < DAY_END) {
            return "DAY"
        } else if (this.tickInCycle < NIGHT_START) {
            return "EVENING"
        } else {
            return "NIGHT"
        }
    }

    public tick() {
        if (!this.enableClock) {
            return;
        }

        this.tickCounter++;
        this.updateWeather();
        this.updateBrightness();
        this.sendUpdatePacket();
    }

    private updateWeather() {
        if (this.dynamicWeatherActive) {
            const activeDuration = this.tickCounter - this.dynamicWeatherActivatedTick;

            if (activeDuration >= DYNAMIC_WEATHER_MINIMUM_DURATION && randomChance(DYNAMIC_WEATHER_DEACTIVATE_PROBABILITY)) {
                this._dynamicWeatherActive = false;
            }
        } else {
            if (randomChance(DYNAMIC_WEATHER_ACTIVATE_PROBABILITY)) {
                this._dynamicWeatherActive = true;
                this.dynamicWeatherActivatedTick = this.tickCounter;
            }
        }
    }

    public updateBrightness() {
        const tickInCycle = this.tickInCycle

        let brightness: number
        if (tickInCycle < DAY_START) {
            brightness = tickInCycle / DAY_START
        } else if (tickInCycle < DAY_END) {
            brightness = 1
        } else if (tickInCycle < NIGHT_START) {
            brightness = 1 - ((tickInCycle - DAY_END) / (NIGHT_START - DAY_END))
        } else {
            brightness = 0
        }
        this._brightness = MIN_BRIGHTNESS + (MAX_BRIGHTNESS - MIN_BRIGHTNESS) * brightness
    }

    private sendUpdatePacket() {
        playerHandler.broadcast(new WeatherPacket(this._dynamicWeatherActive, this._brightness));
    }

    private get tickInCycle() {
        return this.tickCounter % TICKS_PER_CYCLE
    }

}