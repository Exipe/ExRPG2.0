import { Observable } from "../../util/observable"

export type MenuEntry = [string, () => void]

export class OpenContextMenu {
    public readonly entries: MenuEntry[]
    public readonly x: number
    public readonly y: number

    constructor(entries: MenuEntry[], x: number, y: number) {
        this.entries = entries
        this.x = x
        this.y = y
    }
}

const NullContextMenu = new OpenContextMenu([], 0, 0)

export class ContextMenuModel {

    private entries = [] as MenuEntry[]

    public readonly observable = new Observable(NullContextMenu)

    public open(x: number, y: number) {
        this.observable.value = new OpenContextMenu(this.entries, x ,y)
        this.entries = []
    }

    public show(entries: MenuEntry[], x: number, y: number) {
        this.entries = entries
        this.open(x, y)
    }

    public add(entry: MenuEntry) {
        this.entries.push(entry)
    }

}