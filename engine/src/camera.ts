
import { ShaderHandler } from "./shader/shader-handler"
import { Entity } from "./entity/entity"
import { LightHandler } from "./light/light-handler"
import { projection, translation } from "./matrix"
import { OffscreenHandler } from "./offscreen"
import { Engine, TILE_SIZE } from "."

export class Camera {

    private readonly engine: Engine
    private get shaderHandler() { return this.engine.shaderHandler; }
    private get lightHandler() { return this.engine.lightHandler }
    private get offscreenHandler() { return this.engine.offscreenHandler }

    private _x: number = 0
    private _y: number = 0
    private _scale: number = 1

    /*
    only used when pixel scaling is enabled, because the center coordinates are calculated differently
    */
    private _scaleX: number
    private _scaleY: number

    private followEntity: Entity = null

    private _width: number
    private _height: number

    public onUpdate = (_x: number, _y: number, _scale: number) => {}

    constructor(engine: Engine) {
        this.engine = engine
    }

    private maxX = Infinity
    private maxY = Infinity

    private minX = -Infinity
    private minY = -Infinity

    private _enablePixelScaling = false

    public setBoundaries(minX: number, minY: number, maxX: number, maxY: number) {
        this.minX = minX
        this.minY = minY
        this.maxX = maxX
        this.maxY = maxY

        if(this.followEntity != null) {
            this.fixPosition()
        }
    }

    public get realX() {
        return this._x
    }

    public get realY() {
        return this._y
    }

    public get realWidth() {
        return this._width
    }

    public get realHeight() {
        return this._height
    }

    public set enablePixelScaling(enable: boolean) {
        this._enablePixelScaling = enable
        this.dimensionsChanged()
    }

    public get enablePixelScaling() {
        return this._enablePixelScaling
    }

    public follow(entity: Entity) {
        if(this.followEntity != null) {
            this.followEntity._onMove = null
        }

        this.followEntity = entity
        entity._onMove = () => {
            this.fixPosition()
        }

        this.fixPosition()
    }

    private fixPosition() {
        const maxX = this.maxX * this._scale
        const maxY = this.maxY * this._scale
        const minX = this.minX * this._scale
        const minY = this.minY * this._scale

        let cameraX: number, cameraY: number

        if(this._width < maxX) {
            const entityX = Math.floor((this.followEntity.feetX + this.followEntity.width / 2) * this._scale)
            cameraX = entityX - this._width / 2

            this._scaleX = Math.floor(this.followEntity.feetX) 
                            + this.followEntity.width / 2 
                            - Math.floor(this.width / 2)

            if(cameraX < minX) {
                cameraX = minX
                this._scaleX = this.minX
            } else if(cameraX > maxX - this._width) {
                cameraX = maxX - this._width
                this._scaleX = this.maxX - Math.floor(this.width)
            }
        } else { // center
            cameraX = -this._width / 2 + maxX / 2
            this._scaleX = -Math.floor(this.width) / 2 + this.maxX / 2
        }

        if(this._height < maxY) {
            const entityY = Math.floor((this.followEntity.feetY + TILE_SIZE - this.followEntity.height / 2) * this._scale)
            cameraY = entityY - this._height / 2
            
            this._scaleY = Math.floor(this.followEntity.feetY + TILE_SIZE) 
                            - this.followEntity.height / 2 
                            - Math.floor(this.height / 2)

            if(cameraY < minY) {
                cameraY = minY
                this._scaleY = this.minY
            } else if(cameraY > maxY - this._height) {
                cameraY = maxY - this._height
                this._scaleY = this.maxY - Math.floor(this.height)
            }
        } else { // center
            cameraY = -this._height / 2 + maxY / 2
            this._scaleY = -Math.floor(this.height) / 2 + this.maxY / 2
        }

        this._move(cameraX, cameraY)
    }

    translateClick(mouseX: number, mouseY: number) {
        return [
            (this._x + mouseX) / this._scale,
            (this._y + mouseY) / this._scale
        ]
    }

    get scale() { return this._scale }
    get x() { return this._x / this._scale }
    get y() { return this._y / this._scale }

    get width() {
        return this._width / this._scale
    }

    get height() {
        return this._height / this._scale
    }

    private dimensionsChanged() {
        this.lightHandler.resize(this.width, this.height)
        const lightShader = this.shaderHandler.useLightShader()
        lightShader.setProjectionMatrix(projection(this.width, this.height))

        this.offscreenHandler.resize(
            Math.floor(this.width),
            Math.floor(this.height))
        this.resetProjection()

        if(this.followEntity != null) {
            this.fixPosition()
        }
    }

    set scale(scale: number) {
        const x = this.x
        const y = this.y
        this._scale = scale
        
        this.dimensionsChanged()

        if(this.followEntity == null) {
            this.move(x, y)
        }
    }

    setDimensions(width: number, height: number) {
        this._width = width
        this._height = height

        this.dimensionsChanged()
    }

    public resetView() {
        // if rendering to an offscreen buffer, the effective scaling = 1
        // this is because scaling is applied later in the shader
        if(this._enablePixelScaling) {
            this.shaderHandler.setView(
                Math.floor(this._scaleX),
                Math.floor(this._scaleY),
                1
            )
        } else {
            this.shaderHandler.setView(
                this._x,
                this._y,
                this._scale
            )
        }
    }

    public resetProjection() {
        if(this._enablePixelScaling) {
            this.shaderHandler.setProjection(
                Math.floor(this.width), 
                Math.floor(this.height))
        } else {
            this.shaderHandler.setProjection(this._width, this._height)
        }
    }

    private _move(x: number, y: number) {
        this._x = Math.floor(x)
        this._y = Math.floor(y)

        this.onUpdate(this._x, this._y, this._scale)
        this.resetView()

        const lightShader = this.shaderHandler.useLightShader()
        lightShader.setViewMatrix(translation(-this.x, -this.y))
    }

    move(x: number, y: number) {
        this._scaleX = x
        this._scaleY = y
        this._move(x * this._scale, y * this._scale)
    }

}