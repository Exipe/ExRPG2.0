
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

    public draw(_x: number, _y: number) {}

    public postDraw(_x: number, _y: number) {}

    public initialize() {}

    public destroy() {}

}