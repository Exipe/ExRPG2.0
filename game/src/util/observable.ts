
export type Observer<T> = (value: T) => void 

export class Observable<T> {

    private _value: T
    private observers = [] as Observer<T>[]

    constructor(value: T = null) {
        this._value = value
    }

    public get value() {
        return this._value
    }

    public set value(value: T) {
        this._value = value
        this.observers.forEach(o => o(value))
    }

    public register(observer: Observer<T>) {
        this.observers.push(observer)
    }

    public unregister(observer: Observer<T>) {
        this.observers = this.observers.filter(o => o != observer)
    }

}