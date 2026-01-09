import React = require("react");
import { useObservable, useStatus } from "../hooks";

interface SkillItemProps {
    skill: string;
    skillName: string;
    level: number;
    experience: number;
    requiredExperience: number;
}

function SkillItem(props: SkillItemProps) {
    const iconStyle: React.CSSProperties = {
        backgroundImage: `url('ui/skill/${props.skill}.png')`
    };

    const percentage = props.requiredExperience !== undefined
        ? props.experience / props.requiredExperience * 100
        : 0;
    const style: React.CSSProperties = {
        width: `${percentage}%`
    };
    const experienceLabel = props.requiredExperience !== undefined
        ? `(XP) ${props.experience} / ${props.requiredExperience}`
        : 'Completed';

    return <div className="skill-item box-gradient">
        <div className="skill-item-details">
            <div className="scale-icon skill-item-icon" style={iconStyle}></div>
            <div>{props.skillName}</div>
            <div>Lv.{props.level}</div>
        </div>
        <div className="skill-experience-bar">
            <div className="skill-experience-bar-fill" style={style} />
            <span className="experience-label">{experienceLabel}</span>
        </div>
    </div>;
}

export function Skills() {
    const status = useStatus();
    const skills = useObservable(status.skills);

    return <div id="skills" className="box-standard tab-content">
        <div id="skill-list">
            {skills.map(skill =>
                <SkillItem key={skill.skillId}
                    skill={skill.skillId}
                    skillName={skill.skillName}
                    level={skill.level}
                    experience={skill.experience}
                    requiredExperience={skill.requiredExperience} />
            )}
        </div>
    </div>
}