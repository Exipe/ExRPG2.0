import { Observable } from "../../util/observable"

export interface SkillStatus {
    skillId: string,
    skillName: string,
    level: number,
    experience: number,
    requiredExperience: number
}

export class StatusModel {

    public readonly health = new Observable(0)
    public readonly totalHealth = new Observable(0)

    public readonly level = new Observable(0)
    public readonly experience = new Observable(0)
    public readonly requiredExperience = new Observable(0)

    public readonly name = new Observable("N/A")
    public readonly skills = new Observable([] as SkillStatus[]);
}