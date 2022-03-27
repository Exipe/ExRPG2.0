
import { Engine } from "../engine";
import { Sprite } from "./sprite";
import { Texture } from "./texture";

const calculateDimensions = (base: Texture, x: number, y: number, pxDimensions: boolean) => {
    const columns = pxDimensions
    ? base.sourceWidth / x
    : x;
    const rows = pxDimensions
        ? base.sourceHeight / y
        : y;
    const width = pxDimensions
        ? x
        : base.sourceWidth / x;
    const height = pxDimensions
        ? y
        : base.sourceHeight / y;

    return [ columns, rows, width, height ];
}

export class MultiTexture {

    public readonly base: Texture

    private rows: Texture[][] = []

    width: number
    height: number

    constructor(base: Texture, x: number, y: number, pxDimensions = true) {
        const [ columns, rows, width, height ] 
            = calculateDimensions(base, x, y, pxDimensions);

        this.width = columns;
        this.height = rows;
        this.base = base;

        for(var ir = 0; ir < rows; ir++) {
            const row: Texture[] = []
            this.rows.push(row)

            for(var ic = 0; ic < columns; ic++) {
                const itxt = base.subTexture(ic*width, ir*height, width, height)
                row.push(itxt)
            }
        }
    }

    get(x: number, y: number) {
        return this.rows[y][x]
    }

    getSprites(engine: Engine): Sprite[][] {
        return this.rows.map((row) => row.map((texture) =>
            new Sprite(engine, texture)));
    }

}
