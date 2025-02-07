
import { Engine, TILE_SIZE } from "exrpg"

export type CameraMode = "clip" | "center"

export class SettingsModel {

    private _cameraMode: CameraMode

    private readonly engine: Engine

    constructor(engine: Engine) {
        this.engine = engine

        this.zoom = localStorage.zoom ? localStorage.zoom : 3
        this.cameraMode = localStorage.cameraMode ? localStorage.cameraMode : "clip"
    }

    public set zoom(value: number) {
        this.engine.camera.scale = value
        localStorage.zoom = value
    }

    public get zoom() {
        return this.engine.camera.scale
    }

    public updateBoundary() {
        const map = this.engine.map
        const camera = this.engine.camera

        if(map != null && this._cameraMode == "clip") {
            camera.setBoundaries(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE)
        } else {
            camera.setBoundaries(-Infinity, -Infinity, Infinity, Infinity)
        }
    }

    public set cameraMode(value: CameraMode) {
        this._cameraMode = value
        localStorage.cameraMode = value
        this.updateBoundary()
    }

    public get cameraMode() {
        return this._cameraMode
    }
}