
import { Texture } from "./texture";

export class MultiTexture {

    public readonly base: Texture

    private rows: Texture[][] = []

    width: number
    height: number

    constructor(base: Texture, width: number, height: number) {
        this.base = base
        this.width = base.sourceWidth / width
        this.height = base.sourceHeight / height

        for(var ir = 0; ir < this.height; ir++) {
            const row: Texture[] = []
            this.rows.push(row)

            for(var ic = 0; ic < this.width; ic++) {
                const itxt = base.subTexture(ic*width, ir*height, width, height)
                row.push(itxt)
            }
        }
    }

    get(x: number, y: number) {
        return this.rows[y][x]
    }

}
