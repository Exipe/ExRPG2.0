
import { Scene } from "../scene/scene"
import { Walking } from "./walking"
import { sceneHandler } from "../world"
import { TaskHandler } from "./task-handler"
import { CancelPointItemPacket, ChatBubblePacket, ChatBubbleStyle, PointItemPacket, ProgressIndicatorPacket, RemoveProgressIndicatorPacket, SwingItemPacket } from "../connection/outgoing-packet"
import { CombatHandler } from "../combat/combat"
import { MapId } from "../scene/map-id"
import { Bounds, intersects, reachable } from "../util/util"

export type CharacterType = "player" | "npc"
export type CharacterIdentifier = {
    characterType: CharacterType,
    id: number,
}

const WALK_DELAY = 250

export abstract class Character {

    public lastPrimaryExecution = -1

    public readonly taskHandler = new TaskHandler()
    protected readonly walking = new Walking(this)

    private followers = [] as Character[]
    protected following = null as Character

    public readonly type: CharacterType

    public get identifier(): CharacterIdentifier {
        return {
            characterType: this.type,
            id: this.id
        }
    }

    public readonly id: number

    /*
    The last tile the character moved away from
    (or their current position, after a placement)
    Useful to get behind the character
    */
    private lastX = 0
    private lastY = 0

    private _x = 0
    private _y = 0

    private _map: Scene

    private _walkSpeed: number
    private _walkDelay: number

    public combatHandler = null as CombatHandler

    constructor(type: CharacterType, id: number, walkSpeed = 1) {
        this.type = type
        this.id = id
        this.walkSpeed = walkSpeed
    }

    public tick() {
        // prevent character from getting stuck
        if (this.taskHandler.stopped && this.target != null) {
            this.getBehind(this.target);
        }
    }

    public sendChatBubble(message: string, style: ChatBubbleStyle = "standard") {
        this.map.broadcast(new ChatBubblePacket(this.type, this.id, message, style))
    }

    public showIndicator(itemId: string, duration: number) {
        this.map.broadcast(
            new ProgressIndicatorPacket(this.type, this.id, itemId, duration)
        )
    }

    public removeIndicator() {
        this.map.broadcast(
            new RemoveProgressIndicatorPacket(this.type, this.id)
        )
    }

    public swingItem(itemId: string, offX: number, offY: number, duration: number): void {
        this.map.broadcast(
            new SwingItemPacket(itemId, this.type, this.id, offX, offY, duration))
    }

    protected pointingItem?: string;

    public pointItem(itemId: string, target: Character) {
        if (this.pointingItem == itemId) {
            return;
        }

        this.map.broadcast(
            new PointItemPacket(itemId, this.identifier, target.identifier));
        this.pointingItem = itemId;
    }

    public stopPointing() {
        if (this.pointingItem == undefined) {
            return;
        }

        this.map.broadcast(
            new CancelPointItemPacket(this.identifier)
        );
        delete this.pointingItem;
    }

    public get attackable() {
        return this.combatHandler != null
    }

    public get target() {
        return this.following
    }

    public get walkSpeed() {
        return this._walkSpeed
    }

    public set walkSpeed(value: number) {
        this._walkSpeed = value
        this._walkDelay = Math.trunc(WALK_DELAY / value)
    }

    public get walkDelay() {
        return this._walkDelay
    }

    /**
     * If we are following another character slower than us, and have caught up with them, return their walk delay
     */
    public get predictWalkDelay() {
        if (this.walking.stopped && this.following != null && this.following._walkDelay > this._walkDelay) {
            return this.following._walkDelay
        }

        return this._walkDelay
    }

    public isAdjacent(other: Character, x = this.x, y = this.y) {
        const diffX = other.x - x;
        const diffY = other.y - y;
        const deltaX = Math.sign(diffX);
        const deltaY = Math.sign(diffY);

        const bounds = this.bounds;
        const otherBounds = other.bounds;

        return this.map === other.map
            && !intersects(bounds, otherBounds)
            && reachable(bounds, otherBounds, true)
            && this.walkable(x, y, deltaX, deltaY);
    }

