import { useRef } from "react";
import { ChatBubbleModel, HealthBarModel, HitSplatModel, HitSplatStyle, NameTagModel, OverlayAreaModel, OverlayModel, ProgressIndicatorModel } from "../game/model/overlay-model";
import React = require("react")

export interface OverlayAreaProps {
    overlayAreaModel: OverlayAreaModel
}

interface OverlayProps {
    overlayModel: OverlayModel
    className: string
    children: any
}

function Overlay(props: OverlayProps) {
    const overlayModel = props.overlayModel
    const domRef = useRef(null as HTMLDivElement)

    React.useEffect(() => {
        const move = overlayModel.onMove = (x: number, y: number) => {
            const style = domRef.current.style

            style.left = `${x}px`
            style.top = `${y}px`
        }

        move(overlayModel.x, overlayModel.y) // in case the npc moved before the effect is called
        domRef.current.style.visibility = 'visible'

        return () => {
            overlayModel.onMove = null
        }
    }, [])

    return <div 
    className={"overlay " + props.className} 
    style={{ visibility: 'hidden', left: overlayModel.x, top: overlayModel.y }}
    ref={domRef}>
        {props.children}
    </div>
}

interface NameTagProps {
    model: NameTagModel
}

function NameTag(props: NameTagProps) {
    const model = props.model
    let content = <>{model.name}</>
    let className: string

    switch(model.style) {
        case "player":
            className = "playerName"
            break
        case "npc":
            className = "npcName"
            break
        case "dev":
            className = "playerName"
            content = <><img className="text-icon" src="ui/crown.png" /> {model.name}</>
            break
    }

    return <Overlay overlayModel={model} className={className}>
        {content}
    </Overlay>
}

interface HitSplatProps {
    model: HitSplatModel
}

function HitSplat(props: HitSplatProps) {
    const model = props.model
    let text: string
    let className: string

    switch(model.style) {
        case "hit":
            text = `-${model.hit}`
            className = "hitSplat"
            break
        case "miss":
            text = `-${model.hit}`
            className = "missSplat"
            break
        case "heal":
            text = `+${model.hit}`
            className = "healSplat"
    }

    return <Overlay overlayModel={model} className={className}>
        {text}
    </Overlay>
}

interface ProgressIndicatorProps {
    model: ProgressIndicatorModel
}

const TIMER_TICKS = 4

function ProgressIndicator(props: ProgressIndicatorProps) {
    const model = props.model

    const [progress, setProgress] = React.useState(0)
    const [resetCounter, setResetCounter] = React.useState(model.resetCounter.value)

    React.useEffect(() => {
        model.resetCounter.register(setResetCounter)
        return () => model.resetCounter.unregister(setResetCounter)
    }, [])

    React.useEffect(() => {
        setProgress(0)
    }, [ resetCounter ])

    React.useEffect(() => {
        const interval = window.setTimeout(() => {
            setProgress(progress+1)
        }, model.duration / (TIMER_TICKS+1))

        return () => {
            window.clearTimeout(interval)
        }
    }, [ progress, resetCounter ])

    return <Overlay overlayModel={model} className="progressIndicator">
        <img src={model.sprite}></img>

        {Array(TIMER_TICKS).fill(undefined).map((_, i) => (
            <div className={"progressCircle " + 
                (i < progress ? "circleOn" : "circleOff")}></div>
        ))}
    </Overlay>
}

interface HealthBarProps {
    healthBarModel: HealthBarModel
}

function HealthBar(props: HealthBarProps) {
    const fillRef = useRef(null as HTMLDivElement)
    const healthBarModel = props.healthBarModel

    React.useEffect(() => {
        healthBarModel.onRatioUpdate = ratio => {
            const style = fillRef.current.style

            style.width = `${ratio * 100}%`
        }
    }, [])

    const fillStyle = {
        width: `${healthBarModel.ratio * 100}%`
    }

    return <Overlay overlayModel={healthBarModel} className={"overlayHealthBar"}>
        <div ref={fillRef} className={"overlayHealthFill"} style={fillStyle}></div>
    </Overlay>
}

interface ChatBubbleProps {
    chatBubbleModel: ChatBubbleModel
}

function ChatBubble(props: ChatBubbleProps) {
    const { chatBubbleModel }= props
    const [message, setMessage] = React.useState(chatBubbleModel.message.value)

    React.useEffect(() => {
        chatBubbleModel.message.register(setMessage)
        return () => chatBubbleModel.message.unregister(setMessage)
    }, [])

    return <Overlay overlayModel={chatBubbleModel} className={"chatBubble box-standard"}>
        {message}
    </Overlay>
}

export function OverlayArea(props: OverlayAreaProps) {
    const overlayAreaModel = props.overlayAreaModel

    const [overlayModels, setOverlayModels] = React.useState(overlayAreaModel.overlayModels.value)

    React.useEffect(() => {
        overlayAreaModel.overlayModels.register(setOverlayModels)

        return () => overlayAreaModel.overlayModels.unregister(setOverlayModels)
    }, [])

    const overlays = overlayModels.map(model => {
        if(model instanceof HitSplatModel) {
            return <HitSplat key={model.id} model={model} />
        }

        if(model instanceof ProgressIndicatorModel) {
            return <ProgressIndicator key={model.id} model={model} />
        }

        if(model instanceof NameTagModel) {
            return <NameTag key={model.id} model={model} />
        }

        if(model instanceof HealthBarModel) {
            return <HealthBar key={model.id} healthBarModel={model} />
        }

        if(model instanceof ChatBubbleModel) {
            return <ChatBubble key={model.id} chatBubbleModel={model} />
        }
    })

    return <div>{overlays}</div>
}
