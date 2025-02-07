import { Camera } from "exrpg/dist/camera"
import { PlayerRank } from "../character/player"
import { Observable } from "../../util/observable"

export class OverlayModel {

    public readonly id: number
    
    private _x: number
    private _y: number

    private readonly camera: Camera

    constructor(id: number, camera: Camera, x: number, y: number) {
        this.id = id
        this.camera = camera
        this._x = x
        this._y = y
    }

    public get x() {
        return Math.floor(this._x * this.camera.scale) - this.camera.realX
    }

    public get y() {
        return Math.floor(this._y * this.camera.scale) - this.camera.realY
    }

    public onMove = null as (x: number, y: number) => void

    public update() {
        if(this.onMove != null) {
            this.onMove(this.x, this.y)
        }
    }

    public move(x: number, y: number) {
        this._x = x
        this._y = y

        this.update()
    }

}

export class HealthBarModel extends OverlayModel {

    private _ratio: number

    constructor(id: number, camera: Camera, x: number, y: number, ratio: number) {
        super(id, camera, x, y)
        this._ratio = ratio
    }

    public onRatioUpdate = null as (ratio: number) => void

    public get ratio() {
        return this._ratio
    }

    public set ratio(value: number) {
        this._ratio = value

        if(this.onRatioUpdate != null) {
            this.onRatioUpdate(value)
        }
    }

}

export type ChatBubbleStyle = "standard" | "quiet"

export class ChatBubbleModel extends OverlayModel {
    public readonly message: Observable<string>
    public readonly style: Observable<ChatBubbleStyle>

    constructor(id: number, camera: Camera, x: number, y: number, message: string, style: ChatBubbleStyle) {
        super(id, camera, x, y)
        this.message = new Observable(message)
        this.style = new Observable(style)
    }

}

export class ProgressIndicatorModel extends OverlayModel {

    public sprite: string
    public duration: number

    public readonly resetCounter = new Observable(0)

    constructor(id: number, camera: Camera, x: number, y: number, sprite: string, duration: number) {
        super(id, camera, x, y)
        this.sprite = sprite
        this.duration = duration
    }

}

export type HitSplatStyle = "hit" | "miss" | "heal"

export class HitSplatModel extends OverlayModel {
    public readonly hit: number
    public readonly style: HitSplatStyle

    constructor(id: number, camera: Camera, hit: number, style: HitSplatStyle, x: number, y: number) {
        super(id, camera, x, y)
        this.hit = hit
        this.style = style
    }
}

export type NameTagStyle = "npc" | PlayerRank

export class NameTagModel extends OverlayModel {
    public readonly name: string
    public readonly style: NameTagStyle

    constructor(id: number, camera: Camera, name: string, style: NameTagStyle, x: number, y: number) {
        super(id, camera, x, y)
        this.name = name
        this.style = style
    }
}

export class OverlayAreaModel {

    private idCount = 0
    public overlayModels = new Observable([] as OverlayModel[])

    private readonly camera: Camera

    constructor(camera: Camera) {
        camera.onUpdate = () => {
            this.overlayModels.value.forEach(o => o.update())
        }
        this.camera = camera
    }

    public addHealthBar(ratio: number, x: number, y: number) {
        const healthBarModel = new HealthBarModel(this.idCount++, this.camera, x, y, ratio)
        this.addOverlay(healthBarModel)
        return healthBarModel
    }

    public addChatBubble(message: string, style: ChatBubbleStyle, x: number, y: number) {
        const chatBubbleModel = new ChatBubbleModel(this.idCount++, this.camera, x, y, message, style)
        this.addOverlay(chatBubbleModel)
        return chatBubbleModel
    }

    public addHitSplat(hit: number, style: HitSplatStyle, x: number, y: number, duration: number) {
        const hitSplatModel = new HitSplatModel(this.idCount++, this.camera, hit, style, x, y)
        this.addOverlay(hitSplatModel, duration)
        return hitSplatModel
    }

    public addNameTag(name: string, style: NameTagStyle, x: number, y: number) {
        const nameTagModel = new NameTagModel(this.idCount++, this.camera, name, style, x, y)
        this.addOverlay(nameTagModel)
        return nameTagModel
    }

    public addProgressIndicator(sprite: string, duration: number, x: number, y: number) {
        const model = new ProgressIndicatorModel(this.idCount++, this.camera, x, y, sprite, duration)
        this.addOverlay(model)
        return model
    }

    public addOverlay(overlay: OverlayModel, duration: number = undefined) {
        this.overlayModels.value = this.overlayModels.value.concat(overlay)
        if(duration != undefined) {
            setTimeout(() => this.removeOverlay(overlay), duration)
        }
    }

    public removeOverlay(overlay: OverlayModel) {
        this.overlayModels.value = this.overlayModels.value.filter(other => other != overlay)
    }

}
