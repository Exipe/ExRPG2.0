
import fetch from "node-fetch"
import { ReadOnlyMap } from "../util/readonly-map"

export class ObjectData {

    public readonly id: string
    public readonly width: number
    public readonly depth: number

    public readonly block: boolean
    public readonly actions: string[]

    constructor(id: string, width: number, depth: number, block: boolean, actions: string[]) {
        this.id = id
        this.width = width
        this.depth = depth
        this.block = block
        this.actions = actions
    }

}

export async function loadObjectData(resPath: string) {
    const objDataMap = new Map<string, ObjectData>()
    const data = await fetch(resPath + "data/object.json")
    .then(res => res.json())

    data.forEach((obj: any) => {
        if(objDataMap.get(obj.id) != null) {
            throw "IMPORTANT - duplicate object ID: " + obj.id
        }

        const width = obj.width ? obj.width : 1
        const depth = obj.depth ? obj.depth : 1
        const block = obj.block != undefined ? obj.block : true
        const actions = obj.options ? obj.options.map((action: string) =>
            action.toLowerCase().replace(" ", "_")) : []

        const objData = new ObjectData(obj.id, width, depth, block, actions)
        objDataMap.set(obj.id, objData)
    })

    return new ReadOnlyMap(objDataMap)
}
