import { BlockMap, Goal, Path, PathFinderMessage, PathFinderRequest, PathFinderResponse } from "./path-finder-types"

const SCRIPT_URL = '/path-finder.js'

export class PathFinderWorker {

    private readonly worker: Worker

    private currentRevision = 0
    private request?: PathFinderRequest

    constructor() {
        this.worker = new Worker(SCRIPT_URL)
        this.worker.onmessage = (evt) => {
            this.handleMessage(evt.data)
        }
    }

    private postMessage(message: PathFinderMessage) {
        this.worker.postMessage(message)
    }

    private handleMessage(message: PathFinderResponse) {
        if(message.revision != this.currentRevision) {
            return
        }

        this.request.resolve(message.path)
        this.request = undefined
    }

    public setBlockMap(map: BlockMap) {
        this.postMessage({
            type: 'BLOCK_MAP',
            map: map
        })
    }

    public clearBlockMap() {
        this.postMessage({
            type: 'BLOCK_MAP',
            map: undefined
        })
    }

    public findPath(startX: number, startY: number, goal: Goal): Promise<Path> {
        const revision = ++this.currentRevision
        const promise = new Promise<Path>((resolve, reject) => {
            this.request = { revision, resolve, reject }
        })

        this.postMessage({ type: 'PATH', startX, startY, goal, revision })
        return promise
    }

}