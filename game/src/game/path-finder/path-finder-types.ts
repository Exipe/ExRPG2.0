
export type Path = [number, number][]

export type PathFinderRequest = {
    resolve: (path: Path) => void,
    reject: () => void,
    revision: number
}

export type BlockMap = {
    grid: boolean[][],
    width: number,
    height: number
} | undefined

export type Goal = {
    x: number,
    y: number,
    width: number,
    height: number,
    distance: number
}

export type PathFinderResponse = {
    revision: number,
    path: Path
}

export type PathFinderMessage = BlockMapMessage | PathMessage

export type BlockMapMessage = {
    type: 'BLOCK_MAP',
    map: BlockMap
}

export type PathMessage = {
    type: 'PATH',
    startX: number,
    startY: number,
    goal: Goal,
    revision: number
}