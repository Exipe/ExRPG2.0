
export const maps = [
    "newbie_village",
    "slime_grove",
    "newbie_east_route",
    "newbie_north_route",
    "newbie_capital",
    "capital_dungeon",
    "skeleton_boss_chamber",
    "desert",
    "desert_maze_start",
    "desert_maze",
    "snake_pit",
    "maze_mine"] as const;

export type MapId = typeof maps[number];

export function isMapId(id: string): id is MapId {
    return maps.includes(id as MapId)
}