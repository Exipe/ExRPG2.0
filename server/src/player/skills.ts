import { UpdateSkillsPacket } from "../connection/outgoing-packet";
import { Colors } from "../util/color";
import { experienceRequired } from "../util/formula";
import { playerHandler } from "../world";
import { Player } from "./player";

export const skills = ["mining", "smithing", "fishing", "cooking", "woodcutting", "foraging"] as const;

export type Skill = typeof skills[number];

export const skillNames: Readonly<Record<Skill, string>> = {
    mining: "Mining",
    smithing: "Smithing",
    fishing: "Fishing",
    cooking: "Cooking",
    woodcutting: "Woodcutting",
    foraging: "Foraging"
}

export const isSkill = (skill: string): skill is Skill => {
    return skills.includes(skill as Skill);
}

type SkillProgress = {
    level: number,
    experience: number,
    requiredExperience?: number,
}

export const MAX_SKILL_LEVEL = 100;

const experienceRequiredSkill = (level: number) => level < MAX_SKILL_LEVEL
    ? experienceRequired(level)
    : undefined;

const INITIAL_REQUIRED_EXPERIENCE = experienceRequired(1);

export class Skills {
    private skillProgressMap: Map<Skill, SkillProgress> = new Map(skills.map(skill => (
        [skill, { level: 1, experience: 0, requiredExperience: INITIAL_REQUIRED_EXPERIENCE }]
    )));

    constructor(private readonly player: Player) { }

    public update() {
        const packet = new UpdateSkillsPacket(skills.map(skill => {
            const progress = this.skillProgressMap.get(skill);

            return {
                skillId: skill,
                skillName: skillNames[skill],
                level: progress.level,
                experience: progress.experience,
                requiredExperience: progress.requiredExperience
            };
        }));

        this.player.send(packet);
    }

    public setProgress(skill: Skill, level: number, experience: number, update = true) {
        this.skillProgressMap.set(skill, {
            level,
            experience,
            requiredExperience: experienceRequired(level)
        });

        if (update) this.update();
    }

    public addExperience(skill: Skill, xp: number) {
        const progress = this.skillProgressMap.get(skill);
        progress.experience += xp;

        while (progress.level < MAX_SKILL_LEVEL && progress.experience >= progress.requiredExperience) {
            progress.experience -= progress.requiredExperience;
            progress.level++;
            progress.requiredExperience = experienceRequiredSkill(progress.level);

            this.player.sendMessage(`Congratulations, you have gained a ${skillNames[skill]} level!`);
            if (progress.level == MAX_SKILL_LEVEL) {
                const format = `/sprite(ui/skill/${skill}) ${Colors.yellow}`;
                playerHandler.globalMessage(format, `${this.player.name} has just achieved the maximum level of ${MAX_SKILL_LEVEL} in ${skillNames[skill]}!`);
            }
            else if (progress.level % 10 == 0) {
                playerHandler.globalMessage(`${this.player.name} has advanced to level ${progress.level} ${skillNames[skill]}!`);
            }
        }

        this.update();
    }

    public getLevel(skill: Skill) {
        return this.skillProgressMap.get(skill).level;
    }

    public getProgress(skill: Skill) {
        return {
            ...this.skillProgressMap.get(skill)
        }
    }
}