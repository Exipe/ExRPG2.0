
import React = require("react");
import { StatusModel } from "../game/model/status-model";
import { Observable } from "../util/observable";

export interface StatusProps {
    model: StatusModel
}

interface HealthProps {
    health: Observable<number>,
    totalHealth: Observable<number>
}

function HealthBar(props: HealthProps) {
    const [health, setHealth] = React.useState(props.health.value)
    const [totalHealth, setTotalHealth] = React.useState(props.totalHealth.value)

    React.useEffect(() => {
        props.health.register(setHealth)
        props.totalHealth.register(setTotalHealth)

        return () => {
            props.health.unregister(setHealth)
            props.health.unregister(setTotalHealth)
        }
    }, [])

    const percentage = health / totalHealth * 100

    const style = {
        width: `${percentage}%`
    } as React.CSSProperties

    return <div className="statusBar" id="healthBar">
        <div className="barFill" style={style} id="healthFill" />
        <p>(HP) {health} / {totalHealth}</p>
    </div>
}

interface ExperienceProps {
    experience: number,
    requiredExperience: number
}

function ExperienceBar(props: ExperienceProps) {
    const experience = props.experience
    const requiredExperience = props.requiredExperience

    const percentage = experience / requiredExperience * 100

    const style = {
        width: `${percentage}%`
    } as React.CSSProperties

    return <div className="statusBar" id="experienceBar">
        <div className="barFill" style={style} id="experienceFill" />
        <p>(XP) {experience} / {requiredExperience}</p>
    </div>
}

export function StatusArea(props: StatusProps) {
    const [name, setName] = React.useState(props.model.name.value)

    const [level, setLevel] = React.useState(props.model.level.value)
    const [xp, setXp] = React.useState(props.model.experience.value)
    const [reqXp, setReqXp] = React.useState(props.model.requiredExperience.value)

    React.useEffect(() => {
        props.model.name.register(setName)

        props.model.level.register(setLevel)
        props.model.experience.register(setXp)
        props.model.requiredExperience.register(setReqXp)

        return () => {
            props.model.level.unregister(setLevel)
            props.model.experience.unregister(setXp)
            props.model.requiredExperience.unregister(setReqXp)
        }
    })

    return <div id="statusArea" className="box-standard">
        <div id="nameAndLevel">
            <p>{name}</p>
            <p>Level {level}</p>
        </div>

        <HealthBar 
            health={props.model.health}
            totalHealth={props.model.totalHealth}
        />

        <ExperienceBar
            experience={xp}
            requiredExperience={reqXp}
        />
    </div>
}