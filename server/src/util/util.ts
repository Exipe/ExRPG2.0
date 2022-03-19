
import { ObjectData } from "../object/object-data"

export function currentTime() {
    return (new Date()).getTime()
}

export function timeSince(timestamp: number) {
    if(!timestamp) {
        return Infinity
    }

    return currentTime() - timestamp
}

export function randomChance(probability: number) {
    return Math.random() < 1 / probability
}

export function randomInt(lowest: number, highest: number) {
    if(highest < lowest) {
        throw "Upper limit has to be higher than lower limit"
    }

    return lowest + Math.floor((highest - lowest + 1) * Math.random())
}

export function randomOffset(center: number, radius: number) {
    return center - radius + Math.floor((radius * 2 + 1) * Math.random())
}

export function objectDirection(objData: ObjectData, objX: number, objY: number, px: number, py: number) {
    if(px < objX) {
        return [1, 0]
    } else if(px >= objX + objData.width) {
        return [-1, 0]
    } else if(py < objY) {
        return [0, 1]
    } else if(py > objY) {
        return [0, -1]
    } else {
        return [0, 0]
    }
}

export function formatStrings(strings: string[], prefix: string, separator: string, suffix: string) {
    return prefix + strings.join(separator) + suffix
}
