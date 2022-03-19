
export abstract class Component {

    public readonly id: string

    constructor(id: string) {
        this.id = id
    }

    public movePx() {}

    public moveTile() {}

    public startHover() {}

    public stopHover() {}

    public animate(_dt: number) {}

    public draw(x: number, y: number) {}

    public postDraw(x: number, y: number) {}

    public initialize() {}

    public destroy() {}

}