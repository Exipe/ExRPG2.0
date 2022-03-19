
import { Scene } from "./scene";
import { Layer } from "./layer/layer";

export function saveScene(scene: Scene) {
    const obj: any = {}
    obj.width = scene.width
    obj.height = scene.height
    obj.ambient = scene.ambientLight

    obj.baseLayer = saveLayer(scene.baseLayer)
    obj.overLayer = saveLayer(scene.overlayLayer)
    obj.wallLayer = saveLayer(scene.wallLayer)
    obj.attribLayer = saveLayer(scene.attribLayer)
    obj.decoLayer = saveLayer(scene.decoLayer)

    return JSON.stringify(obj, null, "\t")
}

function rowToString(indices: number[], colLength: number) {
    let row = ""
    indices.forEach(n => {
        const col = n.toString()
        for(let pad = 0; pad < colLength - col.length; pad++) {
            row += "0"
        }
        row += col
    })

    return row
}

function saveLayer(layer: Layer<any>) {
    const ids: string[] = []
    const grid: number[][] = []

    for(let ri = 0; ri < layer.height; ri++) {
        const row: number[] = []
        grid.push(row)

        for(let ci = 0; ci < layer.width; ci++) {
            const tile = layer.get(ci, ri)

            if(tile == null || tile.id == null) {
                row.push(0)
                continue
            }

            let idx = ids.indexOf(tile.id) + 1
            if(idx == 0) {
                ids.push(tile.id)
                idx = ids.length
            }

            row.push(idx)
        }
    }

    if(ids.length == 0) {
        return undefined
    }

    const colLength = Math.floor(Math.log10(ids.length) + 1)
    const stringGrid: string[] = []
    grid.forEach(row => {
        stringGrid.push(rowToString(row, colLength))
    })

    return {
        ids: ids,
        grid: stringGrid
    }
}