    public isInFieldOfVision(other: Character, distance: number) {
        const distX = other.centerX - this.centerX;
        const distY = other.centerY - this.centerY;
        const steps = Math.max(Math.abs(distX), Math.abs(distY));

        if (intersects(this.bounds, other.bounds) || steps > distance) return false;

        const dx = distX / steps;
        const dy = distY / steps;

        for (let i = 0; i < steps; i++) {
            const previousX = this.x + Math.ceil(dx * i);
            const previousY = this.y + Math.ceil(dy * i);

            if (!this.walkable(previousX, previousY, Math.round(dx), Math.round(dy))) {
                return false;
            }
        }

        return true;
    }

    public get idle() {
        return this.following == null && this.walking.stopped
    }

    private addFollower(character: Character) {
        this.followers.push(character)
    }

    private removeFollower(character: Character) {
        this.followers = this.followers.filter(c => c != character)
    }

    private getBehind(other: Character, x = this.walking.goalX, y = this.walking.goalY) {
        if(!this.isAdjacent(other, x, y)) {
            this.walking.followStep(other.lastX, other.lastY);
        }
        
        this.walking.checkGoal();
    }

    public follow(character: Character) {
        if (character == this) {
            throw new Error("Attempt to follow self")
        }

        if (this.following != null) {
            this.unfollow()
        }

        this.following = character
        character.addFollower(this)

        this.getBehind(character)
    }

    public attack(character: Character) {
        if (character == this) {
            throw new Error("Attempt to attack self")
        }

        if (!character.attackable) {
            throw new Error("Attempt to attack unattackable")
        }

        this.combatHandler.target(character, this.walking);
    }

    public unfollow() {
        if (this.following == null) {
            return
        }

        this.following.removeFollower(this)
        this.following = null
    }

    public abstract get bounds(): Bounds;

    public get x() {
        return this._x
    }

    public get y() {
        return this._y
    }

    public get centerX() {
        const bounds = this.bounds;
        return this.x + (bounds.width - 1) / 2;
    }

    public get centerY() {
        const bounds = this.bounds;
        return this.y - (bounds.depth - 1) / 2;
    }

    public get map() {
        return this._map
    }

    public goToMap(map: Scene, x: number, y: number) {
        this._x = x
        this._y = y
        this.stop()

        for (let f of this.followers) {
            f.stop()
        }

        if (this._map != map) {
            if (this._map != null) {
                this.leaveMap()
            }

            this.lastX = x
            this.lastY = y

            this._map = map
            this.enterMap()
        } else {
            this.move(x, y)
        }
    }

    public goTo(mapId: MapId, x: number, y: number) {
        const map = sceneHandler.get(mapId)
        this.goToMap(map, x, y)
    }

    protected abstract enterMap(): void

    private leaveMap() {
        if (this.attackable) {
            this.combatHandler.leaveMap();
        }

        this.onLeaveMap();
        this._map = null;
    }
    protected abstract onLeaveMap(): void

    public walk(x: number, y: number) {
        if (this.tileWalkable(x, y)) {
            this.move(x, y, true)
        } else {
            this.stop();
        }
    }

    public tileWalkable(x: number, y: number) {
        return !this._map.isBlocked(x, y)
    }

    public walkable(x: number, y: number, diffX: number, diffY: number) {
        const bounds = this.bounds;
        for (let ix = x; ix < x + bounds.width; ix++) {
            for (let iy = y; iy > y - bounds.depth; iy--) {
                const walkable = this.tileWalkable(ix + diffX, iy + diffY) &&
                    (diffX == 0 || this.tileWalkable(ix + diffX, iy)) &&
                    (diffY == 0 || this.tileWalkable(ix, iy + diffY));

                if (!walkable) {
                    return false;
                }
            }
        }

        return true;
    }

    public stop() {
        this.unfollow();
        this.walking.clear();
        this.taskHandler.stopTask();

        if (this.attackable && this.map != null) {
            this.combatHandler.stop();
        }
    }

    protected abstract onMove(delay: number): void

    public move(x: number, y: number, animate = false, delay?: number) {
        this.lastX = this._x
        this.lastY = this._y
        this._x = x
        this._y = y

        this.followers.forEach(f => {
            f.getBehind(this, f.x, f.y)
        })

        delay = animate ? (delay ?? this.predictWalkDelay) : -1;
        this.onMove(delay);
    }

    public remove() {
        this.stop()

        if (this._map != null) {
            this.leaveMap()
        }

        for (let f of this.followers) {
            f.stop()
        }
    }

}