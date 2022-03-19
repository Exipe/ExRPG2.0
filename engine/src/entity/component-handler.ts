
import { Component } from "./component";

export class ComponentHandler {

    private components = new Map<string, Component>()

    public add(component: Component) {
        this.components.set(component.id, component)
    }

    public remove(id: string) {
        const component = this.get(id)
        this.components.delete(id)
        component.destroy()
    }

    public get(id: string) {
        return this.components.get(id)
    }

    public forEach(action: (c: Component) => void) {
        this.components.forEach(action)
    }

    public initialize() {
        this.components.forEach(c => c.initialize())
    }

    public destroy() {
        this.components.forEach(c => c.destroy())
    }

}