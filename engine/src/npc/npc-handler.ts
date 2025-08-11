
import { NpcData, NpcOption } from "./npc-data";

export async function initNpcs(resPath: string) {
    const npcMap = new Map<string, NpcData>()

    const data = await fetch(resPath + "/data/npc.json").then(text => text.json())
    data.forEach((npcData: any) => {
        const id = npcData.id
        const sprite = npcData.sprite
        const options: NpcOption[] = npcData.options ? npcData.options.map((option: string) => [
            option, option.toLowerCase().replace(" ", "_")
        ]) : []

        if(npcData.combat != null) {
            options.unshift(["Attack", "__attack"])
        }

        if(npcMap.has(id)) {
            throw "IMPORTANT - duplicate NPC id: " + id
        }

        const npc = new NpcData(npcData, resPath + "/char/" + sprite + ".png", options)
        npcMap.set(id, npc)
    })

    return new NpcHandler(npcMap)
}

export class NpcHandler {

    private readonly npcMap: Map<string, NpcData>
    private readonly npcList: string[]

    constructor(npcMap: Map<string, NpcData>) {
        this.npcMap = npcMap
        this.npcList = [ ...npcMap.keys() ]
    }

    public search(prefix: string) {
        return this.npcList.filter(npc => npc.startsWith(prefix))
    }

    public get(id: string) {
        return this.npcMap.get(id)
    }

}
