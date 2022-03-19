
import { Entity } from "./entity";

export class EntityList {

    public furthestBehind: Entity = null
    public furthestAhead: Entity = null

    public destroy() {
        this.fromBack(e => e.componentHandler.destroy())
    }

    public fromBack(action: (e: Entity) => any) {
        let current = this.furthestBehind

        while(current != null) {
            action(current)
            current = current.ahead
        }
    }

    public fromFront(action: (e: Entity) => any) {
        let current = this.furthestAhead

        while(current != null) {
            action(current)
            current = current.behind
        }
    }

    public isEmpty() {
        return this.furthestBehind == null
    }

    public add(entity: Entity) {
        entity.list = this

        if(this.isEmpty()) {
            this.furthestBehind = entity
            this.furthestAhead = entity
        } else if(entity.isBehind(this.furthestBehind)) {
            entity.setAhead(this.furthestBehind)
            this.furthestBehind = entity
        } else if(entity.isAhead(this.furthestAhead)) {
            entity.setBehind(this.furthestAhead)
            this.furthestAhead = entity
        } else {
            this.furthestBehind.placeAhead(entity)
        }

        entity.componentHandler.initialize()
    }

}