
import React = require("react");
import { ContextMenuModel } from "../../game/model/context-menu-model";
import { SettingsModel } from "../../game/model/tab/settings-model";
import { useNavigate } from "react-router-dom";

export interface SettingsProps {
    ctxMenu: ContextMenuModel
    settings: SettingsModel
}

export function Settings(props: SettingsProps) {
    const [zoom, setZoom] = React.useState(props.settings.zoom)
    const [camera, setCamera] = React.useState(props.settings.cameraMode)
    const navigate = useNavigate();

    const settings = props.settings
    const ctxMenu = props.ctxMenu

    function onZoom(e: MouseEvent) {
        for(let i = 1; i <= 5; i++) {
            const text = `Set zoom level: ${i}x`
            ctxMenu.add([text, () => { 
                settings.zoom = i
                setZoom(i)
            }])
        }

        ctxMenu.open(e.clientX, e.clientY)
    }

    function onCamera(e: MouseEvent) {
        ctxMenu.add(["Set camera mode: clip", () => {
            settings.cameraMode = "clip"
            setCamera("clip")
        }])

        ctxMenu.add(["Set camera mode: center", () => {
            settings.cameraMode = "center"
            setCamera("center")
        }])

        ctxMenu.open(e.clientX, e.clientY)
    }

    function onFullscreen() {
        const container = document.querySelector("#container")
        container.requestFullscreen()
    }

    function onSignOut() {
        navigate("/", { replace: true });
    }

    return <div id="settings" className="box-standard tab-content">
        <div className="ui-button thick" onClick={e => { onZoom(e.nativeEvent) }}>Zoom: {zoom}x</div>
        <div className="ui-button thick" onClick={e => { onCamera(e.nativeEvent) }}>Camera: {camera}</div>

        <div className="ui-button thick" onClick={onFullscreen}>Enable fullscreen</div>
        <div id="sign-out-button" className="ui-button thick" onClick={onSignOut}>Sign out</div>
    </div>
}