
import React = require("react");
import { ContextMenuModel } from "../../game/model/context-menu-model";
import { SettingsModel } from "../../game/model/tab/settings-model";

export interface SettingsProps {
    ctxMenu: ContextMenuModel
    settings: SettingsModel
}

export function Settings(props: SettingsProps) {
    const [zoom, setZoom] = React.useState(props.settings.zoom)
    const [camera, setCamera] = React.useState(props.settings.cameraMode)

    const settings = props.settings
    const ctxMenu = props.ctxMenu

    function onZoom(e: MouseEvent) {
        for(let i = 1; i <= 5; i++) {
            const text = `Set: ${i}x`
            ctxMenu.add([text, () => { 
                settings.zoom = i
                setZoom(i)
            }])
        }

        ctxMenu.open(e.clientX, e.clientY)
    }

    function onCamera(e: MouseEvent) {
        ctxMenu.add(["Set: clip", () => {
            settings.cameraMode = "clip"
            setCamera("clip")
        }])

        ctxMenu.add(["Set: center", () => {
            settings.cameraMode = "center"
            setCamera("center")
        }])

        ctxMenu.open(e.clientX, e.clientY)
    }

    function onFullscreen() {
        const container = document.querySelector("#container")
        container.requestFullscreen()
    }

    return <div id="settings" className="box-standard">
        <div className="uiButton" onClick={e => { onZoom(e.nativeEvent) }}>Zoom: {zoom}x</div>
        <div className="uiButton" onClick={e => { onCamera(e.nativeEvent) }}>Camera: {camera}</div>

        <div id="fullscreenButton" className="uiButton" onClick={onFullscreen}>Fullscreen</div>
    </div>
}