
export class MultiMap<K, V> {

    private readonly map = new Map<K, V[]>()

    public add(key: K, value: V) {
        let list = this.map.get(key)
        if(!list) {
            list = []
            this.map.set(key, list)
        }

        list.push(value)
    }

    public forEach(key: K, action: (value: V) => void) {
        const list = this.map.get(key)
        if(!list) {
            return
        }

        list.forEach(action)
    }

}