
import { ObjectData } from "../object/object-data"

export function currentTime() {
    return (new Date()).getTime()
}

export function timeSince(timestamp: number) {
    if (!timestamp) {
        return Infinity
    }

    return currentTime() - timestamp
}

export function randomChance(probability: number) {
    return Math.random() < 1 / probability
}

export function randomInt(lowest: number, highest: number) {
    if (highest < lowest) {
        throw "Upper limit has to be higher than lower limit"
    }

    return lowest + Math.floor((highest - lowest + 1) * Math.random())
}

export function randomOffset(center: number, radius: number) {
    return center - radius + Math.floor((radius * 2 + 1) * Math.random())
}

export function objectDirection(objData: ObjectData, objX: number, objY: number, px: number, py: number) {
    if (px < objX) {
        return [1, 0]
    } else if (px >= objX + objData.width) {
        return [-1, 0]
    } else if (py < objY) {
        return [0, 1]
    } else if (py > objY) {
        return [0, -1]
    } else {
        return [0, 0]
    }
}

export type Bounds = {
    x: number;
    y: number;
    width: number;
    depth: number;
}

export function getSides(entity: Bounds) {
    return {
        left: entity.x,
        bottom: entity.y,
        top: entity.y - entity.depth + 1,
        right: entity.x + entity.width - 1
    }
};

export function reachable(entityA: Bounds, entityB: Bounds, allowDiagonal = false) {
    const getCenter = (entity: Bounds) => ({
        x: entity.x + (entity.width - 1) / 2,
        y: entity.y - (entity.depth - 1) / 2
    });
    const centerA = getCenter(entityA);
    const centerB = getCenter(entityB);
    const distX = Math.abs(centerA.x - centerB.x);
    const distY = Math.abs(centerA.y - centerB.y)

    const reqX = (entityA.width + entityB.width + 1) / 2
    const reqY = (entityA.depth + entityB.depth + 1) / 2

    if (allowDiagonal) {
        return distX < reqX && distY < reqY;
    } else {
        return ((distX < reqX && distY < reqY - 1) || (distX < reqX - 1 && distY < reqY))
    }
}

export function intersects(entityA: Bounds, entityB: Bounds) {
    const sidesA = getSides(entityA);
    const sidesB = getSides(entityB);

    if (sidesA.right < sidesB.left) return false;
    else if (sidesA.left > sidesB.right) return false;
    else if (sidesA.top > sidesB.bottom) return false;
    else if (sidesA.bottom < sidesB.top) return false;

    return true;
}

export function formatStrings(strings: ReadonlyArray<string>, prefix: string, separator: string, suffix: string) {
    return prefix + strings.join(separator) + suffix
}
