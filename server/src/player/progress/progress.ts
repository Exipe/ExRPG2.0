
import { EquipSlot } from "../../item/equipment";
import { AttribId } from "../attrib";
import { Skill } from "../skills";

export interface SaveItem {
    id: string,
    amount: number
}

export interface SaveEquip {
    slot: EquipSlot,
    id: string
}

export interface SaveAttrib {
    id: AttribId,
    base: number
}

export interface SaveSkill {
    id: Skill,
    level: number,
    experience: number
}

export interface SaveVar {
    key: string,
    value: boolean | number | string
}

export interface Progress {
    level: number
    experience: number,
    skills: SaveSkill[],

    rank: number,
    mute: boolean,

    health: number

    position: {
        x: number,
        y: number,
        map: string
    }

    inventory: SaveItem[]
    bank: SaveItem[]

    equipment: SaveEquip[]

    attributes: SaveAttrib[]
    points: number

    unlockedRecipes: string[]
    vars: SaveVar[]
}