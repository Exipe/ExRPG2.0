
export type MapId = "newbie_village" | "newbie_east_route" | "slime_grove" | "capital" | "dungeon" | "skeleton_boss_chamber"
                    | "desert" | "desert_maze_start" | "desert_maze" | "snake_pit" | "maze_mine"

export const maps = [ "newbie_village", "newbie_east_route", "slime_grove", "capital", "dungeon", "skeleton_boss_chamber",
                        "desert", "desert_maze_start", "desert_maze", "snake_pit", "maze_mine" ] as MapId[]

export function isMapId(id: string): id is MapId {
    return maps.includes(id as MapId)
}