
import React = require("react");
import { Observable } from "../util/observable";
import { useObservable, useStatus } from "./hooks";

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

export function StatusArea() {
    const model = useStatus();
    
    const name = useObservable(model.name);
    const level = useObservable(model.level);
    const xp = useObservable(model.experience);
    const reqXp = useObservable(model.requiredExperience);

    return <div id="statusArea" className="box-standard">
        <div id="nameAndLevel">
            <p>{name}</p>
            <p>Level {level}</p>
        </div>

        <HealthBar 
            health={model.health}
            totalHealth={model.totalHealth}
        />

        <ExperienceBar
            experience={xp}
            requiredExperience={reqXp}
        />
    </div>
}