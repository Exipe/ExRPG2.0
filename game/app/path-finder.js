
/**
 * This module is intended to be run as a web worker.
 * Its purpose is to find a non-blocked path to a point on a map, using the A* algorithm.
 * By doing this expensive calculation on a separate thread, 
 * we stop the game from hanging when calculating a complicated path.
 * 
 * Made by Ludwig Johansson for use in ExRPG
 */

const BLOCK_MAP_MESSAGE = 'BLOCK_MAP';
const PATH_MESSAGE = 'PATH';

let map;

const isBlocked = (x, y) => {
    return x < 0 || y < 0 || x >= map.width || y >= map.height 
        || map.grid[y][x] === true;
}

const setBlockMap = (m) => {
    map = m;
}

const findPath = (startX, startY, goal, revision) => {
    if(map === undefined) {
        return;
    }

    const pathFinder = new PathFinder(startX, startY, goal);
    const path = pathFinder.findPath();
    self.postMessage({
        revision,
        path
    });
}

self.onmessage = (evt) => {
    const msg = evt.data;
    const type = msg.type;

    switch(type) {
        case BLOCK_MAP_MESSAGE:
            setBlockMap(msg.map);
            break;
        case PATH_MESSAGE:
            findPath(msg.startX, msg.startY, msg.goal, msg.revision);
            break;
    }
};

// Path finder business logic follows

class Point {
    parent = null;

    cost = 0;
    heuristic = 0;
    x;
    y;

    distX = 0;
    distY = 0;

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    updateHeuristic(goal) {
        this.distX = Math.abs(goal.x - this.x)
        this.distY = Math.abs(goal.y - this.y)
        this.heuristic = Math.max(this.distX, this.distY)
    }

    get weight() {
        return this.cost + this.heuristic
    }
}

const sort = (a, b) => {
    return (b.cost + b.heuristic) - (a.cost + a.heuristic)
}

const findPoint = (point, other) => {
    return other.x == point.x && other.y == point.y
}

/*
if the point is already in the list, with a more expensive cost, remove it
*/
const filterStale = (point, other) => {
    return other.x != point.x || other.y != point.y || other.cost < point.cost
}

function calculateCost(diffX, diffY) {
    if(diffX == 0 || diffY == 0) {
        return 1
    } else {
        return 1.4
    }
}

function getTime() {
    return new Date().getTime()
}

const TIME_LIMIT = 250

class PathFinder {
    goal;
    xReq;
    yReq;
    closest;
    open;

    constructor(startX, startY, goal) {
        this.goal = goal
        this.xReq = Math.max(this.goal.width / 2 + this.goal.distance, 1)
        this.yReq = Math.max(this.goal.height / 2 + this.goal.distance, 1)
        
        this.closest = new Point(startX, startY)
        this.closest.updateHeuristic(goal)
        this.open = [this.closest]
    }

    blocked(x, y, diffX, diffY) {
        return isBlocked(x+diffX, y+diffY) || 
               (diffX != 0 && isBlocked(x+diffX, y)) || 
               (diffY != 0 && isBlocked(x, y+diffY))
    }

    reachedGoal(point) {
        return ((point.distX < this.xReq && point.distY <= this.yReq - 1) || (point.distX <= this.xReq - 1 && point.distY < this.yReq))
    }

    backTracePath() {
        let closest = this.closest

        let points = []
        let diffX = 0
        let diffY = 0

        while(closest != null) {
            if(closest.parent == null) {
                break
            }

            let nDiffX = closest.x - closest.parent.x
            let nDiffY = closest.y - closest.parent.y

            if(nDiffX == diffX && nDiffY == diffY) {
                closest = closest.parent
                continue
            }

            diffX = nDiffX
            diffY = nDiffY
            points.unshift([closest.x, closest.y])
            closest = closest.parent
        }

        return points
    }

    insertPoint(point) {
        this.open.push(point)
        this.open.sort(sort)
    }

    findPath() {
        let closed = []
        let point = null

        const startTime = getTime()

        while(this.open.length > 0 && (getTime() - startTime < TIME_LIMIT)) {
            point = this.open.pop()

            if(point.heuristic < this.closest.heuristic) {
                this.closest = point
            }

            if(this.reachedGoal(point)) {
                this.closest = point
                break
            }

            closed.push(point)

            for(let xi = -1; xi <= 1; xi++) {
                for(let yi = -1; yi <= 1; yi++) {
                    if((xi == 0 && yi == 0) || this.blocked(point.x, point.y, xi, yi)) {
                        continue
                    }

                    const next = new Point(point.x + xi, point.y + yi)
                    next.cost = point.cost + calculateCost(xi, yi)

                    next.updateHeuristic(this.goal)
                    if(next.distX < this.goal.distance && next.distY < this.goal.distance) {
                        continue
                    }

                    this.open = this.open.filter(filterStale.bind(null, next))
                    closed = closed.filter(filterStale.bind(null, next))

                    if(this.open.find(findPoint.bind(null, next)) || closed.find(findPoint.bind(null, next))) {
                        continue
                    }

                    next.parent = point
                    this.insertPoint(next)
                }
            }
        }

        return this.backTracePath()
    }
}